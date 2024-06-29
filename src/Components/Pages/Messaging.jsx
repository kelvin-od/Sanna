import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, onSnapshot, getDocs, addDoc } from "firebase/firestore";
import { db } from '../firebase/firebase';
import { AuthContext } from "../AppContext/AppContext";
import Navbar from '../Navbar/Navbar';

const Messaging = () => {
    const { user } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        if (user) {
            const q = query(
                collection(db, "messages"),
                where("receiverId", "==", user.uid)
            );

            const unsubscribe = onSnapshot(q, async (querySnapshot) => {
                const uniqueUsers = new Set();
                querySnapshot.forEach((doc) => {
                    const message = doc.data();
                    if (message.senderId !== user.uid) {
                        uniqueUsers.add(message.senderId);
                    }
                });

                const convos = [];
                for (let uid of uniqueUsers) {
                    const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", uid)));
                    userDoc.forEach((doc) => {
                        convos.push(doc.data());
                    });
                }

                setConversations(convos);
            });

            return () => unsubscribe();
        }
    }, [user]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (selectedUser) {
                const q = query(
                    collection(db, "messages"),
                    where("senderId", "in", [user.uid, selectedUser.uid]),
                    where("receiverId", "in", [user.uid, selectedUser.uid])
                );

                const unsubscribe = onSnapshot(q, async (querySnapshot) => {
                    const msgs = [];
                    for (const doc of querySnapshot.docs) {
                        const message = doc.data();
                        const messageObj = {
                            id: doc.id,
                            ...message,
                            replies: []
                        };

                        // Fetch replies for each message only once
                        const repliesRef = collection(db, "messages", doc.id, "replies");
                        const repliesSnapshot = await getDocs(repliesRef);
                        const replies = repliesSnapshot.docs.map(replyDoc => ({
                            id: replyDoc.id,
                            ...replyDoc.data()
                        }));
                        messageObj.replies = replies;
                        msgs.push(messageObj);
                    }

                    // Sort messages by timestamp in ascending order
                    msgs.sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate());

                    setMessages(msgs);
                });

                return () => unsubscribe();
            }
        };

        fetchMessages();
    }, [selectedUser, user]);

    const sendMessage = async () => {
        if (newMessage.trim() === "" || !selectedUser) return;

        const messageData = {
            senderId: user.uid,
            receiverId: selectedUser.uid,
            text: newMessage,
            timestamp: new Date()
        };

        try {
            const docRef = await addDoc(collection(db, "messages"), messageData);
            const messageId = docRef.id; // Get the automatically generated ID
            setNewMessage("");

            // Optionally, you can update state to immediately show the message
            const messageWithId = { id: messageId, ...messageData, replies: [] };
            setMessages([messageWithId, ...messages]);
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    };


    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    const handleResponse = async (messageId, responseText) => {
        const response = {
            senderId: user.uid,
            text: responseText,
            timestamp: new Date()
        };

        try {
            await addDoc(collection(db, "messages", messageId, "replies"), response);
        } catch (error) {
            console.error("Error sending response: ", error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="fixed top-0 z-10 w-full bg-white shadow-md">
                <Navbar />
            </div>
            <div className="flex flex-1 mt-16 p-4">
                <div className="w-1/4 p-4 border-r">
                    <h2 className="font-medium mb-4 text-sm">Conversations</h2>
                    {conversations.map((convo) => (
                        <div
                            key={convo.uid}
                            onClick={() => handleUserClick(convo)}
                            className="cursor-pointer p-2 hover:bg-gray-200 rounded text-sm"
                        >
                            {convo.name}
                        </div>
                    ))}
                </div>
                <div className="flex-1 p-4">
                    {selectedUser ? (
                        <div className="flex flex-col h-full">
                            <h2 className="font-medium mb-4 text-sm">Conversation with {selectedUser.name}</h2>
                            <div className="flex-1 border p-4 mb-4 overflow-y-auto w-[60%]">
                                <div style={{ minHeight: '300px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                                    {messages.map((msg) => (
                                        <div key={msg.id} className="mb-2 flex flex-col pr-5">
                                            <div className={`p-1 text-sm rounded inline-block mb-2 ${msg.senderId === user.uid ? 'bg-green-100 self-end' : 'bg-gray-200 self-start'}`}>
                                                {msg.text}
                                            </div>
                                            {msg.replies.map((reply) => (
                                                <div key={reply.id} className="ml-4 mb-2 mt-2 flex">
                                                    <div className={`p-1 text-sm rounded inline-block ${reply.senderId === user.uid ? 'bg-green-100 self-end' : 'bg-gray-200 self-start'}`}>
                                                        {reply.text}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex w-[60%]">
                                <textarea
                                    className="flex-1 border p-1 rounded text-sm"
                                    rows="1"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button className="bg-green-500 text-white py-1 px-7 text-sm rounded ml-2" onClick={sendMessage}>Send</button>
                            </div>
                        </div>
                    ) : (
                        <div className='text-sm'>Select a conversation to view</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messaging;

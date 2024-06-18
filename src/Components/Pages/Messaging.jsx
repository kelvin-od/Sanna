import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, onSnapshot, getDocs, addDoc, orderBy } from "firebase/firestore";
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
                    if (message.receiverId !== user.uid) {
                        uniqueUsers.add(message.receiverId);
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
        if (selectedUser) {
            const q = query(
                collection(db, "messages"),
                orderBy("timestamp"),
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

                    // Fetch replies for each message
                    const repliesRef = collection(db, "messages", doc.id, "replies");
                    const repliesSnapshot = await getDocs(repliesRef);
                    const replies = repliesSnapshot.docs.map(replyDoc => ({
                        id: replyDoc.id,
                        ...replyDoc.data()
                    }));
                    messageObj.replies = replies;
                    msgs.push(messageObj);
                }

                setMessages(msgs);
            });

            return () => unsubscribe();
        }
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
            await addDoc(collection(db, "messages", docRef.id, "replies"), {
                senderId: user.uid,
                text: newMessage,
                timestamp: new Date()
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
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
                        <div>
                            <h2 className="font-medium mb-4 text-sm">Conversation with {selectedUser.name}</h2>
                            <div className="border p-4 mb-4 h-40 overflow-y-scroll">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`mb-2 ${msg.senderId === user.uid ? 'text-right' : 'text-left'}`}>
                                        <p className="bg-gray-200 p-1 text-sm rounded inline-block">{msg.text}</p>
                                        {msg.replies && msg.replies.map((reply) => (
                                            <div key={reply.id} className={`ml-4 mb-2 ${reply.senderId === user.uid ? 'text-right' : 'text-left'}`}>
                                                <p className="bg-gray-100 p-1 text-sm rounded inline-block">{reply.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div className="flex">
                                <textarea
                                    className="w-[60%] border p-1 rounded text-sm"
                                    rows="1"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
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

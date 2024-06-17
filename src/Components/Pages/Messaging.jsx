import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase'; 
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

const Messaging = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeSection, setActiveSection] = useState('read');
  const [receiverId, setReceiverId] = useState(null);
  const [users, setUsers] = useState([]); 
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchUsers(); // Fetch users from Firebase
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUsers = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const usersList = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setUsers(usersList);
  };

  useEffect(() => {
    if (user && receiverId) {
      const q = query(
        collection(db, 'messages'),
        orderBy('timestamp', 'desc')
      );
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(message => 
          (message.senderId === user.uid && message.receiverId === receiverId) || 
          (message.senderId === receiverId && message.receiverId === user.uid)
        );
        setMessages(fetchedMessages);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
  
      return () => unsubscribe();
    }
  }, [user, receiverId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!user || newMessage.trim() === '' || !receiverId) return;

    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      senderId: user.uid,
      receiverId: receiverId,
      timestamp: serverTimestamp(),
      read: false
    });

    setNewMessage('');
  };

  const deleteMessage = async (id) => {
    await deleteDoc(doc(db, 'messages', id));
  };

  useEffect(() => {
    if (searchTerm.trim() !== '') {
      const filteredResults = users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, users]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const markAsRead = async (messageId) => {
    await updateDoc(doc(db, 'messages', messageId), { read: true });
  };

  const filteredMessages = messages.filter(message => {
    if (activeSection === 'read') {
      return message.read;
    } else if (activeSection === 'unread') {
      return !message.read;
    } else {
      return true;
    }
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="fixed top-0 z-10 w-full bg-white shadow-md">
        <Navbar />
      </div>
      <div className="flex flex-grow mt-16">
        {/* Sidebar with Users */}
        <div className="w-1/4 bg-gray-100 border-r border-gray-300 p-4">
          <h2 className="text-lg font-semibold mb-4">Users</h2>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none"
          />
          <div className="overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map(user => (
                <div key={user.id} onClick={() => setReceiverId(user.id)} className="p-2 cursor-pointer hover:bg-gray-200 rounded-lg">
                  <p className="text-sm">{user.name}</p>
                </div>
              ))
            ) : (
              users.map(user => (
                <div key={user.id} onClick={() => setReceiverId(user.id)} className="p-2 cursor-pointer hover:bg-gray-200 rounded-lg">
                  <p className="text-sm">{user.name}</p>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Messages */}
        <div className="flex flex-col w-3/4 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {receiverId ? `Chat with ${users.find(u => u.id === receiverId)?.name}` : 'Select a user to chat'}
            </h2>
          </div>
          <div className="flex space-x-4 mb-4 border-b border-gray-300">
            <button 
              onClick={() => handleSectionChange('read')} 
              className={`px-4 text-sm py-2 ${activeSection === 'read' ? 'border-b-2 border-green-500' : 'text-gray-700'} focus:outline-none`}
            >
              Read Messages
            </button>
            <button 
              onClick={() => handleSectionChange('unread')} 
              className={`px-4 text-sm py-2 ${activeSection === 'unread' ? 'border-b-2 border-green-500' : 'text-gray-700'} focus:outline-none`}
            >
              Unread Messages
            </button>
            <button 
              onClick={() => handleSectionChange('compose')} 
              className={`px-4 text-sm py-2 ${activeSection === 'compose' ? 'border-b-2 border-green-500' : 'text-gray-700'} focus:outline-none`}
            >
              Compose Message
            </button>
          </div>
          <div className="flex-1 overflow-y-auto mb-4">
            {activeSection === 'compose' && receiverId && (
              <form onSubmit={sendMessage} className="flex mb-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-[50%] px-4 py-2 mr-2 border border-gray-300 rounded-lg focus:outline-none"
                />
                <button type="submit" className="px-6 py-2 text-black-400 text-sm border border-gray-500 rounded-lg hover:bg-green-100 focus:outline-none">Send</button>
              </form>
            )}
            {filteredMessages.length > 0 ? (
              filteredMessages.map(message => (
                <div key={message.id} className={`p-2 w-[50%] rounded-lg mb-2 ${message.senderId === user?.uid ? 'bg-green-100 self-end' : 'bg-gray-100 self-start'}`}>
                  <p className="text-sm">{message.text}</p>
                  {message.senderId === user.uid && (
                    <button onClick={() => deleteMessage(message.id)} className="text-red-500 text-xs mt-1">Delete</button>
                  )}
                  {!message.read && message.senderId !== user.uid && (
                    <button onClick={() => markAsRead(message.id)} className="text-green-500 text-xs mt-1">Mark as Read</button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No messages found.</p>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 z-10 w-full bg-white shadow-md">
        <Footer />
      </div>
    </div>
  );
};

export default Messaging;

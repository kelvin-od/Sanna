import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { AuthContext } from '../AppContext/AppContext';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase/firebase';
import { Helmet } from 'react-helmet';

const Notification = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [newPosts, setNewPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [menuVisible, setMenuVisible] = useState({});
  const [showCount, setShowCount] = useState(5); // Show only 5 notifications initially
  const [page, setPage] = useState(1); // Track current page

  const menuRef = useRef(null);
  const navigate = useNavigate();
  

  useEffect(() => {
    if (user) {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('userId', '==', user.uid));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notificationsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp.toDate()
          };
        });
        // Sort notifications by timestamp in descending order
        notificationsData.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(notificationsData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPostsData = snapshot.docChanges().filter(change => change.type === 'added' && change.doc.data().userId !== user.uid).map(change => {
        const post = change.doc.data();
        return {
          id: change.doc.id,
          title: 'New post from a user',
          timestamp: new Date(),
          post: post
        };
      });
      setNewPosts(prevNewPosts => [...newPostsData, ...prevNewPosts]);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleMenuToggle = (id) => {
    setMenuVisible(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  const handleDeleteNotification = async (id) => {
    await deleteDoc(doc(db, 'notifications', id));
  };

  const handleMuteNotification = async (id) => {
    await updateDoc(doc(db, 'notifications', id), { muted: true });
  };

  const handleMarkAsUnread = async (id) => {
    await updateDoc(doc(db, 'notifications', id), { read: false });
  };

  const handleMarkAsRead = async (id) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  const getTimeDifference = (timestamp) => {
    const now = new Date();
    const diffInMs = now - timestamp;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else {
      return `${diffInMonths} months ago`;
    }
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification.id);
    if (notification.type === 'follow') {
      navigate(`/notification/${notification.userId}`);
    } else {
      navigate(`/post/${notification.postId}`);
    }
  };
  
  

  const filteredNotifications = activeTab === 'all'
    ? notifications
    : notifications.filter(notification => notification.type === 'comment' || notification.type === 'like');

  // Calculate pagination
  const totalPages = Math.ceil(filteredNotifications.length / showCount);
  const startIndex = (page - 1) * showCount;
  const endIndex = startIndex + showCount;
  const visibleNotifications = filteredNotifications.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    
    if (page > 1) {
      setPage(prevPage => prevPage - 1);
    }
  };

  return (
    <>
    <Helmet>
        <title>Notifications | Sanna</title>
      </Helmet>
    <div className="fixed top-0 z-10 w-full bg-white shadow-md">
        <Navbar />
      </div>
    <div className="flex flex-col h-screen bg-white">
      
      <div className="flex-grow flex flex-col mt-24 h-screen mb-16 w-full max-w-4xl mx-auto px-4 h-auto bg-white">
        <h1 className="text-2xl font-medium mb-2">Notifications</h1>

        <div className="flex justify-center space-x-4 mb-4 border-b border-gray-300">
          <button
            className={`px-4 text-sm py-2 ${activeTab === 'all' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-700'} focus:outline-none`}
            onClick={() => handleTabChange('all')}
          >
            All
          </button>
          <button
            className={`px-4 text-sm py-2 ${activeTab === 'myPosts' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-700'} focus:outline-none`}
            onClick={() => handleTabChange('myPosts')}
          >
            My Posts
          </button>
        </div>

        <div className="py-4">
          <h2 className="text-sm font-bold mb-2">All Notifications</h2>
          {visibleNotifications.length > 0 ? (
  <ul>
    {visibleNotifications.map(notification => (
      <li
        key={notification.id}
        className={`border-b border-white py-2 px-4 text-xs relative ${notification.read ? 'bg-white' : 'bg-green-50'}`}
        onClick={() => handleNotificationClick(notification)}
        style={{ cursor: 'pointer' }}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs pb-1 text-gray-600">{getTimeDifference(notification.timestamp)}</p>
            <p className="text-xs">{notification.message}</p>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuToggle(notification.id);
            }}
          >
            ⋮
          </button>
        </div>
        {menuVisible[notification.id] && (
          <div ref={menuRef} className="absolute right-0 mt-2 w-48 rounded bg-green-100 border border-gray-300 shadow-md z-20">
            <button
              className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 focus:outline-none"
              onClick={() => {
                handleDeleteNotification(notification.id);
                handleMenuToggle(notification.id);
              }}
            >
              Delete
            </button>
            <button
              className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 focus:outline-none"
              onClick={() => {
                handleMuteNotification(notification.id);
                handleMenuToggle(notification.id);
              }}
            >
              Mute Notification
            </button>
            <button
              className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 focus:outline-none"
              onClick={() => {
                handleMarkAsUnread(notification.id);
                handleMenuToggle(notification.id);
              }}
            >
              Mark as Unread
            </button>
          </div>
        )}
      </li>
    ))}
  </ul>
) : (
  <p>No notifications available</p>
)}


          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-between mt-2">
              <button
                className={`px-4 py-1 border border-green-500 text-black text-sm rounded-md focus:outline-none ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                {'< Previous'}
              </button>
              <button
                className={`px-4 py-1 border border-green-500 text-black text-sm rounded-md focus:outline-none ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                {'Next >'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Notification;

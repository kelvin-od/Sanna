import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { AuthContext } from '../AppContext/AppContext';
import { collection, query, where, onSnapshot, deleteDoc, getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase/firebase';
import { Helmet } from 'react-helmet';
import avatar from "../../Assets/Images/avatar1.png";
import LikeNotification from '../NotificationTypes/LikeNotification';
import CommentNotification from '../NotificationTypes/CommentNotification';
import FollowNotification from '../NotificationTypes/FollowNotification';

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
    try {
      const docRef = doc(db, 'notifications', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await deleteDoc(docRef);
        console.log("Notification deleted successfully");
      } else {
        console.log("No such document exists!");
      }
    } catch (error) {
      console.error("Error deleting notification: ", error);
    }
  };

  const handleMuteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    await updateDoc(doc(db, 'notifications', id), { muted: true });
  };

  const handleMarkAsUnread = async (id, e) => {
    if (e) e.stopPropagation();
    await updateDoc(doc(db, 'notifications', id), { read: false });
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
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

  const truncateText = (text, wordLimit) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case 'like':
        return (
          <LikeNotification notification={notification} />
        );
      case 'comment':
        return (
          <CommentNotification notification={notification} />
        );
      case 'follow':
        return (
          <FollowNotification notification={notification} />
        );
      default:
        return <p>Unknown notification type</p>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Notifications | Sanna</title>
      </Helmet>
      <div className="fixed top-0 z-10 w-full bg-white">
        <Navbar />
      </div>
      <div className="flex flex-col h-screen">
        <div className='mt-20'>
          <div className="flex-grow flex flex-col h-screen w-full max-w-4xl mx-auto px-4 h-auto bg-white rounded-lg border border-gray-300 p-4">
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
            <div>
              {visibleNotifications.length > 0 ? (
                <ul>
                  {visibleNotifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`flex items-center justify-between p-2 border-b border-gray-300 cursor-pointer ${!notification.read ? 'bg-gray-100' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-center w-full">
                        <div className="flex rounded-full mr-3">
                          <img
                            src={notification.userAvatar || avatar}
                            className="w-10 h-10 mr-3 rounded-full object-cover"
                            alt="User Avatar"
                          />
                          <div>
                            {renderNotificationContent(notification)}
                            <p className="text-xs text-gray-500">{getTimeDifference(notification.timestamp)}</p>
                          </div>
                        </div>
                        <div className="relative inline-block text-left">
                          <button onClick={() => handleMenuToggle(notification.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>

                          </button>
                          {menuVisible[notification.id] && (
                            <div
                              ref={menuRef}
                              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                            >
                              <div className="py-1">
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                  onClick={() => handleMuteNotification(notification.id)}
                                >
                                  Mute Notification
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                  onClick={(e) => handleMarkAsUnread(notification.id, e)}
                                >
                                  Mark as Unread
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                >
                                  Delete Notification
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs">No notifications found</p>
              )}

              <div className="flex justify-between mt-4">
                <button
                  className="bg-gray-300 text-gray-700 px-2 py-1 rounded"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <button
                  className="bg-gray-300 text-gray-700 px-2 py-1 rounded"
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notification;

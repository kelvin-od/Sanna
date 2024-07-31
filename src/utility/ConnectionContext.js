import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../Components/firebase/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../Components/AppContext/AppContext';

const ConnectionContext = createContext();

export const useConnection = () => useContext(ConnectionContext);

export const ConnectionProvider = ({ children }) => {
  const [connections, setConnections] = useState({});
  const { user, userData } = useContext(AuthContext);

  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const userConnections = userData.friends || [];
        const connectionMap = userConnections.reduce((acc, friend) => {
          acc[friend.id] = true;
          return acc;
        }, {});
        setConnections(connectionMap);
      }
    }, (error) => {
      console.error('Error fetching connections:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleConnection = async (profileUid, profileName, photoURL) => {
    if (!profileUid || !profileName || !user?.uid) {
      console.error('Invalid input parameters:', {
        profileUid,
        profileName,
        userUid: user?.uid,
        photoURL,
      });
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const profileRef = doc(db, 'users', profileUid);

      const friendData = {
        id: profileUid,
        image: photoURL,
        name: profileName,
      };

      if (connections[profileUid]) {
        // Disconnect user without notification
        await updateDoc(userRef, {
          friends: arrayRemove(friendData),
        });
        await updateDoc(profileRef, {
          friends: arrayRemove({ id: user.uid, image: userData.photoURL, name: userData.name }),
        });
      } else {
        // Connect user with notification
        await updateDoc(userRef, {
          friends: arrayUnion(friendData),
        });
        await updateDoc(profileRef, {
          friends: arrayUnion({
            id: user.uid,
            image: userData.photoURL,
            name: userData.name,
          }),
        });

        // Add notification for the target user
        await addNotification('follow', `${userData.name} started following you`, profileUid);
      }

      setConnections((prevConnections) => ({
        ...prevConnections,
        [profileUid]: !connections[profileUid],
      }));
    } catch (error) {
      console.error('Error updating connection status:', error);
    }
  };

  const addNotification = async (type, message, targetUserId) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: targetUserId,
        type,
        message,
        timestamp: new Date(),
        read: false,
      });
    } catch (err) {
      console.error('Error adding notification: ', err);
    }
  };

  return (
    <ConnectionContext.Provider value={{ connections, handleConnection }}>
      {children}
    </ConnectionContext.Provider>
  );
};

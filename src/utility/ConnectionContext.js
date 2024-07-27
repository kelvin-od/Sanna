import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../Components/firebase/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, getDoc } from 'firebase/firestore';
import { AuthContext } from '../../src/Components/AppContext/AppContext';

const ConnectionContext = createContext();

export const useConnection = () => useContext(ConnectionContext);

export const ConnectionProvider = ({ children }) => {
  const [connections, setConnections] = useState({});
  const { user, profileDetails } = useContext(AuthContext);

  useEffect(() => {
    if (user?.uid) {
      const fetchConnections = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            const userConnections = userData.friends || [];
            const connectionMap = userConnections.reduce((acc, friend) => {
              acc[friend.id] = true;
              return acc;
            }, {});
            setConnections(connectionMap);
          }
        } catch (error) {
          console.error('Error fetching connections:', error);
        }
      };

      fetchConnections();
    }
  }, [user]);

  const handleConnection = async (profileUid, profileName) => {
    if (!profileUid || !profileName || !user?.uid) {
      console.error('Invalid input parameters:', {
        profileUid,
        profileName,
        userUid: user?.uid,
      });
      return;
    }

    console.log('handleConnection - user:', user.uid, 'profileUid:', profileUid, 'name:', profileName);

    try {
      const userRef = doc(db, 'users', user.uid);
      const profileRef = doc(db, 'users', profileUid);

      const friendData = {
        id: profileUid,
        image: profileDetails.profilePicture,
        name: profileName,
      };

      if (connections[profileUid]) {
        // Disconnect user
        console.log('Disconnecting user');
        await updateDoc(userRef, {
          friends: arrayRemove(friendData),
        });
        await updateDoc(profileRef, {
          friends: arrayRemove({ id: user.uid, image: user.photoURL, name: user.displayName }),
        });
        await addNotification('unfollow', `${user.displayName} unfollowed you`, profileUid);
      } else {
        // Connect user
        console.log('Connecting user');
        await updateDoc(userRef, {
          friends: arrayUnion(friendData),
        });
        await updateDoc(profileRef, {
          friends: arrayUnion({
            id: user.uid,
            image: user.photoURL,
            name: user.displayName,
          }),
        });
        await addNotification('follow', `${user.displayName} started following you`, profileUid);
      }

      // Update the connection status in the state
      setConnections((prevConnections) => ({
        ...prevConnections,
        [profileUid]: !connections[profileUid],
      }));
    } catch (error) {
      console.error('Error updating connection status:', error);
    }
  };

  const addNotification = async (type, message, userId) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        type,
        message,
        timestamp: new Date(),
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

import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../Components/firebase/firebase'; // Adjust the path as needed
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../Components/AppContext/AppContext'; // Adjust the path as needed

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [notificationCounts, setNotificationCounts] = useState({
        likes: 0,
        comments: 0,
        follows: 0,
    });

    useEffect(() => {
        if (user) {
            const notificationsCollectionRef = collection(db, 'notifications');

            // Define queries
            const likesQuery = query(
                notificationsCollectionRef,
                where('userId', '==', user.uid),
                where('type', '==', 'like'),
                where('read', '==', false)
            );
            const commentsQuery = query(
                notificationsCollectionRef,
                where('userId', '==', user.uid),
                where('type', '==', 'comment'),
                where('read', '==', false)
            );
            const followsQuery = query(
                notificationsCollectionRef,
                where('userId', '==', user.uid),
                where('type', '==', 'follow'),
                where('read', '==', false)
            );

            // Snapshot listeners
            const unsubscribeLikes = onSnapshot(likesQuery, (snapshot) => {
                setNotificationCounts(prevCounts => ({
                    ...prevCounts,
                    likes: snapshot.size,
                }));
            }, (error) => {
                console.error("Error fetching likes notifications:", error);
            });
            
            const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
                setNotificationCounts(prevCounts => ({
                    ...prevCounts,
                    comments: snapshot.size,
                }));
            }, (error) => {
                console.error("Error fetching comments notifications:", error);
            });
            
            const unsubscribeFollows = onSnapshot(followsQuery, (snapshot) => {
                setNotificationCounts(prevCounts => ({
                    ...prevCounts,
                    follows: snapshot.size,
                }));
            }, (error) => {
                console.error("Error fetching follows notifications:", error);
            });

            return () => {
                unsubscribeLikes();
                unsubscribeComments();
                unsubscribeFollows();
            };
        }
    }, [user]);

    return (
        <NotificationContext.Provider value={notificationCounts}>
            {children}
        </NotificationContext.Provider>
    );
};

export { NotificationContext };

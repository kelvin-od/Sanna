import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../Components/firebase/firebase'; // Adjust the path as needed

const markNotificationAsRead = async (notificationId) => {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
            read: true
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
};

export { markNotificationAsRead };

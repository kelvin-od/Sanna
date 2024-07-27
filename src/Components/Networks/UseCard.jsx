import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { AuthContext } from "../AppContext/AppContext"; // Adjust the import path as needed
import FollowButton from '../FollowButton/FollowButton'; // Adjust the import path as needed

const UserCard = ({ user }) => {
    const { user: currentUser } = useContext(AuthContext); // Get current user context
    const { id } = useParams();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const q = query(collection(db, 'users'), where('uid', '==', id));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const profileData = snapshot.docs[0]?.data();
                setProfile(profileData);
            });

            return () => unsubscribe();
        };

        fetchUserProfile();
    }, [id]);

    return (
        <div className="flex items-center p-2 mb-2 border border-gray-300 bg-gray-100 rounded-lg">
            <img
                src={user.profilePicture || 'default-avatar.png'} // Replace with default avatar path
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover mr-4"
            />
            <div className="flex-1">
                <p className="font-medium">{user.name}</p>
            </div>
            {currentUser?.uid !== user.id && (
                <FollowButton profileUid={user.id} />
            )}
        </div>
    );
};

export default UserCard;

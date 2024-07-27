import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../Navbar/Navbar';
import avatar from '../../Assets/Images/avatar.jpg';
import profilePic from '../../Assets/Images/profilePic.jpg';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useParams } from 'react-router-dom';
import { AuthContext } from "../AppContext/AppContext";
import NetworkUsers from '../Networks/NetworkUsers';
import FollowButton from '../FollowButton/FollowButton';

const NetworkProfile = ({ logo }) => {
    const { user, profileDetails } = useContext(AuthContext);
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
        <div className="w-full">
            <div className="fixed top-0 z-10 w-full bg-white">
                <Navbar />
            </div>
            <div className="flex bg-white">
                <div className="flex flex-1 absolute flex-col w-[45%] left-[10%] mt-6 border bg-gray-300 shadow-sm h-auto top-16 bg-white rounded-b-xl">
                    <div className="flex absolute right-4 mt-10">
                        {user?.uid !== id && (
                            <FollowButton profileUid={id} />
                        )}
                    </div>
                    <div className="relative py-4 mt-16">
                        <img
                            className="h-40 w-full"
                            src={profilePic}
                            alt="profilePic"
                        />
                        <div className="absolute bottom-20 left-6">
                            <img
                                className="h-20 w-20 rounded-full border-4 border-white"
                                src={user?.uid ? profileDetails.profilePicture || avatar : logo}
                                alt="avatar"
                            />
                            <p className="py-2 font-roboto mt-4 font-medium text-sm text-white no-underline tracking-normal leading-none">
                                {profile?.name}
                            </p>
                            <p className="py-2 font-roboto font-medium text-xs text-white no-underline tracking-normal leading-none">
                                {profile?.email}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex-2 w-[70%] ml-[55%] mr-[10%] mt-24">
                    <h2 className="text-sm font-semibold ml-8 mb-4">Connect with Like-minded users</h2>
                    <div className="max-h-[500px] overflow-y-auto mx-4 border-t border-gray-200 p-4 rounded-lg shadow-sm custom-scrollbar scrollbar-thin">
                        <NetworkUsers />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkProfile;

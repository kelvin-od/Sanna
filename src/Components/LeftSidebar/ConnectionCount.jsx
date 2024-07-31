import React, { useEffect, useState, useContext } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase"; 
import { AuthContext } from "../AppContext/AppContext"; 

const ConnectionCount = () => {
    const [followerCount, setFollowerCount] = useState(0);
    const { user } = useContext(AuthContext); // Get current user context

    useEffect(() => {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                const userData = doc.data();
                setFollowerCount(userData.followers ? userData.followers.length : 0);
            }
        }, (error) => {
            console.error('Error fetching user data: ', error);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="flex items-center gap-2">
            <div className="flex border py-1 px-3 rounded-full shadow-sm shadow-green-500 gap-1 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="green" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span className="font-semibold text-sm">{followerCount}</span>
                <span className="text-sm">followers</span>
            </div>
        </div>
    );
};

export default ConnectionCount;

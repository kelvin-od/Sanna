import React, { useEffect, useState, useContext } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Adjust the import path as needed
import { AuthContext } from "../AppContext/AppContext"; // Adjust the import path as needed

const ConnectionCount = () => {
    const [connectionCount, setConnectionCount] = useState(0);
    const { user } = useContext(AuthContext); // Get current user context

    useEffect(() => {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                const userData = doc.data();
                setConnectionCount(userData.friends ? userData.friends.length : 0);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [user]);

    return (
        <div className="flex items-center gap-2">
            <div className="flex border py-1 px-3 rounded-full shadow-sm shadow-green-500 gap-1 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" class="size-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span className="font-semibold text-sm">{connectionCount}</span>
                <span className=" text-sm">followers</span>
                
            </div>
        </div>
    );
};

export default ConnectionCount;

import React, { useEffect, useState, useContext } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { AuthContext } from "../AppContext/AppContext";

const ContentCount = () => {
    const [contentCount, setContentCount] = useState(0);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user) return;

        // Reference to the 'posts' collection
        const postsRef = collection(db, 'posts');

        // Query to filter posts by the current user's ID (uid)
        const q = query(postsRef, where('uid', '==', user.uid));

        // Set up a snapshot listener to get real-time updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
            // Set contentCount to the number of posts
            setContentCount(snapshot.size);
        }, (error) => {
            console.error("Error fetching posts:", error);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [user]);

    return (
        <div className="flex items-center gap-2">
            <div className="flex border py-1 px-3 rounded-full shadow-sm shadow-green-500 gap-1 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="green" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                <span className="font-semibold text-sm">{contentCount}</span>
                <span className=" text-sm">contributions</span>
            </div>
        </div>
    );
};

export default ContentCount;

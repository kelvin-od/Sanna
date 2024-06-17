import React, { useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc, collection, query, where, onSnapshot } from "firebase/firestore"; 
import { db } from '../firebase/firebase'; 
import avatar from "../../Assets/Images/avatar.avif";

const AdvertPostCard = ({ logo, id, uid, retailPrice, businessName, crossSalePrice, location, expiryDate, name, image, text, timestamp }) => {
    const [likeCount, setLikeCount] = useState(0);
    const [isMessagePopupVisible, setIsMessagePopupVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [userHasLiked, setUserHasLiked] = useState(false);

    useEffect(() => {
        if (!id) {
            console.error("Error: 'id' is undefined");
            return;
        }

        const likesRef = collection(db, "likes");
        const q = query(likesRef, where("postId", "==", id));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setLikeCount(snapshot.size);
            setUserHasLiked(snapshot.docs.some(doc => doc.data().userId === uid));
        });

        return () => unsubscribe();
    }, [id, uid]);

    const handleLike = async (e) => {
        e.preventDefault();

        if (!id || !uid) {
            console.error("Error: 'id' or 'uid' is undefined");
            return;
        }

        const likeDocRef = doc(db, "likes", `${id}_${uid}`);

        try {
            if (userHasLiked) {
                await deleteDoc(likeDocRef);
                console.log("Like removed from Firebase");
            } else {
                await setDoc(likeDocRef, {
                    postId: id,
                    userId: uid,
                    timestamp: new Date()
                });
                console.log("Like added to Firebase");
            }
        } catch (error) {
            console.error("Error handling like: ", error);
        }
    };

    const handleMessage = (e) => {
        e.preventDefault();
        setIsMessagePopupVisible(true);
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!id || !uid) {
            console.error("Error: 'id' or 'uid' is undefined");
            return;
        }

        try {
            await setDoc(doc(db, "messages", `${id}_${uid}_${new Date().getTime()}`), {
                postId: id,
                userId: uid,
                message: message,
                timestamp: new Date()
            });
            console.log("Message sent to Firebase");
            setIsMessagePopupVisible(false);
            setMessage("");
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    };

    return (
        <div className="mb-4 justify-center mx-8">
            <div className="post-card p-4 bg-green-50 rounded-lg shadow mb-4">
                <div className="flex items-center">
                    <img className="w-[2rem] rounded-full" src={avatar} alt="avatar" />
                    <div className="flex flex-col w-full">
                        <p className="ml-4 font-roboto w-full font-normal text-sm no-underline tracking-normal leading-none">
                            {businessName}
                        </p>
                        <p className="ml-4 font-roboto w-full font-normal text-xs text-gray-500 no-underline tracking-normal leading-none">
                            Published: {timestamp}
                        </p>
                    </div>
                    <div className="flex justify-end ml-4 font-roboto w-full font-normal bg-green-500 text-white w-[15%] p-2 rounded-sm text-tiny text-gray-500 no-underline tracking-normal leading-none">
                        <p>Promoted</p>
                    </div>
                    <div className="ml-4">
                        <h3 className="font-semibold">{name}</h3>
                    </div>
                </div>
                <div className="mt-4">
                    <p>{text}</p>
                    {image && <img src={image} alt="Post Content" className="mt-2 w-full rounded" />}
                </div>

                <div className='grid grid-cols-2 gap-1 w-full bg-white p-4 border my-4'>
                    <div className='flex'>
                        <p className="text-sm font-medium mr-2">Location:</p>
                        <span className='text-sm'>{location}</span>
                    </div>
                    <div className='flex'>
                        <p className="text-sm font-medium mr-2">Retail Price:</p>
                        <span className='text-sm'>{retailPrice}</span>
                    </div>
                    <div className='flex'>
                        <p className="text-sm font-medium mr-2">Date of expiry:</p>
                        <span className='text-sm'>{expiryDate}</span>
                    </div>
                    <div className='flex'>
                        <p className="text-sm font-medium mr-2">Cross_Sale Price:</p>
                        <span className='text-sm'>{crossSalePrice}</span>
                    </div>
                </div>

                <div className="flex justify-around pb-1 items-center border-t">
                    <button className="flex items-center cursor-pointer rounded-lg pt-2 hover:bg-gray-100" onClick={handleLike}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                        </svg>
                        <span className="text-xs font-normal ml-1">{userHasLiked ? 'Unlike' : 'Like'} {likeCount}</span>
                    </button>
                    <button className="flex items-center cursor-pointer rounded-lg pt-2 hover:bg-gray-100" onClick={handleMessage}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                        <span className="text-xs font-normal ml-1">Message Seller</span>
                    </button>
                </div>

                {isMessagePopupVisible && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                        <div className="bg-white p-4 rounded shadow-md w-96">
                            <h2 className="text-lg font-semibold mb-2">Message Seller</h2>
                            <textarea
                                className="w-full border border-gray-300 p-2 rounded mb-4"
                                rows="5"
                                placeholder="Type your message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button className="bg-green-500 text-white px-4 py-2 rounded mr-2" onClick={sendMessage}>Send</button>
                                <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setIsMessagePopupVisible(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvertPostCard;

import React, { useState, useContext } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../firebase/firebase';
import avatar from "../../Assets/Images/avatar.avif";
import { AuthContext } from "../AppContext/AppContext";

const AdvertPostCard = ({ id, uid, retailPrice, businessName, crossSalePrice, location, expiryDate, name, image, text, timestamp }) => {
    const { user } = useContext(AuthContext);
    const [isMessagePopupVisible, setIsMessagePopupVisible] = useState(false);
    const [message, setMessage] = useState("");

    const handleMessage = () => {
        setIsMessagePopupVisible(true);
    };

    const sendMessage = async () => {
        if (!user || !user.uid || !uid) {
            console.error("Current user or recipient UID is undefined");
            return;
        }
    
        if (message.trim() === "") return;
    
        const messageData = {
            senderId: user.uid,
            receiverId: uid,
            text: message,
            read: false,
            timestamp: new Date()
        };
    
        console.log("Message data to be sent:", messageData);
    
        try {
            await addDoc(collection(db, "messages"), messageData);
            console.log("Message sent successfully");
            setMessage("");
            setIsMessagePopupVisible(false);
            alert("Message sent successfully");
        } catch (error) {
            console.error("Error sending message: ", error);
            alert("Failed to send message");
        }
    };
    

    return (
        <div className="mb-4 justify-center mx-8">
            <div className="flex justify-end ml-1 font-roboto font-normal text-black p-2 my-1 rounded-sm text-xs no-underline tracking-normal leading-none">
                <p className="bg-green-500 py-1 px-2 rounded-md text-white">Promoted</p>
            </div>

            <div className="post-card p-4 bg-green-50 rounded-lg border border-gray-400 shadow mb-4">
                <div className="flex items-center">
                    <img className="w-[2rem] rounded-full" src={avatar} alt="avatar" />
                    <div className="flex flex-col w-full">
                        <p className="ml-4 font-roboto w-full font-normal text-sm no-underline tracking-normal leading-none">
                            {businessName}
                        </p>
                        <p className="ml-4 font-roboto w-[90%] font-normal text-xs text-gray-500 no-underline tracking-normal leading-none">
                            Published: {timestamp}
                        </p>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-sm font-roboto">{text}</p>
                    {image && <img src={image} alt="Post Content" className="mt-2 w-full rounded" />}
                </div>

                <div className='grid grid-cols-2 gap-1 w-full p-4 border border-gray-300 rounded-lg my-4'>
                    <div className='flex'>
                        <p className="text-sm font-medium font-roboto text-gray-700 mr-2">Location:</p>
                        <span className='text-sm text-gray-700'>{location}</span>
                    </div>
                    <div className='flex'>
                        <p className="text-sm font-medium mr-2 font-roboto text-gray-700">Retail Price:</p>
                        <span className='text-sm text-gray-700'>{retailPrice}</span>
                    </div>
                    <div className='flex'>
                        <p className="text-sm font-medium mr-2 font-roboto text-gray-700">Date of expiry:</p>
                        <span className='text-sm text-gray-700'>{expiryDate}</span>
                    </div>
                    <div className='flex'>
                        <p className="text-sm font-medium mr-2 font-roboto text-gray-700">Cross_Sale Price:</p>
                        <span className='text-sm text-gray-700'>{crossSalePrice}</span>
                    </div>
                </div>

                <div className="flex justify-around pb-1 items-center border-t">
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
                            <h2 className="font-medium text-sm mb-2">Message Seller</h2>
                            <textarea
                                className="w-full border border-gray-300 p-2 text-xs rounded mb-4"
                                rows="5"
                                placeholder="Type your message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button className="bg-green-500 text-white text-sm px-4 py-1 rounded mr-2" onClick={sendMessage}>Send</button>
                                <button className="text-green-500 border text-sm px-4 py-1 rounded" onClick={() => setIsMessagePopupVisible(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvertPostCard;

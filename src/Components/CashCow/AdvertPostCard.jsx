import React, { useState, useContext, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from '../firebase/firebase';
import avatar from "../../Assets/Images/avatar.avif";
import { Tooltip } from 'react-tooltip';
import { AuthContext } from "../AppContext/AppContext";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51PZd0vJIpuZzEOXAgFWUKMSHgwdzAshclJ5lvrMBFSDc9Vz8d22JMmHxooR9GYo0JJZlSKbhLK9ggo1BtzTp6OV500sHrWgIgO'); // Replace with your actual Stripe publishable key

const AdvertPostCard = ({ id, uid, retailPrice, businessName, crossSalePrice, location, expiryDate, name, image, text, timestamp }) => {
    const { user } = useContext(AuthContext);
    const [isMessagePopupVisible, setIsMessagePopupVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [isPurchasePopupVisible, setIsPurchasePopupVisible] = useState(false);
    const [isDepositPopupVisible, setIsDepositPopupVisible] = useState(false);
    const [amount, setAmount] = useState(crossSalePrice);
    const [balance, setBalance] = useState(0);
    const [depositAmount, setDepositAmount] = useState(0);
    const stripe = useStripe();
    const elements = useElements();
    const [isExpanded, setIsExpanded] = useState(false);
    const wordLimit = 15;

    useEffect(() => {
        const fetchBalance = async () => {
            if (!user || !user.uid) return;
            const balanceDoc = await getDoc(doc(db, "balances", user.uid));
            if (balanceDoc.exists()) {
                setBalance(balanceDoc.data().amount);
            } else {
                setBalance(0);
            }
        };
        fetchBalance();
    }, [user]);

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

        try {
            await addDoc(collection(db, "messages"), messageData);
            setMessage("");
            setIsMessagePopupVisible(false);
            alert("Message sent successfully");
        } catch (error) {
            console.error("Error sending message: ", error);
            alert("Failed to send message");
        }
    };

    const handlePurchase = async () => {
        if (balance < crossSalePrice) {
            setIsDepositPopupVisible(true);
            return;
        }

        if (!user || !user.uid || !uid) {
            console.error("Current user or seller UID is undefined");
            return;
        }

        try {
            // Create payment intent with Firebase Function
            const response = await fetch('YOUR_FIREBASE_FUNCTION_URL', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: crossSalePrice * 100, // Convert to cents or appropriate currency
                    buyerId: user.uid,
                    sellerId: uid,
                }),
            });

            const { clientSecret } = await response.json();

            // Confirm the payment with Stripe
            const paymentIntent = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: user.displayName,
                    },
                },
            });

            if (paymentIntent.error) {
                console.error("Payment failed: ", paymentIntent.error.message);
                alert("Failed to complete payment");
                return;
            }

            // Update purchase and escrow status in Firebase
            const productDetails = {
                name,
                crossSalePrice,
            };

            const purchaseRef = await addDoc(collection(db, "purchases"), {
                buyerId: user.uid,
                sellerId: uid,
                productDetails,
                status: "pending",
                timestamp: serverTimestamp(),
            });

            await addDoc(collection(db, "escrow"), {
                purchaseId: purchaseRef.id,
                buyerId: user.uid,
                sellerId: uid,
                amount: crossSalePrice,
                status: "held",
                timestamp: serverTimestamp(),
            });

            setIsPurchasePopupVisible(false);
            alert("Purchase successful and funds held in escrow.");
        } catch (err) {
            console.error("Error creating purchase: ", err);
            alert("Failed to complete purchase");
        }
    };

    const handleDeposit = async () => {
        if (!user || !user.uid) {
            console.error("Current user UID is undefined");
            return;
        }

        try {
            const balanceDoc = await getDoc(doc(db, "balances", user.uid));
            const currentBalance = balanceDoc.exists() ? balanceDoc.data().amount : 0;
            const newBalance = currentBalance + depositAmount;

            await addDoc(collection(db, "balances"), {
                uid: user.uid,
                amount: newBalance,
                timestamp: serverTimestamp(),
            });

            setBalance(newBalance);
            setDepositAmount(0);
            setIsDepositPopupVisible(false);
            alert("Deposit successful.");
        } catch (err) {
            console.error("Error making deposit: ", err);
            alert("Failed to deposit funds.");
        }
    };

    const truncateText = (text, wordLimit) => {
        const words = text.split(' ');
        if (words.length > wordLimit) {
          return words.slice(0, wordLimit).join(' ') + '...';
        }
        return text;
      }

    return (
        <div className="mb-2 flex flex-col justify-center w-full md:mx-8">
            <div className="flex justify-end ml-1 font-sans font-normal text-black md:p-2  rounded-sm text-xs no-underline tracking-normal leading-none">
                <p className="bg-green-500 py-1 px-2 rounded-sm text-white">Promoted</p>
            </div>

            <div className="post-card p-4 bg-white md:bg-green-50 md:rounded-lg md:shadow-md border w-full border-gray-300 mb-4">
                <div className="flex items-center py-2 md:py-4">
                    <img className="w-8 h-8 md:w-10 md:h-10 rounded-full" src={avatar} alt="avatar" />
                    <div className="flex flex-col ml-4 w-full">
                        <p className="pb-1 font-sans font-semibold text-base md:text-sm text-gray-900 tracking-normal leading-none">
                            {businessName}
                        </p>
                        <p className="font-sans font-normal text-xs text-gray-700">
                            Published: {timestamp}
                        </p>
                    </div>
                </div>
                <div className="mt-1">
                    <p className="text-base md:text-sm font-sans">
                        {isExpanded ? text : truncateText(text, wordLimit)}
                    </p>
                    {text.split(' ').length > wordLimit && (
                        <button
                            className="text-gray-600 text-base hover:text-black"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? "... see less" : "... see more"}
                        </button>
                    )}
                    {image && <img src={image} alt="Post Content" className="mt-2 w-full rounded" />}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-1 w-full p-4 border bg-green-50 border-gray-300 rounded-lg my-4'>
                    <div className='flex'>
                        <p className="text-base md:text-sm font-medium font-sans text-gray-700 mr-2">Location:</p>
                        <span className='text-base md:text-sm text-gray-700'>{location}</span>
                    </div>
                    <div className='flex'>
                        <p className="text-base md:text-sm font-medium mr-2 font-sans text-gray-700">Retail Price:</p>
                        <span className='text-base md:text-sm text-gray-700'>Kshs {retailPrice}</span>
                    </div>
                    <div className='flex'>
                        <p className="text-base md:text-sm font-medium mr-2 font-sans text-gray-700">Date of expiry:</p>
                        <span className='text-base md:text-sm text-gray-700'>{expiryDate}</span>
                    </div>
                    <div className='flex'>
                        <p className="text-base md:text-sm font-medium mr-2 font-sans text-gray-700">Cross_Sale Price:</p>
                        <span className='text-base md:text-sm text-gray-700'>Kshs {crossSalePrice}</span>
                    </div>
                </div>

                <div className="flex  md:flex-row justify-around pb-1 items-center border-t">
                    <button className="flex items-center cursor-pointer rounded-lg pt-2 hover:bg-gray-100" onClick={() => setIsPurchasePopupVisible(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-tooltip-id="purchase-tooltip" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                        <span className="text-base md:text-sm font-normal font-sans ml-1">Purchase Product</span>
                    </button>

                    <Tooltip
                        id="purchase-tooltip"
                        place="bottom"
                        effect="solid"
                        style={{ fontSize: '11px', backgroundColor: '#4ade80', color: 'white' }}>
                        Upon paying for the item, your fund will be safely placed in an escrow account until your products are delivered. Otherwise, you will receive a full refund.
                    </Tooltip>

                    <button className="flex items-center cursor-pointer rounded-lg pt-2 hover:bg-gray-100" onClick={handleMessage}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                        <span className="text-base md:text-sm font-normal ml-1">Message Seller</span>
                    </button>
                </div>

                {isMessagePopupVisible && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                        <div className="bg-white p-4 rounded shadow-md w-11/12 md:w-96">
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

                {isPurchasePopupVisible && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                        <div className="bg-white p-4 rounded shadow-md w-11/12 md:w-96">
                            <h2 className="font-medium text-sm mb-2">Purchase Confirmation</h2>
                            <p className="mb-4">Are you sure you want to purchase {name} for Kshs {crossSalePrice}?</p>

                            <div className="flex justify-end mt-4">
                                <button className="bg-green-500 text-white text-sm px-4 py-1 rounded mr-2" onClick={handlePurchase}>Confirm Purchase</button>
                                <button className="text-green-500 border text-sm px-4 py-1 rounded" onClick={() => setIsPurchasePopupVisible(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {isDepositPopupVisible && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                        <div className="bg-white p-4 rounded shadow-md w-11/12 md:w-96">
                            <h2 className="font-medium text-sm mb-2">Deposit Funds</h2>
                            <p className="mb-4">Your current balance is Kshs {balance}. Please deposit additional funds to proceed with the purchase.</p>

                            <input
                                type="text"
                                className="w-full border border-gray-300 p-2 text-xs rounded mb-4"
                                placeholder="Enter amount to deposit"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(Number(e.target.value))}
                            />
                            <Elements stripe={stripePromise}>
                                <CardElement
                                    options={{
                                        style: {
                                            base: {
                                                fontSize: '16px',
                                                color: '#424770',
                                                '::placeholder': {
                                                    color: '#aab7c4',
                                                },
                                            },
                                            invalid: {
                                                color: '#9e2146',
                                            },
                                        },
                                    }}
                                />
                            </Elements>
                            <div className="flex justify-end mt-12">
                                <button className="bg-green-500 text-white text-sm px-4 py-1 rounded mr-2" onClick={handleDeposit}>Deposit</button>
                                <button className="text-green-500 border text-sm px-4 py-1 rounded" onClick={() => setIsDepositPopupVisible(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvertPostCard;

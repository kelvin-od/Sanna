import React, { useState, useContext, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from '../firebase/firebase';
import avatar from "../../Assets/Images/avatar.jpg";
import { Tooltip } from 'react-tooltip';
import { AuthContext } from "../AppContext/AppContext";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51PZd0vJIpuZzEOXAgFWUKMSHgwdzAshclJ5lvrMBFSDc9Vz8d22JMmHxooR9GYo0JJZlSKbhLK9ggo1BtzTp6OV500sHrWgIgO'); // Replace with your actual Stripe publishable key

const AdvertPostCard = ({ id, advertId, uid, retailPrice, handlePurchase, logo, businessName, crossSalePrice, location, expiryDate, name, image, text, timestamp }) => {
    const { user } = useContext(AuthContext);
    const [isMessagePopupVisible, setIsMessagePopupVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [isPurchasePopupVisible, setIsPurchasePopupVisible] = useState(false);
    const [isDepositPopupVisible, setIsDepositPopupVisible] = useState(false);
    const [amount, setAmount] = useState(crossSalePrice);
    const [balance, setBalance] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCardCVV] = useState('');
    const [depositAmount, setDepositAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('balance');
    const [isExpanded, setIsExpanded] = useState(false);
    const wordLimit = 15;

    const [profileDetails, setProfileDetails] = useState({
        firstName: '',
        secondName: '',
        personalPhone: '',
        businessName: '',
        businessDescription: '',
        businessEmail: '',
        businessPhone: '',
        profilePicture: '',
        businessPicture: '',
        profileCover: '',
    });

    useEffect(() => {
        const fetchProfileDetails = async () => {
            if (uid) {
                const docRef = doc(db, 'users', uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    console.log("Profile details: ", docSnap.data());
                    setProfileDetails(docSnap.data());
                } else {
                    setProfileDetails({
                        firstName: '',
                        secondName: '',
                        personalPhone: '',
                        businessName: '',
                        businessEmail: '',
                        businessPhone: '',
                        profilePicture: '',
                        profileCover: '',
                        businessPicture: '',
                        businessDescription: '',
                    });
                }
            }
        };

        fetchProfileDetails();
    }, [uid]);

    useEffect(() => {
        console.log("UID: ", uid);
        console.log("User UID: ", user?.uid);
    }, [user, uid]);

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

    const handleBuyout = async () => {
        if (!user || !user.uid || !uid) {
            console.error("Current user or recipient UID is undefined");
            return;
        }

        // Ensure current user is not the author
        if (user.uid === uid) {
            console.error("Current user is the author of the post");
            return;
        }

        if (paymentMethod === 'balance') {
            // Check if balance is sufficient
            if (balance >= crossSalePrice) {
                handlePurchase();
            } else {
                setIsDepositPopupVisible(true);
            }
        } else if (paymentMethod === 'mpesa') {
            // Implement M-Pesa payment logic here
            // For demonstration, let's assume direct confirmation
            if (phoneNumber) {
                // Perform M-Pesa transaction logic here
                handlePurchase();
            } else {
                alert('Please enter your phone number.');
            }
        } else if (paymentMethod === 'creditCard') {
            // Implement Credit Card payment logic here
            // For demonstration, let's assume direct confirmation
            if (cardNumber && cardExpiry && cardCVV) {
                // Perform Credit Card transaction logic here
                handlePurchase();
            } else {
                alert('Please fill in all credit card details.');
            }
        }

        try {
            // Example: Directly setting amount to crossSalePrice for simplicity
            const amountToPay = crossSalePrice;

            // Store payment in escrow with a unique ID (example using Firestore)
            const escrowRef = await addDoc(collection(db, 'escrow'), {
                postId: id, // Adjust based on your post identifier
                buyerUid: user.uid,
                sellerUid: uid,
                amount: amountToPay,
                paid: false, // Payment status, adjust as per your needs
                timestamp: serverTimestamp()
            });

            console.log("Payment stored in escrow with ID:", escrowRef.id);

            // Optionally update UI or handle payment confirmation here

        } catch (error) {
            console.error("Error handling buyout:", error);
            // Handle error as needed
        }
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
    };

    const handleConfirmPurchase = () => {
        // Logic to handle confirmation based on payment method
        if (paymentMethod === 'balance') {
            if (balance >= crossSalePrice) {
                // Proceed with payment from balance
                // Implement your logic here
                console.log("Payment from balance");
            } else {
                // Show message that balance is insufficient
                setIsDepositPopupVisible(true);
            }
        } else {
            // Handle other payment methods (M-Pesa, credit card)
            console.log("Payment method: ", paymentMethod);
        }

        // Close the purchase popup/modal
        setIsPurchasePopupVisible(false);
    };

    const truncateText = (text, wordLimit) => {
        const words = text.split(' ');
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(' ') + '...';
        }
        return text;
    }

    return (
        <div className="flex flex-col justify-center md:mx-8">
            <div className="post-card p-4 bg-white md:bg-green-50 md:rounded-lg md:shadow-sm border w-full md:border-green-100">

                <div className="flex items-center py-2 md:pb-2">
                    <img
                        className="w-9 h-9 rounded-full"
                        src={profileDetails.businessPicture || avatar}
                        alt="avatar"
                    />

                    <div className="flex flex-col ml-4 w-full">
                        <p className="pb-1 font-sans font-semibold text-base md:text-sm text-gray-900 tracking-normal leading-none">
                            {profileDetails.businessName}
                        </p>
                        <p className="font-sans font-normal text-xs text-gray-700">
                            Promoted
                        </p>
                    </div>
                </div>
                <div className="mt-1">
                    <p className="text-3xl md:text-sm font-sans">
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

                <div className='grid grid-cols-2 md:grid-cols-2 justify-center bg-green-50 gap-1 w-full p-4 border border-gray-300 rounded-lg my-4'>
                    <div className='flex flex-row'>
                        <div className='mr-2'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                            </svg>

                        </div>
                        <div className='flex flex-col'>
                            <p className='text-base md:text-sm font-semibold text-green-700 tracking-wide leading-none'>
                                KSH {retailPrice}
                            </p>
                            <p className='text-xs text-green-500'>
                                Retail Price
                            </p>
                        </div>
                    </div>

                    <div className='flex flex-row'>
                        <div className='mr-2'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                            </svg>

                        </div>
                        <div className='flex flex-col'>
                            <p className='text-base md:text-sm font-semibold text-green-700 tracking-wide leading-none'>
                                KSH {crossSalePrice}
                            </p>
                            <p className='text-xs text-green-500'>
                                Cross Sale Price
                            </p>
                        </div>
                    </div>

                    <div className='flex flex-row'>
                        <div className='mr-2'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>

                        </div>
                        <div className='flex flex-col'>
                            <p className='text-base md:text-sm font-semibold text-green-700 tracking-wide leading-none'>
                                {location}
                            </p>
                            <p className='text-xs text-green-500'>
                                Location
                            </p>
                        </div>
                    </div>

                    <div className='flex flex-row'>
                        <div className='mr-2'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                            </svg>

                        </div>
                        <div className='flex flex-col'>
                            <p className='text-base md:text-sm font-semibold text-green-700 tracking-wide leading-none'>
                                {expiryDate}
                            </p>
                            <p className='text-xs text-green-500'>
                                Expiry Date
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row items-center justify-between mt-4">
                    <div className="flex flex-row">
                        <button
                            className="flex items-center justify-center p-2 md:p-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-black focus:outline-none"
                            onClick={handleMessage}
                        >
                            <svg fill="none" className="h-6 w-6 md:h-5 md:w-5 stroke-gray-600 stroke-2" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                            <span className="ml-2 text-base md:text-sm font-semibold">Message</span>
                        </button>
                        {isMessagePopupVisible && (
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <div className="bg-white p-4 rounded-lg shadow-lg max-w-lg w-full">
                                    <h2 className="text-xl font-semibold mb-4">Send a Message</h2>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Write your message..."
                                        className="w-full p-2 border rounded-md mb-4"
                                        rows="4"
                                    ></textarea>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => setIsMessagePopupVisible(false)}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded mr-2"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={sendMessage}
                                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                                        >
                                            Send
                                        </button>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        {user && user.uid !== uid && (
                            <button className="flex items-center border border-green-500 rounded-sm px-3 py-2 text-green-600 hover:text-black text-sm" onClick={() => setIsPurchasePopupVisible(true)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5M5 12l7-7 7 7" />
                                </svg>
                                <span className="md:block">Buy Out</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Payment Method Popup for larger screens */}
                {isPurchasePopupVisible && (
                    <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-70 flex items-center justify-center">
                        <div className="bg-white p-8 md:p-4 w-full md:max-w-lg mx-4 rounded-lg">
                            <div className="flex justify-end">
                                <button
                                    className="text-gray-600 hover:text-black"
                                    onClick={() => setIsPurchasePopupVisible(false)}
                                >
                                    Close
                                </button>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Payment Method
                            </h2>
                            {/* Display amount being paid */}
                            <p className="text-sm text-gray-700 mb-2">
                                Amount: KSH {crossSalePrice}
                            </p>
                            {/* Payment method selection */}
                            <div className="flex flex-col space-y-2">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-green-500 focus:ring-green-400"
                                        checked={paymentMethod === 'balance'}
                                        onChange={() =>
                                            handlePaymentMethodChange('balance')
                                        }
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        Account Balance
                                    </span>
                                </label>
                                {/* M-Pesa */}
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-green-500 focus:ring-green-400"
                                        checked={paymentMethod === 'mpesa'}
                                        onChange={() =>
                                            handlePaymentMethodChange('mpesa')
                                        }
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        M-Pesa
                                    </span>
                                </label>
                                {paymentMethod === 'mpesa' && (
                                    <div className="flex flex-col space-y-2">
                                        <input
                                            type="tel"
                                            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                                            placeholder="Enter Phone Number"
                                            value={phoneNumber}
                                            onChange={(e) =>
                                                setPhoneNumber(e.target.value)
                                            }
                                        />
                                    </div>
                                )}
                                {/* Credit Card */}
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-green-500 focus:ring-green-400"
                                        checked={paymentMethod === 'creditCard'}
                                        onChange={() =>
                                            handlePaymentMethodChange('creditCard')
                                        }
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        Credit Card
                                    </span>
                                </label>
                                {paymentMethod === 'creditCard' && (
                                    <div className="flex flex-col space-y-2">
                                        <input
                                            type="text"
                                            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                                            placeholder="Card Number"
                                            value={cardNumber}
                                            onChange={(e) =>
                                                setCardNumber(e.target.value)
                                            }
                                        />
                                        <input
                                            type="text"
                                            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                                            placeholder="Expiry Date"
                                            value={cardExpiry}
                                            onChange={(e) =>
                                                setCardExpiry(e.target.value)
                                            }
                                        />
                                        <input
                                            type="text"
                                            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                                            placeholder="CVV"
                                            value={cardCVV}
                                            onChange={(e) =>
                                                setCardCVV(e.target.value)
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                            {/* Confirm purchase button */}
                            <button
                                className="mt-4 px-4 py-2 text-sm text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:bg-green-600"
                                onClick={handleConfirmPurchase}
                            >
                                Confirm Purchase
                            </button>
                        </div>
                    </div>
                )}

                {/* New Screen for Mobile Phones */}
                
                {isPurchasePopupVisible && (
                    <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-70 flex items-center justify-center">
                        <div className="bg-white p-8 md:p-4 w-full md:max-w-lg mx-4 rounded-lg">
                            <div className="flex justify-end">
                                <button
                                    className="text-gray-600 hover:text-black"
                                    onClick={() => setIsPurchasePopupVisible(false)}
                                >
                                    Close
                                </button>
                            </div>
                            <h2 className="text-2xl mb:text-lg font-semibold text-gray-800 mb-4">
                                Payment Method (Mobile View)
                            </h2>
                            {/* Display amount being paid */}
                            <p className="text-sm text-gray-700 mb-2">
                                Amount: KSH {crossSalePrice}
                            </p>
                            {/* Payment method selection */}
                            <div className="flex flex-col space-y-2">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-green-500 focus:ring-green-400"
                                        checked={paymentMethod === 'balance'}
                                        onChange={() =>
                                            handlePaymentMethodChange('balance')
                                        }
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        Account Balance
                                    </span>
                                </label>
                                {/* M-Pesa */}
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-green-500 focus:ring-green-400"
                                        checked={paymentMethod === 'mpesa'}
                                        onChange={() =>
                                            handlePaymentMethodChange('mpesa')
                                        }
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        M-Pesa
                                    </span>
                                </label>
                                {paymentMethod === 'mpesa' && (
                                    <div className="flex flex-col space-y-2">
                                        <input
                                            type="tel"
                                            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                                            placeholder="Enter Phone Number"
                                            value={phoneNumber}
                                            onChange={(e) =>
                                                setPhoneNumber(e.target.value)
                                            }
                                        />
                                    </div>
                                )}
                                {/* Credit Card */}
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-green-500 focus:ring-green-400"
                                        checked={paymentMethod === 'creditCard'}
                                        onChange={() =>
                                            handlePaymentMethodChange('creditCard')
                                        }
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        Credit Card
                                    </span>
                                </label>
                                {paymentMethod === 'creditCard' && (
                                    <div className="flex flex-col space-y-2">
                                        <input
                                            type="text"
                                            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                                            placeholder="Card Number"
                                            value={cardNumber}
                                            onChange={(e) =>
                                                setCardNumber(e.target.value)
                                            }
                                        />
                                        <input
                                            type="text"
                                            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                                            placeholder="Expiry Date"
                                            value={cardExpiry}
                                            onChange={(e) =>
                                                setCardExpiry(e.target.value)
                                            }
                                        />
                                        <input
                                            type="text"
                                            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                                            placeholder="CVV"
                                            value={cardCVV}
                                            onChange={(e) =>
                                                setCardCVV(e.target.value)
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                            {/* Confirm purchase button */}
                            <button
                                className="mt-4 px-4 py-2 text-sm text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:bg-green-600"
                                onClick={handleConfirmPurchase}
                            >
                                Confirm Purchase
                            </button>
                        </div>
                    </div>
                )}

                {/* Insufficient Balance Popup */}
                {isDepositPopupVisible && (
                    <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-70 flex items-center justify-center">
                        <div className="bg-white p-8 md:p-4 w-full md:max-w-lg mx-4 rounded-lg">
                            <div className="flex justify-end">
                                <button
                                    className="text-gray-600 hover:text-black"
                                    onClick={() => setIsDepositPopupVisible(false)}
                                >
                                    Close
                                </button>
                            </div>
                            <h2 className="text-2xl mb:text-lg font-semibold text-gray-800 mb-4">
                                Insufficient Balance
                            </h2>
                            <p className="text-sm text-gray-700 mb-2">
                                Your current balance: KSH {balance}
                            </p>
                            <p className="text-sm text-red-500 mb-4">
                                Your balance is insufficient to complete the
                                transaction. Please deposit funds to proceed.
                            </p>
                            <div className="flex justify-end">
                                <button
                                    className="px-4 py-2 text-sm text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:bg-green-600"
                                    onClick={() => setIsDepositPopupVisible(false)}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvertPostCard;


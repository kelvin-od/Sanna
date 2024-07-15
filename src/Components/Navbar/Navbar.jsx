import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faBell, faUser, faSignOutAlt, faHome, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AppContext/AppContext';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from '../firebase/firebase';
import { auth, onAuthStateChanged } from "../firebase/firebase";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { signOutUser, user, userData } = useContext(AuthContext);
    const [notificationCount, setNotificationCount] = useState(0);
    const [messageCount, setMessageCount] = useState(0);
    const navigate = useNavigate();
    const [profileDetails, setProfileDetails] = useState({
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

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const notificationCollectionRef = useMemo(() => collection(db, 'notifications'), [db]);
    const messageCollectionRef = useMemo(() => collection(db, 'messages'), [db]);

    useEffect(() => {
        if (user) {
            const q = query(notificationCollectionRef, where('userId', '==', user.uid));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const notificationsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                const unreadNotifications = notificationsData.filter(notif => !notif.read);
                setNotificationCount(unreadNotifications.length);
            });

            return () => unsubscribe();
        }
    }, [user, notificationCollectionRef]);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            document.title = notificationCount > 0 ? `(${notificationCount}) Sanna` : 'Sanna';
          } else {
            document.title = 'Sanna';
          }
        });
      
        return () => unsubscribe();
      }, [notificationCount]);
      

    useEffect(() => {
        if (user) {
            const q = query(messageCollectionRef, where('userId', '==', user.uid));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const messagesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                const unreadMessages = messagesData.filter(message => !message.read);
                setMessageCount(unreadMessages.length);
            });

            return () => unsubscribe();
        }
    }, [user, messageCollectionRef]);

    const handleNotificationClick = async () => {
        if (user) {
            const q = query(notificationCollectionRef, where('userId', '==', user.uid), where('read', '==', false));
            const snapshot = await getDocs(q);
            snapshot.forEach(async (doc) => {
                await updateDoc(doc.ref, { read: true });
            });
            setNotificationCount(0); // Reset count after marking as read
        }
    };

    const handleMessageClick = async () => {
        if (user) {
            const q = query(messageCollectionRef, where('userId', '==', user.uid), where('read', '==', false));
            const snapshot = await getDocs(q);
            snapshot.forEach(async (doc) => {
                await updateDoc(doc.ref, { read: true });
            });
            setMessageCount(0); // Reset count after marking as read
        }
    };

    const handleSignOut = (e) => {
        e.preventDefault();
        signOutUser();
        navigate('/');
    };

    useEffect(() => {
        const fetchProfileDetails = async () => {
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfileDetails(docSnap.data());
                } else {
                    setProfileDetails({
                        firstName: user.displayName?.split(' ')[0] || userData?.firstName || '',
                        secondName: user.displayName?.split(' ')[1] || userData?.secondName || '',
                        personalPhone: '',
                        businessName: '',
                        businessEmail: '',
                        businessPhone: '',
                        profilePicture: '',
                        profileCover: '',
                        businessDescription: '',
                    });
                }
            }
        };

        fetchProfileDetails();
    }, [user, userData]);

    return (
        <div className='border-b border-gray-200'>
            <nav className='sticky flex top-0 bg-white-500 mx-12 md:mx-16 md:py-2 py-3'>
                <div className='flex text-green-700 text-2xl font-bold items-center flex-shrink-0 sm:mb-0'>
                    <Link to="/home">Sanna</Link>
                    <input className='w-90 md:w-96 md:ml-8 ml-4 rounded-full md:rounded-lg w-full focus:outline-none' type="text" placeholder='Search' />
                </div>
                <div className='hidden md:flex items-center mx-16 justify-between space-x-8'>

                    {/* <Link to="/messaging" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700 relative' onClick={handleMessageClick}>
                            <FontAwesomeIcon icon={faEnvelope} />
                            <span className='text-sm'>Messages</span>
                            {messageCount > 0 &&
                                <span className="absolute top-[-5px] right-4 text-tiny bg-green-500 text-white rounded-full px-1">{messageCount}</span>
                            }
                        </Link> */}
                    <Link to="/notification" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700 relative' onClick={handleNotificationClick}>
                        <FontAwesomeIcon className="h-4 w-4" icon={faBell} />
                        <span className='text-sm'>Notification</span>
                        {notificationCount > 0 && (
                            <span className="absolute top-[-5px] right-4 text-tiny bg-green-500 text-white rounded-full px-1">
                                {notificationCount}
                            </span>
                        )}
                    </Link>
                    <Link to="/profile" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700'>
                        <FontAwesomeIcon className="h-4 w-4" icon={faUser} />
                        <span className='text-sm'>Profile</span>
                    </Link>
                    {/* <Link to="/cross-sell">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" data-tooltip-id="cross-sale-tooltip" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" className="size-6 group-hover:text-green-700">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                            </svg>
                            <Tooltip
                                id="cross-sale-tooltip"
                                place="bottom"
                                effect="solid"
                                style={{ fontSize: '11px', backgroundColor: '#4ade80', color: 'white' }}>
                                Cross-Sell your product
                            </Tooltip>
                        </Link> */}
                </div>

                {/* <div className='hidden md:flex items-center border-r border-l border-gray-500 px-3'>
                        <Link to="/cross-sell">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" data-tooltip-id="cross-sale-tooltip" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" className="size-6 group-hover:text-green-700">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                            </svg>
                            <Tooltip
                                id="cross-sale-tooltip"
                                place="bottom"
                                effect="solid"
                                style={{ fontSize: '11px', backgroundColor: '#4ade80', color: 'white' }}>
                                Cross-Sell your product
                            </Tooltip>
                        </Link>
                    </div> */}

                <div className='hidden md:flex items-center w-[20%] justify-center'>
                    <span><img className=' hidden lg:block rounded-full h-5 w-5 mr-2' src={profileDetails.profilePicture} alt="" /></span>
                    <span>
                        <p className='text-sm font-roboto font-medium'>
                            {profileDetails.firstName === null && userData?.firstName !== undefined
                                ? userData?.firstName?.charAt(0)?.toUpperCase() +
                                userData?.firstName?.slice(1)
                                : profileDetails.firstName?.split(" ")[0]}
                        </p>
                    </span>
                </div>
                <div className='hidden md:flex items-center'>
                    <span>
                        <FontAwesomeIcon className='cursor-pointer mr-4 hover:text-green-700' data-tooltip-id="sign-out-tooltip" onClick={handleSignOut} icon={faSignOutAlt} />
                    </span>
                    <Tooltip
                        id="sign-out-tooltip"
                        place="bottom"
                        effect="solid"
                        style={{ fontSize: '11px', backgroundColor: '#4ade80', color: 'white' }}>
                        Sign out
                    </Tooltip>
                </div>
            </nav>

            <footer className='fixed bottom-0 w-full bg-white md:hidden border-t-2 border-gray-200'>
                <ul className='flex justify-around py-2'>
                    <li className='text-base hover:cursor-pointer px-3 py-2 rounded-lg'>
                        <Link to="/home" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700'>
                            <FontAwesomeIcon icon={faHome} />
                            <span className='text-xs'>Home</span>
                        </Link>
                    </li>
                    {/* <li className='text-base hover:cursor-pointer px-3 py-2 rounded-lg'>
                        <Link to="/messaging" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700'>
                            <FontAwesomeIcon icon={faEnvelope} />
                            <span className='text-xs'>Messages</span>
                        </Link>
                    </li> */}
                    <li className='text-base hover:cursor-pointer px-3 py-2 rounded-lg'>
                        <Link to="/notification" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700 relative' onClick={handleNotificationClick}>
                            <FontAwesomeIcon icon={faBell} />
                            <span className='text-xs'>Notification</span>
                            {notificationCount > 0 &&
                                <span className="absolute top-0 right-0 text-tiny bg-red-500 text-white rounded-full px-1">{notificationCount}</span>
                            }
                        </Link>
                    </li>
                    <li className='text-base hover:cursor-pointer px-3 py-2 rounded-lg'>
                        <Link to="/profile" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700'>
                            <FontAwesomeIcon icon={faUser} />
                            <span className='text-xs'>Profile</span>
                        </Link>
                    </li>
                    {/* <li className='text-base hover:cursor-pointer px-3 py-2 rounded-lg'>
                        <Link to="/cross-sell" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700'>
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                            <span className='text-xs'>Cross-Sell</span>
                            <Tooltip
                                id="cross-sale-tooltip"
                                place="bottom"
                                effect="solid"
                                style={{ fontSize: '11px', backgroundColor: '#4ade80', color: 'white' }}>
                                Cross-Sell your product
                            </Tooltip>
                        </Link>
                    </li> */}
                    <li className='text-base hover:cursor-pointer px-3 py-2 rounded-lg'>
                        <button onClick={handleSignOut} className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700'>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            <span className='text-xs'>Sign out</span>
                        </button>
                    </li>
                </ul>
            </footer>
        </div>
    );
};

export default Navbar;

import React, { useContext } from 'react';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser, faSignOutAlt, faHome } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AppContext/AppContext';
import avatar from "../../Assets/Images/avatar1.png";
import SearchComponent from "./SearchComponent";
import NotificationCount from './NotificationCount';

const Navbar = () => {
    const { signOutUser, userData } = useContext(AuthContext);
    const navigate = useNavigate();

    console.log("User Data:", userData);  // For debugging

    const handleSignOut = (e) => {
        e.preventDefault();
        signOutUser();
        navigate('/');
    };

    return (
        <div className='border-b border-gray-200'>
            <nav className='sticky flex top-0 bg-white-500 md:mx-24 md:py-2 py-3 mx-8 md:justify-around'>
                <div className='flex text-green-700 text-2xl font-bold items-center flex-shrink-0 sm:mb-0'>
                    <Link to="/feeds">Sanna</Link>
                    <SearchComponent />
                </div>
                <div className='hidden md:flex items-center mx-16 justify-between space-x-8'>
                    <Link to="/notification" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700 relative'>
                        <FontAwesomeIcon className="h-5 w-5 text-green-900" icon={faBell} />
                        <span className='text-sm text-green-900'>Notification</span>
                        <NotificationCount />
                    </Link>
                    <Link to="/profile" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700'>
                        <FontAwesomeIcon className="h-5 w-5 text-green-900" icon={faUser} />
                        <span className='text-sm text-green-900'>Profile</span>
                    </Link>
                </div>

                <div className='hidden md:flex items-center'>
                    <span>
                        <img
                            className='hidden lg:block rounded-full h-6 w-6 mr-2'
                            src={userData?.photoURL || avatar}
                            alt="User Avatar"
                        />
                    </span>
                    <span>
                        <p className='text-sm font-roboto text-green-900 font-medium'>
                            {userData?.name
                                ? userData.name.trim().split(' ')[0].charAt(0).toUpperCase() + userData.name.trim().split(' ')[0].slice(1)
                                : 'Name not available'}
                        </p>
                    </span>
                </div>
                <div className='hidden md:flex items-center'>
                    <span>
                        <FontAwesomeIcon
                            className='cursor-pointer mr-4 text-green-900 hover:text-green-700'
                            data-tooltip-id="sign-out-tooltip"
                            onClick={handleSignOut}
                            icon={faSignOutAlt}
                        />
                    </span>
                    <Tooltip
                        id="sign-out-tooltip"
                        place="bottom"
                        effect="solid"
                        style={{ fontSize: '11px', backgroundColor: '#4ade80', color: 'white' }}
                    >
                        Sign out
                    </Tooltip>
                </div>
            </nav>

            <footer className='fixed bottom-0 w-full bg-white md:hidden border-t-2 border-gray-200'>
                <ul className='flex justify-around py-2'>
                    <li className='text-base hover:cursor-pointer px-3 py-2 rounded-lg'>
                        <Link to="/feeds" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700'>
                            <FontAwesomeIcon className="h-4 w-4 text-green-900" icon={faHome} />
                            <span className='text-xs'>Home</span>
                        </Link>
                    </li>
                    <li className='text-base hover:cursor-pointer px-3 py-2 rounded-lg'>
                        <Link to="/notification" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700 relative'>
                            <FontAwesomeIcon className="h-4 w-4 text-green-900" icon={faBell} />
                            <span className='text-xs'>Notification</span>
                            <NotificationCount />
                        </Link>
                    </li>
                    <li className='text-base hover:cursor-pointer px-3 py-2 rounded-lg'>
                        <Link to="/profile" className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700'>
                            <FontAwesomeIcon className="h-4 w-4 text-green-900" icon={faUser} />
                            <span className='text-xs'>Profile</span>
                        </Link>
                    </li>
                    <li className='text-base hover:cursor-pointer px-3 py-2 rounded-lg'>
                        <button onClick={handleSignOut} className='flex flex-col items-center text-gray-700 text-sm hover:text-green-700'>
                            <FontAwesomeIcon className="h-4 w-4 text-green-900" icon={faSignOutAlt} />
                            <span className='text-xs'>Sign out</span>
                        </button>
                    </li>
                </ul>
            </footer>
        </div>
    );
};

export default Navbar;

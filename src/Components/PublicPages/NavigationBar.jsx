import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const NavigationBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className='sticky top-0 bg-white py-2 border-b border-gray-200 shadow-md h-16 flex items-center justify-between'>
      <div className="flex items-center justify-between w-full px-4 md:px-6">
        <div className='text-green-700 text-2xl font-bold ml-16'>
          <Link to="/">Sanna</Link>
        </div>
        <div className="hidden md:flex items-center mr-24">
          <ul className="flex space-x-4">
            <li>
              <Link to="/login" className='flex items-center text-white hover:text-black px-6 py-2 bg-green-500 hover:bg-white hover:cursor-pointer rounded border hover:border-green-500'>
                <span className='text-sm'>Sign in</span>
              </Link>
            </li>
            <li>
              <Link to="/register" className='flex items-center hover:cursor-pointer px-6 py-2 rounded text-gray-700 text-sm hover:border-green-500 hover:text-green-700 border'>
                <span className='text-sm'>Register</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} className="text-green-700 focus:outline-none">
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col items-center mt-4">
          <ul className="flex flex-col space-y-2 mt-24">
            <li>
              <Link to="/login" className='flex items-center text-white hover:text-black px-6 py-2 bg-green-500 hover:bg-white hover:cursor-pointer rounded border hover:border-green-500'>
                <span className='text-sm'>Sign in</span>
              </Link>
            </li>
            <li>
              <Link to="/register" className='flex items-center hover:cursor-pointer px-6 py-2 rounded text-gray-700 text-sm hover:border-green-500 hover:text-green-700 border'>
                <span className='text-sm'>Register</span>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;

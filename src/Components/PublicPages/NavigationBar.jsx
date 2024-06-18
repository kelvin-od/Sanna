import React from "react";
import { Link } from 'react-router-dom';


const NavigationBar = () => {

  return (

    <nav className='sticky top-0 bg-white-500 py-2 border-b-1 border-gray-200 shadow-md h-16 items-center'>
      <div className="flex items-center justify-between mx-6 mr-24">
        <div className='text-green-700 text-2xl font-bold ml-16'>
          <Link to="/">Sanna</Link>
        </div>
        <div className="flex items-center justify-between mx-6 mr-24">
          <ul className="flex my-2">
            <li >
              <Link to="/login" className='flex flex-col items-center text-white hover:text-black px-4 py-2 bg-green-500 hover:bg-white  hover:cursor-pointer rounded  border hover:border hover:border-green-500'>
                <span className='text-sm'>Sign in</span>
              </Link>
            </li>
            <li>
              <Link to="/register" className='flex flex-col hover:cursor-pointer ml-4 px-4 py-2 rounded items-center text-gray-700 text-sm hover:border border border-white hover:border-green-500 hover:text-green-700  relative'>
                <span className='text-sm'>Register</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

    </nav>

  );
};

export default NavigationBar;

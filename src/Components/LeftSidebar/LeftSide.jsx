import React, { useContext } from 'react';
import edu from "../../Assets/Images/educa.jfif";
import avatar from "../../Assets/Images/avatar.avif";
import { AuthContext } from "../AppContext/AppContext";

const Leftside = ({ profilePicture }) => {
  const { user, userData } = useContext(AuthContext);

  // Determine the profile picture URL
  const profilePictureUrl = profilePicture || avatar;

  return (
    <div className='flex flex-col h-auto bg-white pb-4 border border-gray-300 rounded-md shadow-lg lg:w-full md:w-1/2 sm:w-full'>
      <div className='flex flex-col items-center relative'>
        <img className='h-20 sm:h-35 w-full rounded-t-md' src={edu} alt="edu" />
        <div className='absolute -bottom-8'>
          <img className='rounded-full h-16 w-16' src={user?.photoURL || avatar} alt="avatar" />
        </div>
      </div>
      <div className='flex flex-col items-center pt-12'>
        <p className='font-roboto font-medium text-md text-gray-600 no-underline tracking-normal leading-none'>
          {user?.displayName || userData?.name}
        </p>
        <p className='font-roboto text-sm text-gray-600 no-underline tracking-normal leading-none py-2'>
          {user?.company || userData?.company}
        </p>
        <p className='text-xs text-gray-600 no-underline tracking-normal leading-none mx-4 text-center'>
          Description of the company - Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </p>
      </div>
    </div>
  );
};

export default Leftside;

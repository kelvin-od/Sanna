import React, { useContext } from 'react';
import edu from "../../Assets/Images/educa.jfif";
import avatar from "../../Assets/Images/avatar.avif";
import { AuthContext } from "../AppContext/AppContext";

const Leftside = ({ profilePicture }) => {
  const { user, userData } = useContext(AuthContext);

  // Determine the profile picture URL
  const profilePictureUrl = profilePicture || avatar;

  return (
    <div className='flex flex-col h-screen bg-white pb-4 border-2 rounded-xl shadow-lg'>
      <div className='flex flex-col items-center relative'>
        <img className='h-24 w-full rounded-t-xl' src={edu} alt="edu" />
        <div className='absolute -bottom-6'>
          <div>
            <img className='size-md rounded-full h-12 w-12' src={user?.photoURL || avatar} alt="avatar" />
          </div>
        </div>
      </div>
      <div className='flex flex-col items-center pt-12'>
        <p className='font-roboto font-medium text-md text-gray-600 no-underline tracking-normal leading-none'>
          {user?.displayName || userData?.name}
        </p>
        <p className='font-roboto text-sm text-gray-600 no-underline tracking-normal leading-none py-2'>
          {user?.company || userData?.company}
        </p>
        <p className='text-xs text-gray-600 no-underline tracking-normal leading-none mx-4'>
          Description of the company - Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </p>
      </div>
      <div className='flex items-center'>
        <img src="" alt="" />
      </div>
    </div>
  );
};

export default Leftside;

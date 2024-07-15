import React, { useEffect, useState, useContext } from 'react';
import cover from "../../Assets/Images/coverImage.jpg";
import avatar from "../../Assets/Images/avatar.jpg";
import { AuthContext } from '../AppContext/AppContext';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Leftside = ({ userData }) => {
  const { user } = useContext(AuthContext);
  const [profileDetails, setProfileDetails] = useState({
    firstName: '',
    secondName: '',
    personalPhone: '',
    businessName: '',
    businessDescription: '',
    businessEmail: '',
    businessPhone: '',
    profilePicture: '',
    profileCover: '',
  });

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
    <div className='flex flex-col h-auto bg-white pb-4 border border-gray-300 rounded-md shadow-sm lg:w-full md:w-1/2 sm:w-full'>
      <div className='flex flex-col items-center mt-10 md:mt-0 relative'>
        <img className='h-28 sm:h-30 w-full rounded-t-md' src={profileDetails.profileCover || cover} alt="profile_image" />
        <div className='absolute -bottom-8'>
          <img className='rounded-full h-14 w-14' src={profileDetails.profilePicture} alt="avatar" />
        </div>
      </div>
      <div className='flex flex-col items-center pt-12'>
        <p className='font-roboto font-semibold text-md text-gray-900 no-underline tracking-normal leading-none'>
          {profileDetails.firstName || userData?.firstName} {profileDetails.secondName || userData?.secondName}
        </p>
        <p className='font-roboto text-sm text-gray-600 no-underline tracking-normal leading-none py-2'>
          <span className='font-semibold'></span>{profileDetails.businessName || userData?.businessName}
        </p>
        <p className='text-xs text-gray-600 no-underline tracking-normal leading-none mx-4 text-center'>
          {profileDetails.businessDescription}
        </p>
      </div>
      <div className='flex flex-col items-center pt-12'>
        <Link to="/profile" className='flex shadow-sm shadow-black px-4 py-2 gap-2 bg-green-100 rounded-full border-gray-400 items-center hover:bg-green-50'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="black" class="size-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
          </svg>
          <span className='text-xs text-black '>Edit your Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default Leftside;

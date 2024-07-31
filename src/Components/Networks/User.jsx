import React from 'react';
import avatar from '../../Assets/Images/avatar.jpg'; 

const User = ({ user = {}, currentUserUid }) => {
  return (
    <div className="flex items-center p-2 mb-2 border border-gray-300 bg-gray-100 rounded-lg">
      <img
        src={user.photoURL || avatar}
        alt={user.name || 'Profile Picture'}
        className="h-10 w-10 rounded-full object-cover mr-4"
      />
      <div className="flex-1">
        <p className="font-sans font-semibold text-base md:text-sm text-gray-900">
          {user.name || 'Unknown'}
        </p>
      </div>
      {currentUserUid !== user.uid && (
        <button className="bg-blue-500 text-white px-4 py-1 rounded-lg">
          Follow
        </button>
      )}
    </div>
  );
};

export default User;

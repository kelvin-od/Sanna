import React, { useContext } from 'react';
import { useConnection } from '../../utility/ConnectionContext';
import { AuthContext } from '../../Components/AppContext/AppContext';

const FollowButton = ({ profileUid }) => {
  const { user, profileDetails } = useContext(AuthContext);
  const { connections, handleConnection } = useConnection();

  const isConnected = connections[profileUid];
  const profileName = `${profileDetails?.firstName || ''} ${profileDetails?.secondName || ''}`.trim();

  const handleConnectionClick = () => {
    console.log('Follow button clicked with profileUid:', profileUid, 'and profileName:', profileName);
    handleConnection(profileUid, profileName);
  };

  return (
    <div
      className='flex right-4 cursor-pointer ml-auto flex gap-1 py-1 border border-green-500 shadow-sm shadow-green-500 rounded-full px-3 items-center'
      onClick={handleConnectionClick}
    >
      {!isConnected ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 fill-green-700 hover:fill-green-500">
            <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
          </svg>
          <p className="text-xs text-green-500">Follow</p>
        </>
      ) : (
        <p className="text-xs text-green-500">Following</p>
      )}
    </div>
  );
};

export default FollowButton;

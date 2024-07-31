import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import User from '../Networks/User';
import { AuthContext } from '../AppContext/AppContext';

const NetworkProfile = () => {
  const { uid } = useParams();
  const { getUserDataByUID, user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserDataByUID(uid);
        setProfileData(data);
      } catch (error) {
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [uid, getUserDataByUID]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!profileData) {
    return <div>No user data found.</div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 overflow-x-hidden">
      <div className="fixed top-0 z-10 w-full bg-white shadow">
        <Navbar />
      </div>
      <div className="flex flex-col lg:flex-row pt-16 lg:max-w-full lg:mx-24">
        <div className='flex-1 lg:ml-4 px-4 lg:px-8 py-6 bg-white shadow-lg rounded-lg my-4 mx-4 lg:mx-0'>
          <User user={profileData} currentUserUid={user?.uid} />
        </div>
      </div>
    </div>
  );
};

export default NetworkProfile;

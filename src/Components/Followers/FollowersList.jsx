import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../AppContext/AppContext';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import avatar from "../../Assets/Images/avatar1.png";
import Navbar from "../Navbar/Navbar";
import { Helmet } from 'react-helmet';

const FollowersList = () => {
  const { user } = useContext(AuthContext);
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchFollowers = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const followerUids = userData.followers || [];
          const followerDetails = await Promise.all(
            followerUids.map(async (uid) => {
              const followerDoc = await getDoc(doc(db, 'users', uid));
              return followerDoc.exists() ? followerDoc.data() : null;
            })
          );
          setFollowers(followerDetails.filter(f => f)); // Filter out null values
        }
      } catch (error) {
        console.error('Error fetching followers: ', error);
      }
    };

    fetchFollowers();
  }, [user]);

  return (
    <>
      <Helmet>
        <title>Followers | Sanna </title>
      </Helmet>
      <div className="fixed top-0 z-10 w-full bg-white">
        <Navbar />
      </div>

      <div className='flex flex-col items-center'>
      <div className='mt-24 w-[40%] border border-gray-200 rounded-lg p-4 bg-white'>
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Followers</h1>
        <ul className="">
          {followers.map((follower) => (
            <li key={follower.uid} className="flex items-center p-2 border-b border-white bg-green-50 rounded-lg">
              <img
                className="rounded-full h-10 w-10 mr-4"
                src={follower.photoURL || avatar}
                alt="avatar"
              />
              <div className="flex flex-col">
                <span className="text-md font-medium text-gray-900">{follower.name}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      </div>
      
      {/* <div className="flex flex-col items-center p-4 h-screen border border-gray-300 rounded-md  lg:w-full md:w-1/2 sm:w-full mt-16">
        
      </div> */}
    </>
  );
};

export default FollowersList;

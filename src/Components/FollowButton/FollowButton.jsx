import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../AppContext/AppContext";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase/firebase";

const FollowButton = ({ profileUid }) => {
  const { user, userData, setUserData } = useContext(AuthContext);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (userData?.following?.includes(profileUid)) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
  }, [userData, profileUid]);

  const handleFollow = async () => {
    if (!user) return; // Ensure user is logged in

    const userRef = doc(db, "users", user.uid);
    const profileRef = doc(db, "users", profileUid);

    try {
      if (isFollowing) {
        await updateDoc(userRef, {
          following: arrayRemove(profileUid),
        });
        await updateDoc(profileRef, {
          followers: arrayRemove(user.uid),
        });
        setUserData((prevData) => ({
          ...prevData,
          following: prevData.following.filter(id => id !== profileUid)
        }));
      } else {
        await updateDoc(userRef, {
          following: arrayUnion(profileUid),
        });
        await updateDoc(profileRef, {
          followers: arrayUnion(user.uid),
        });
        setUserData((prevData) => ({
          ...prevData,
          following: [...prevData.following, profileUid]
        }));
      }
      setIsFollowing(!isFollowing); // Toggle follow state
    } catch (err) {
      console.error("Error updating follow status: ", err);
    }
  };

  return (
    <button
      onClick={handleFollow}
      className={`px-2 py-1 rounded ${isFollowing ? "bg-[#84cc16]" : "bg-black"} text-white text-xs flex items-center`}
    >
      {isFollowing ? "Unfollow" : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-5 w-5 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
          </svg>
          Follow
        </>
      )}
    </button>
  );
};

export default FollowButton;

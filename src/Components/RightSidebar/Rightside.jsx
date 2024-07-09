import React, { useState, useContext } from 'react'
import eco from "../../Assets/Images/eco.jpg"
import Footer from '../Footer/Footer';
import avatar from "../../Assets/Images/avatar.avif"
import { Link } from 'react-router-dom';
import { AuthContext } from "../AppContext/AppContext";
// import syngenta from "../../Assets/Images/syngenta.jpg"
// import Ads from "./Ads"
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  arrayRemove,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const Rightside = () => {

  const [input, setInput] = useState('')
  const { user, userData } = useContext(AuthContext);
  const friendList = userData?.friends;

  const searchFriends = (data) => {
    return data.filter((item) =>
      item["name"].toLowerCase().includes(input.toLowerCase())
    );
  };

  const removeFriend = async (id, name, image) => {
    const q = query(collection(db, "users"), where("uid", "==", user?.uid));
    const getDoc = await getDocs(q);
    const userDocumentId = getDoc.docs[0].id;

    await updateDoc(doc(db, "users", userDocumentId), {
      friends: arrayRemove({ id: id, name: name, image: image }),
    });
  };


  return (
    <div >
      <div className='flex flex-col bg-white border border-gray-300 rounded-md h-auto shadow-lg'>
        <div className='flex flex-col items-center relative'>
          <img className='w-full h-38 rounded-md' src={eco} alt="edu" />
        </div>
        <p className='font-normal text-sm text-black max-m-fit no-underline tracking-normal leading-tight py-2 mx-5 mt-2'>
          Welcome to Sanna, your ultimate platform for learning, networking, and education.
          At Sanna, you can not only expand your knowledge and connections but also seize the opportunity
          to enhance your income and recover revenue lost to expiring products.
        </p>

        <div className='mx-6 mt-5'>
          <p className='font-medium text-sm text-gray-700 no-underline tracking-normal leading-none'>
            Networks:
          </p>
          <input
            className='border border-gray-400 rounded-lg w-full outline-line my-4 py-2 text-sm px-3'
            name='input'
            value={input}
            type="text"
            placeholder='Search Agribusinesses/Networks'
            onChange={(e) => setInput(e.target.value)} />

          {friendList?.length > 0 ? (
            searchFriends(friendList)?.map((friend) => {
              return (
                <div
                  className="flex items-center justify-between hover:bg-gray-100 duration-300 ease-in-out"
                  key={friend.id}
                >
                  <Link to={`/profile/${friend.id}`}>
                    <div className="flex items-center my-5 cursor-pointer">
                      <div className="flex items-center">
                        <img className='w-[1.5rem] rounded-full' src={friend?.image || avatar} alt="avatar" />
                        <p className="ml-4 font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none">
                          {friend.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="mr-4">
                    <svg onClick={() => removeFriend(friend.id, friend.name, friend.image)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="cursor-pointer text-greee-700 size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>

                  </div>
                </div>
              );
            })
          ) : (
            <p className="my-10 font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none">
              Add friends to check their profile
            </p>
          )}

        </div>
      </div>
      {/* <Ads /> */}
    </div>
  )
}

export default Rightside
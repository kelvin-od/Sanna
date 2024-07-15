import React, { useEffect, useState, useContext } from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { AuthContext } from '../AppContext/AppContext';
import { db, storage } from '../firebase/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc, // Import updateDoc from firebase/firestore
} from 'firebase/firestore'; // Make sure updateDoc is imported

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Profile = () => {
  const { user, userData } = useContext(AuthContext);
  const [profileDetails, setProfileDetails] = useState({
    firstName: '',
    secondName: '',
    personalPhone: '',
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    profilePicture: '',
    profileCover: '',
    businessPicture: '',
    businessDescription: '',
  });
  const [userPosts, setUserPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [businessPictureFile, setBusinessPictureFile] = useState(null);
  const [profileCoverFile, setProfileCoverFile] = useState(null);

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
            businessPicture: '',
            businessDescription: '',
          });
        }
      }
    };

    const fetchUserPosts = async () => {
      if (user) {
        const postsCollection = collection(db, 'posts');
        const q = query(postsCollection, where('uid', '==', user.uid));
        onSnapshot(q, (snapshot) => {
          setUserPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
      }
    };

    fetchProfileDetails();
    fetchUserPosts();
  }, [user, userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'profilePicture') {
      setProfilePictureFile(e.target.files[0]);
    } else if (e.target.name === 'businessPicture') {
      setBusinessPictureFile(e.target.files[0]);
    } else if (e.target.name === "profileCover") {
      setProfileCoverFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user) {
      console.log('User UID:', user.uid);

      let profilePictureUrl = profileDetails.profilePicture;
      let businessPictureUrl = profileDetails.businessPicture;
      let profileCoverUrl = profileDetails.profileCover;

      if (profilePictureFile) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        const uploadTask = await uploadBytes(storageRef, profilePictureFile);
        profilePictureUrl = await getDownloadURL(uploadTask.ref);
      }

      if (businessPictureFile) {
        const businessStorageRef = ref(storage, `businessPictures/${user.uid}`);
        const businessUploadTask = await uploadBytes(businessStorageRef, businessPictureFile);
        businessPictureUrl = await getDownloadURL(businessUploadTask.ref);
      }

      if (profileCoverFile) {
        const coverStorageRef = ref(storage, `profileCover/${user.uid}`);
        const coverUploadTask = await uploadBytes(coverStorageRef, profileCoverFile);
        profileCoverUrl = await getDownloadURL(coverUploadTask.ref);
      }

      const updatedProfileDetails = {
        ...profileDetails,
        profilePicture: profilePictureUrl,
        businessPicture: businessPictureUrl,
        profileCover: profileCoverUrl
      };

      const docRef = doc(db, 'users', user.uid);

      try {

        await updateDoc(docRef, updatedProfileDetails);
        setProfileDetails(updatedProfileDetails);
        setIsEditing(false);
        alert('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile: ', error);
        alert('Error updating profile');
      }
    }
  };





  if (!user || !userData) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="fixed top-0 z-10 w-full bg-white border-b">
        <Navbar />
      </div>
        <section className=" h-[80%] flex flex-col md:flex-row gap-8 p-4 md:p-8 mt-16 bg-white md:w-full md:px-24 md:justify-center">
          {/* User activities */}
          <div className="flex-1 items-center ml-8 h-auto">
            <div className="flex items-center border border-gray-300 p-2 w-full md:w-[87%] rounded gap-4 mx-auto">
              {profileDetails.profilePicture && (
                <img src={profileDetails.profilePicture} alt="Profile" className="w-10 h-10 rounded-full" />
              )}
              <h2 className="text-sm sm:text-5xl font-medium">{profileDetails.firstName} {profileDetails.secondName}</h2>
              <button
                className="bg-green-800 ml-auto text-sm text-white py-1 px-4 rounded"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
            <div className="flex items-center border border-gray-300 p-2 my-4 w-full md:w-[87%] rounded gap-4 mx-auto">
              {profileDetails.businessPicture && (
                <img src={profileDetails.businessPicture} alt="Profile" className="w-10 h-10 rounded-full" />
              )}
              <h2 className="text-sm sm:text-5xl font-medium">{profileDetails.businessName} Logo</h2>

            </div>
            <div className="flex items-center border border-gray-300 p-2 w-full md:w-[87%] rounded gap-4 mx-auto">
              {profileDetails.profileCover && (
                <img src={profileDetails.profileCover} alt="Profile" className="w-10 h-10 rounded-full" />
              )}
              <h2 className="text-sm sm:text-5xl font-medium">Your Cover Image</h2>

            </div>

            {/* <div className='hidden md:block md:ml-9 mt-8 bg-gray-100  px-4 py-5 border rounded-lg'>
            <div>
              <div className='border-b font-semibold mb-4'>
                <p className='pb-2 text-sm'>Accounts Balances</p>
              </div>
              <div>
                <p className='pb-2 text-sm'>Amount:</p>
                <p className='pb-2 text-sm'>Amount on Escrow:</p>
              </div>
              <button className='text-sm border border-green-700 hover:bg-green-700 hover:text-white rounded-lg px-4 py-1 mt-4'>
                Withdraw/Transfer Funds
              </button>
            </div>
          </div> */}

          </div>

          {/* User details */}
          <div className="flex-1 border border-gray-300 py-6 h-auto px-4 md:px-8 bg-green-50 rounded">
            <h2 className="text-sm font-medium mb-2">Profile Details</h2>
            <div className="mb-4">
              <h3 className="text-sm text-white font-medium mb-2 bg-green-300 p-1 rounded-sm">Personal Details</h3>
              <div className="text-xs md:text-sm">
                <p><strong>First Name:</strong> {profileDetails.firstName}</p>
                <p><strong>Second Name:</strong> {profileDetails.secondName}</p>
                <p><strong>Email:</strong> {user.email || userData.email}</p>
                <p><strong>Phone:</strong> {profileDetails.personalPhone}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm text-white font-medium mb-2 bg-green-300 p-1 rounded-sm">Business Details</h3>
              <div className="text-xs md:text-sm">
                <p><strong>Business Name:</strong> {profileDetails.businessName}</p>
                <p><strong>Business Description:</strong>{profileDetails.businessDescription}</p>
                <p><strong>Business Email:</strong> {profileDetails.businessEmail}</p>
                <p><strong>Business Phone:</strong> {profileDetails.businessPhone}</p>
              </div>
            </div>
          </div>
        </section>

        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 md:p-6 rounded shadow-lg max-w-md w-full">
              <h2 className="text-lg md:text-xl font-medium mb-4 text-center">Edit Profile</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-base md:text-sm font-semibold">Personal Details</h3>
                    <label className="block">
                      <span className="text-xs md:text-sm">First Name:</span>
                      <input
                        className="border p-1 rounded"
                        type="text"
                        name="firstName"
                        value={profileDetails.firstName}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs md:text-sm">Second Name:</span>
                      <input
                        className="border p-1 rounded"
                        type="text"
                        name="secondName"
                        value={profileDetails.secondName}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs md:text-sm">Email:</span>
                      <input
                        className="border p-1 rounded"
                        type="email"
                        value={user.email || userData.email}
                        readOnly
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs md:text-sm">Personal Phone:</span>
                      <input
                        className="border p-1 rounded"
                        type="text"
                        name="personalPhone"
                        value={profileDetails.personalPhone}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs md:text-sm">Profile Cover:</span>
                      <input
                        className="border p-1 rounded"
                        type="file"
                        name="profileCover"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-base md:text-sm font-semibold">Business Details</h3>
                    <label className="block">
                      <span className="text-xs md:text-sm">Business Name:</span>
                      <input
                        className="border p-1 rounded"
                        type="text"
                        name="businessName"
                        value={profileDetails.businessName}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs md:text-sm">Business Description:</span>
                      <input
                        className="border p-1 rounded"
                        type="text"
                        name="businessDescription"
                        value={profileDetails.businessDescription}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs md:text-sm">Business Email:</span>
                      <input
                        className="border p-1 rounded"
                        type="email"
                        name="businessEmail"
                        value={profileDetails.businessEmail}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs md:text-sm">Business Phone:</span>
                      <input
                        className="border p-1 rounded"
                        type="text"
                        name="businessPhone"
                        value={profileDetails.businessPhone}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs md:text-sm">Profile Picture:</span>
                      <input
                        className="border p-1 rounded"
                        type="file"
                        name="profilePicture"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs md:text-sm">Business Picture:</span>
                      <input
                        className="border p-1 rounded"
                        type="file"
                        name="businessPicture"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>

                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    className="bg-gray-300 text-sm text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
                    type="button"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button className="bg-green-500 text-sm text-white py-2 px-4 rounded hover:bg-green-600" type="submit">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      {/* <div className=' bottom-0'>
        <Footer />
      </div> */}
    </>
  );
};

export default Profile;

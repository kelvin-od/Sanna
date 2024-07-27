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
  updateDoc,
} from 'firebase/firestore';
import { Helmet } from 'react-helmet';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Profile = () => {
  const { user, userData, ensureUserDocument } = useContext(AuthContext);
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

  // Get the full name from user or userData
  const fullName = user.name || userData.name || '';

  // Split the full name into an array of names
  const nameParts = fullName.split(' ');

  // Assign first and second names
  const firstName = nameParts[0] || '';
  const secondName = nameParts[1] || '';

  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [profileCoverPreview, setProfileCoverPreview] = useState(null);


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

  // const handleFileChange = (e) => {
  //   if (e.target.name === 'profilePicture') {
  //     setPreview(URL.createObjectURL(e.target.name === 'profilePicture'));
  //     setProfilePictureFile(e.target.files[0]);
  //   } else if (e.target.name === 'businessPicture') {
  //     setBusinessPictureFile(e.target.files[0]);
  //   } else if (e.target.name === "profileCover") {
  //     setProfileCoverFile(e.target.files[0]);
  //   }
  // };

  const handleFileChange = (e) => {
    const name = e.target.name;
    const file = e.target.files[0];

    if (name === 'profilePicture') {
      setProfilePicturePreview(URL.createObjectURL(file));
      setProfilePictureFile(file);
    } else if (name === 'profileCover') {
      setProfileCoverPreview(URL.createObjectURL(file));
      setProfileCoverFile(file);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user) {
      console.log('User UID:', user.uid);

      let profilePictureUrl = profileDetails.profilePicture || '';
      let businessPictureUrl = profileDetails.businessPicture || '';
      let profileCoverUrl = profileDetails.profileCover || '';

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

      // Remove fields with undefined values
      Object.keys(updatedProfileDetails).forEach(key => {
        if (updatedProfileDetails[key] === undefined) {
          delete updatedProfileDetails[key];
        }
      });

      const docRef = doc(db, 'users', user.uid);

      try {
        // Ensure the user document exists
        await ensureUserDocument(user.uid);

        // Update the Firestore document
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
      <Helmet>
        <title>Profile | Sanna</title>
      </Helmet>
      <div className="fixed top-0 z-10 w-full bg-white border-b">
        <Navbar />
      </div>
      <section className=" h-screen flex flex-col md:flex-row gap-8 p-4 md:p-8 mt-16 bg-white md:w-full md:px-24 md:justify-center">
        {/* User activities */}
        <div className="flex-1 items-center ml-8 h-auto">
          <div className="flex items-center border border-gray-300 p-2 mb-4 w-full md:w-[87%] rounded gap-4 mx-auto">
            {profileDetails.profilePicture && (
              <img src={profileDetails.profilePicture} alt="Profile" className="w-10 h-10 rounded-full" />
            )}

            <h2 className="text-sm sm:text-5xl font-medium">{firstName || profileDetails.firstName} {secondName || profileDetails.secondName}</h2>

            <button
              className="bg-green-800 ml-auto text-sm text-white py-1 px-4 rounded"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
          <div className="flex items-center border border-gray-300 p-2 w-full md:w-[87%] rounded gap-4 mx-auto">
            {profileDetails.profileCover && (
              <img src={profileDetails.profileCover} alt="Profile" className="w-10 h-10 rounded" />
            )}
            <h2 className="text-sm sm:text-5xl font-medium">Your Cover Image</h2>

          </div>
        </div>

        {/* User details */}
        <div className="flex-1 border border-gray-300 py-6 h-[50%] px-4 md:px-8 bg-green-50 rounded">
          <h2 className="text-sm font-medium mb-2">Profile Details</h2>
          <div className="mb-4">
            <h3 className="text-sm text-white font-medium mb-2 bg-green-300 p-1 rounded-sm">Personal Details</h3>
            <div className="text-xs md:text-sm">
              <p>
                <strong>First Name: </strong>{firstName || profileDetails.firstName}
              </p>
              <p>
                <strong>Second Name: </strong>{secondName || profileDetails.secondName}
              </p>
              <p><strong>Email:</strong> {user.email || userData.email}</p>
              <p><strong>Phone:</strong> {profileDetails.personalPhone}</p>
            </div>
          </div>
        </div>
      </section>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 md:p-6 rounded shadow-lg md:w-[50%] w-[90%]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4  p-5">
              <div className="flex flex-col md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <h3 className="text-base md:text-sm font-semibold">Personal Details</h3>
                  <div className='flex gap-4'>
                    <label className="flex flex-col">
                      <span className="text-xs md:text-sm">First Name:</span>
                      <input
                        className="border p-1 rounded w-full"
                        type="text"
                        name="firstName"
                        value={firstName || profileDetails.firstName}
                        readOnly
                      />
                    </label>
                    <label className="flex flex-col">
                      <span className="text-xs md:text-sm">Second Name:</span>
                      <input
                        className="border p-1 rounded"
                        type="text"
                        name="secondName"
                        value={secondName || profileDetails.secondName}
                        readOnly
                      />
                    </label>
                  </div>
                  <div className='flex gap-3'>
                    <label className="flex flex-col">
                      <span className="text-xs md:text-sm">Email:</span>
                      <input
                        className="border p-1 rounded"
                        type="email"
                        value={user.email || userData.email}
                        readOnly
                      />
                    </label>
                    <label className="flex flex-col">
                      <span className="text-xs md:text-sm">Personal Phone:</span>
                      <input
                        className="border p-1 rounded"
                        type="text"
                        name="personalPhone"
                        value={profileDetails.personalPhone}
                        onChange={handleInputChange}
                      />
                    </label>
                  </div>
                  <div className='flex gap-3'>
                    <label className="flex flex-col">
                      <span className="block mb-2 font-medium">Upload Profile Picture</span>
                      <div className="flex items-center justify-center w-full border border-dashed border-green-500 rounded-lg p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <svg className="w-8 h-8 text-gray-500" fill="currentColor" stroke='green' viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zM4 5h12v10H4V5zm7 3l2.25 3h-1.5l-1.5-2-1.5 2H8.75L10 8zm-3 5a2 2 0 114 0h-4z" />
                        </svg>
                        <span className="ml-2 text-sm text-gray-500">Click to upload or drag and drop</span>
                      </div>
                      <input
                        className="hidden"
                        type="file"
                        id="profilePicture"
                        name="profilePicture"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {profilePicturePreview && (
                        <div className="relative w-40 h-40 mt-2 rounded-lg overflow-hidden border border-gray-300">
                          <img
                            src={profilePicturePreview}
                            alt="Profile Cover Preview"
                            className="object-cover w-full h-full"
                          />
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                            onClick={() => setProfilePicturePreview(null)} // Clear preview
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </label>
                    <label className="flex flex-col">
                      <span className="text-xs md:text-sm font-semibold mb-2 block">Profile Cover:</span>
                      <div className="flex items-center justify-center w-full border border-dashed border-green-500 rounded-lg p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <svg className="w-8 h-8 text-gray-500" fill="currentColor" stroke='green' viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zM4 5h12v10H4V5zm7 3l2.25 3h-1.5l-1.5-2-1.5 2H8.75L10 8zm-3 5a2 2 0 114 0h-4z" />
                        </svg>
                        <span className="ml-2 text-sm text-gray-500">Click to upload or drag and drop</span>
                      </div>
                      <input
                        className="hidden"
                        type="file"
                        id="profileCover"
                        name="profileCover"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {profileCoverPreview && (
                        <div className="relative w-40 h-40 mt-2 rounded-lg overflow-hidden border border-gray-300">
                          <img
                            src={profileCoverPreview}
                            alt="Profile Cover Preview"
                            className="object-cover w-full h-full"
                          />
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                            onClick={() => setProfileCoverPreview(null)} // Clear preview
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </label>
                  </div>

                </div>
              </div>
              <div className="flex justify-end mt-4 gap-3">
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

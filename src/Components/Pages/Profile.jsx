import React, { useEffect, useState, useContext } from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { AuthContext } from "../AppContext/AppContext";
import { db, storage } from "../firebase/firebase";
import { doc, setDoc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PostCard from "../Main/PostCard";

const Profile = () => {
  const { user, userData } = useContext(AuthContext);
  const [profileDetails, setProfileDetails] = useState({
    name: '',
    personalPhone: '',
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    profilePicture: ''
  });
  const [userPosts, setUserPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileDetails(docSnap.data());
        } else {
          setProfileDetails({
            name: user.displayName || userData?.name || '',
            personalPhone: '',
            businessName: '',
            businessEmail: '',
            businessPhone: '',
            profilePicture: ''
          });
        }
      }
    };

    const fetchUserPosts = async () => {
      if (user) {
        const postsCollection = collection(db, "posts");
        const q = query(postsCollection, where("uid", "==", user.uid));
        onSnapshot(q, (snapshot) => {
          setUserPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
      }
    };

    fetchProfileDetails();
    fetchUserPosts();
  }, [user, userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setProfilePictureFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      let profilePictureUrl = profileDetails.profilePicture;
      if (profilePictureFile) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        const uploadTask = await uploadBytes(storageRef, profilePictureFile);
        profilePictureUrl = await getDownloadURL(uploadTask.ref);
      }
      const updatedProfileDetails = { ...profileDetails, profilePicture: profilePictureUrl };
      const docRef = doc(db, "users", user.uid);
      try {
        await setDoc(docRef, updatedProfileDetails);
        setProfileDetails(updatedProfileDetails);
        alert('Profile updated successfully');
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile: ", error);
        alert('Error updating profile');
      }
    }
  };

  if (!user || !userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="fixed top-0 z-10 w-full bg-white">
        <Navbar />
      </div>

      <section className="flex flex-col md:flex-row gap-8 p-4 md:p-8 mt-16">
        {/* User activities */}
        <div className="flex-1 items-center">
          <div className="flex items-center shadow p-2 w-full md:w-[87%] rounded gap-4 mx-auto">
            {profileDetails.profilePicture && (
              <img src={profileDetails.profilePicture} alt="Profile" className="w-10 h-10 rounded-full" />
            )}
            <h2 className="text-sm sm:text-5xl font-medium">{profileDetails.name}</h2>
            <button
              className="bg-green-800 ml-auto text-sm text-white py-1 px-4 rounded"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
          <div className="mt-4">
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <PostCard
                  key={post.id}
                  logo={post.logo}
                  id={post.id}
                  uid={post.uid}
                  name={post.name}
                  email={post.email}
                  image={post.image}
                  text={post.text}
                  timestamp={new Date(post.timestamp?.toDate()).toUTCString()}
                  profilePicture={profileDetails.profilePicture}
                />
              ))
            ) : (
              <p>No posts yet</p>
            )}
          </div>
        </div>

        {/* User details */}
        <div className="flex-1 py-1 px-4 md:px-12 bg-white rounded mt-2">
          <div className="border border-gray-300 py-6 px-4 md:px-8 bg-green-50 rounded">
            <h2 className="text-sm font-medium mb-2">Profile Details</h2>
            <div className="mb-4">
              <h3 className="text-sm text-white font-medium mb-2 bg-green-300 p-1 rounded-sm">Personal Details</h3>
              <div className="text-xs">
                <p><strong>Name:</strong> {profileDetails.name}</p>
                <p><strong>Email:</strong> {user.email || userData.email}</p>
                <p><strong>Phone:</strong> {profileDetails.personalPhone}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm text-white font-medium mb-2 bg-green-300 p-1 rounded-sm">Business Details</h3>
              <div className="text-xs">
                <p><strong>Business Name:</strong> {profileDetails.businessName}</p>
                <p><strong>Business Email:</strong> {profileDetails.businessEmail}</p>
                <p><strong>Business Phone:</strong> {profileDetails.businessPhone}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full bg-white mt-8">
        <Footer />
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 md:p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg md:text-xl font-medium mb-4">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <h3 className="text-base md:text-lg font-medium">Personal Details</h3>
                <label className="block">
                  <span className="text-xs md:text-sm">Name:</span>
                  <input
                    className="border p-2 rounded"
                    type="text"
                    name="name"
                    value={profileDetails.name}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="block">
                  <span className="text-xs md:text-sm">Email:</span>
                  <input
                    className="border p-2 md:p-1 rounded"
                    type="email"
                    value={user.email || userData.email}
                    readOnly
                  />
                </label>
                <label className="block">
                  <span className="text-xs md:text-sm">Personal Phone:</span>
                  <input
                    className="border p-2 md:p-1 rounded"
                    type="text"
                    name="personalPhone"
                    value={profileDetails.personalPhone}
                    onChange={handleInputChange}
                  />
                </label>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-base md:text-lg font-medium">Business Details</h3>
                <label className="block">
                  <span className="text-xs md:text-sm">Business Name:</span>
                  <input
                    className="border p-2 md:p-1 rounded"
                    type="text"
                    name="businessName"
                    value={profileDetails.businessName}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="block">
                  <span className="text-xs md:text-sm">Business Email:</span>
                  <input
                    className="border p-2 md:p-1 rounded"
                    type="email"
                    name="businessEmail"
                    value={profileDetails.businessEmail}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="block">
                  <span className="text-xs md:text-sm">Business Phone:</span>
                  <input
                    className="border p-2 md:p-1 rounded"
                    type="text"
                    name="businessPhone"
                    value={profileDetails.businessPhone}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="block">
                  <span className="text-xs md:text-sm">Profile Picture:</span>
                  <input
                    className="border p-2 md:p-1 rounded"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  className="bg-green-500 text-white text-sm py-2 px-4 rounded"
                  type="button"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button className="text-black text-sm border border-green-600 py-2 px-4 rounded" type="submit">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

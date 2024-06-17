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

      <section className="flex gap-16 p-8">
        {/* User activities */}
        <div className="mt-24 flex-1 ml-[10%]">
          <div className="flex items-center gap-4">
            {profileDetails.profilePicture && (
              <img src={profileDetails.profilePicture} alt="Profile" className="w-20 h-20 rounded-full" />
            )}
            <h2 className="text-3xl sm:text-5xl font-medium">{profileDetails.name}</h2>
            <button
              className="border border-gray-500 text-sm text-black py-2 px-4 rounded"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
          <div className="mt-8">
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
        <div className="flex-1 border border-gray-300 py-12 px-12 bg-white rounded mt-20">
          <h2 className="text-2xl font-medium mb-4">Profile Details</h2>
          <div className="mb-8">
            <h3 className="text-xl font-medium mb-2">Personal Details</h3>
            <div>
              <p><strong>Name:</strong> {profileDetails.name}</p>
              <p><strong>Email:</strong> {user.email || userData.email}</p>
              <p><strong>Phone:</strong> {profileDetails.personalPhone}</p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">Business Details</h3>
            <div>
              <p><strong>Business Name:</strong> {profileDetails.businessName}</p>
              <p><strong>Business Email:</strong> {profileDetails.businessEmail}</p>
              <p><strong>Business Phone:</strong> {profileDetails.businessPhone}</p>
            </div>
          </div>
        </div>
      </section>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl h-auto">
            <h2 className="text-sm font-medium mb-4">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="flex flex-wrap justify-around">
              <div className="w-full md:w-1/2">
                <h3 className="text-xl font-medium mb-2">Personal Details</h3>
                <label className="block mb-2 text-sm">
                  Name:
                  <input
                    className="border p-2 rounded w-full mr-2"
                    type="text"
                    name="name"
                    value={profileDetails.name}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="block mb-2 text-sm">
                  Email:
                  <input
                    className="border p-2 rounded w-full"
                    type="email"
                    value={user.email || userData.email}
                    readOnly
                  />
                </label>
                <label className="block mb-2 text-sm">
                  Personal Phone:
                  <input
                    className="border p-2 rounded w-full"
                    type="text"
                    name="personalPhone"
                    value={profileDetails.personalPhone}
                    onChange={handleInputChange}
                  />
                </label>
              </div>
              <div className="w-full md:w-1/2">
                <h3 className="text-xl font-medium mb-2">Business Details</h3>
                <label className="block mb-2 text-sm">
                  Business Name:
                  <input
                    className="border p-2 rounded w-full"
                    type="text"
                    name="businessName"
                    value={profileDetails.businessName}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="block mb-2 text-sm">
                  Business Email:
                  <input
                    className="border p-2 rounded w-full"
                    type="email"
                    name="businessEmail"
                    value={profileDetails.businessEmail}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="block mb-2 text-sm">
                  Business Phone:
                  <input
                    className="border text-xs text-gray-300 p-2 rounded w-full"
                    type="text"
                    name="businessPhone"
                    value={profileDetails.businessPhone}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="block mb-2 text-sm">
                  Profile Picture:
                  <input
                    className="border p-2 rounded w-full"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <div className="w-full flex justify-end gap-4 mt-4">
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

      <div className="fixed bottom-0 z-10 w-full bg-white">
        <Footer />
      </div>
    </div>
  );
};

export default Profile;

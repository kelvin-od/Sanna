import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../Navbar/Navbar';
import { Helmet } from 'react-helmet';
import { AuthContext } from '../AppContext/AppContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AiOutlineCloudUpload } from 'react-icons/ai';
// import ConnectionCount from '../LeftSidebar/ConnectionCount';
// import ContentCount from '../LeftSidebar/ContentCount';
// import ReplyCount from '../LeftSidebar/ReplyCount';

const FileInput = ({ name, onChange, label, fileName }) => (
  <div className='flex flex-col mb-6'>
    <label className='text-gray-700 text-sm font-medium mb-2'>{label}</label>
    <div className='relative'>
      <input
        type="file"
        name={name}
        onChange={onChange}
        id={name}
        className='absolute inset-0 opacity-0 cursor-pointer'
      />
      <label
        htmlFor={name}
        className='flex items-center justify-center h-12 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-gray-500 transition-all duration-200'
      >
        <AiOutlineCloudUpload className='text-gray-500 mr-2' />
        <span className='text-gray-700'>
          {fileName ? fileName : 'Drag & drop or click to select file'}
        </span>
      </label>
    </div>
  </div>
);

const Profile = () => {
  const { user, userData, updateProfileDetails, ensureUserDocument } = useContext(AuthContext);
  const [displayName, setDisplayName] = useState(userData?.name || '');
  const [photoURL, setPhotoURL] = useState(userData?.photoURL || '');
  const [coverPhotoURL, setCoverPhotoURL] = useState(userData?.profileCover || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [password, setPassword] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAndEnsureUserDocument = async () => {
      if (user) {
        await ensureUserDocument(user.uid);
      }
    };

    checkAndEnsureUserDocument();

    if (userData) {
      setDisplayName(userData.name || '');
      setPhotoURL(userData.photoURL || '');
      setCoverPhotoURL(userData.profileCover || '');
      setEmail(userData.email || '');
    }
  }, [user, userData, ensureUserDocument]);

  const handleFileChange = (e) => {
    if (e.target.name === 'profilePhoto') {
      setPhotoFile(e.target.files[0]);
    } else if (e.target.name === 'coverPhoto') {
      setCoverPhotoFile(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      let newPhotoURL = photoURL;
      let newCoverPhotoURL = coverPhotoURL;

      const storage = getStorage();

      // Upload profile photo if available
      if (photoFile) {
        const photoStorageRef = ref(storage, `profilePictures/${user.uid}/${photoFile.name}`);
        await uploadBytes(photoStorageRef, photoFile);
        newPhotoURL = await getDownloadURL(photoStorageRef);
      }

      // Upload cover photo if available
      if (coverPhotoFile) {
        const coverPhotoStorageRef = ref(storage, `profileCover/${user.uid}/${coverPhotoFile.name}`);
        await uploadBytes(coverPhotoStorageRef, coverPhotoFile);
        newCoverPhotoURL = await getDownloadURL(coverPhotoStorageRef);
      }

      if (user) {
        await updateProfileDetails({
          name: displayName,
          photoURL: newPhotoURL,
          email,
          profileCover: newCoverPhotoURL,
        });
        alert('Profile updated successfully');
      }
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    setLoading(true);
    try {
      if (user) {
        await user.updateEmail(email);
        await updateProfileDetails({ email });
        alert('Email updated successfully');
      }
    } catch (error) {
      alert('Error updating email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setLoading(true);
    try {
      if (user) {
        await user.updatePassword(password);
        alert('Password updated successfully');
      }
    } catch (error) {
      alert('Error updating password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Profile | Sanna</title>
      </Helmet>
      <div className="fixed top-0 z-10 w-full bg-white border-b">
        <Navbar />
      </div>

      <div className='flex mt-16 mx-32'>
        <div className='flex flex-col w-[40%] mr-4'>
          <div className='flex'>
            {coverPhotoURL ? (
              <img
                src={coverPhotoURL}
                alt="Cover Photo"
                className='rounded-lg border-2 w-full h-auto max-w-screen-lg max-h-48 object-cover'
              />
            ) : (
              <div className='rounded-lg border-2 w-full h-48 max-w-screen-lg max-h-48 flex items-center justify-center bg-white'>
                <div className='text-center'>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className='w-12 h-12 text-gray-400 mx-auto mb-2'
                    fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
                    <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>

                  <span className='text-gray-500'>Upload Cover Photo</span>
                </div>
              </div>
            )}
            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className='absolute border-2 border-green-500 z-10 w-24 h-24 top-52 rounded-full border-2 border-gray-300'
              />
            ) : (
              <div className='absolute border border-green-200 z-10 w-24 h-24 top-52 rounded-full p-3 flex items-center justify-center bg-white'>
                <div className='text-center'>
                  <span className='text-gray-500 text-sm'>Upload Profile Photo</span>
                </div>
              </div>
            )}
          </div>

        </div>
        <div className='flex flex-col w-[60%] bg-white px-12 py-8'>
          <div className='flex flex-col mb-6'>
            <label className='text-gray-700 text-sm font-medium mb-2'>Display Name</label>
            <input
              type="text"
              name="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className='p-1 border border-gray-500 rounded-md w-[50%]'
            />
          </div>
          <div className='flex gap-2'>
            <FileInput name="profilePhoto" onChange={handleFileChange} label="Profile Photo" fileName={photoFile?.name} />
            <FileInput name="coverPhoto" onChange={handleFileChange} label="Cover Photo" fileName={coverPhotoFile?.name} />
          </div>
          <button
              onClick={handleUpdateProfile}
              className='border border-gray-300 hover:bg-green-600 hover:text-white text-gray-700 py-1 px-2 rounded w-[30%]'
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          <div className='flex flex-col mb-6'>
            <label className='text-gray-700 text-sm font-medium my-2'>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='p-1 border border-gray-500 rounded-md w-[50%]'
            />
          </div>
          <button
            onClick={handleUpdateEmail}
            className='border border-gray-300 hover:bg-green-600 hover:text-white text-gray-700 py-1 px-2 rounded w-[30%]'
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Email'}
          </button>
          <div className='flex flex-col mb-6'>
            <label className='text-gray-700 text-sm font-medium mb-2'>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='p-1 border border-gray-500 rounded-md w-[50%]'
            />
          </div>
          <button
            onClick={handleUpdatePassword}
            className='border border-gray-300 hover:bg-green-600 hover:text-white text-gray-700 py-1 px-2 rounded w-[30%]'
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
      {/* <div className='bg-white p-6 rounded-lg shadow-lg mx-32'>
        <h2 className='text-xl font-bold mb-4 text-gray-900'>Your Activity</h2>
        <div className='flex flex-row items-center'>
          <ConnectionCount />
          <ContentCount />
          <ReplyCount />
        </div>
      </div> */}
    </>
  );
};

export default Profile;

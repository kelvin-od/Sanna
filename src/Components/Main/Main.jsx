import React, { useContext, useRef, useState, useReducer, useEffect } from 'react';
import avatar from "../../Assets/Images/avatar.avif";
import { AuthContext } from "../AppContext/AppContext";
import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  PostsReducer,
  postActions,
  postsStates,
} from "../AppContext/PostReducer";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import PostCard from "./PostCard";
import AdvertPostCard from '../CashCow/AdvertPostCard';

const Main = () => {
  const { user, userData } = useContext(AuthContext);
  const [state, dispatch] = useReducer(PostsReducer, postsStates);
  const [file, setFile] = useState(null);
  const text = useRef("");
  const scrollRef = useRef(null);
  const [image, setImage] = useState(null);
  const postRef = doc(collection(db, "posts"));
  const collectionRef = collection(db, "posts");
  const advertsCollectionRef = collection(db, "adverts");
  const { SUBMIT_POST, HANDLE_ERROR } = postActions;
  const document = postRef.id;
  const [progressBar, setProgressBar] = useState(0);
  const [advertPosts, setAdvertPosts] = useState([]);
  const defaultLogo = 'path/to/default/logo.png';
  const defaultImage = 'path/to/default/image.png';


  // State for floating icon visibility
  const [showFloatingIcon, setShowFloatingIcon] = useState(false);

  // State for popup visibility
  const [showPopup, setShowPopup] = useState(false);

  const handleUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (text.current.value !== "") {
      try {
        await setDoc(postRef, {
          documentId: document,
          uid: user?.uid || userData?.uid,
          logo: user?.photoURL,
          name: user?.displayName || userData?.name,
          email: user?.email || userData?.email,
          text: text.current.value,
          image: image,
          timestamp: serverTimestamp(),
        });
        console.log('Post submitted:', {
          documentId: document,
          uid: user?.uid || userData?.uid,
          logo: user?.photoURL,
          name: user?.displayName || userData?.name,
          email: user?.email || userData?.email,
          text: text.current.value,
          image: image,
          timestamp: serverTimestamp(),
        });
        text.current.value = "";
      } catch (err) {
        dispatch({ type: HANDLE_ERROR });
        console.error('Error submitting post:', err);
        alert(err.message);
      }
    } else {
      dispatch({ type: HANDLE_ERROR });
    }
  };

  const storage = getStorage();

  const metadata = {
    contentType: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/svg+xml",
    ],
  };

  const submitImage = async () => {
    const fileType = metadata.contentType.includes(file["type"]);
    if (!file) return;
    if (fileType) {
      try {
        const storageRef = ref(storage, `images/${file.name}`);
        const uploadTask = uploadBytesResumable(
          storageRef,
          file,
          metadata.contentType
        );
        await uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgressBar(progress);
            console.log('Upload progress:', progress);
          },
          (error) => {
            console.error('Error uploading image:', error);
            alert(error);
          },
          async () => {
            await getDownloadURL(uploadTask.snapshot.ref).then(
              (downloadURL) => {
                setImage(downloadURL);
                console.log('Image uploaded, download URL:', downloadURL);
              }
            );
          }
        );
      } catch (err) {
        dispatch({ type: HANDLE_ERROR });
        console.error('Error submitting image:', err);
        alert(err.message);
      }
    }
  };

  useEffect(() => {
    const postData = async () => {
      const q = query(collectionRef, orderBy("timestamp", "asc"));
      return onSnapshot(q, (doc) => {
        const posts = doc?.docs?.map((item) => item?.data());
        console.log('Fetched posts:', posts);
        dispatch({
          type: SUBMIT_POST,
          posts: posts,
        });
        scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
        setImage(null);
        setFile(null);
        setProgressBar(0);
      });
    };
    postData();
  }, [SUBMIT_POST]);

  useEffect(() => {
    const fetchAdvertPosts = async () => {
      const q = query(advertsCollectionRef, orderBy("timestamp", "asc"));
      return onSnapshot(q, (snapshot) => {
        const ads = snapshot?.docs?.map((doc) => doc?.data());
        console.log('Fetched advert posts:', ads);
        setAdvertPosts(ads);
        scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
      });
    };
    fetchAdvertPosts();
  }, []);

  const combinedPosts = [...state.posts, ...advertPosts].sort((a, b) => {
    if (!a.timestamp) return 1; // Move posts with null timestamp to the end
    if (!b.timestamp) return -1;
    return b.timestamp.toDate() - a.timestamp.toDate();
  });

  const handleScroll = () => {
    // Adjust the threshold as needed based on your layout
    const threshold = 400; // Example: Show icon when scrolled down by 200 pixels
    if (window.scrollY > threshold) {
      setShowFloatingIcon(true);
    } else {
      setShowFloatingIcon(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  return (
    <div className='flex flex-col items-center bg-gray-200 md:bg-[#F4F2F2]'>
      <div className='flex flex-col py-4  bg-white mx-4 md:mx-6 w-full md:w-[88%] shadow-md rounded-lg border border-gray-300'>
        <div className='flex items-center border-b border-green-50 pb-4 pl-4 w-full '>
          <img sizes='sm' className='w-[2rem] rounded-full' variant="circular" src={user?.photoURL || avatar} alt="avatar" />
          <form className='w-full' action="" onSubmit={handleSubmitPost}>
            <div className='flex justify-between items-center'>
              <div className='w-full ml-4 '>
                <input
                  className='outline-none w-full bg-white border border-gray-200 rounded-md font-normal text-sm'
                  type="text"
                  name='text'
                  placeholder={`Share some knowledge about farming/agriculture ${user?.displayName?.split(" ")[0] ||
                    userData?.name?.charAt(0).toUpperCase() +
                    userData?.name?.slice(1)
                    }`}
                  ref={text} />
              </div>
              <div className='mx-4'>
                {image && (
                  <img
                    className="h-24 rounded-xl"
                    src={image}
                    alt="previewImage"
                  ></img>
                )}
              </div>
              <div className='mr-3'>
                <button className='bg-green-500 py-1 px-4 text-white text-sm rounded-xs' type='submit'>Share</button>
              </div>
            </div>
          </form>
        </div>
        <span
          style={{ width: `${progressBar}%` }}
          className="bg-blue-700 py-1 rounded-md"
        ></span>
        <div className='flex justify-around items-center pt-2'>
          <div className='flex items-center'>
            <label htmlFor="addImage" className='cursor-pointer items-center flex'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-green-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <input
                type="file"
                id='addImage'
                style={{ display: 'none' }}
                onChange={handleUpload} />
            </label>
            {file && (<button className='text-sm' onClick={submitImage}>Upload</button>)}
          </div>
          {/* <div className='flex items-center'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-green-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.904 18.5H18.75m-12.846 0-.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
            </svg>
            <p className='font-roboto font-normal text-sm ml-2 text-gray-700 no-underline tracking-normal leading-none'>Like</p>
          </div>
          <div className='flex items-center'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-green-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75 18 6m0 0 2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
            </svg>
            <p className='font-roboto font-normal text-sm ml-2 text-gray-700 no-underline tracking-normal leading-none'>Feeling</p>
          </div> */}
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className='flex flex-col py-4  bg-gray-200 mx-4 md:mx-8 w-[93%] md:w-[87%] rounded-lg border border-gray-300'>
            <div className='flex items-center border-b border-white pb-4 pl-4 w-full '>
              <img sizes='sm' className='w-[2rem] rounded-full' variant="circular" src={user?.photoURL || avatar} alt="avatar" />
              <form className='w-full' onSubmit={(e) => { e.preventDefault(); setShowPopup(false); handleSubmitPost(e); }}>
                <div className='flex justify-between items-center'>
                  <div className='w-full ml-4 '>
                    <input
                      className='outline-none w-full bg-white border border-gray-200 rounded-md font-normal text-sm'
                      type="text"
                      name='text'
                      placeholder={`What are you Cross-selling today? ${user?.displayName?.split(" ")[0] ||
                        userData?.name?.charAt(0).toUpperCase() +
                        userData?.name?.slice(1)
                        }`}
                      ref={text} />
                  </div>
                  <div className='mx-4'>
                    {image && (
                      <img
                        className="h-24 rounded-xl"
                        src={image}
                        alt="previewImage"
                      ></img>
                    )}
                  </div>
                  <div className='mr-4'>
                    <button className='bg-green-500 py-1 px-4 text-white text-sm rounded-xs' type='submit'>Share</button>
                  </div>
                </div>
              </form>
            </div>
            <span
              style={{ width: `${progressBar}%` }}
              className="bg-blue-700 py-1 rounded-md"
            ></span>
            <div className='flex justify-around items-center pt-2'>
              <div className='flex items-center'>
                <label htmlFor="addImage" className='cursor-pointer items-center flex'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-green-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <input
                    type="file"
                    id='addImage'
                    style={{ display: 'none' }}
                    onChange={handleUpload} />
                </label>
                {file && (<button onClick={submitImage}>Upload</button>)}
              </div>
              <div className='flex items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-green-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.904 18.5H18.75m-12.846 0-.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                </svg>
                <p className='font-roboto font-normal text-sm ml-2 text-gray-700 no-underline tracking-normal leading-none'>Like</p>
              </div>
              <div className='flex items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-green-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75 18 6m0 0 2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
                </svg>
                <p className='font-roboto font-normal text-sm ml-2 text-gray-700 no-underline tracking-normal leading-none'>Feeling</p>
              </div>
            </div>
          </div>
          {/* Removed Close button */}
        </div>
      )}

      {/* Floating Icon */}
      {showFloatingIcon && (
        <div>
          <button
            className="fixed top-2 right-5 z-50 bg-green-500 text-white rounded-full p-1 shadow-md lg:hidden"
            onClick={() => setShowPopup(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>

        </div>

      )}

      <div className='flex flex-col py-2 mt-4'>
        {state?.error ? (
          <div className="flex justify-center items-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">Something went wrong. Refresh and try again...</span>
            </div>
          </div>
        ) : (
          <div className='space-y-2'>
            {combinedPosts.length > 0 &&
              combinedPosts.map((post, index) => {
                if (post.retailPrice) {
                  return (
                    <AdvertPostCard
                      key={post?.documentId ?? index} // Use a unique identifier, fallback to index if necessary
                      logo={post?.logo ?? defaultLogo} // Provide a default logo if post.logo is undefined
                      id={post?.documentId ?? ''} // Ensure documentId matches your Firestore document field name
                      uid={post?.uid ?? ''}
                      businessName={post?.businessName ?? 'Unknown Business'}
                      retailPrice={post?.retailPrice ?? 'N/A'}
                      crossSalePrice={post?.crossSalePrice ?? 'N/A'}
                      location={post?.location ?? 'Unknown Location'}
                      expiryDate={post?.expiryDate ?? 'N/A'}
                      name={post?.name ?? 'Unnamed Product'}
                      image={post?.image ?? defaultImage} // Provide a default image if post.image is undefined
                      text={post?.text ?? 'No description available'}
                      timestamp={post?.timestamp ? new Date(post.timestamp.toDate()).toUTCString() : 'No timestamp'}
                    />
                  );
                } else {
                  return (
                    <PostCard
                      key={index}
                      logo={post?.logo}
                      id={post?.documentId}
                      uid={post?.uid}
                      name={post?.name}
                      email={post?.email}
                      image={post?.image}
                      text={post?.text}
                      timestamp={post?.timestamp ? new Date(post.timestamp.toDate()).toUTCString() : 'No timestamp'}
                    />
                  );
                }
              })}
          </div>
        )}
      </div>
      <div ref={scrollRef}></div>
    </div>
  );
}

export default Main;
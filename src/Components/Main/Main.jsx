import React, { useContext, useRef, useState, useReducer, useEffect } from 'react';
import avatar from "../../Assets/Images/avatar.jpg";
import { AuthContext } from "../AppContext/AppContext";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db, storage } from "../firebase/firebase";
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
  const { user, userData} = useContext(AuthContext);
  const [state, dispatch] = useReducer(PostsReducer, postsStates);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const text = useRef(null);
  // const text = useRef("");
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
  const [files, setFiles] = useState([]);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [photoURL, setPhotoURL] = useState(userData?.photoURL || '');
  

  // State for floating icon visibility
  const [showFloatingIcon, setShowFloatingIcon] = useState(false);

  // State for popup visibility
  const [showPopup, setShowPopup] = useState(false);

  const handleUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const urlPattern = new RegExp('https?://(?:[-\\w.]|(?:%[\\da-fA-F]{2}))+', 'i');

  const detectURL = (text) => {
    const urls = text.match(urlPattern);
    if (urls && urls.length > 0) {
      fetchURLMetadata(urls[0]);
    }
  };


  const fetchURLMetadata = async (url) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.linkpreview.net/?key=f4d601ba4e104c0fec4ddbd5a03a24cd&q=${encodeURIComponent(url)}`);
      const data = await response.json();
      setPreviewData(data);
    } catch (error) {
      setError('Failed to fetch link preview.');
      console.error('Error fetching URL metadata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    const textValue = text.current.value.trim();
    const isLink = urlPattern.test(textValue);
  
    if (textValue !== "" || (files && files.length > 0)) {
      let uploadedMediaUrls = [];
  
      // Upload media files
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const isImage = file.type.startsWith('image/');
          const storageRef = ref(storage, `${isImage ? 'images' : 'videos'}/${file.name}`);
          const uploadTask = uploadBytesResumable(storageRef, file);
  
          try {
            await new Promise((resolve, reject) => {
              uploadTask.on(
                "state_changed",
                (snapshot) => {
                  const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                  setProgressBar(progress);
                },
                (error) => {
                  console.error(`Error uploading ${isImage ? 'image' : 'video'}:`, error);
                  alert(error);
                  reject(error);
                },
                async () => {
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  uploadedMediaUrls.push(downloadURL);
                  resolve();
                }
              );
            });
          } catch (error) {
            console.error('Upload failed:', error);
            return;
          }
        }
      }
  
      // Prepare post data with default values for potentially undefined fields
      const postData = {
        documentId: document || "",
        uid: user?.uid || userData?.uid || "",
        logo: user?.photoURL || "",
        name: user?.displayName || userData?.name || "",
        email: user?.email || userData?.email || "",
        text: textValue, // Allow text even if it's a link
        media: uploadedMediaUrls,
        linkPreview: isLink ? previewData : null,
        timestamp: serverTimestamp(),
      };
  
      // Log postData to ensure there are no undefined values
      console.log("Post Data:", postData);
  
      try {
        // Submit the post
        await setDoc(postRef, postData);
  
        // Clear input and reset state
        text.current.value = "";
        setFiles([]);
        setMediaUrls([]);
        setPreviewData(null);
        setProgressBar(0);
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } catch (error) {
        console.error('Error submitting post:', error);
        alert('Failed to submit post.');
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

  const truncateSummary = (text, maxLength = 100) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };



  return (
    <div className='flex flex-col items-center bg-gray-200 md:bg-[#F4F2F2]'>
      <div className='flex flex-col bg-white w-full border-y md:border border-gray-300 w-[93%] md:w-[88%]'>
        <div className='flex items-center bg-white border-b p-3 mt-2 border-green-50'>
          <img sizes='sm' className='w-7 h-7 rounded-full' variant="circular" src={userData?.photoURL || avatar} alt="avatar" />
          <form className='w-full items-center' action="" onSubmit={handleSubmitPost}>
            <div className='flex justify-between items-center'>
              <div className='w-full ml-4 '>
                <textarea
                  className='outline-none w-full h-24 bg-gray-100 border border-gray-300 rounded-md p-2 font-normal text-sm mb-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500'
                  type="text"
                  name='text'
                  placeholder={`Share some knowledge about farming/agriculture ${user?.displayName?.split(" ")[0] ||
                    userData?.name?.charAt(0).toUpperCase() +
                    userData?.name?.slice(1)
                    }`}
                  ref={text}
                  onChange={(e) => detectURL(e.target.value)}
                />
              </div>
              <div className="ml-3">
                <button className='bg-green-500 py-1 px-4 text-white text-sm rounded-xs' type='submit'>Share</button>
              </div>
            </div>
          </form>
        </div>
        <div className='mx-4 flex'>
          {Array.from(files).map((file, index) => {
            const fileType = file.type.split('/')[0];
            if (fileType === 'image') {
              return (
                <img
                  key={index}
                  className="h-24 rounded-xl m-1"
                  src={URL.createObjectURL(file)}
                  alt={`preview ${index}`}
                />
              );
            } else if (fileType === 'video') {
              return (
                <video
                  key={index}
                  className="h-24 rounded-xl m-1"
                  src={URL.createObjectURL(file)}
                  controls
                  alt={`preview ${index}`}
                />
              );
            }
            return null;
          })}

          {isLoading && <div className="text-gray-500">Loading preview...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {previewData && (
            <a href={previewData.url} target="_blank" rel="noopener noreferrer">
              <div className="url-preview border rounded-md shadow-md p-3 bg-white flex flex-col items-center">
                <div className='w-full'>
                  {previewData.image && (
                    <img src={previewData.image} alt="Preview" className="w-full mr-3 rounded-md" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{previewData.title}</h3>
                  <p className="text-sm text-gray-600">
                    {truncateSummary(previewData.description)}
                  </p>
                  <span className="text-blue-500 text-sm">{previewData.url}</span>
                </div>
              </div>
            </a>
          )}



        </div>
        <span
          style={{ width: `${progressBar}%` }}
          className="bg-green-700 py-1 rounded-md"
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
                multiple
                style={{ display: 'none' }}
                onChange={(e) => setFiles(e.target.files)} />
            </label>
          </div>
        </div>
        <div className='flex flex-wrap justify-center mt-4'>
          {mediaUrls.map((url, index) => {
            const isImage = url.match(/\.(jpeg|jpg|gif|png|svg|webp)$/);
            const isVideo = url.match(/\.(mp4|webm|ogg)$/);

            if (isImage) {
              return <img key={index} src={url} alt={`media ${index}`} className="w-full h-auto object-cover m-2" />;
            } else if (isVideo) {
              return <video key={index} src={url} controls className="w-full h-auto object-cover m-2" />;
            }
            return null;
          })}
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className='flex fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50'>
          <div className='flex items-center bg-white border-b p-3 mt-2 border-green-50  w-full md:w-[88%] '>
            <img sizes='sm' className='w-7 h-7 rounded-full' variant="circular" src={photoURL || avatar} alt="avatar" />
            <form className='w-full items-center' action="" onSubmit={(e) => { e.preventDefault(); setShowPopup(false); handleSubmitPost(e); }}>
              <div className='flex justify-between items-center'>
                <div className='w-full ml-4 '>
                  <textarea
                    className='outline-none w-full h-24 bg-gray-100 border border-gray-300 rounded-md p-2 font-normal text-sm mb-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500'
                    type="text"
                    name='text'
                    placeholder={`Share some knowledge about farming/agriculture ${user?.displayName?.split(" ")[0] ||
                      userData?.name?.charAt(0).toUpperCase() +
                      userData?.name?.slice(1)
                      }`}
                    ref={text} />
                </div>
                <div className='mx-4 flex flex-wrap'>
                  {Array.from(files).map((file, index) => {
                    const fileType = file.type.split('/')[0];
                    if (fileType === 'image') {
                      return (
                        <img
                          key={index}
                          className="h-24 rounded-xl m-1"
                          src={URL.createObjectURL(file)}
                          alt={`preview ${index}`}
                        />
                      );
                    } else if (fileType === 'video') {
                      return (
                        <video
                          key={index}
                          className="h-24 rounded-xl m-1"
                          src={URL.createObjectURL(file)}
                          controls
                          alt={`preview ${index}`}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
                <div className="mr-2">
                  <button className='bg-green-500 py-1 px-4 text-white text-sm rounded-xs' type='submit'>Share</button>
                </div>
              </div>
            </form>
          </div>
          <span
            style={{ width: `${progressBar}%` }}
            className="bg-green-700 py-1 rounded-md"
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
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => setFiles(e.target.files)} />
              </label>
            </div>
          </div>
          <div className='flex flex-wrap justify-center mt-4'>
            {mediaUrls.map((url, index) => {
              const isImage = url.match(/\.(jpeg|jpg|gif|png|svg|webp)$/);
              const isVideo = url.match(/\.(mp4|webm|ogg)$/);

              if (isImage) {
                return <img key={index} src={url} alt={`media ${index}`} className="w-full h-auto object-cover m-2" />;
              } else if (isVideo) {
                return <video key={index} src={url} controls className="w-full h-auto object-cover m-2" />;
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Floating Icon */}
      {showFloatingIcon && (
        <div>
          <button
            className="fixed top-4 right-5 z-50 bg-green-500 text-white rounded-full p-1 shadow-md lg:hidden"
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
          <div className='space-y-2 w-full'>
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
                      post={post}
                      previewData={post?.linkPreview}
                      id={post?.documentId}
                      uid={post?.uid}
                      name={post?.name}
                      email={post?.email}
                      image={post?.image}
                      media={post?.media}
                      text={post?.text}
                      timestamp={post?.timestamp ? new Date(post.timestamp.toDate()).toUTCString() : 'No timestamp'}
                    />
                  );
                }
              })}
          </div>
        )}
      </div>
      {/* <div ref={scrollRef}></div> */}
    </div>
  );
}

export default Main;
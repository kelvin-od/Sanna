import React, { useContext, useRef, useState, useReducer, useEffect } from 'react'
import avatar from "../../Assets/Images/avatar.avif"
import addImage from "../../Assets/Images/addImage.png"
import like from "../../Assets/Images/like.jpg"
// import {  } from '@fortawesome/free-solid-svg-icons';
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
import PostCard from "./PostCard"




const Main = () => {

  const { user, userData } = useContext(AuthContext);
  const [state, dispatch] = useReducer(PostsReducer, postsStates);
  const [file, setFile] = useState(null);
  const text = useRef("");
  const scrollRef = useRef("");
  const [image, setImage] = useState(null);
  const postRef = doc(collection(db, "posts"));
  const collectionRef = collection(db, "posts");
  const { SUBMIT_POST, HANDLE_ERROR } = postActions;
  const document = postRef.id;
  const [progressBar, setProgressBar] = useState(0);


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
        text.current.value = "";
      } catch (err) {
        dispatch({ type: HANDLE_ERROR });
        alert(err.message);
        console.log(err.message);
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
          },
          (error) => {
            alert(error);
          },
          async () => {
            await getDownloadURL(uploadTask.snapshot.ref).then(
              (downloadURL) => {
                setImage(downloadURL);
              }
            );
          }
        );
      } catch (err) {
        dispatch({ type: HANDLE_ERROR });
        alert(err.message);
        console.log(err.message);
      }
    }
  };


  useEffect(() => {
    const postData = async () => {
      const q = query(collectionRef, orderBy("timestamp", "asc"));
      await onSnapshot(q, (doc) => {
        dispatch({
          type: SUBMIT_POST,
          posts: doc?.docs?.map((item) => item?.data()),
        });
        scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
        setImage(null);
        setFile(null);
        setProgressBar(0);
      });
    };
    return () => postData();
  }, [SUBMIT_POST]);


  return (
    <div className='flex flex-col items-center'>
      <div className='flex flex-col py-4 w-[85%] bg-white rounded-3xl shadow-lg'>
        <div className='flex items-center border-b-2 border-gray-300 pb-4 pl-4 w-full '>
          <img sizes='sm' className='h-10 w-10 rounded-full' variant="circular" src={avatar} alt="avatar" />
          <form className='w-full' action="" onSubmit={handleSubmitPost}>
            <div className='flex justify-between items-center'>
              <div className='w-full ml-4 '>
                <input
                  className='outline-none w-full bg-white rounded-md'
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
                <button className='bg-green-500 py-2 px-4 text-white rounded-lg' type='submit'>Share</button>
              </div>
            </div>
          </form>
        </div>
        <span
          style={{ width: `${progressBar}%` }}
          className="bg-blue-700 py-1 rounded-md"
        ></span>
        <div className='flex justify-around items-center pt-4'>
          <div className='flex items-center'>
            <label htmlFor="addImage" className='cursor-pointer items-center flex'>
              <img className='h-5 mr-4' src={addImage} alt="addImage" />
              <input 
              type="file" 
              id='addImage' 
              style={{ display: 'none' }}
              onChange={handleUpload} />
              {/* <button>upload</button> */}
            </label>
            {file && (<button onClick={submitImage}>Upload</button>) }
            
          </div>
          <div className='flex items-center'>
            <img className='h-5 mr-4' src={like} alt="like" />
            <p className='font-roboto font-medium text-md text-gray-700 no-underline tracking-normal leading-none'>Like</p>
          </div>
          <div className='flex items-center'>
            <img className='h-5 mr-4' src={like} alt="feeling" />
            <p className='font-roboto font-medium text-md text-gray-700 no-underline tracking-normal leading-none'>Feeling</p>
          </div>
        </div>
      </div>
      <div className='flex flex-col py-4 w-full'>
      {state?.error ? (
          <div className="flex justify-center items-center">
            <Alert color="red">
              Something went wrong refresh and try again...
            </Alert>
          </div>
        ) : (
          <div>
            {state?.posts?.length > 0 &&
              state?.posts?.map((post, index) => {
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
                    timestamp={new Date(
                      post?.timestamp?.toDate()
                    )?.toUTCString()}
                  ></PostCard>
                );
              })}
          </div>
        )}
      </div>
      <div  ref={scrollRef}>
        {/* reference for later */}
      </div>
    </div>
  )
}

export default Main
import React, { useContext, useState, useReducer, useEffect, useRef } from "react";
import avatar from "../../Assets/Images/avatar.avif";
import { AuthContext } from "../AppContext/AppContext";
import {
  PostsReducer,
  postActions,
  postsStates,
} from "../AppContext/PostReducer";
import {
  doc,
  setDoc,
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import CommentSection from "./CommentSection";

const PostCard = ({ uid, id, logo, name, email, text, image, timestamp }) => {
  const { user } = useContext(AuthContext);
  console.log("User object:", user); // Added for debugging
  const [state, dispatch] = useReducer(PostsReducer, postsStates);
  const likesRef = doc(collection(db, "posts", id, "likes"));
  const likesCollection = collection(db, "posts", id, "likes");
  const { ADD_LIKE, HANDLE_ERROR, ADD_COMMENT } = postActions;
  const [open, setOpen] = useState(false);
  const singlePostDocument = doc(db, "posts", id);
  const commentButtonRef = useRef(null);

  const handleOpen = (e) => {
    e.preventDefault();
    setOpen(!open);
  };

  const addUser = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const doc = await getDocs(q);
      const data = doc.docs[0].ref;
      await updateDoc(data, {
        friends: arrayUnion({
          id: uid,
          image: logo,
          name: name,
        }),
      });
    } catch (err) {
      alert(err.message);
      console.log(err.message);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    const q = query(likesCollection, where("id", "==", user?.uid));
    const querySnapshot = await getDocs(q);
    const likesDocId = await querySnapshot?.docs[0]?.id;
    
    try {
      if (likesDocId !== undefined) {
        const deleteId = doc(db, "posts", id, "likes", likesDocId);
        await deleteDoc(deleteId);
      } else {
        await setDoc(likesRef, {
          id: user?.uid,
        });
        await addNotification("like", `${user.displayName} liked your post`, uid, id);
      }
    } catch (err) {
      alert(err.message);
      console.log(err.message);
    }
  };

  const addNotification = async (type, message, userId, postId) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        type,
        postId,
        message,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error("Error adding notification: ", err);
    }
  };

  const deletePost = async (e) => {
    e.preventDefault();
    try {
      if (user?.uid === uid) {
        await deleteDoc(singlePostDocument);
      } else {
        alert("You can't delete other users' posts !!!");
      }
    } catch (err) {
      alert(err.message);
      console.log(err.message);
    }
  };

  useEffect(() => {
    const getLikes = async () => {
      try {
        const q = collection(db, "posts", id, "likes");
        await onSnapshot(q, (doc) => {
          dispatch({
            type: ADD_LIKE,
            likes: doc.docs.map((item) => item.data()),
          });
        });
      } catch (err) {
        dispatch({ type: HANDLE_ERROR });
        alert(err.message);
        console.log(err.message);
      }
    };
    const getComments = async () => {
      try {
        const q = collection(db, "posts", id, "comments");
        await onSnapshot(q, (doc) => {
          dispatch({
            type: ADD_COMMENT,
            comments: doc.docs.map((item) => item.data()),
          });
        });
      } catch (err) {
        dispatch({ type: HANDLE_ERROR });
        alert(err.message);
        console.log(err.message);
      }
    };
    getLikes();
    getComments();
  }, [id, ADD_LIKE, ADD_COMMENT, HANDLE_ERROR]);

  return (
    <div className="mb-4 justify-center mx-8">
      <div className="flex flex-col py-4 bg-white border border-gray-300 rounded-md w-full shadow-lg">
        <div className="flex items-center py-4 ml-4 w-full">
          <img className="w-[2rem] rounded-full" src={avatar} alt="avatar" />
          <div className="flex flex-col w-full">
            <p className="ml-4 py-2 font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none">
              {email}
            </p>
            <p className="ml-4 font-roboto w-full font-normal text-xs text-gray-500 no-underline tracking-normal leading-none">
              Published: {timestamp}
            </p>
          </div>
          {user?.uid !== uid && (
            <div
              onClick={addUser}
              className="flex justify-end cursor-pointer mr-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 fill-green-700 hover:fill-green-500">
                <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
              </svg>
            </div>
          )}
        </div>
        <div className="pb-4 font-roboto font-normal text-sm text-gray-700 no-underline tracking-normal leading-none">
          <p className="ml-4 pb-4 font-roboto font-normal text-black text-xs pr-3 leading-normal">
            {text}
          </p>
          {image && (<img className="h-auto w-full" src={image} alt="postImage" />)}
        </div>
        <div className="flex justify-around pb-1 items-center border-t">
          <button className="flex items-center cursor-pointer rounded-lg pt-2 hover:bg-gray-100" onClick={handleLike}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 fill-gray-700 hover:fill-gray-500">
              <path fillRule="evenodd" d="M12 4.879l-.94-.94c-1.738-1.737-4.64-1.737-6.378 0A4.5 4.5 0 0 0 2.44 9.44L12 19l9.56-9.56a4.5 4.5 0 0 0-6.378-6.378L12 4.878ZM4.56 3.56c2.32-2.32 6.08-2.32 8.4 0l.94.94.94-.94c2.32-2.32 6.08-2.32 8.4 0 2.32 2.32 2.32 6.08 0 8.4l-9.56 9.56a1.5 1.5 0 0 1-2.12 0L4.56 11.96c-2.32-2.32-2.32-6.08 0-8.4Z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-xs font-roboto text-black">{state.likes.length}</span>
            <span className="text-xs font-normal ml-1">Like</span>
          </button>
          <button
            className="flex items-center cursor-pointer rounded-lg pt-2 hover:bg-gray-100"
            onClick={handleOpen}
            ref={commentButtonRef}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 fill-gray-700 hover:fill-gray-500">
              <path fillRule="evenodd" d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V6.75ZM6.75 3A3.75 3.75 0 0 0 3 6.75v10.5A3.75 3.75 0 0 0 6.75 21h10.5A3.75 3.75 0 0 0 21 17.25V6.75A3.75 3.75 0 0 0 17.25 3H6.75ZM6 10.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75Zm.75 3a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-xs font-roboto text-black">{state.comments.length}</span>
            <span className="text-xs font-normal ml-1">Comments</span>
          </button>
          {user?.uid === uid && (
            <button className="flex items-center cursor-pointer rounded-lg pt-2 hover:bg-gray-100" onClick={deletePost}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 fill-red-700 hover:fill-red-500">
                <path fillRule="evenodd" d="M6.75 4.5a.75.75 0 0 0-.75.75V6h12V5.25a.75.75 0 0 0-.75-.75h-3.75V4.5A1.5 1.5 0 0 0 12 3a1.5 1.5 0 0 0-1.5 1.5v.75H6.75ZM18 6V5.25A2.25 2.25 0 0 0 15.75 3H8.25A2.25 2.25 0 0 0 6 5.25V6H5.25A.75.75 0 0 0 4.5 6.75v.75h15v-.75a.75.75 0 0 0-.75-.75H18ZM6.75 9A.75.75 0 0 0 6 9.75v9A2.25 2.25 0 0 0 8.25 21h7.5A2.25 2.25 0 0 0 18 18.75v-9a.75.75 0 0 0-1.5 0v9c0 .414-.336.75-.75.75h-7.5a.75.75 0 0 1-.75-.75v-9A.75.75 0 0 0 6.75 9Z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 text-xs font-roboto text-black">Delete</span>
            </button>
          )}
        </div>
      </div>
      {open && <CommentSection open={open} setOpen={setOpen} postId={id} uid={uid} />}
    </div>
  );
};

export default PostCard;
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
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ uid, id, logo, name, email, text, image, timestamp }) => {
  const { user } = useContext(AuthContext);
  console.log("User object:", user); // Added for debugging
  const [state, dispatch] = useReducer(PostsReducer, postsStates);
  const likesRef = doc(collection(db, "posts", id, "likes"));
  const likesCollection = collection(db, "posts", id, "likes");
  const { ADD_LIKE, HANDLE_ERROR, ADD_COMMENT } = postActions;
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const singlePostDocument = doc(db, "posts", id);
  const commentButtonRef = useRef(null);
  const wordLimit = 20;

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

  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return ''; // Handle case where timestamp is null or undefined

      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate(); // Assuming timestamp is a Firestore Timestamp
      } else {
        date = new Date(timestamp); // Fallback for other cases (e.g., JavaScript Date)
      }

      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid Date'; // or handle it differently based on your UI requirements
    }
  };


  const truncateText = (text, wordLimit) => {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  }

  return (
    <div className="flex flex-col mb-4 md:mx-8 flex justify-center">
      <div className="flex flex-col py-4 bg-white border border-gray-300 md:rounded-md w-full md:max-w-2xl md:shadow-md">
        <div className="flex items-center py-2 md:py-4 px-5 md:px-4">
          <img className="w-8 h-8 rounded-full" src={user?.photoURL || avatar} alt="avatar" />
          <div className="flex flex-col ml-4 w-full">
            <p className="font-sans font-semibold text-base md:text-sm text-gray-900">
              {email}
            </p>
            <p className="font-sans font-normal text-xs text-gray-700">
              Published: {formatTimestamp(timestamp)}
            </p>
          </div>
          {user?.uid !== uid && (
            <div onClick={addUser} className="cursor-pointer ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 fill-green-700 hover:fill-green-500">
                <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
              </svg>
            </div>
          )}
        </div>
        <div className="px-4 pb-4">
          <p className="font-sans font-normal text-black text-base md:text-sm leading-normal">
            {isExpanded ? text : truncateText(text, wordLimit)}
          </p>
          {text.split(' ').length > wordLimit && (
            <button
              className="text-gray-600 text-base"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "... see less" : "... see more"}
            </button>
          )}
          {image && (
            <img
              className="w-full h-auto mt-4"
              src={image}
              alt="userpost"
            />
          )}

        </div>

        <div className="flex items-center items-center justify-end w-full border-gray-300 pr-8 px-4 py-2">
          <div className="flex mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-4 h-4 fill-green-700 hover:fill-green-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
            </svg>
            <span className="ml-2 text-xs md:text-sm font-roboto text-black">{state.likes.length}</span>
          </div>
          <div className="flex">
            <span className="ml-2 font-sans font-normal text-sm text-gray-700 text-black">{state.comments.length}</span>
            <span className="font-sans font-normal text-sm text-gray-700 ml-1">Questions</span>
          </div>
        </div>

        <div className="flex items-center justify-around w-full border-t border-gray-300 px-4 pt-2">
          <button
            className="flex items-center cursor-pointer rounded-lg hover:bg-gray-100 px-2 py-1"
            onClick={handleLike}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
            </svg>
            <span className="text-base md:text-sm font-normal ml-1">Like</span>
          </button>
          <button
            className="flex items-center cursor-pointer rounded-lg hover:bg-gray-100 px-2 py-1"
            onClick={handleOpen}
            ref={commentButtonRef}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>

            <span className="text-base md:text-sm font-normal ml-1">Questions</span>
          </button>
          {user?.uid === uid && (
            <button className="flex items-center cursor-pointer rounded-lg hover:bg-gray-100 px-2 py-1" onClick={deletePost}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 fill-red-700 hover:fill-red-500">
                <path fillRule="evenodd" d="M6.75 4.5a.75.75 0 0 0-.75.75V6h12V5.25a.75.75 0 0 0-.75-.75h-3.75V4.5A1.5 1.5 0 0 0 12 3a1.5 1.5 0 0 0-1.5 1.5v.75H6.75ZM18 6V5.25A2.25 2.25 0 0 0 15.75 3H8.25A2.25 2.25 0 0 0 6 5.25V6H5.25A.75.75 0 0 0 4.5 6.75v.75h15v-.75a.75.75 0 0 0-.75-.75H18ZM6.75 9A.75.75 0 0 0 6 9.75v9A2.25 2.25 0 0 0 8.25 21h7.5A2.25 2.25 0 0 0 18 18.75v-9a.75.75 0 0 0-1.5 0v9c0 .414-.336.75-.75.75h-7.5a.75.75 0 0 1-.75-.75v-9A.75.75 0 0 0 6.75 9Z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 text-base md:text-sm font-roboto text-black">Delete</span>
            </button>
          )}
        </div>
      </div>
      {open && <CommentSection open={open} setOpen={setOpen} postId={id} uid={uid} />}
    </div>
  );
};

export default PostCard;

import React, { useContext, useState, useReducer, useEffect, useRef } from "react";
import avatar from "../../Assets/Images/avatar.jpg";
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
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import CommentSection from "./CommentSection";
import { formatDistanceToNow } from 'date-fns';
import { FaLink } from 'react-icons/fa';
import MediaModal from './MediaModal';
import { Link, useNavigate } from 'react-router-dom';
import { useConnection } from "../../utility/ConnectionContext"
import FollowButton from "../Button/FollowButton";
import LikeButton from "../Button/LikeButton";


const FullScreenComments = ({ postId, uid, close }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto p-4">
      <button className="text-black mb-4" onClick={close}>
        ← Back to Post
      </button>
      <CommentSection open={true} setOpen={close} postId={postId} uid={uid} />
    </div>
  );
};

const PostCard = ({ uid, id, logo, name, post, media, previewData, email, text, image, timestamp }) => {
  console.log('Media URLs:', media);
  const { user, userData, getUserDataByUID } = useContext(AuthContext);
  const { connections, handleConnection } = useConnection();
  const [state, dispatch] = useReducer(PostsReducer, postsStates);
  const likesRef = doc(collection(db, "posts", id, "likes"));
  const likesCollection = collection(db, "posts", id, "likes");
  const { ADD_LIKE, HANDLE_ERROR, ADD_COMMENT } = postActions;
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const singlePostDocument = doc(db, "posts", id);
  const commentButtonRef = useRef(null);
  const videoRefs = useRef([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [lastLike, setLastLike] = useState(null);
  const wordLimit = 20;
  const navigate = useNavigate();

  const [authorData, setAuthorData] = useState(null);


  const [likeText, setLikeText] = useState('');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const getLikes = async () => {
      try {
        const q = collection(db, "posts", id, "likes");
        await onSnapshot(q, (snapshot) => {
          const likesData = snapshot.docs.map((doc) => doc.data());
          dispatch({
            type: ADD_LIKE,
            likes: likesData,
          });

          const names = likesData.map((like) => like.name).filter(Boolean);
          const currentUserLiked = likesData.some((like) => like.id === user?.uid);

          let namesToShow = '';
          if (likesData.length > 0) {
            if (likesData.length > 2) {
              if (currentUserLiked) {
                namesToShow = `You and ${likesData.length - 1} others`;
              } else {
                namesToShow = `${names[0]} and ${likesData.length - 1} others`;
              }
            } else {
              namesToShow = likesData.length;
            }
          }

          setLikeText(namesToShow);
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
        await onSnapshot(q, (snapshot) => {
          dispatch({
            type: ADD_COMMENT,
            comments: snapshot.docs.map((item) => item.data()),
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
  }, [id, dispatch, user]);


  useEffect(() => {
    const fetchAuthorData = async () => {
      const data = await getUserDataByUID(post.uid);
      setAuthorData(data);
    };

    if (post.uid) {
      fetchAuthorData();
    }
  }, [post.uid, getUserDataByUID]);



  const openModal = (index) => {
    setSelectedMediaIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.play();
          } else {
            entry.target.pause();
          }
        });
      },
      { threshold: 0.5 } // Adjust the threshold as needed
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOpen = (e) => {
    e.preventDefault();
    if (isMobileView) {
      setOpen(true);
    } else {
      setOpen(!open);
    }
  };

  useEffect(() => {
    const checkIfLiked = async () => {
      const q = query(collection(db, "posts", id, "likes"), where("id", "==", user?.uid));
      const querySnapshot = await getDocs(q);
      setLiked(!querySnapshot.empty);
    };
    checkIfLiked();
  }, [id, user?.uid]);

  const handleLike = async (e) => {
    e.preventDefault();
    const q = query(collection(db, "posts", id, "likes"), where("id", "==", user?.uid));
    const querySnapshot = await getDocs(q);
    const likesDocId = querySnapshot?.docs[0]?.id;

    try {
      if (likesDocId !== undefined) {
        const deleteId = doc(db, "posts", id, "likes", likesDocId);
        await deleteDoc(deleteId);
      } else {
        const likesRef = doc(collection(db, "posts", id, "likes"));
        await setDoc(likesRef, {
          id: user?.uid,
          name: user?.displayName || "Anonymous",
        });

        if (user.uid !== uid) {
          await addNotification("like", `<strong>${user.displayName}</strong> liked your post`, uid, id, user.displayName);
        }
      }
    } catch (err) {
      alert(err.message);
      console.log(err.message);
    }
  };





  const addNotification = async (type, message, userId, postId, name) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        type,
        postId,
        message,
        name,
        timestamp: new Date(),
        read: false
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

  // useEffect(() => {
  //   const getLikes = async () => {
  //     try {
  //       const q = collection(db, "posts", id, "likes");
  //       await onSnapshot(q, (doc) => {
  //         dispatch({
  //           type: ADD_LIKE,
  //           likes: doc.docs.map((item) => item.data()),
  //         });
  //       });
  //     } catch (err) {
  //       dispatch({ type: HANDLE_ERROR });
  //       alert(err.message);
  //       console.log(err.message);
  //     }
  //   };

  //   const getComments = async () => {
  //     try {
  //       const q = collection(db, "posts", id, "comments");
  //       await onSnapshot(q, (doc) => {
  //         dispatch({
  //           type: ADD_COMMENT,
  //           comments: doc.docs.map((item) => item.data()),
  //         });
  //       });
  //     } catch (err) {
  //       dispatch({ type: HANDLE_ERROR });
  //       alert(err.message);
  //       console.log(err.message);
  //     }
  //   };
  //   getLikes();
  //   getComments();
  // }, [id, ADD_LIKE, ADD_COMMENT, HANDLE_ERROR]);

  // Function to format timestamp into a readable date string
  const formatTimestamp = (timestamp) => {
    if (!timestamp) {
      return "Invalid Date";
    }

    if (timestamp.toDate) {
      timestamp = timestamp.toDate();
    }

    let relativeTime = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    relativeTime = relativeTime.replace('about ', ''); // Remove 'about'

    return relativeTime;
  };

  const truncateText = (text, wordLimit) => {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };


  const truncateSummary = (text, maxLength = 100) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${id}`;
    const postText = "Insert your post text here"; // Replace with actual post text
    const postImageUrl = "https://example.com/image.jpg"; // Replace with actual image URL

    // Construct the content to copy
    const contentToCopy = `${postText}\n\n${postUrl}\n${postImageUrl}`;

    navigator.clipboard.writeText(contentToCopy)
      .then(() => alert("Post content copied to clipboard!"))
      .catch((err) => console.error("Failed to copy content: ", err));
  };


  const handleProfileClick = async (e) => {
    e.preventDefault();
    if (uid === user.uid) {
      alert("You are already viewing your own profile.");
      return;
    }

    try {
      const profileRef = doc(db, "users", uid);
      const profileSnapshot = await getDoc(profileRef);
      if (profileSnapshot.exists()) {
        const profileData = profileSnapshot.data();
        const status = profileData?.status; // Fetch the connection status from the profile data
        navigate(`/profile/${uid}`, { state: { status } });
      } else {
        console.error("No such profile exists!");
      }
    } catch (err) {
      console.error("Error fetching profile details: ", err);
    }
  };


  return (
    <>

      <div className="flex flex-col mb-4 md:mx-8 justify-center">
        <div className="flex flex-col py-4 bg-white border border-gray-300 md:rounded-md w-full md:max-w-2xl md:shadow-sm">
          <div className="flex items-center py-2 px-5 md:px-4 border-b">
            <div className="flex items-center justify-center w-[15%] bg-white">
              <img
                className="rounded-full h-10 w-10"
                // src={post.uid === user?.uid ? user.photoURL || avatar : logo}
                src={post?.uid === userData?.uid
                  ? userData?.photoURL
                  : authorData?.photoURL || avatar}
                alt="avatar"
              />
            </div>

            <div className="flex flex-col w-full">
              <Link to={`/profile/${uid}`} onClick={handleProfileClick}>

                <p className="font-sans font-semibold text-base md:text-sm text-gray-900">
                  {post?.uid === userData?.uid
                    ? userData?.name
                    : authorData?.name || 'Unknown'}
                </p>
              </Link>
              <div className="flex items-center">
                <p className="font-sans font-normal text-xs text-gray-700">
                  Published: {formatTimestamp(post.timestamp)}
                </p>
              </div>
            </div>

            <div>
              {user?.uid !== uid && (
                <FollowButton profileUid={uid} />
              )}
            </div>
          </div>

          <div className="text-left py-1 md:py-3 px-5 md:px-4">
            <p className="text-3xl md:text-sm font-sans text-gray-900">
              {isExpanded ? text : truncateText(text, wordLimit)}
              {text.split(' ').length > wordLimit && !isExpanded && (
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={() => setIsExpanded(true)}
                >
                  see more
                </span>
              )}
            </p>
          </div>

          <div>
            {previewData && (
              <a href={previewData.url} target="_blank" rel="noopener noreferrer">
                <div className="url-preview border w-full p-3 bg-white flex flex-col items-center">
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

          {/* Media rendering */}
          <div className="p-2 flex flex-wrap">
            {media && media.length > 0 ? (
              <>
                {media.length === 1 ? (
                  <div className="w-full relative">
                    {media[0].includes('.jpg') || media[0].includes('.jpeg') || media[0].includes('.png') || media[0].includes('.gif') ? (
                      <img
                        src={media[0]}
                        alt="Media 1"
                        className="w-full h-auto object-cover border border-gray-300 cursor-pointer"
                        onClick={() => openModal(0)}
                      />
                    ) : (
                      <div className="relative">
                        <video
                          ref={(el) => (videoRefs.current[0] = el)}
                          src={media[0]}
                          controls
                          className="w-full h-auto object-cover border border-gray-300 rounded-md cursor-pointer"
                          onClick={() => openModal(0)}
                        />
                      </div>
                    )}
                  </div>
                ) : media.length === 2 ? (
                  <>
                    {media.map((url, index) => (
                      <div key={index} className="w-full sm:w-1/2 relative">
                        {url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') ? (
                          <img
                            src={url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-auto object-cover border border-gray-300 rounded-sm cursor-pointer"
                            onClick={() => openModal(index)}
                          />
                        ) : (
                          <div className="relative">
                            <video
                              ref={(el) => (videoRefs.current[index] = el)}
                              src={url}
                              controls
                              className="w-full h-auto object-cover border border-gray-300 rounded-sm cursor-pointer"
                              onClick={() => openModal(index)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="w-[70%] mb-2 relative">
                      {media[0].includes('.jpg') || media[0].includes('.jpeg') || media[0].includes('.png') || media[0].includes('.gif') ? (
                        <img
                          src={media[0]}
                          alt="Media 1"
                          className="w-full h-auto object-cover border border-gray-300 rounded-sm cursor-pointer"
                          onClick={() => openModal(0)}
                        />
                      ) : (
                        <div className="relative">
                          <video
                            ref={(el) => (videoRefs.current[0] = el)}
                            src={media[0]}
                            controls
                            className="w-full h-auto object-cover border border-gray-300 rounded-sm cursor-pointer"
                            onClick={() => openModal(0)}
                          />
                        </div>
                      )}
                    </div>

                    <div className="w-[30%] flex flex-col">
                      {media.slice(1, 3).map((url, index) => (
                        <div key={index + 1} className="relative">
                          {url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') ? (
                            <img
                              src={url}
                              alt={`Media ${index + 2}`}
                              className="w-full h-auto object-cover border border-gray-300 rounded-sm cursor-pointer"
                              onClick={() => openModal(index + 1)}
                            />
                          ) : (
                            <div className="relative">
                              <video
                                ref={(el) => (videoRefs.current[index + 1] = el)}
                                src={url}
                                controls
                                className="w-full h-auto object-cover border border-gray-300 rounded-sm cursor-pointer"
                                onClick={() => openModal(index + 1)}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {media.length > 3 && (
                      <div className="w-[30%] relative">
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                          <span className="text-white text-2xl">+{media.length - 3}</span>
                        </div>
                        {media[3].includes('.jpg') || media[3].includes('.jpeg') || media[3].includes('.png') || media[3].includes('.gif') ? (
                          <img
                            src={media[3]}
                            alt="Media 4"
                            className="w-full h-auto object-cover border border-gray-300 rounded-sm cursor-pointer"
                            onClick={() => openModal(3)}
                          />
                        ) : (
                          <div className="relative">
                            <video
                              ref={(el) => (videoRefs.current[3] = el)}
                              src={media[3]}
                              controls
                              className="w-full h-auto object-cover border border-gray-300 rounded-sm cursor-pointer"
                              onClick={() => openModal(3)}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <p></p>
            )}

            {isModalOpen && (
              <MediaModal
                media={media}
                selectedMediaIndex={selectedMediaIndex}
                onClose={closeModal}
              />
            )}
          </div>

          <div className="flex mx-10 justify-between">
            <div className="flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className={`w-5 h-5 ${state.likes.some((like) => like.id === user?.uid) ? "fill-green-700" : "fill-gray-700"} hover:fill-green-500`}
              >
                <path d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
              </svg>
              <p className="text-sm text-gray-700">
                {likeText}
              </p>
            </div>
            <div className="flex gap-1">
              <span className="ml-1 text-sm font-semibold text-gray-700">
                {state.comments.length}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" className="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
              <p className="text-sm text-gray-600">Questions Asked</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-5 md:mx-8 md:px-4 border-t border-gray-200 py-2 mt-2 md:py-2">
            <div>
              <LikeButton handleLike={handleLike} liked={state.likes.some((like) => like.id === user?.uid)} />
            </div>

            <div className="flex items-center">
              <div className="cursor-pointer flex items-center " onClick={handleOpen} ref={commentButtonRef}>
                <div className="border rounded-full shadow-sm shadow-green-500 flex px-3 py-1 mr-2 items-center">
                  <span className="text-sm mr-2">Question?</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" className="h-4 w-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002" />
                  </svg>
                  <span className="text-sm">Say</span>
                </div>
              </div>
            </div>

            <button onClick={handleCopyLink} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <FaLink className="w-4 h-4 text-green-700" />
              <span>
                <p className="text-base md:text-sm font-normal">Copy to Share</p>
              </span>
            </button>

            <div className="cursor-pointer">
              {user?.uid === uid && (
                <svg
                  onClick={deletePost}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 fill-red-700 hover:fill-red-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 4.5V3.75A2.25 2.25 0 0 1 9.75 1.5h4.5A2.25 2.25 0 0 1 16.5 3.75V4.5h3.75a.75.75 0 0 1 0 1.5h-.891l-.789 12.623A2.25 2.25 0 0 1 16.325 21H7.674a2.25 2.25 0 0 1-2.245-2.377L4.64 6H3.75a.75.75 0 0 1 0-1.5H7.5Zm1.5-1.5v1.5h6V3.75a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0-.75.75ZM6.14 6l.749 12.004a.75.75 0 0 0 .748.746h8.65a.75.75 0 0 0 .748-.746L17.84 6H6.14Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        {open && !isMobileView && (
          <div className="bg-white shadow-md rounded-md mt-2 w-full md:max-w-2xl p-4">
            <CommentSection open={open} setOpen={setOpen} postId={id} uid={uid} />
          </div>
        )}
        {isMobileView && open && (
          <FullScreenComments postId={id} uid={uid} close={() => setOpen(false)} />
        )}
      </div>
    </>
  );
};

export default PostCard;


import React, { useState, useEffect, useRef, useContext } from "react";
import { doc, updateDoc, deleteDoc, getDoc, getDocs, collection, addDoc, query, orderBy, onSnapshot, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import avatar from "../../Assets/Images/avatar.jpg";
import { AuthContext } from "../AppContext/AppContext";

const Comment = ({ name, comment, id, uid, userId, loggedInUserId, postAuthorId, parentId, postId, onDelete, onEdit, onReply }) => {
    const { user, getUserDataByUID } = useContext(AuthContext);
    const [showOptions, setShowOptions] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [newComment, setNewComment] = useState(comment);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [reply, setReply] = useState("");
    const [replies, setReplies] = useState([]);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replyCount, setReplyCount] = useState(0);
    const menuRef = useRef(null);
    const [commentUserData, setCommentUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (uid) {
                const data = await getUserDataByUID(uid);
                setCommentUserData(data);
            }
        };
        fetchUserData();
    }, [uid, getUserDataByUID]);

    useEffect(() => {
        if (id) {
            const collectionOfReplies = collection(db, `posts/${postId}/comments/${id}/replies`);
            const q = query(collectionOfReplies, orderBy("timestamp", "asc"));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                setReplies(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
                setReplyCount(snapshot.docs.length);
            });

            return () => unsubscribe();
        }
    }, [id, postId]);

    const handleClick = (id) => {
        setShowOptions((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setShowOptions({});
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleEdit = async () => {
        if (newComment.trim() !== "") {
            const commentRef = parentId
                ? doc(db, `posts/${postId}/comments/${parentId}/replies`, id)
                : doc(db, `posts/${postId}/comments`, id);
            try {
                const commentDoc = await getDoc(commentRef);
                if (commentDoc.exists()) {
                    await updateDoc(commentRef, { comment: newComment });
                    setIsEditing(false);
                } else {
                    console.error("No document to update: ", id);
                }
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        }
    };

    const handleDelete = async () => {
        // Check if the logged-in user is the author of the post or the comment/reply
        if (loggedInUserId === postAuthorId || loggedInUserId === userId) {
            const commentRef = parentId
                ? doc(db, `posts/${postId}/comments/${parentId}/replies`, id)
                : doc(db, `posts/${postId}/comments`, id);
    
            try {
                // If it's a parent comment, delete all its replies first
                if (!parentId) {
                    const repliesRef = collection(db, `posts/${postId}/comments/${id}/replies`);
                    const repliesSnapshot = await getDocs(repliesRef);
                    const batch = writeBatch(db);
    
                    repliesSnapshot.forEach((replyDoc) => {
                        // Ensure only the author's replies are deleted
                        if (replyDoc.data().userId === loggedInUserId) {
                            batch.delete(replyDoc.ref);
                        }
                    });
    
                    await batch.commit();
                }
    
                // Ensure only the author's comment is deleted
                const commentDoc = await getDoc(commentRef);
                if (commentDoc.exists() && commentDoc.data().userId === loggedInUserId) {
                    await deleteDoc(commentRef);
                } else {
                    console.error("You are not authorized to delete this comment.");
                }
            } catch (error) {
                console.error("Error deleting document:", error);
            }
        } else {
            console.error("You are not authorized to delete this comment.");
        }
    };
    

    const handleReply = async () => {
        if (reply.trim() === "") {
            console.error("Reply cannot be empty.");
            return;
        }

        // Add logging to check postId and id
        console.log("postId: ", postId);
        console.log("id (commentId): ", id);

        try {
            console.log("Adding reply to path: ", `posts/${postId}/comments/${id}/replies`);
            console.log("Reply content: ", reply);

            // Path to the replies subcollection
            const collectionOfReplies = collection(db, `posts/${postId}/comments/${id}/replies`);
            const newReplyRef = await addDoc(collectionOfReplies, {
                comment: reply,
                name: user.displayName,
                image: user.photoURL,
                uid: user.uid,
                timestamp: serverTimestamp(),
            });

            console.log("Reply added with ID: ", newReplyRef.id);
            setReply("");
            setShowReplyInput(false);
        } catch (error) {
            console.error("Error adding reply: ", error);
        }
    };

    const handleLike = async () => {
        const commentRef = parentId
            ? doc(db, `posts/${postId}/comments/${parentId}/replies`, id)
            : doc(db, `posts/${postId}/comments`, id);
        try {
            const commentDoc = await getDoc(commentRef);
            if (commentDoc.exists()) {
                const currentLikes = commentDoc.data().likes || 0;
                const newLikes = hasLiked ? currentLikes - 1 : currentLikes + 1;
                await updateDoc(commentRef, { likes: newLikes });
                setLikes(newLikes);
                setHasLiked(!hasLiked);
            } else {
                console.error("Comment document does not exist:", id);
            }
        } catch (error) {
            console.error("Error liking the comment: ", error);
        }
    };

    useEffect(() => {
        const fetchLikes = async () => {
            const commentRef = parentId
                ? doc(db, `posts/${postId}/comments/${parentId}/replies`, id)
                : doc(db, `posts/${postId}/comments`, id);
            try {
                const commentDoc = await getDoc(commentRef);
                if (commentDoc.exists()) {
                    setLikes(commentDoc.data().likes || 0);
                    const likedBy = commentDoc.data().likedBy || [];
                    setHasLiked(likedBy.includes(loggedInUserId));
                }
            } catch (error) {
                console.error("Error fetching likes: ", error);
            }
        };
        fetchLikes();
    }, [id, parentId, postId, loggedInUserId]);

    return (
        <div className="flex flex-col items-start mt-2 w-full relative">
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                    <img
                        className="w-8 h-8 rounded-full mr-3"
                        src={commentUserData?.photoURL || avatar}
                        alt="avatar"
                    />
                    <p className="text-gray-700 text-sm no-underline tracking-normal leading-none p-1 font-medium">
                        {commentUserData?.firstName && commentUserData?.secondName
                            ? `${commentUserData.firstName} ${commentUserData.secondName}`
                            : name}
                    </p>
                </div>
                <div>
                    {(loggedInUserId === userId || loggedInUserId === postAuthorId) && (
                        <div ref={menuRef}>
                            <button
                                onClick={() => handleClick(id)}
                                className="absolute right-2 flex items-center text-gray-500 text-medium hover:text-gray-800 focus:outline-none mr-4"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    className="w-5 h-5">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                                </svg>

                            </button>
                            {showOptions[id] && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 p-2 rounded shadow-md z-10">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="block flex items-center gap-1 w-full py-1 px-4 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                        </svg>
                                        Edit your Response
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="block w-full flex items-center gap-1 py-1 px-4 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                        Delete You response
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>


            </div>
            <div className="flex flex-col rounded-lg p-1 w-full max-w-[600px] relative">
                <div className="flex justify-between w-full">
                    <div className="bg-white rounded-md p-2 w-full bg-red-500">

                        {isEditing ? (
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="text-black font-normal text-base md:text-sm no-underline tracking-normal leading-none p-1 w-full resize-none"
                            />
                        ) : (
                            <p className="w-full text-black text-base md:text-sm no-underline tracking-normal leading-relaxed py-1 px-2 rounded-lg border font-normal">
                                {comment}
                            </p>
                        )}
                    </div>
                </div>
                {isEditing && (
                    <button
                        onClick={handleEdit}
                        className="text-xs text-gray-500 ml-2 focus:outline-none mt-2"
                    >
                        Update
                    </button>
                )}
                <div className="flex items-center justify-end mr-4 space-x-2">
                    <button onClick={handleLike} className="text-sm text-gray-500 focus:outline-none flex mr-2 items-center">
                        {hasLiked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" className="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                            </svg>

                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                            </svg>

                        )}
                        <span className="ml-1">{likes}</span>
                    </button>
                    <button
                        onClick={() => setShowReplyInput(!showReplyInput)}
                        className="flex text-sm text-gray-500 bottom-0  gap-1 items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" className="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                        </svg>

                        Reply
                    </button>
                    {replyCount > 0 && (
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="flex text-xs text-gray-500 bottom-0 ml-1 items-center"
                        >
                            {showReplies ? "Hide" : "Show"} Replies ({replyCount})
                        </button>
                    )}
                </div>
                {showReplyInput && (
                    <div className="flex flex-col">
                        <textarea
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            className="text-black text-base items-center no-underline rounded-lg tracking-normal leading-none font-normal w-full resize-none mt-2"
                            placeholder="Write a reply..."
                        />
                        <button
                            onClick={handleReply}
                            className=" absolute right-5 text-xs text-gray-500 ml-2 focus:outline-none mt-5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" className="h-6 w-5 text-gray-600">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                        </button>
                    </div>
                )}
                {showReplies && replies && replies.map((reply) => (
                    <div key={reply.id} className="ml-4 font-normal text-base md:text-sm border-y border-white">
                        <Comment
                            {...reply}
                            loggedInUserId={loggedInUserId}
                            postAuthorId={postAuthorId}
                            parentId={id}
                            postId={postId}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comment;

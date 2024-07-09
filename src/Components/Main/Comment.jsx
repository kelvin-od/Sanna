import React, { useState, useEffect, useRef, useContext } from "react";
import { doc, updateDoc, deleteDoc, getDoc, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import avatar from "../../Assets/Images/avatar.avif";
import { AuthContext } from "../AppContext/AppContext";

const Comment = ({ name, comment, image, id, userId, loggedInUserId, postAuthorId, parentId, postId }) => {
    const { user, userData } = useContext(AuthContext);
    const [showOptions, setShowOptions] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [newComment, setNewComment] = useState(comment);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [reply, setReply] = useState("");
    const [replies, setReplies] = useState([]);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (id) {
            const collectionOfReplies = collection(db, `posts/${postId}/comments/${id}/replies`);
            const q = query(collectionOfReplies, orderBy("timestamp", "asc"));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                setReplies(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
        if (loggedInUserId === postAuthorId || loggedInUserId === userId) {
            const commentRef = parentId 
                ? doc(db, `posts/${postId}/comments/${parentId}/replies`, id) 
                : doc(db, `posts/${postId}/comments`, id);
            try {
                await deleteDoc(commentRef);
            } catch (error) {
                console.error("Error deleting document: ", error);
            }
        } else {
            console.error("You are not authorized to delete this comment.");
        }
    };

    const handleReply = async () => {
        if (reply.trim() !== "") {
            try {
                const collectionOfReplies = collection(db, `posts/${postId}/comments/${id}/replies`);
                await addDoc(collectionOfReplies, {
                    comment: reply,
                    name: user.displayName, 
                    image: user.photoURL, 
                    uid: user.uid,
                    timestamp: new Date(),
                });
                setReply("");
                setShowReplyInput(false);
            } catch (error) {
                console.error("Error adding reply: ", error);
            }
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
        <div className="flex items-start mt-2 w-full relative">
            <div className="mx-2">
                <img className="w-[2rem] mr-4 rounded-full" src={image || avatar} alt="avatar" />
            </div>
            <div className="flex flex-col bg-green-50 rounded-lg p-1 mr-5 w-full max-w-[600px] relative">
                <div className="flex justify-between w-full">
                    <div>
                        <p className="text-black text-xs no-underline tracking-normal leading-none p-1 font-medium">
                            {name}
                        </p>
                        {isEditing ? (
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="text-black text-xs no-underline tracking-normal leading-none p-1 font-normal w-full"
                            />
                        ) : (
                            <p className="text-black text-sm no-underline tracking-normal leading-none p-1 font-normal">
                                {comment}
                            </p>
                        )}
                    </div>
                    {(loggedInUserId === userId || loggedInUserId === postAuthorId) && (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => handleClick(id)}
                                className="focus:outline-none flex items-center text-gray-500 text-medium mt-3 hover:text-gray-700 focus:outline-none mr-4"
                            >
                                ⋮
                            </button>
                            {showOptions[id] && (
                                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded shadow-md z-10">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="block w-full py-1 px-4 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="block w-full py-1 px-4 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {isEditing && (
                    <button
                        onClick={handleEdit}
                        className="text-xs text-gray-500 ml-2 focus:outline-none mt-2"
                    >
                        Save
                    </button>
                )}
                <div className="flex items-center space-x-2 mt-1">
                    <button onClick={handleLike} className="text-xs text-gray-500 ml-2 focus:outline-none mt-2">
                        {hasLiked ? "Unlike" : "Like"} ({likes})
                    </button>
                    <button
                        onClick={() => setShowReplyInput(!showReplyInput)}
                        className="flex text-xs text-gray-500 bottom-0 mt-2 ml-1 items-center"
                    >
                        Reply
                    </button>
                </div>
                {showReplyInput && (
                    <div className="flex flex-col mt-2">
                        <textarea
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            className="text-black text-xs no-underline tracking-normal leading-none p-1 font-normal w-full"
                            placeholder="Write a reply..."
                        />
                        <button
                            onClick={handleReply}
                            className="text-xs text-gray-500 ml-2 focus:outline-none mt-2"
                        >
                            Submit Reply
                        </button>
                    </div>
                )}
                {replies && replies.map((reply) => (
                    <div key={reply.id} className="ml-6 mt-2 bg-green-50 border-y border-white">
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

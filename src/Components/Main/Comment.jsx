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
                        batch.delete(replyDoc.ref);
                    });
    
                    await batch.commit();
                }
    
                await deleteDoc(commentRef);
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
        <div className="flex items-start mt-2 w-full relative">
            <img
                className="w-10 h-10 rounded-full"
                src={commentUserData?.photoURL || avatar}
                alt="avatar"
            />
            <div className="flex flex-col bg-red-white rounded-lg p-1 w-full max-w-[600px] relative">
                <div className="flex justify-between w-full">
                    <div className="bg-green-50 rounded-md p-2 w-full">
                        <p className="text-gray-700 text-xs no-underline tracking-normal leading-none p-1 font-medium">
                            {commentUserData?.firstName && commentUserData?.secondName
                                ? `${commentUserData.firstName} ${commentUserData.secondName}`
                                : name}
                        </p>
                        {isEditing ? (
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="text-black font-normal text-base md:text-sm no-underline tracking-normal leading-none p-1 w-full"
                            />
                        ) : (
                            <p className="text-black text-base md:text-sm no-underline tracking-normal leading-none p-1 font-normal">
                                {comment}
                            </p>
                        )}
                    </div>
                    {(loggedInUserId === userId || loggedInUserId === postAuthorId) && (
                        <div className="relative ml-4" ref={menuRef}>
                            <button
                                onClick={() => handleClick(id)}
                                className="focus:outline-none flex items-center text-gray-500 text-medium mt-3 hover:text-gray-700 focus:outline-none mr-4"
                            >
                                ...
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
                <div className="flex items-center space-x-2">
                    <button onClick={handleLike} className="text-xs text-gray-500 focus:outline-none">
                        {hasLiked ? "Unlike" : "Like"} ({likes})
                    </button>
                    <button
                        onClick={() => setShowReplyInput(!showReplyInput)}
                        className="flex text-xs text-gray-500 bottom-0  ml-1 items-center"
                    >
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
                            className="text-black text-base no-underline rounded-lg tracking-normal leading-none p-1 font-normal w-full"
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

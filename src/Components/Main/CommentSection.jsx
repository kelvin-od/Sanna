import React, { useContext, useRef, useState, useReducer, useEffect } from "react";
import avatar from "../../Assets/Images/avatar.jpg";
import { AuthContext } from "../AppContext/AppContext";
import {
    setDoc,
    getDoc,
    collection,
    doc,
    serverTimestamp,
    orderBy,
    query,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
    PostsReducer,
    postActions,
    postsStates,
} from "../AppContext/PostReducer";
import Comment from "./Comment";

const CommentSection = ({ open, setOpen, postId, uid, loggedInUserId }) => {
    const comment = useRef("");
    const { user, userData } = useContext(AuthContext);
    const [state, dispatch] = useReducer(PostsReducer, postsStates);
    const { ADD_COMMENT, HANDLE_ERROR } = postActions;

    const addComment = async (e) => {
        e.preventDefault();
        if (comment.current.value !== "") {
            try {
                const commentRef = doc(collection(db, "posts", postId, "comments"));
                await setDoc(commentRef, {
                    id: commentRef.id,
                    comment: comment.current.value,
                    image: user?.photoURL || avatar,
                    name: userData?.name?.charAt(0)?.toUpperCase() + userData?.name?.slice(1) || user?.displayName?.split(" ")[0] || "Anonymous",
                    timestamp: serverTimestamp(),
                    uid: user.uid,
                });

                // Check if the comment is made by another user before adding a notification
                if (user.uid !== uid) {
                    await addNotification("comment", 
                        `<strong>${user.displayName}</strong> added a Question on your post`, 
                        uid, 
                        postId, 
                        user.photoURL || avatar, 
                        comment.current.value);
                }

                comment.current.value = "";
                setOpen(false); // Close comment section after adding a comment
            } catch (err) {
                dispatch({ type: HANDLE_ERROR, error: err.message });
                alert(err.message);
                console.log(err.message);
            }
        }
    };

    const addNotification = async (type, message, userId, postId, userPhotoURL, comment) => {
        try {
            await addDoc(collection(db, "notifications"), {
                userId,
                type,
                postId,
                message,
                userPhotoURL,
                comment,
                timestamp: serverTimestamp(),
                read: false
            });
        } catch (err) {
            console.error("Error adding notification: ", err);
        }
    };


    useEffect(() => {
        const collectionOfComments = collection(db, `posts/${postId}/comments`);
        const q = query(collectionOfComments, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            dispatch({
                type: ADD_COMMENT,
                comments: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
            });
        });

        return () => unsubscribe();
    }, [postId, ADD_COMMENT, HANDLE_ERROR]);

    const editComment = async (id, newComment) => {
        try {
            const commentRef = doc(collection(db, "posts", postId, "comments"), id);
            await updateDoc(commentRef, {
                comment: newComment,
            });
        } catch (err) {
            console.error("Error updating comment: ", err);
        }
    };

    const deleteComment = async (id) => {
        try {
            const commentRef = doc(collection(db, "posts", postId, "comments"), id);
            await deleteDoc(commentRef);
        } catch (err) {
            console.error("Error deleting comment: ", err);
        }
    };

    const replyToComment = async (reply, parentCommentId) => {
        try {
            const replyRef = doc(collection(db, "posts", postId, "comments", parentCommentId, "replies"));
            await setDoc(replyRef, {
                id: replyRef.id,
                comment: reply,
                image: user.photoURL,
                name: user.displayName,
                timestamp: serverTimestamp(),
                uid: user.uid,
            });
        } catch (error) {
            console.error("Error replying to comment: ", error);
        }
    };

    return (
        <div className={`flex flex-col bg-white w-full py-2 rounded-lg ${open ? '' : 'hidden'}`}>
            <div className="flex items-center mb-1">
                
                    <img
                        className="w-8 h-8 rounded-full"
                        src={userData?.photoURL || avatar}
                        alt="avatar"
                    />
                
                <div className="flex items-center w-full rounded-lg ml-1 mr-1 bg-green-50">
                    <textarea ref={comment} className="bg-green-50 w-full my-0 text-sm rounded-lg border-none outline-none  resize-none" placeholder="Ask your Question?"></textarea>

                </div>
                <button className="p-1 text-xs md:text-sm rounded-full bg-green-600 text-white border" onClick={addComment}>
                    Ask
                </button>
            </div>
            <div className="bg-white w-full py-1 rounded-b-3xl">
                {state.comments.map((comment) => (
                    <Comment
                        key={comment.id}
                        {...comment}
                        onEdit={(newComment) => editComment(comment.id, newComment)}
                        onDelete={() => deleteComment(comment.id)}
                        onReply={(reply) => replyToComment(reply, comment.id)}
                        postId={postId}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommentSection;

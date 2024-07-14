import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase/firebase';
import PostCard from "../Main/PostCard";

const Post = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // Added loading state

    useEffect(() => {
        const fetchPost = async () => {
            try {
                if (!postId) {
                    setError('Post ID is not provided');
                    return;
                }

                const docRef = doc(db, 'posts', postId);
                console.log('Fetching post with ID:', postId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    console.log('Document data:', docSnap.data());
                    const postData = docSnap.data();
                    postData.documentId = postId; // Add the documentId to the post data
                    setPost(postData);
                } else {
                    console.log('No such document!');
                    setError('Post not found');
                }
            } catch (err) {
                console.error('Error fetching post:', err);
                setError('Failed to fetch post');
            } finally {
                setLoading(false); // Set loading to false when fetch is complete
            }
        };

        fetchPost();
    }, [postId]);

    const defaultLogo = 'path/to/default/logo.png'; // Provide the path to your default logo

    return (
        <div className="flex flex-col min-h-screen">
            <div className="fixed top-0 z-10 w-full bg-white shadow-md">
                <Navbar />
            </div>

            <div className='flex flex-col md:flex-row w-full md:px-24 mt-24 md:mt-32'>
                <div className='w-full md:w-1/2 px-4 py-4 mx-auto'>
                    {loading ? ( // Render loading spinner only when loading state is true
                        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white">
                            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
                            <div>Loading...</div>
                        </div>
                    ) : (
                        post ? (
                            <PostCard
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
                        ) : (
                            <div className="text-center">Post not found</div>
                        )
                    )}
                </div>
            </div>

            {/* <div className="fixed bottom-0 z-10 w-full bg-white shadow-md">
                <Footer />
            </div> */}
        </div>
    );
};

export default Post;

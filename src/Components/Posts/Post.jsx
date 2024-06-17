import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
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

    return (
        <div className="flex flex-col h-screen items-center">
            <div className="fixed top-0 z-10 w-full bg-white shadow-md">
                <Navbar />
            </div>

            <div className='flex mx-24'>

                <div className='flex-col py-4 flex flex-col mt-24 mb-16 w-[60%] mx-auto px-4'>
                    {loading ? ( // Render loading spinner only when loading state is true
                        <div className=" flex absolute justify-center items-center">
                            <div className="loader"></div>
                            <div>Loading...</div>
                        </div>
                    ) : (
                        <PostCard
                            logo={post.logo}
                            id={post.documentId}
                            uid={post.uid}
                            name={post.name}
                            email={post.email}
                            image={post.image}
                            text={post.text}
                            timestamp={new Date(post.timestamp.toDate()).toUTCString()}
                        />
                    )}
                </div>

                <div className='w-[40%]'>

                </div>

            </div>



            <div className="fixed bottom-0 z-10 w-full bg-white shadow-md">
                <Footer />
            </div>
        </div>
    );
};

export default Post;

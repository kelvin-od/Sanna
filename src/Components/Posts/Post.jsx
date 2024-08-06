import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import { useParams } from 'react-router-dom';
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from '../firebase/firebase';
import PostCard from "../Main/PostCard";
import CommentSection from "../Main/CommentSection";

const Post = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [additionalPosts, setAdditionalPosts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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
                    postData.documentId = postId;
                    setPost(postData);
                } else {
                    console.log('No such document!');
                    setError('Post not found');
                }
            } catch (err) {
                console.error('Error fetching post:', err);
                setError('Failed to fetch post');
            } finally {
                setLoading(false);
            }
        };

        const fetchAdditionalPosts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'posts'));
                const postsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return { ...data, documentId: doc.id };
                }).filter(post => post.documentId !== postId);

                setAdditionalPosts(postsData);
            } catch (err) {
                console.error('Error fetching additional posts:', err);
            }
        };

        fetchPost();
        fetchAdditionalPosts();
    }, [postId]);

    const defaultLogo = 'path/to/default/logo.png';

    return (
        <div className="flex flex-col min-h-screen">
            <div className="fixed top-0 z-10 w-full bg-white border-b border-gray-300">
                <Navbar />
            </div>

            <div className='flex flex-col md:flex-row w-full mt-24 md:mt-16'>
                <div className='w-full md:w-[60%] md:ml-24'>
                    {loading ? (
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
                <div className="w-full md:w-1/2 px-4 py-4 mx-auto">
                    <CommentSection />
                </div>
            </div>

            {additionalPosts.map(post => (
                    <div key={post.documentId} className='w-full md:ml-24 md:w-[49%]'>
                        <PostCard
                            logo={post?.logo || defaultLogo}
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
                    </div>
                ))}

            {/* <div className='flex flex-col w-full md:w-[50%] md:ml-24 space-y-4 border border-red-500 '>
                {additionalPosts.map(post => (
                    <div key={post.documentId} className='w-full mx-auto'>
                        <PostCard
                            logo={post?.logo || defaultLogo}
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
                    </div>
                ))}
            </div> */}
        </div>
    );
};

export default Post;

// SearchComponent.jsx
import React, { useState, useEffect } from 'react';
import { searchUsersAndPosts, getRecommendations } from '../../utility/searchUtils';
import { db } from '../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

const SearchComponent = () => {
    const [query, setQuery] = useState('');
    const [data, setData] = useState([]);
    const [results, setResults] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const getData = async () => {
            const userQuerySnapshot = await getDocs(collection(db, "users"));
            const postQuerySnapshot = await getDocs(collection(db, "posts"));
            const fetchedUsers = userQuerySnapshot.docs.map(doc => doc.data());
            const fetchedPosts = postQuerySnapshot.docs.map(doc => doc.data());
            const combinedData = [...fetchedUsers, ...fetchedPosts];
            setData(combinedData);
        };

        getData();
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        const searchResults = searchUsersAndPosts(value, data, 3);
        setResults(searchResults);

        const recs = getRecommendations(value, data);
        setRecommendations(recs);
    };

    const handleClick = (item) => {
        // Handle item click (e.g., navigate to user profile or post)
        if (item.postName) {
            console.log('Post clicked:', item);
            // Navigate to post
        } else {
            console.log('User clicked:', item);
            // Navigate to user profile
        }
    };

    return (
        <div className="relative flex items-center w-full">
            <input
                className="w-full md:w-96 md:ml-8 ml-4 rounded-full md:rounded-lg text-black font-normal focus:outline-none px-4 py-2"
                type="text"
                placeholder="Search"
                value={query}
                onChange={handleInputChange}
            />
            {query && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-10 flex justify-center items-start top-14">
                    <div className="relative w-[70%] bg-white border mt-4 border-gray-300 rounded-lg shadow-lg z-20">
                        <div className="p-4 w-full">
                            <h4 className="text-sm font-semibold mb-2">Search Results</h4>
                            {results.length > 0 ? (
                                results.map((item, index) => (
                                    <div key={index} className="px-4 py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleClick(item)}>
                                        <div className="flex items-center">
                                            <img src={item.profilePicture || 'https://via.placeholder.com/40'} alt={`${item.firstName} ${item.secondName}`} className="w-10 h-10 rounded-full mr-3"/>
                                            <div>
                                                <div className="text-sm font-semibold">{item.firstName || item.postName} {item.secondName}</div>
                                                <div className="text-sm font-normal text-gray-500">{item.businessName}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500">No results found</div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-100 rounded-lg">
                            <h4 className="text-sm font-semibold mb-2">Recommendations</h4>
                            <ul className="list-none p-0 m-0">
                                {recommendations.map((rec, index) => (
                                    <li key={index} className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleClick(rec)}>
                                        <div className="flex items-center">
                                            <img src={rec.profilePicture || 'https://via.placeholder.com/40'} alt={`${rec.firstName} ${rec.secondName}`} className="w-10 h-10 rounded-full mr-3"/>
                                            <div>
                                                <div className="text-sm font-semibold">{rec.firstName || rec.postName} {rec.secondName}</div>
                                                <div className="text-sm font-normal text-gray-500">{rec.businessName}</div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchComponent;

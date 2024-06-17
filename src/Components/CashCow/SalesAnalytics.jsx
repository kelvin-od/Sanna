import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AppContext/AppContext';
import { db } from '../firebase/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

const SalesAnalytics = () => {
    const { user } = useContext(AuthContext);
    const [adverts, setAdverts] = useState([]);

    useEffect(() => {
        const fetchAdverts = async () => {
            const q = query(collection(db, "adverts"), orderBy("timestamp", "desc"));
            return onSnapshot(q, (snapshot) => {
                const ads = snapshot?.docs?.map((doc) => ({ id: doc.id, ...doc.data() }));
                setAdverts(ads);
            });
        };
        fetchAdverts();
    }, []);

    const handleDelete = async (advertId) => {
        try {
            await deleteDoc(doc(db, "adverts", advertId));
            alert("Advert deleted successfully");
        } catch (error) {
            console.error("Error deleting advert: ", error);
            alert("Error deleting advert");
        }
    };

    return (
        <div className="max-w-md mt-24 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-lg font-semibold mb-2">Analytics Dashboard</h2>
            <div className="text-sm space-y-2">
                <div>
                    <h3 className="font-medium">Promoted Posts</h3>
                    <p>Track the performance of your promoted posts.</p>
                    <div className="mt-4">
                        {adverts.length > 0 ? (
                            adverts.map((advert) => (
                                <div key={advert.id} className="border p-4 rounded-lg mb-2 bg-white">
                                    <p>{advert.text}</p>
                                    {advert.image && <img src={advert.image} alt="advert" className="h-24 rounded-md" />}
                                    <p>Retail Price: {advert.retailPrice}</p>
                                    <p>Cross-Sale Price: {advert.crossSalePrice}</p>
                                    <p>Expiry Date: {advert.expiryDate}</p>
                                    <p>Location: {advert.location}</p>
                                    <p>Business Name: {advert.businessName}</p>
                                    <div className="flex space-x-2 mt-2">
                                        <button
                                            className="border p-2 rounded-lg border-red-500"
                                            onClick={() => handleDelete(advert.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No promoted posts available.</p>
                        )}
                    </div>
                </div>
                <div>
                    <h3 className="font-medium">Viewership</h3>
                    <p>Monitor the number of views your content receives.</p>
                </div>
                <div>
                    <h3 className="font-medium">Traffic</h3>
                    <p>Analyze the traffic sources and volumes.</p>
                </div>
                <div>
                    <h3 className="font-medium">Interactions</h3>
                    <p>See how users are interacting with your content.</p>
                </div>
            </div>
        </div>
    );
};

export default SalesAnalytics;

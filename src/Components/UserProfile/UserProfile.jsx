import React, { useEffect, useState } from 'react';

function UserProfile({ profileUid }) {
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        if (!profileUid) {
            console.error("profileUid is undefined in UserProfile");
            return;
        }

        // Fetch profile data or perform other side effects
        const fetchProfileData = async () => {
            try {
                const response = await fetch(`/api/profile/${profileUid}`);
                const data = await response.json();
                setProfileData(data);
            } catch (error) {
                console.error("Failed to fetch profile data", error);
            }
        };

        fetchProfileData();
    }, [profileUid]);

    if (!profileUid) {
        // Optionally return a fallback UI or null
        return <div>Loading...</div>;
    }

    return (
        <div>
            {profileData ? (
                <div>
                    <h1>{profileData.name}</h1>
                    <p>{profileData.bio}</p>
                </div>
            ) : (
                <div>Loading profile...</div>
            )}
        </div>
    );
}

export default UserProfile;

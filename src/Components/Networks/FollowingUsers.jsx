import React from 'react';
import UserCard from './UseCard'; 

const FollowingUsers = ({ users }) => {
    return (
        <div className="flex flex-col">
            {users.map(user => (
                <UserCard key={user.id} user={user} />
            ))}
        </div>
    );
};

export default FollowingUsers;

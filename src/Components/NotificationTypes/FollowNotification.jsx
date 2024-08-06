import React from 'react';

const FollowNotification = ({ notification }) => (
  <div className="notification follow">
    <p>{notification.message}</p>
    {/* Add more details and styles specific to follows */}
  </div>
);

export default FollowNotification;

import React from 'react';

const LikeNotification = ({ notification }) => (
  <div className="notification like">
    <p>{notification.message}</p>
    {/* Add more details and styles specific to likes */}
  </div>
);

export default LikeNotification;

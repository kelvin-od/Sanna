import React from 'react';

const CommentNotification = ({ notification }) => (
  <div className="notification comment w-full">
    <p dangerouslySetInnerHTML={{ __html: notification.message }}></p>
    <p className="text-sm text-gray-900 border border-green-50 bg-white py-1 px-3 my-1 rounded-lg">
      {notification.comment}
    </p>
    {/* Add more details and styles specific to comments */}
  </div>
);

export default CommentNotification;

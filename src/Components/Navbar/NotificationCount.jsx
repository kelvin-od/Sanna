import React, { useContext } from 'react';
import { NotificationContext } from '../../utility/NotificationContext';

const NotificationCount = () => {
    const { likes, comments, follows } = useContext(NotificationContext);

    const totalNotifications = likes + comments + follows;

    return (
        <div className="notification-count">
            {totalNotifications > 0 && (
                <div className="absolute flex top-[-6px] right-[16px] bg-red-700 px-1 rounded-full items-center">
                    <p className="text-tiny text-white font-semibold">{totalNotifications}</p>
                </div>
            )}
        </div>
    );
};

export default NotificationCount;

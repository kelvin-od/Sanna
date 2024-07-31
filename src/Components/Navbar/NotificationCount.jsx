import React, { useContext } from 'react';
import { NotificationContext } from '../../utility/NotificationContext';

const NotificationCount = () => {
    const { likes, comments, follows } = useContext(NotificationContext);

    const totalNotifications = likes + comments + follows;

    console.log("Notification counts: ", { likes, comments, follows, totalNotifications });

    return (
        <div className="notification-count">
            {totalNotifications > 0 && (
                <div className="absolute flex top-[-6px] right-[16px] bg-red-700 w-5 h-5 justify-center rounded-full items-center">
                    <p className="text-xs text-white font-semibold">{totalNotifications}</p>
                </div>
            )}
        </div>
    );
};

export default NotificationCount;

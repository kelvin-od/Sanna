import React, { useState, useEffect, useContext } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { AuthContext } from "../AppContext/AppContext";
import { useConnection } from '../../utility/ConnectionContext';
import FollowingUsers from './FollowingUsers';
import FollowUsers from './FollowUsers';

const NetworkUsers = () => {
    const [users, setUsers] = useState([]);
    const { user } = useContext(AuthContext);
    const { connections } = useConnection();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(userList);
        }, (error) => {
            console.error("Error fetching users: ", error);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-base font-bold mb-4">Following</h2>
            <FollowingUsers users={users.filter(user => connections[user.id])} />
            <h2 className="text-base font-bold mt-4 mb-4">People You May Know</h2>
            <FollowUsers users={users.filter(user => !connections[user.id])} />
        </div>
    );
};

export default NetworkUsers;

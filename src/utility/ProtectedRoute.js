import React, { useContext } from 'react';
import { AuthContext } from '../Components/AppContext/AppContext';
import { Navigate } from 'react-router-dom';
import BarLoader from 'react-spinners/BarLoader';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
                <p className="text-green-500 font-bold mb-4 text-lg md:text-base">Sanna</p>
          <BarLoader
            color="#10bc21"
            height={4}
            speedMultiplier={1}
            width={150}
            loading={loading}
          />

      </div>
    );
  }

  return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;

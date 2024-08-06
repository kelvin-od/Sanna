import React from 'react';
import { BarLoader } from 'react-spinners';

const Loader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-50 z-50">
    <p className="text-2xl text-green-500 font-bold">Sanna</p>
    <BarLoader
      color="#15803d"
      speedMultiplier={1}
    />
  </div>
);

export default Loader;

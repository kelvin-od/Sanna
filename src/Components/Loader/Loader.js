import React from 'react';

const Loader = () => (
  <div className="fixed flex flex-col inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
    <p className='text-2xl text-green-500 font-bold'>Sanna</p>
    <div className="w-16 h-16 border-4 border-t-4 border-green-500 border-solid rounded-full animate-spin"></div>
  </div>
);

export default Loader;

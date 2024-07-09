import React from 'react';
import Navbar from "../Navbar/Navbar";
import Leftside from '../LeftSidebar/LeftSide';
import Rightside from '../RightSidebar/Rightside';
import Ads from "../RightSidebar/Ads";
import Main from '../Main/Main';

const Home = () => {
  return (
    <div className='w-full flex flex-col'>
      <div className="fixed top-0 z-10 w-full bg-white">
        <Navbar />
      </div>
      <div className='flex-grow flex flex-col lg:flex-row pt-8 lg:pt-24'>
        <div className='w-full lg:w-[17%] lg:fixed top-24 lg:ml-24 h-full'>
          <Leftside />
        </div>
        <div className='w-full lg:w-[42%] lg:ml-[25%] rounded-xl mt-4 lg:mt-0 h-full'>
          <Main />
        </div>
        <div className='w-full lg:w-[25%] lg:ml-4 lg:mr-4 mt-4 lg:mt-0'>
          <Rightside />
          <div className='sticky top-20 mt-4 lg:mt-0'>
            <Ads />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

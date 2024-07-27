import React from 'react';
import Navbar from "../Navbar/Navbar";
import Leftside from '../LeftSidebar/LeftSide';
import Rightside from '../RightSidebar/Rightside';
import Ads from "../RightSidebar/Ads";
import Main from '../Main/Main';
import { Helmet } from 'react-helmet';

const Home = () => {
  
  return (
    <>
      <Helmet>
        <title>Feeds | Sanna</title>
      </Helmet>
      <div className="fixed top-0 z-10 w-full bg-white">
        <Navbar />
      </div>
      <div className='w-full flex flex-col lg:flex-row px-1 lg:px-[8%] mt-20'>
        <div className='flex-none lg:sticky top-20 w-full lg:w-[20%] h-full mb-4 lg:mb-0'>
          <Leftside />
        </div>
        <div className='flex-initial w-full lg:w-[50%] rounded-xl mb-4 lg:mb-0'>
          <Main />
        </div>
        <div className='flex-initial w-full lg:w-[30%]'>
          <Rightside />
          <div className='sticky top-20 mt-4 lg:mt-0'>
            <Ads />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

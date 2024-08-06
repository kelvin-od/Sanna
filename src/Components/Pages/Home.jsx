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

      {/* <div className='lg:sticky left-24 lg:w-[20%] lg:mt-20'>
        <Leftside />
      </div>
      <div className='flex absolute lg:w-[50%] z-10 lg:top-0 lg:sticky lg:mx-auto lg:mt-20'>
        <Main />
      </div> */}

      <div className='flex flex-col lg:flex-row md:mx-24 lg:mt-20'>
        <div className='flex-none w-full lg:w-[20%]'>
          <div className='lg:sticky lg:top-20'>
            <Leftside />
          </div>
        </div>
        <div className='flex-initial w-full lg:w-[50%] rounded-xl mb-4 lg:mb-0'>
          <Main />
        </div>
        <div className='flex-initial w-full lg:w-[30%]'>
          <div className='h-full'>
            <Rightside />
            <div className='lg:sticky lg:top-20 mt-4 lg:mt-0'>
              <Ads />
            </div>
          </div>
        </div>
      </div>

      {/* <div className='w-full flex flex-col lg:flex-row px-1 lg:px-[8%] lg:mt-20'>
        <div className='flex-none w-full lg:w-[20%] lg:sticky lg:top-20 h-screen mb-4 lg:mb-0'>
          <Leftside />
        </div>
        <div className='flex-initial w-full lg:w-[50%] rounded-xl mb-4 lg:mb-0'>
          <Main />
        </div>
        <div className='flex-initial w-full lg:w-[30%] h-screen'>
          <div className='h-full'>
            <Rightside />
            <div className='lg:sticky lg:top-20 mt-4 lg:mt-0'>
              <Ads />
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default Home;

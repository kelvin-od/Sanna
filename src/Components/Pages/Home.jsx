import React from 'react';
import Navbar from "../Navbar/Navbar";
import Leftside from '../LeftSidebar/LeftSide';
import Rightside from '../RightSidebar/Rightside';
import Ads from "../RightSidebar/Ads";
import Main from '../Main/Main';

const Home = () => {
  return (
    <div className='w-full'>
      <div className="fixed top-0 z-10 w-full bg-white">
        <Navbar />
      </div>
      <div className='flex pt-24'> {/* Added pt-24 to account for fixed Navbar height */}
        <div className='flex-auto w-[17%] fixed top-24 ml-12 '>
          <Leftside />
        </div>
        <div className='flex-auto w-[35%] ml-[20%] rounded-xl'>
          <Main />
        </div>
        <div className='flex-auto w-[20%] ml-4 mr-24'>
          <div className='relative'>
            <Rightside />
          </div>
          <div className='sticky top-20'>
            <Ads />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

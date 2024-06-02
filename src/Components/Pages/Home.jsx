import React from 'react'
import Navbar from "../Navbar/Navbar"
import Leftside from '../LeftSidebar/LeftSide'
import Rightside from '../RightSidebar/Rightside'
import CardSection from '../Main/CardSection'
import Main from '../Main/Main'
// import MainContent from '../Components/MainContent'

const Home = () => {
  return (

    <div className='w-full'>
      <div>
        <Navbar />
      </div>
      <div className='flex bg-white'>
        <div className='flex-auto w-[15%] fixed top-24 ml-4'>
          <Leftside />
        </div>

        <div className='flex-auto w-[60%] absolute left-[17%]  top-24 bg-gray-100 rounded-xl mx-2 items-center'>
          <div>
            <CardSection />
            <Main />
          </div>

        </div>

        <div className='flex-auto w-[20%] right-0 fixed top-24 mr-6'>
          <Rightside />
        </div>

      </div>



    </div>



  )
}

export default Home
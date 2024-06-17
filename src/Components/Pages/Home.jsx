import React from 'react'
import Navbar from "../Navbar/Navbar"
import Leftside from '../LeftSidebar/LeftSide'
import Rightside from '../RightSidebar/Rightside'
import CardSection from '../Main/CardSection'
import Main from '../Main/Main'
import Footer from '../Footer/Footer'
// import MainContent from '../Components/MainContent'

const Home = () => {
  return (

    <div className='w-full '>
      <div className="fixed top-0 z-10 w-full bg-white">
        <Navbar />
      </div>
      <div className='flex'>
        <div className='flex-auto w-[20%] fixed top-24 ml-14'>
          <Leftside />
        </div>

        <div className='flex-auto w-[42%] absolute left-[25%]  top-24 bg-gray-100 rounded-xl mb-24'>
          <div>
            <CardSection />
            <Main />
          </div>
        </div>

        <div className='flex-auto w-[25%] right-0 fixed top-24 mr-24'>
          <Rightside />
        </div>
      </div>
      <div className="fixed bottom-0 z-10 w-full bg-white">
        <Footer />
      </div>
    </div>



  )
}

export default Home
import React from "react";
import syngenta from "../../Assets/Images/syngenta.jpg"; // Adjust the path based on your project structure
import Footer from '../Footer/Footer';

const Ads = () => {
    return (
        <div className="mt-8">
            <div className='absolute flex flex-col sticky bg-white border border-gray-300 rounded-md shadow-lg mt-2'>
                <p className='text-sm text-right pr-2'>Ads</p>
                <img className='h-96 w-full' src={syngenta} alt="Advertisement" />
            </div>
            <div>
                <Footer />
            </div>
        </div>

    );
};

export default Ads;

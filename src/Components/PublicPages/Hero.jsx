import React from "react";
import { Link } from 'react-router-dom';
import Farming from "../../Assets/Images/Farming.jpg"

const Hero = () => {
    return (
        <div className="min-h-screen p-6 md:p-12 flex flex-col md:flex-row items-center justify-center">
            <div className="w-full md:w-1/2 mt-16 md:mt-0 md:ml-12">
                <div className="mb-4 md:mb-8">
                    <h1 className="text-lg md:text-xl subpixel-antialiased text-gray-700 text-center md:text-left">Network | Learn | Save</h1>
                </div>
                <div className="mb-6 md:mb-12">
                    <p className="leading-normal text-base md:text-lg subpixel-antialiased text-center md:text-left">Connect and Network with Millions of Agribusinesses and Farmers</p>
                </div>
                <div className="flex justify-center md:justify-start">
                    <ul className="flex flex-col md:flex-row">
                        <li className="mb-4 md:mb-0">
                            <Link to="/register" className="flex items-center justify-center text-white hover:text-black px-4 md:px-2 py-2 bg-green-500 hover:bg-white cursor-pointer rounded border hover:border-green-500">
                                <span className="text-2xl  subpixel-antialiased">Register Now</span>
                            </Link>
                        </li>
                        <li className="md:ml-4">
                            <Link to="/" className="flex items-center justify-center text-gray-700 hover:text-green-700 px-4 md:px-2 py-2 bg-white border border-green-500 cursor-pointer rounded">
                                <span className="text-2xl  subpixel-antialiased">Learn More</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="w-full md:w-1/2 mt-12 md:mt-0 md:mr-12">
                <div className="flex justify-center md:justify-end">
                    <img className="h-64 md:h-[70%] w-auto" src={Farming} alt="farming" />
                </div>
            </div>
        </div>
    );
};

export default Hero;

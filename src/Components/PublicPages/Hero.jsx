import React from "react";
import { Link } from 'react-router-dom';
import Farming from "../../Assets/Images/heroimage.jpeg"

const Hero = () => {
    return (
        <div className="h-[96%] p-12 top-24 flex items-center justify-center">
            <div className="w-[50%] m-12">
                <div className="mb-8">
                    <h1 className="text-xl subpixel-antialiased text-gray-700">Learn | Learn | Save</h1>
                </div>
                <div className="mb-12">
                    <p className="leading-normal text-lg subpixel-antialiased ">Connect and Network with Millions of Agribusinesses and Farmers
                    </p>
                </div>
                <div className="flex">
                    <ul className="flex">
                        <li>
                            <Link to="/register" className="flex items-center justify-center text-white hover:text-black px-5 py-2 bg-green-500 hover:bg-white cursor-pointer rounded border hover:border-green-500">
                                <span className="text-xl subpixel-antialiased">Register</span>
                            </Link>
                        </li>
                        <li className="ml-4">
                            <Link to="/" className="flex items-center justify-center text-gray-700 hover:text-green-700 px-5 py-2 bg-white border border-green-500 cursor-pointer rounded">
                                <span className="text-xl subpixel-antialiased">Learn More</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="w-[50%]">
                <div>
                    <img src={Farming} alt="farming" />
                </div>
            </div>
        </div>
    );
};

export default Hero;

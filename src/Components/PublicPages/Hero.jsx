import React, { useContext } from "react";
import { AuthContext } from "../AppContext/AppContext";
import Farming from "../../Assets/Images/Farming.jpg";
import { Link } from "react-router-dom";

const Hero = () => {
  const { signInWithGoogle } = useContext(AuthContext);
  return (
    <div className="h-auto p-6 md:p-12 flex flex-col md:flex-row items-center justify-center">
      <div className="w-full md:w-1/2 mt-4 md:mt-0 md:ml-12 flex flex-col">
        <div className="mb-6 md:mb-12">
          <p className="leading-normal text-base text-lg subpixel-antialiased text-center md:text-left">
            Connect and Network with Millions of Farmers, Agronomists, and Agri-Tech
          </p>
        </div>
        <div className="flex w-full md:flex-row md:justify-start gap-4">
          <button
            type="button"
            className="flex items-center gap-2 border border-gray-600 text-gray-900 text-sm py-2 px-4 w-full  rounded-full hover:bg-green-100 transition duration-300"
            onClick={signInWithGoogle}
          >
            <img
              src="https://www.material-tailwind.com/logos/logo-google.png"
              alt="google"
              className="h-5 w-5 md:ml-16"
            />
            Sign in with Google
          </button>
          <Link
            to="/login"
            className="flex items-center gap-2 border border-gray-600 text-gray-900 text-sm py-2 px-4 w-full rounded-full hover:bg-green-100 transition duration-300"
          >
            <span className="md:ml-16">Sign in with Email</span>
          </Link>
        </div>
        <div className="mt-6 text-center md:text-left">
          <p>
            By clicking Continue to join or sign in, you agree to Sanna’s{" "}
            <a href="#" className="text-green-500 hover:text-green-800">
              User Agreement
            </a>
            ,{" "}
            <a href="#" className="text-green-500 hover:text-green-800">
              Privacy Policy
            </a>
            , and{" "}
            <a href="#" className="text-green-500 hover:text-green-800">
              Cookie Policy
            </a>
            .
          </p>
        </div>
        <div className="mt-6 flex gap-2 md:text-left">
          <p>New to Sanna?</p>
          <Link to="/register" className="font-bold hover:text-green-800 text-green-500">
            Join Now
          </Link>
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

import React, { useState, useContext, useEffect } from 'react';
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ClipLoader from "react-spinners/ClipLoader";
import { AuthContext } from "../AppContext/AppContext";
import { auth, onAuthStateChanged } from "../firebase/firebase";
import Header from "../../Assets/Images/header.avif"

const Login = () => {
  const { signInWithGoogle, loginWithEmailAndPassword } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);

  const togglePasswordVisiblity = (e) => {
    e.preventDefault();
    setPasswordShown((cur) => !cur);
  };

  useEffect(() => {
    setLoading(true);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/home");
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

  let initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string()
      .required("Required")
      .min(6, "Must be at least 6 characters long")
      .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, "Password must contain at least one letter, one number, and one special character"),
  });
  

  const handleSubmit = (e) => {
    e.preventDefault();

    const { email, password } = formik.values;
    if (formik.isValid === true) {
      loginWithEmailAndPassword(email, password);
    } else {
      setLoading(false);
      alert("Check your input fields");
    }

    console.log("formik", formik);
  };

  const formik = useFormik({ initialValues, validationSchema, handleSubmit });

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <ClipLoader color="#000000" size={100} speedMultiplier={0.5} />
        </div>
      ) : (
        <section className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-white p-6">
          <div className="hidden md:flex w-1/2 h-screen justify-end">
            <img className="object-cover w-full h-full" src={Header} alt="Header" />
          </div>

          <div className="flex flex-col items-center w-full md:w-1/2">
            <p className="text-green-500 font-bold mb-5 text-lg md:text-base">Sanna</p>
            <div className='px-6 py-8 md:px-12 md:py-8 rounded-lg border shadow bg-white w-full max-w-md'>
              <p className="text-sm md:text-base mb-4">Please Sign in to Network, learn, and Cross-Sell</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-1 text-gray-700 text-sm md:text-base" htmlFor="email">Email</label>
                  <input
                    className="w-full border rounded px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name='email'
                    type="email"
                    placeholder='name@mail.com'
                    {...formik.getFieldProps("email")}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className='mt-1 text-red-500'>{formik.errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-gray-700 text-sm md:text-base" htmlFor="password">Password</label>
                  <div className="relative">
                    <input
                      className="w-full border rounded px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name='password'
                      type={passwordShown ? "text" : "password"}
                      placeholder='***********'
                      {...formik.getFieldProps("password")}
                    />
                    <button
                      onClick={togglePasswordVisiblity}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 focus:outline-none"
                    >
                      {passwordShown ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className='mt-1 text-red-500'>{formik.errors.password}</p>
                  )}
                </div>

                <button className='w-full bg-green-500 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300'>
                  Login
                </button>

                <div className='text-center mt-2'>
                  <Link to="/reset" className='text-green-500 text-sm hover:underline'>Reset your password</Link>
                </div>

                <div className='flex justify-center items-center mt-2'>
                  <button
                    type="button"
                    className='flex items-center gap-2 border text-gray-400 text-sm py-2 px-4 rounded-lg hover:bg-green-100 transition duration-300'
                    onClick={signInWithGoogle}
                  >
                    <img src={`https://www.material-tailwind.com/logos/logo-google.png`} alt="google" className='h-5 w-5' />
                    Sign in with Google
                  </button>
                </div>

                <div className='text-center mt-4'>
                  <p className='text-gray-700 text-sm'>Don't have an account? <Link to="/register" className='text-green-500 text-sm hover:underline'>Register</Link></p>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Login;

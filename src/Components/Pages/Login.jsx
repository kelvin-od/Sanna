import React, { useState, useContext, useEffect } from 'react';
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import BarLoader from "react-spinners/BarLoader";
import { AuthContext } from "../AppContext/AppContext";
import { auth, onAuthStateChanged } from "../firebase/firebase";
import { Helmet } from 'react-helmet';

const Login = () => {
  const { signInWithGoogle, loginWithEmailAndPassword, signingIn  } = useContext(AuthContext);
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
        navigate("/feeds");
      }
      setLoading(false);
    });
  }, [navigate]);

  const initialValues = {
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

  const handleSubmit = async (e) => {
    const { email, password } = formik.values;
    if (formik.isValid) {
      setLoading(true); // Set loading to true before starting login process
      try {
        await loginWithEmailAndPassword(email, password);
      } catch (err) {
        setLoading(false); // Ensure loading is set to false in case of error
      }
    } else {
      alert("Check your input fields");
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit: handleSubmit });

  return (
    <>
      <Helmet>
        <title>Login | Sanna</title>
      </Helmet>
      {loading ? (
        <div className="flex flex-col justify-center items-center h-screen">
          <p className="text-green-500 font-bold mb-4 text-lg md:text-base">Sanna</p>
          <BarLoader
            color="#10bc21"
            height={4}
            speedMultiplier={1}
            width={150}
          />
        </div>
      ) : signingIn ? (
        <div className="flex flex-col justify-center items-center h-screen">
          <p className="text-green-500 font-bold mb-4 text-lg md:text-base">Sanna</p>
          <BarLoader
            color="#10bc21"
            height={4}
            speedMultiplier={1}
            width={150}
          />
        </div>
      ) : (
        <section className="flex flex-col justify-center items-center h-screen p-6 bg-gray-100">
          <div className="w-full max-w-md flex flex-col items-center">
            <p className="text-green-500 font-bold text-lg md:text-base">Sanna</p>
            <p className="text-sm md:text-base my-4 text-center">Please Sign in to Network, learn, and Cross-Sell</p>
            <form className="bg-white p-8 rounded-lg border border-black-200 space-y-4 w-full" onSubmit={formik.handleSubmit}>
              <div>
                <label className="block mb-1 text-gray-700 text-sm md:text-base" htmlFor="email">Email</label>
                <input
                  className="w-full border rounded-md px-4 py-1 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full border rounded-md px-4 py-1 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <button type="submit" className='w-full bg-green-500 text-white py-1 rounded-md hover:bg-green-700 transition duration-300'>
                Login
              </button>

              <div className='text-center mt-2'>
                <Link to="/reset" className='text-green-500 text-sm hover:underline'>Reset your password</Link>
              </div>

              <div className='flex justify-center items-center mt-2'>
                <button
                  type="button"
                  className='flex items-center gap-2 border text-gray-600 text-sm py-2 px-4 rounded-lg hover:bg-green-100 transition duration-300'
                  onClick={signInWithGoogle}
                >
                  <img src={`https://www.material-tailwind.com/logos/logo-google.png`} alt="google" className='h-5 w-5' />
                  Sign in with Google
                </button>
              </div>
            </form>
            <div className='text-center mt-4'>
              <p className='text-gray-700 text-sm'>Don't have an account? <Link to="/register" className='text-green-500 text-sm hover:underline'>Register</Link></p>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Login;

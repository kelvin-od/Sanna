import React, { useState, useContext, useEffect } from 'react';
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import BarLoader from "react-spinners/BarLoader";
import { AuthContext } from "../AppContext/AppContext";
import { auth, onAuthStateChanged } from "../firebase/firebase";
import { Helmet } from 'react-helmet';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { registerWithEmailAndPassword, signInWithGoogle } = useContext(AuthContext);
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
      }
      setLoading(false);
    });
  }, [navigate]);

  const initialValues = {
    firstName: "",
    secondName: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required("Required")
      .min(4, "Must be at least 4 characters long"),
    secondName: Yup.string()
      .required("Required")
      .min(4, "Must be at least 4 characters long"),
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string()
      .required("Required")
      .min(6, "Must be at least 6 characters long")
      .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, "Password must contain at least one letter, one number, and one special character"),
  });

  const handleRegister = (e) => {
    e.preventDefault();
    const { firstName, secondName, email, password } = formik.values;
    if (formik.isValid) {
      registerWithEmailAndPassword(firstName, secondName, email, password);
      setLoading(true);
    } else {
      setLoading(false);
      alert("Check input fields");
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit: handleRegister });

  return (
    <>
      <Helmet>
        <title>Register | Sanna</title>
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
      ) : (
        <section className="flex flex-col justify-center items-center h-screen p-6 bg-gray-100">
          <div className="w-full max-w-md flex flex-col items-center">
            <p className="text-green-500 font-bold text-lg md:text-base">Sanna</p>
            <p className="text-gray-600 text-center my-4">Nice to meet you</p>
            <form className="bg-white p-8 rounded-lg border border-black-200 space-y-4 w-full" onSubmit={handleRegister}>
              <div className='flex flex-col md:flex-row w-full gap-3'>
                <div className='w-full'>
                  <label className="block text-gray-700 font-medium text-sm mb-1">First Name</label>
                  <input
                    className="w-full px-4 py-1 border text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    {...formik.getFieldProps("firstName")}
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.firstName}</p>
                  )}
                </div>
                <div className='w-full'>
                  <label className="block text-gray-700 font-medium text-sm mb-1">Second Name</label>
                  <input
                    className="w-full px-4 py-1 border text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    name="secondName"
                    placeholder="Second Name"
                    {...formik.getFieldProps("secondName")}
                  />
                  {formik.touched.secondName && formik.errors.secondName && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.secondName}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                <input
                  className="w-full px-4 py-1 border text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="email"
                  name="email"
                  placeholder="youremail@mail.com"
                  {...formik.getFieldProps("email")}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-1 border text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type={passwordShown ? "text" : "password"}
                    name="password"
                    placeholder="********"
                    {...formik.getFieldProps("password")}
                  />
                  <button
                    onClick={togglePasswordVisiblity}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                  >
                    {passwordShown ? (
                      <EyeIcon className="h-5 w-5" />
                    ) : (
                      <EyeSlashIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
                )}
              </div>
              <button
                className="w-full py-1 mt-8 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-200"
                type="submit"
              >
                Register
              </button>
              <div className="flex items-center justify-center mt-4">
                <button className="flex items-center gap-2 border text-gray-600 text-sm py-2 px-4 rounded-lg hover:bg-green-100 transition duration-300"
                  onClick={signInWithGoogle}
                >
                  <img
                    src="https://www.material-tailwind.com/logos/logo-google.png"
                    alt="google"
                    className="h-5 w-5 mr-2"
                  />
                  Sign in with Google
                </button>
              </div>

            </form>
            <div className="text-center mt-4">
              <p className="text-gray-600 text-sm">Already have an account? <Link to="/login" className="text-green-500 text-sm hover:underline">Login</Link></p>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Register;

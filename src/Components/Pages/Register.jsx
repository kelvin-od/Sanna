import React, { useState, useContext, useEffect } from 'react'
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ClipLoader from "react-spinners/ClipLoader";
import { AuthContext } from "../AppContext/AppContext";
import { auth, onAuthStateChanged } from "../firebase/firebase";

const Register = () => {

  const [loading, setLoading] = useState(false);
  const { registerWithEmailAndPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = (e) => {
    e.preventDefault()
    setPasswordShown((cur) => !cur);
  }

  

  useEffect(() => {
    setLoading(true);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

  let initialValues = {
    name: "",
    email: "",
    company:"",
    password: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Required")
      .min("4", "Must be at least 4 characters long")
      .matches(/^[a-zA-Z]+$/, "Name can only contain letters"),
    email: Yup.string().email("Invalid email address").required("Required"),
    company: Yup.string()
      .required("Required")
      .min("4", "Must be at least 4 characters long")
      .matches(/^[a-zA-Z]+$/, "Company name can only contain letters"),
    password: Yup.string()
      .required("Required")
      .min("6", "Must be at least 6 characters long")
      .matches(/^[a-zA-Z]+$/, "Password can only contain letters"),
  });


  const handleRegister = (e) => {
    e.preventDefault();

    const { name, email, company, password } = formik.values;
     if (formik.isValid === true) {
      registerWithEmailAndPassword(name, email, company, password);
      setLoading(true)
    } else {
      setLoading(false)
     alert("check input filds")
    }
  }
  

  const formik = useFormik({ initialValues, validationSchema, handleRegister });

  return (
    <>
    {loading ? (<div className="grid text-center justify-center h-screen items-center p-8 ">
    <ClipLoader
  color="#000000"
  size={100}
  speedMultiplier={0.5}
/>
    </div>) : (
      <section className="grid text-center justify-center h-screen items-center p-8 ">
      <div className='w-full'>
        <h4>Sign up</h4>
        <p className='font-normal '>
          Nice to meet you
        </p>
        <form action="" className="mx-auto w-full text-left mt-8" onSubmit={handleRegister}>
          <div className='mb-3 w-full'>
            <label className="mb-2 block font-medium text-gray-900" htmlFor="">Your Name</label>
            <input
              className="w-full placeholder:opacity-100 border-b-2 border-gray-300 focus:border-t-primary border-t-blue-gray-200 p-2 pr-10"
              type="text"
              name='name'
              placeholder='name'
              {...formik.getFieldProps("name")} />
          </div>

          <div>
                {formik.touched.name && formik.errors.name && (
                  <p className='text-red-500'>
                    {formik.errors.name}
                  </p>
                )}
              </div>

          <div className='mb-3'>
            <label className="mb-2 block font-medium text-gray-900" htmlFor="">Email</label>
            <input
              className="w-full placeholder:opacity-100 border-b-2 border-gray-300 focus:border-t-primary border-t-blue-gray-200 p-2 pr-10"
              type="email"
              name='email'
              placeholder='name@mail.com'
              {...formik.getFieldProps("email")} />
          </div>

          <div>
                {formik.touched.email && formik.errors.email && (
                  <p className='text-red-500'>
                    {formik.errors.email}
                  </p>
                )}
              </div>

          <div className='mb-3'>
            <label className="mb-2 block font-medium text-gray-900" htmlFor="">Company</label>
            <input
              className="w-full placeholder:opacity-100 border-b-2 border-gray-300 focus:border-t-primary border-t-blue-gray-200 p-2 pr-10"
              type="company"
              name='company'
              placeholder='ABC LTD'
              {...formik.getFieldProps("company")} />
          </div>

          <div>
                {formik.touched.company && formik.errors.company && (
                  <p className='text-red-500'>
                    {formik.errors.company}
                  </p>
                )}
              </div>

          <div className='mb-3'>
            <label className="mb-2 block font-medium text-gray-900" htmlFor="password">Password</label>
            <div className="relative">
              <input
                className="w-full placeholder:opacity-100 border-b-2 border-gray-300 focus:border-t-primary border-t-blue-gray-200 p-2 pr-10"
                name='pasword'
                type={passwordShown ? "text" : "password"}
                placeholder='***********'
                id="password"
              {...formik.getFieldProps("password")}
              />

              <div>
                {formik.touched.password && formik.errors.password && (
                  <p className='text-red-500'>
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <button
                onClick={togglePasswordVisiblity}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              >
                {passwordShown ? (
                  <EyeIcon className="h-5 w-5 text-gray-600" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <button className='bg-green-700 mt-6 w-full text-white py-3 rounded-lg'>
            Register
          </button>

          <div className='w-full justify-center items-center'>
            <button className='h-12 flex w-full justfy-center gap-2 mt-2'>
              <img src={`https://www.material-tailwind.com/logos/logo-google.png`} alt="google" className='h-6 w-6' />
              Sign with Google
            </button>
          </div>

          <div className='flex justify-center mt-3'>
            <p className='mr-2'>I have an account?</p>
            <Link to="/login">
              Login
            </Link>
          </div>

        </form>
      </div>

    </section>
      ) }
    
    </>
  )
}

export default Register

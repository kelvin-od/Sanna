import React, { useState, useContext, useEffect } from 'react'
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ClipLoader from "react-spinners/ClipLoader";
import { AuthContext } from "../AppContext/AppContext";
import { auth, onAuthStateChanged } from "../firebase/firebase";

const Login = () => {

  const { signInWithGoogle, loginWithEmailAndPassword } =
    useContext(AuthContext);

  const [loading, setLoading] = useState(false)
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
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string()
      .required("Required")
      .min("6", "Must be at least 6 characters long")
      .matches(/^[a-zA-Z]+$/, "Password can only contain letters"),
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

    console.log("formik", formik)
  }

  const formik = useFormik({ initialValues, validationSchema, handleSubmit });



  return (
    <>
      {loading ? (
        <div className="grid text-center justify-center h-screen items-center p-8 ">
          <ClipLoader
            color="#000000"
            size={100}
            speedMultiplier={0.5}
          />
        </div>
      ) : (
        <section className="grid text-center justify-center h-screen items-center p-8 ">
          <div className='border-2 border-gray-300 px-12 py-9 rounded-lg shadow-md'>
            <h3 className='mb-2'>Sign in</h3>
            <p className='mb-8 text-gray-600 font-normal text-[18px]'>Enter your email and password to sign in</p>
            <form action="" className="mx-auto max-w-[24rem] text-left" onSubmit={handleSubmit}>
              <div className='mb-6'>
                <label className="mb-2 block font-medium text-gray-900" htmlFor="">Email</label>
                <input
                  className="w-full placeholder:opacity-100 border-b-2 border-gray-300 focus:border-t-primary border-t-blue-gray-200 py-3 pl-2"
                  name='email'
                  type="email"
                  placeholder='name@mail.com'
                  labelProps={{
                    className: "hidden",
                  }}
                  {...formik.getFieldProps("email")} />
              </div>

              <div>
                {formik.touched.email && formik.errors.email && (
                  <p className='text-red-500'>
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div className='mb-6'>
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
                Login
              </button>

              <div className='flex justify-center items-center mt-4'>
                <Link to="/reset">
                  Reset your password</Link>
              </div>
              <div className='w-full justify-center items-center'>
                <button className='h-12 flex w-full justfy-center gap-2 mt-2' onClick={signInWithGoogle}>
                  <img src={`https://www.material-tailwind.com/logos/logo-google.png`} alt="google" className='h-6 w-6' />
                  Sign with Google
                </button>
              </div>

              <div className='flex justify-center mt-3'>
                <p className='mr-2'>Don't have an account?</p>
                <Link to="/register">
                  Register
                </Link>
              </div>

            </form>
          </div>
        </section>
      )}

    </>
  )
}

export default Login

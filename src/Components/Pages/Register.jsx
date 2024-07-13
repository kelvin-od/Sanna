import React, { useState, useContext, useEffect } from 'react';
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
    name: "",
    email: "",
    company: "",
    password: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Required")
      .min(4, "Must be at least 4 characters long"),
    email: Yup.string().email("Invalid email address").required("Required"),
    company: Yup.string()
      .required("Required")
      .min(4, "Must be at least 4 characters long"),
    password: Yup.string()
      .required("Required")
      .min(6, "Must be at least 6 characters long")
      .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, "Password must contain at least one letter, one number, and one special character"),
  });
  
  

  const handleRegister = (e) => {
    e.preventDefault();
    const { name, email, company, password } = formik.values;
    if (formik.isValid) {
      registerWithEmailAndPassword(name, email, company, password);
      setLoading(true);
    } else {
      setLoading(false);
      alert("Check input fields");
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit: handleRegister });

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <ClipLoader color="#000000" size={100} speedMultiplier={0.5} />
        </div>
      ) : (
        <section className="flex flex-col justify-center items-center h-screen p-6 bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>
            <p className="text-gray-600 text-center mb-6">Nice to meet you</p>
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label className="block text-gray-700 font-medium text-sm mb-1">Your Name</label>
                <input
                  className="w-full px-4 py-2 border text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  {...formik.getFieldProps("name")}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                <input
                  className="w-full px-4 py-2 border text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="email"
                  name="email"
                  placeholder="name@mail.com"
                  {...formik.getFieldProps("email")}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Company</label>
                <input
                  className="w-full px-4 py-2 border text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  name="company"
                  placeholder="ABC LTD"
                  {...formik.getFieldProps("company")}
                />
                {formik.touched.company && formik.errors.company && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.company}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-2 border text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-200"
                type="submit"
              >
                Register
              </button>
              <div className="flex items-center justify-center mt-4">
                <button className="flex items-center justify-center w-full py-2 border rounded-lg hover:bg-gray-50 transition duration-200">
                  <img
                    src="https://www.material-tailwind.com/logos/logo-google.png"
                    alt="google"
                    className="h-5 w-5 mr-2"
                  />
                  Sign up with Google
                </button>
              </div>
              <div className="text-center mt-4">
                <p className="text-gray-600 text-sm">Already have an account? <Link to="/login" className="text-green-500 text-sm hover:underline">Login</Link></p>
              </div>
            </form>
          </div>
        </section>
      )}
    </>
  );
};

export default Register;

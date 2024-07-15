import React, { createContext, useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { query, where, collection, getDocs, addDoc, doc, setDoc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const AppContext = ({ children }) => {
  const collectionUsersRef = collection(db, "users");
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState();
  const [userData, setUserData] = useState();
  
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      const popup = await signInWithPopup(auth, provider);
      const user = popup.user;
      const q = query(collectionUsersRef, where("uid", "==", user.uid));
      const docs = await getDocs(q);
      if (docs.docs.length === 0) {
        await addDoc(collectionUsersRef, {
          uid: user?.uid,
          name: user?.displayName,
          email: user?.email,
          image: user?.photoURL,
          authProvider: popup?.providerId,
        });
      }
    } catch (err) {
      alert(err.message);
      console.log(err.message);
    }
  };

  const loginWithEmailAndPassword = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await signOut(auth);
        alert("Please verify your email before logging in.");
      } else {
        navigate("/home");
      }
    } catch (err) {
      alert(err.message);
      console.log(err.message);
    }
  };

  const registerWithEmailAndPassword = async (name, email, password) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;
  
      // Send email verification
      await sendEmailVerification(user);
  
      // Store user information in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        providerId: "email/password",
        email: user.email,
        emailVerified: user.emailVerified,
        profilePicture: '',
        businessPicture: '',
        profileCover: '',
        // Add other default profile fields here if needed
      });
  
      alert("Registration successful! Please verify your email before logging in.");
    } catch (err) {
      alert(err.message);
      console.log(err.message);
    }
  };

  const sendPasswordToUser = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("New password sent to your email");
    } catch (err) {
      alert(err.message);
      console.log(err.message);
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUser(null); // Clear user state
    setUserData(null); // Clear userData state
    navigate('/'); // Redirect to landing page after signout
  };

  const userStateChanged = async () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!user.emailVerified) {
          alert("Please verify your email.");
          await signOut(auth);
          navigate("/login");
          return;
        }

        const q = query(collectionUsersRef, where("uid", "==", user?.uid));
        await onSnapshot(q, (doc) => {
          setUserData(doc?.docs[0]?.data());
        });
        setUser(user);
      } else {
        setUser(null);
        navigate("/login");
      }
    });
  };

  useEffect(() => {
    userStateChanged();
    return () => userStateChanged();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.emailVerified) {
        navigate("/home");
      } else {
        navigate("/login");
      }
    } else {
      navigate("/");
    }
  }, [user]);

  const initialState = {
    signInWithGoogle,
    loginWithEmailAndPassword,
    registerWithEmailAndPassword,
    sendPasswordToUser,
    signOutUser,
    user,
    userData,
  };

  console.log("userdata", userData);

  return (
    <AuthContext.Provider value={initialState}>
      {children}
    </AuthContext.Provider>
  );
};

export default AppContext;
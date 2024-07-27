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
import { query, where, collection, getDocs, addDoc, getDoc, setDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const AppContext = ({ children }) => {
  const collectionUsersRef = collection(db, "users");
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false); // New state for sign-in process
  const [profileDetails, setProfileDetails] = useState({
    firstName: '',
    secondName: '',
    personalPhone: '',
    profilePicture: '',
    profileCover: '',
  });

  const navigate = useNavigate();

  const ensureUserDocument = async (uid) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        uid: uid,
        firstName: '',
        secondName: '',
        personalPhone: '',
        profilePicture: '',
        profileCover: '',
      });
    }
  };

  const signInWithGoogle = async () => {
    setSigningIn(true);
    try {
      const popup = await signInWithPopup(auth, provider);
      const user = popup.user;
  
      await ensureUserDocument(user.uid);
  
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          name: user.displayName,
          email: user.email,
          profilePicture: user.photoURL,
          authProvider: popup.providerId,
        });
      } else {
        await setDoc(docRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          profilePicture: user.photoURL,
          authProvider: popup.providerId,
        });
      }
  
      setProfileDetails((prevDetails) => ({
        ...prevDetails,
        firstName: user.displayName,
        profilePicture: user.photoURL,
        email: user.email,
      }));
      navigate("/feeds");
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    } finally {
      setSigningIn(false);
    }
  };

  const loginWithEmailAndPassword = async (email, password) => {
    setSigningIn(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await signOut(auth);
        alert("Please verify your email before logging in.");
      } else {
        navigate("/feeds");
      }
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    } finally {
      setSigningIn(false);
    }
  };

  const registerWithEmailAndPassword = async (firstName, secondName, email, password) => {
    setSigningIn(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;
      await ensureUserDocument(user.uid);

      await sendEmailVerification(user);

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        firstName,
        secondName,
        providerId: "email/password",
        email: user.email,
        emailVerified: user.emailVerified,
        profilePicture: '',
        profileCover: '',
      });

      alert("Registration successful! Please verify your email before logging in.");
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    } finally {
      setSigningIn(false);
    }
  };

  const sendPasswordToUser = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("New password sent to your email");
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      setProfileDetails({
        firstName: '',
        secondName: '',
        personalPhone: '',
        profilePicture: '',
        profileCover: '',
      });
      navigate('/');
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  const updateProfileDetails = async (newDetails) => {
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, newDetails); // Use updateDoc to update the document
        setProfileDetails((prevDetails) => ({
          ...prevDetails,
          ...newDetails
        }));
      } catch (err) {
        console.error(err.message);
        alert(err.message);
      }
    }
  };

  const userStateChanged = () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!user.emailVerified) {
          alert("Please verify your email.");
          await signOut(auth);
          if (window.location.pathname !== "/login") {
            navigate("/login");
          }
          return;
        }

        const q = query(collectionUsersRef, where("uid", "==", user.uid));
        const unsubscribeSnapshot = onSnapshot(q, (doc) => {
          const userData = doc.docs[0]?.data();
          setUserData(userData);
          setProfileDetails((prevDetails) => ({
            ...prevDetails,
            firstName: userData?.firstName || user.displayName || '',
            secondName: userData?.secondName || '',
            personalPhone: userData?.personalPhone || '',
            profilePicture: userData?.profilePicture || user.photoURL || '',
            profileCover: userData?.profileCover || '',
          }));
        });
        setUser(user);
        setLoading(false); // Set loading to false when user data is fetched

        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setProfileDetails({
          firstName: '',
          secondName: '',
          personalPhone: '',
          profilePicture: '',
          profileCover: '',
        });
        setLoading(false); // Set loading to false when no user is found
        if (window.location.pathname !== "/login") {
          navigate("/");
        }
      }
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    const unsubscribe = userStateChanged();
    return () => unsubscribe();
  }, []);

  const initialState = {
    signInWithGoogle,
    loginWithEmailAndPassword,
    registerWithEmailAndPassword,
    sendPasswordToUser,
    signOutUser,
    updateProfileDetails,
    ensureUserDocument,
    user,
    userData,
    profileDetails,
    loading,
    signingIn, // Add signingIn state to context
  };

  return (
    <AuthContext.Provider value={initialState}>
      {children}
    </AuthContext.Provider>
  );
};

export default AppContext;

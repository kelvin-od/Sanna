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
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import {
  query,
  where,
  collection,
  getDoc,
  setDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";

export const AuthContext = createContext();

const AppContext = ({ children }) => {
  const collectionUsersRef = collection(db, "users");
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navigate = useNavigate();

  const ensureUserDocument = async (uid) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        uid,
        name: '',
        email: '',
        photoURL: '',
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
          name: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          authProvider: popup.providerId,
        });
      } else {
        await setDoc(docRef, {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          authProvider: popup.providerId,
        });
      }

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
  
      await updateProfile(user, {
        displayName: `${firstName} ${secondName}`
      });
  
      try {
        await sendEmailVerification(user);
      } catch (verificationError) {
        console.error("Error sending email verification:", verificationError.message);
        alert("Failed to send verification email. Please try again later.");
        return;
      }
  
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: `${firstName} ${secondName}`,
        email: user.email,
        emailVerified: user.emailVerified,
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
    setIsSigningOut(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      navigate('/');
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    } finally {
      setIsSigningOut(false);
    }
  };

  const updateProfileDetails = async (newDetails) => {
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, newDetails);
        setUserData((prevData) => ({
          ...prevData,
          ...newDetails,
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

        try {
          const q = query(collectionUsersRef, where("uid", "==", user.uid));
          const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            const userData = snapshot.docs[0]?.data();
            setUser(user);
            setUserData(userData);
            setLoading(false);
          });

          // Unsubscribe from the snapshot listener when the component is unmounted or the user signs out
          return () => {
            unsubscribeSnapshot();
          };
        } catch (error) {
          console.error("Error fetching user data:", error);
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
        if (window.location.pathname !== "/login") {
          navigate("/");
        }
      }
    });

    // Unsubscribe from the auth state change listener when the component is unmounted
    return () => {
      unsubscribe();
    };
  };

  useEffect(() => {
    const unsubscribe = userStateChanged();
    return () => {
      unsubscribe();
    };
  }, []);

  const getUserDataByUID = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
      return null;
    }
  };

  const initialState = {
    signInWithGoogle,
    loginWithEmailAndPassword,
    registerWithEmailAndPassword,
    sendPasswordToUser,
    signOutUser,
    updateProfileDetails,
    ensureUserDocument,
    getUserDataByUID,
    user,
    userData,
    loading,
    signingIn,
    isSigningOut,
  };

  return (
    <AuthContext.Provider value={{...initialState, setUserData}}>
      {loading ? <Loader /> : children}
    </AuthContext.Provider>
  );
};

export default AppContext;

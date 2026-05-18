import { createContext, useContext, useEffect, useState } from "react";
import { 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
 } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { getDoc, doc, setDoc } from "firebase/firestore";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          // Check if the user is an admin 
          if (userDoc.exists() && userDoc.data().role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password , additionalData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user

    await setDoc(doc(db, "users", user.uid), {
    fullName: additionalData.fullName,
    idNumber: additionalData.idNumber,
    age: additionalData.age,
    gender: additionalData.gender,
    country: additionalData.country,
    city: additionalData.city,
    address: additionalData.address,
    year: additionalData.year,
    studyField: additionalData.studyField,
    //profileImage: additionalData.profileImage,
    //studyApproval: additionalData.studyApproval,
    role: "user", // הגדרת תפקיד ברירת מחדל
    createdAt: new Date() 
    });

    return userCredential;
  };

  const  login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
   
  };
  const logout = () => {
    return signOut(auth);
  };

  const value = { currentUser, loading, loginWithGoogle, isAdmin, signup, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => { return useContext(AuthContext) };
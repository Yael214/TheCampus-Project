import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth, db, storage } from "../firebase/config";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


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

  const uploadFile = async (file, path) => {
    if (!file) return null;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const signup = async (email, password, additionalData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user
    // Get format and upload
    const getExt = (file) => {
      return file.name.split('.').pop().toLowerCase();
    }
    let profileImageUrl = "";
    let studyApprovalUrl = "";

    if (additionalData.profileImage) {
      const ext = getExt(additionalData.profileImage);
      profileImageUrl = await uploadFile(
        additionalData.profileImage,
        `users/${user.uid}/profile.${ext}`
      );
    }
    if (additionalData.studyApproval) {
      const ext = getExt(additionalData.studyApproval);
      studyApprovalUrl = await uploadFile(
        additionalData.studyApproval,
        `users/${user.uid}/studyApproval.${ext}`
      );
    }

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
      profileImage: profileImageUrl,
      studyApproval: studyApprovalUrl,
      role: "user", // הגדרת תפקיד ברירת מחדל
      createdAt: new Date()
    });

    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
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
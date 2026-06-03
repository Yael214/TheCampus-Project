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
import { getDoc, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useImageHandler } from "../hooks/useImageHandler";
import { useUserData } from "../hooks/useUserData";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { getFileExtension, uploadFileToStorage } = useImageHandler();

  // Unified real-time user data listener from Firestore using custom hook
  const { userData, loading: userDataLoading, error: userDataError, updateCourseStatus, updateUserVisibility, updateUserLocation } = useUserData(authUser?.uid);

  // Merge auth data with Firestore user data into single object
  const currentUser = authUser && userData
    ? { ...authUser, ...userData }
    : authUser
      ? authUser
      : null;

  // Combined loading state: includes both auth and Firestore data loading
  const loading = authLoading || (authUser && userDataLoading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);

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
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const signup = async (email, password, additionalData) => {

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user

    let profileImageUrl = "";
    let studyApprovalUrl = "";

    if (additionalData.profileImage) {
      const ext = getFileExtension(additionalData.profileImage);
      profileImageUrl = await uploadFileToStorage(
        additionalData.profileImage,
        `users/${user.uid}/profile.${ext}`
      );
    }
    if (additionalData.studyApproval) {
      const ext = getFileExtension(additionalData.studyApproval);
      studyApprovalUrl = await uploadFileToStorage(
        additionalData.studyApproval,
        `users/${user.uid}/studyApproval.${ext}`
      );
    }

    await setDoc(doc(db, "users", user.uid), {
      fullName: additionalData.fullName,
      idNumber: additionalData.idNumber,
      age: additionalData.age,
      gender: additionalData.gender,
      phone: additionalData.phone,
      isDiscoverable: additionalData.isDiscoverable,
      address: additionalData.address,
      // The location map ({ geohash, lat, lng }) is what powers the nearby-users
      // search via geofire-common. Saved only if the user actually picked an address.
      location: additionalData.location || null,
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

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);

  };

  const deleteAccountComplete = async () => {
    // Use the clean Firebase auth user object (not the merged currentUser)
    if (!authUser) {
      throw new Error("No authenticated user found");
    }

    const userId = authUser.uid;
    const userDataForDeletion = userData;

    try {
      // STEP 1: Pre-verification - check if session is valid/fresh
      // This throws auth/requires-recent-login early if re-authentication is needed
      await authUser.getIdToken(true);

      // STEP 2: Delete uploaded files from Storage while still authenticated
      if (userDataForDeletion?.profileImage || userDataForDeletion?.studyApproval) {
        const fileUrls = [userDataForDeletion.profileImage, userDataForDeletion.studyApproval].filter(Boolean);
        await Promise.allSettled(
          fileUrls.map(url => deleteObject(ref(storage, url)))
        );
      }

      // STEP 3: Delete Firestore user document while still authenticated
      await deleteDoc(doc(db, "users", userId));

      // STEP 4: Finally delete from Auth as the last step
      await authUser.delete();

      // Reset auth state to trigger cleanup in useUserData hook
      setAuthUser(null);

      return { success: true };
    } catch (error) {
      console.error("Error during account deletion:", error);
      
      // Throw specific error types for component to handle
      if (error.code === 'auth/requires-recent-login') {
        throw {
          code: 'auth/requires-recent-login',
          message: 'For security, please log out, sign in again, and retry deletion.'
        };
      }
      
      throw {
        code: error.code || 'unknown',
        message: error.message || 'An error occurred while deleting your account.'
      };
    }
  };

  const logout = async () => {
    // Reset state immediately to null before signOut completes
    // This ensures useUserData's cleanup effect unsubscribes from Firestore listener
    setAuthUser(null);
    return signOut(auth);
  };

  const value = { currentUser, loading, loginWithGoogle, isAdmin, signup, login, logout, deleteAccountComplete, updateCourseStatus, updateUserVisibility, updateUserLocation };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => { return useContext(AuthContext) };
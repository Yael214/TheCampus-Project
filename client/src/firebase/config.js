import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCW4nchpZdzTzeWEIbtXQElVcxrY9K4ruw",
  authDomain: "thecampus-5b732.firebaseapp.com",
  projectId: "thecampus-5b732",
  storageBucket: "thecampus-5b732.firebasestorage.app",
  messagingSenderId: "144386696674",
  appId: "1:144386696674:web:3bb1235c18402593bfc5bb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
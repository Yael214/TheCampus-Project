import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteField, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; 

/**
 * Custom Hook to manage fetching all forums and handling user follow/unfollow logic.
 * @param {string} userId - The authenticated user's ID from Firebase Auth.
 */
export const useForums = (userId) => {
  const [forums, setForums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. FETCH ALL AVAILABLE FORUMS FROM FIRESTORE ---
  useEffect(() => {
    const fetchForums = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get a reference to the root 'forums' collection
        const forumsCollectionRef = collection(db, 'forums');
        
        // Fetch the documents snapshot from the cloud
        const querySnapshot = await getDocs(forumsCollectionRef);
        
        // Map through the documents and construct an array of forum objects
        const forumsList = querySnapshot.docs.map(doc => ({
          id: doc.id,       // The Primary Key / Document ID (e.g., 'react-programming')
          ...doc.data()     // Destructure all internal fields (forumName, description, category, etc.)
        }));
        
        setForums(forumsList);
      } catch (err) {
        console.error("Error fetching forums inside useForums hook:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForums();
  }, []);

  // --- 2. TOGGLE FOLLOW/UNFOLLOW STATUS (ATOMIC OPERATIONS) ---
  /**
   * Adds or removes a forumId from the user's followedForums array.
   * @param {string} forumId - The ID of the target forum.
   * @param {boolean} isCurrentlyFollowing - True if the user is currently subscribed, false otherwise.
   */
  const toggleFollowForum = async (forumId,forumName, isCurrentlyFollowing) => {
    // Safety Guard: Ensure there is an authenticated user before making cloud changes
    if (!userId) {
      console.warn("Cannot toggle forum subscription: No authenticated userId provided.");
      return;
    }

    // Get a direct reference to the specific user document inside 'users' collection
    const userDocRef = doc(db, 'users', userId);

    try {
      if (isCurrentlyFollowing) {
        await updateDoc(userDocRef, {
          [`followedForums.${forumId}`]: deleteField()
        });
      } else {
        await updateDoc(userDocRef, {
          [`followedForums.${forumId}`]: {
            forumId: forumId,
            forumName: forumName
          }
        });
      }
      
    } catch (err) {
      console.error(`Error updating forum subscription for user ${userId}:`, err);
      setError(err.message);
      throw err; // Re-throw the error so the UI component can catch it and show a toast/alert
    }
  };

  return { forums, isLoading, error, toggleFollowForum };
};
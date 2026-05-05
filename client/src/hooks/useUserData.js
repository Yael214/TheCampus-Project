import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Custom hook to manage user profile data and course updates.
 * Provides synchronized state with Firestore for the "The Campus" project.
 */
export const useUserData = (userId) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to fetch initial user data from Firestore on mount or when userId changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Reference the specific user document in the 'users' collection
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data()); // Populate state with Firestore data
        } else {
          setError("User not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  /**
   * Updates the status of a specific course in the user's document.
   * @param {string} courseNumber - The unique ID of the course (e.g., 20594).
   * @param {string} newStatus - The target status (e.g., 'completed').
   */
  const updateCourseStatus = async (courseNumber, newStatus) => {
    if (!userId || !userData) return;

    try {
      const userRef = doc(db, "users", userId);

      // Create a modified array of courses with the updated status for the target course
      const updatedCourses = userData.courses.map(course =>
        course.courseNumber === courseNumber
          ? { ...course, status: newStatus } // Update only the matched course
          : course // Keep other courses unchanged
      );

      // Perform the update operation in Cloud Firestore
      await updateDoc(userRef, {
        courses: updatedCourses
      });

      // Synchronize local state to reflect changes immediately in the UI without refresh
      setUserData({ ...userData, courses: updatedCourses });

      return { success: true };
    } catch (err) {
      console.error("Error updating course status:", err);
      return { success: false, error: err.message };
    }
  };

  // Exporting state and the update function for component use
  return { userData, loading, error, updateCourseStatus };
};
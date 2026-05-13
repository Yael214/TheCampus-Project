import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { db } from '../firebase/config';
import * as geofire from 'geofire-common';

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


  /**
   * Updates the user's visibility status on the map.
   * Modifies the 'isDiscoverable' field in Firestore and updates the local state.
   * * @param {boolean} isVisible - True if the user wants to be shown on the map, false otherwise.
   * @returns {Promise<Object>} An object containing { success: true } on success, or { success: false, error: "..." } on failure.
   */
  const updateUserVisibility = async (isVisible) => {
    // Safety check: ensure we have a valid user and loaded data before proceeding
    if (!userId || !userData) return;

    try {
      // 1. Create a reference to the specific user's document in Firestore
      const userRef = doc(db, "users", userId);
      
      // 2. Update ONLY the isDiscoverable field in the cloud database
      await updateDoc(userRef, {
        isDiscoverable: isVisible
      });

      // 3. Update the local React state so the UI reflects the change immediately
      setUserData({ ...userData, isDiscoverable: isVisible });
      
      // 4. Return a success object to the component that called this function
      return { success: true };
      
    } catch (err) {
      // Log the error for developers and return the error message for the UI
      console.error("Error updating visibility:", err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Updates the user's physical location on the map.
   * Calculates a geohash for the coordinates to allow for radius-based queries later.
   * * @param {number} lat - The latitude of the user's location.
   * @param {number} lng - The longitude of the user's location.
   * @returns {Promise<Object>} An object containing { success: true } on success, or { success: false, error: "..." } on failure.
   */
  const updateUserLocation = async (lat, lng) => {
    // Safety check: ensure user data is loaded
    if (!userId || !userData) return;

    try {
      // 1. Convert the exact coordinates into a 'geohash' string using the geofire library.
      // This is necessary because Firestore cannot natively query by geographic radius.
      const hash = geofire.geohashForLocation([lat, lng]);
      
      // 2. Package the location data into a single object matching our database schema
      const locationData = { lat, lng, geohash: hash };

      // 3. Create a reference to the user's document
      const userRef = doc(db, "users", userId);
      
      // 4. Save the new location object to Firestore
      await updateDoc(userRef, {
        location: locationData
      });

      // 5. Update the local state so the map UI can move the user's pin immediately
      setUserData({ ...userData, location: locationData });
      
      return { success: true };
      
    } catch (err) {
      console.error("Error updating location:", err);
      return { success: false, error: err.message };
    }
  };

  // Exporting state and the update function for component use
  return { 
    userData, loading, error, updateCourseStatus, updateUserVisibility, updateUserLocation };
};
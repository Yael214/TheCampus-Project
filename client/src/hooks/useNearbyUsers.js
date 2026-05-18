import { useState, useEffect } from 'react';
import { collection, query, orderBy, startAt, endAt, getDocs, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import * as geofire from 'geofire-common';

/**
 * Custom hook to fetch nearby users based on a geographic radius.
 * @param {Object} center - The center coordinates { lat, lng } (usually the current user's location).
 * @param {number} radiusInKm - The search radius in kilometers.
 */
export const useNearbyUsers = (center, radiusInKm) => {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNearbyUsers = async () => {
      // Don't run the search if we don't have a starting point or radius
      if (!center || !center.lat || !center.lng || !radiusInKm) return;

      try {
        setLoading(true);
        setError(null);

        // 1. Calculate the geographic boundaries (bounds) for our search radius
        const centerPoint = [center.lat, center.lng];
        const radiusInM = radiusInKm * 1000; // Convert km to meters
        const bounds = geofire.geohashQueryBounds(centerPoint, radiusInM);

        const usersCollection = collection(db, 'users');
        const promises = [];

        // 2. Loop through the calculated boundaries to create Firestore queries
        for (const b of bounds) {
          const q = query(
            usersCollection,
            // Only get users who have opted in to be discoverable
            where('isDiscoverable', '==', true),
            // Order by geohash to utilize the start/end bounds
            orderBy('location.geohash'),
            startAt(b[0]),
            endAt(b[1])
          );

          // Add the promise of this query to our array
          promises.push(getDocs(q));
        }

        // 3. Execute all queries simultaneously
        const snapshots = await Promise.all(promises);
        const matchingUsers = [];

        // 4. Process the results and filter out false positives (corner cases)
        for (const snap of snapshots) {
          for (const doc of snap.docs) {
            const user = doc.data();
            
            // Safety check: ensure the user has a valid location object
            if (user.location && user.location.lat && user.location.lng) {
              
              // Calculate exact distance from center
              const distanceInKm = geofire.distanceBetween(
                [user.location.lat, user.location.lng],
                centerPoint
              );
              
              // Only add if they are strictly within the radius (circle, not square)
              if (distanceInKm <= radiusInKm) {
                // Add the Firestore doc ID to the user object for unique keying
                matchingUsers.push({ id: doc.id, ...user, distance: distanceInKm });
              }
            }
          }
        }

        // 5. Update state with the final list of nearby users
        setNearbyUsers(matchingUsers);

      } catch (err) {
        console.error("Error fetching nearby users:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyUsers();
  }, [center, radiusInKm]); // Re-run whenever the center location or radius changes

  return { nearbyUsers, loading, error };
};
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useAllUsers = () => {
  // State to store the list of users
  const [users, setUsers] = useState([]);
  
  // State to track if data is still loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching all users:", error);
      } finally {
        setLoading(false); // Stop loading regardless of success or error
      }
    };

    fetchUsers();
  }, []);

  // Returning setUsers as well so the list can be updated locally (e.g., when blocking a user)
  return { users, loading, setUsers };
};
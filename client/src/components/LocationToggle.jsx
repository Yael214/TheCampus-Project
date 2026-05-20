import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../hooks/useUserData';

export const LocationToggle = ({ initialStatus }) => {
  const { currentUser } = useAuth();
  const { userData } = useUserData(currentUser?.uid);
  const [isDiscoverable, setIsDiscoverable] = useState(initialStatus ?? false);
  const [updating, setUpdating] = useState(false);

  // עדכן את ה state כשuserData משתנה (זה מתרחש כשמישהו שינה ב Firestore או בעמוד אחר)
  useEffect(() => {
    if (userData?.isDiscoverable !== undefined) {
      setIsDiscoverable(userData.isDiscoverable);
    }
  }, [userData?.isDiscoverable]);

  const handleToggle = async () => {
    if (!currentUser?.uid || updating) return;

    const newStatus = !isDiscoverable;
    setIsDiscoverable(newStatus);
    setUpdating(true);

    try {
      // עדכן את Firestore
      await updateDoc(doc(db, "users", currentUser.uid), {
        isDiscoverable: newStatus
      });
      // onSnapshot listener will automatically update all components listening to this user
    } catch (error) {
      console.error("Error updating isDiscoverable:", error);
      // חזור לסטטוס הקודם במקרה שגיאה
      setIsDiscoverable(!newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-4 py-2" dir="rtl">
      <span className={`text-sm font-medium transition-colors duration-300 ${
        isDiscoverable ? 'text-black' : 'text-gray-400'
      }`}>
        שתף מיקום
      </span>
      
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
          isDiscoverable ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
            isDiscoverable ? '-translate-x-6' : '-translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};
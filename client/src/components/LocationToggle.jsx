import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const LocationToggle = ({ initialStatus }) => {
  const { currentUser, updateUserVisibility } = useAuth();
  const [isDiscoverable, setIsDiscoverable] = useState(initialStatus ?? false);
  const [updating, setUpdating] = useState(false);

  // Sync local state with currentUser when Firestore data changes
  useEffect(() => {
    if (currentUser?.isDiscoverable !== undefined) {
      setIsDiscoverable(currentUser.isDiscoverable);
    }
  }, [currentUser?.isDiscoverable]);

  const handleToggle = async () => {
    if (!currentUser?.uid || updating) return;

    const newStatus = !isDiscoverable;
    setIsDiscoverable(newStatus);
    setUpdating(true);

    try {
      // Call updateUserVisibility from context to sync with Firestore
      await updateUserVisibility(newStatus);
      // Real-time listener automatically updates all subscribed components
    } catch (error) {
      console.error("Error updating isDiscoverable:", error);
      // Rollback on error
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
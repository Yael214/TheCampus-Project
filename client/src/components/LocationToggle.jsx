import { useState } from 'react';

export const LocationToggle = ({ initialStatus }) => {
  const [isDiscoverable, setIsDiscoverable] = useState(initialStatus);

  const handleToggle = () => {
    setIsDiscoverable(!isDiscoverable);
  };

  return (
    <div className="flex items-center gap-4 py-2" dir="rtl">
      <span className={`text-sm font-medium transition-colors duration-300 ${
        isDiscoverable ? 'text-black' : 'text-gray-400'
      }`}>
        מיקום
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
import { useState } from 'react';
import { useAllUsers } from '../hooks/useAllUsers';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { users, loading, setUsers } = useAllUsers();
  const { currentUser } = useAuth();
  
  // State to store the search query
  const [searchQuery, setSearchQuery] = useState('');

  // Block access for non-admin users
  if (currentUser?.role !== 'admin') {
    return <div className="p-6 text-center text-red-500 font-bold" dir="rtl">אין גישה. העמוד מורשה למנהלים בלבד.</div>;
  }

  // Function to toggle block/unblock status
  // Function to toggle block/unblock status
  const handleToggleBlock = async (userId, currentStatus) => {
    console.log("1. Button clicked! User ID:", userId);
    console.log("2. Current Status is:", currentStatus);
    
    try {
      const userRef = doc(db, 'users', userId);
      console.log("3. Found user reference in DB, attempting to update...");
      
      // Toggle the status in Firebase
      await updateDoc(userRef, { isBlocked: !currentStatus });
      console.log("4. Firebase updated successfully!");
      
      // Update the local state
      setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !currentStatus } : u));
      console.log("5. Screen updated successfully!");
      
    } catch (error) {
      console.error("❌ ERROR updating block status:", error);
      alert("שגיאה! תבדקי את הקונסול (F12) כדי לראות מה קרה.");
    }
  };

  // Filter users based on the search query (case-insensitive)
  const filteredUsers = users.filter(user => {
    const name = user.fullName || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <div className="p-6 text-center" dir="rtl">טוען משתמשים...</div>;

  return (
    // Using dir="rtl" to align everything to the right for Hebrew UI
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <h1 className="text-3xl font-bold text-[#2C3E7A] mb-6">ניהול משתמשים</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="חיפוש משתמש לפי שם..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E7A] transition-all"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Table layout with text aligned to the right */}
        <table className="w-full text-right border-collapse">
          <thead className="bg-[#F0F2FA]">
            <tr>
              <th className="p-4 border-b font-semibold text-gray-700">שם משתמש</th>
              <th className="p-4 border-b font-semibold text-gray-700">סטטוס</th>
              <th className="p-4 border-b font-semibold text-gray-700">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {/* Display only the filtered users */}
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4">{user.fullName || 'ללא שם'}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {user.isBlocked ? 'חסום' : 'פעיל'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                      className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${user.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                      {user.isBlocked ? 'שחרר חסימה' : 'חסום'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              // Empty state message when search yields no results
              <tr>
                <td colSpan="3" className="p-8 text-center text-gray-500">
                  לא נמצאו משתמשים תואמים לחיפוש "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
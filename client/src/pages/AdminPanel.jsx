import { useState } from 'react';
import { useAllUsers } from '../hooks/useAllUsers';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import AdminReports from '../components/AdminReports';

const AdminPanel = () => {
  const { users, loading, setUsers } = useAllUsers();
  const { currentUser } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showReports, setShowReports] = useState(false);

  // Block access for non-admin users
  if (currentUser?.role !== 'admin') {
    return <div className="p-6 text-center text-red-500 font-bold" dir="rtl">אין גישה. העמוד מורשה למנהלים בלבד.</div>;
  }

  // Toggle Block Status
  const handleToggleBlock = async (userId, currentStatus, targetRole) => {
    // Safety check: Prevent admin from blocking themselves
    if (userId === currentUser.uid) {
      alert("פעולה לא מורשית: אינך יכול/ה לחסום את החשבון של עצמך.");
      return;
    }

    // Safety check: Prevent admin from blocking other admin accounts
    if (targetRole === 'admin') {
      alert("פעולה לא מורשית: אינך יכול/ה לחסום מנהל מערכת אחר.");
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isBlocked: !currentStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !currentStatus } : u));
    } catch (error) {
      console.error("Error updating block status:", error);
    }
  };

  // Promote user to Admin (One-way action)
  const handleMakeAdmin = async (userId) => {
    // Extra safety confirmation before promoting a user
    const confirmAdmin = window.confirm("האם את בטוחה שברצונך להפוך משתמש זה למנהל מערכת? לא יהיה ניתן לבטל זאת מכאן.");
    
    if (!confirmAdmin) return;

    try {
      const userRef = doc(db, 'users', userId);
      
      // Only set role to 'admin', no downgrading
      await updateDoc(userRef, { role: 'admin' });
      
      // Update local state to reflect changes instantly
      setUsers(users.map(u => u.id === userId ? { ...u, role: 'admin' } : u));
      
      alert("המשתמש הוגדר כמנהל בהצלחה! (כדי לראות את השינוי, עליו לרענן את האפליקציה).");
    } catch (error) {
      console.error("Error updating admin role:", error);
      alert("שגיאה בעדכון הרשאות. ודא/י שיש לך הרשאות מתאימות בפיירבייס.");
    }
  };

  const filteredUsers = users
    .filter(user => {
      const name = user.fullName || '';
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (a.role !== 'admin' && b.role === 'admin') return 1;
      return 0;
    });

  if (loading) return <div className="p-6 text-center" dir="rtl">טוען משתמשים...</div>;

  if (showReports) {
    return <AdminReports onBack={() => setShowReports(false)} />;
  }

  return (
    <div className="max-w-5xl mx-auto p-6" dir="rtl">
      <h1 className="text-3xl font-bold text-[#2C3E7A] mb-6">ניהול משתמשים והרשאות</h1>
      <button
          onClick={() => setShowReports(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-2"
        >
          <span>🚨</span>
          <span>צפה בדיווחים על תוכן</span>
        </button>
      
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
        <table className="w-full text-right border-collapse">
          <thead className="bg-[#F0F2FA]">
            <tr>
              <th className="p-4 border-b font-semibold text-gray-700">שם משתמש</th>
              <th className="p-4 border-b font-semibold text-gray-700">הרשאות</th>
              <th className="p-4 border-b font-semibold text-gray-700">סטטוס</th>
              <th className="p-4 border-b font-semibold text-gray-700">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                  
                  {/* Name */}
                  <td className="p-4 font-medium text-gray-800">{user.fullName || 'ללא שם'}</td>
                  
                  {/* Role Badge */}
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role === 'admin' ? 'מנהל צוות' : 'משתמש רגיל'}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {user.isBlocked ? 'חסום' : 'פעיל'}
                    </span>
                  </td>
                  
                  {/* Action Buttons */}
                  <td className="p-4">
                    <div className="flex gap-2 items-center">
                      {/* Check row ownership and target role restrictions */}
                      {user.id === currentUser.uid ? (
                        <span className="text-gray-400 text-sm font-medium px-2 italic">החשבון שלך</span>
                      ) : user.role === 'admin' ? (
                        <span className="text-gray-400 text-sm font-medium px-2 italic">מנהל מערכת</span>
                      ) : (
                        <>
                          {/* Toggle Block Button */}
                          <button 
                            onClick={() => handleToggleBlock(user.id, user.isBlocked, user.role)}
                            className={`px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-colors ${user.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                          >
                            {user.isBlocked ? 'שחרר חסימה' : 'חסום משתמש'}
                          </button>

                          {/* Make Admin Button */}
                          {user.role !== 'admin' && (
                            <button 
                              onClick={() => handleMakeAdmin(user.id)}
                              className="px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-colors bg-purple-500 hover:bg-purple-600"
                            >
                              הפוך למנהל
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
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
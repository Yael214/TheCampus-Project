import React, { useState, useEffect } from 'react';
import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import AdminPanel from './AdminPanel';     // קובץ ניהול המשתמשים הקיים שלך
import AdminReports from './AdminReports'; // הקובץ החדש של הדיווחים

function AdminDashboardLayout() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'reports'
  const [pendingReportsCount, setPendingReportsCount] = useState(0);

  // בדיקת הרשאות אדמין כללית
  if (currentUser?.role !== 'admin') {
    return <div className="p-6 text-center text-red-500 font-bold" dir="rtl">אין גישה. העמוד מורשה למנהלים בלבד.</div>;
  }

  // שליפת כמות הדיווחים הממתינים כדי להציג את התגית האדומה
  useEffect(() => {
    const fetchReportsCount = async () => {
      try {
        const q = query(collectionGroup(db, "reports"), where("status", "==", "pending"));
        const snapshot = await getDocs(q);
        setPendingReportsCount(snapshot.size);
      } catch (error) {
        console.error("Error fetching pending reports count:", error);
      }
    };
    fetchReportsCount();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      {/* כותרת ראשית של המפקדה */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2C3E7A]">מפקדת ניהול מערכת</h1>
          <p className="text-sm text-gray-500">ניהול משתמשים, הרשאות ובקרה על תכנים מדווחים</p>
        </div>

        {/* טאבים למעבר מהיר */}
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'users' 
                ? 'bg-white text-[#2C3E7A] shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ניהול משתמשים
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`relative px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reports' 
                ? 'bg-white text-[#2C3E7A] shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>דיווחים על תוכן</span>
            {pendingReportsCount > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {pendingReportsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* הצגת הקומפוננטה בהתאם לטאב הנבחר */}
      <div className="transition-all">
        {activeTab === 'users' ? <AdminPanel /> : <AdminReports />}
      </div>
    </div>
  );
}

export default AdminDashboardLayout;
import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

function AdminDashboard() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);

  const handleMakeAdmin = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage({ text: '', isError: false });

    const functions = getFunctions();
    const addAdminRole = httpsCallable(functions, 'addAdminRole');

    try {
      const result = await addAdminRole({ email: email });
      setMessage({ text: result.data.message, isError: false });
      setEmail('');
    } catch (error) {
      console.error("Error setting admin role:", error);
      setMessage({ text: error.message || 'שגיאה במינוי האדמין', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 text-right">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
        <span className="text-3xl">⚙️</span>
        <div>
          <h2 className="text-2xl font-bold text-[#2C3E7A]">פאנל ניהול מערכת</h2>
          <p className="text-sm text-gray-400 font-medium">אזור מוגן לאדמינים בלבד</p>
        </div>
      </div>

      <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-[20px] p-5 mb-8">
        <h3 className="font-bold text-[#4F46E5] mb-2 text-base">מינוי אדמין חדש</h3>
        <p className="text-xs text-[#2C3E7A] opacity-80 leading-relaxed">
          הזנת כתובת האימייל של הסטודנט תעניק לו הרשאות ניהול מלאות (Custom Claims). 
          המשתמש יוכל למחוק פוסטים ותגובות של משתמשים אחרים ולגשת לפאנל זה.
        </p>
      </div>

      <form onSubmit={handleMakeAdmin} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-[#2C3E7A] mr-1">אימייל</label>
          <input
            type="email"
            placeholder="student@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50/50 text-left focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all text-[#2C3E7A]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-center mt-2"
        >
          {loading ? 'מעדכן הרשאות...' : 'הפוך לאדמין במערכת'}
        </button>
      </form>

      {message.text && (
        <div className={`mt-6 p-4 rounded-xl text-sm font-semibold text-center border ${
          message.isError 
            ? 'bg-red-50 border-red-200 text-red-600' 
            : 'bg-green-50 border-green-200 text-green-600'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
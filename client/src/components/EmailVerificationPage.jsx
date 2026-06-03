import React, { useState } from 'react';
import { sendEmailVerification, updateEmail } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config'; 
import { useAuth } from '../context/AuthContext';

function EmailVerificationPage() {
  // Get data and logout function from your own Context
  const { currentUser, logout } = useAuth();

  // Local states
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Resend verification email
  const handleResendEmail = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setMessage('מייל אימות חדש נשלח לכתובת שלך בהצלחה.');
      }
    } catch (err) {
      console.error(err);
      setError('נכשלה שליחת המייל החוזר. אנא נסה שוב מאוחר יותר.');
    } finally {
      setLoading(false);
    }
  };

  // Update email in Auth and Firestore
  const handleUpdateEmailSubmit = async (e) => {
    e.preventDefault();
    if (!newEmail) return;

    setError('');
    setMessage('');
    setLoading(true);
    try {
      const user = auth.currentUser;
      
      // 1. Update Firebase Auth email
      await updateEmail(user, newEmail);

      // 2. Update Firestore document
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { email: newEmail });

      // 3. Send verification to new email
      await sendEmailVerification(user);

      setMessage('כתובת המייל עודכנה ומייל אימות חדש נשלח אליה!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError('חלה שגיאה בעדכון המייל. יש להתחבר מחדש ולנסות שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-right" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        
        {/* Envelope icon */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-indigo-50 text-indigo-600 mb-6 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0l-7.5-4.615a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-3">רגע לפני שנכנסים לקמפוס...</h2>
        
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          שלחנו קישור אימות לכתובת: <br />
          <span className="font-semibold text-indigo-600 break-all text-base">
            {currentUser?.email || 'דוגמה@email.com'}
          </span> <br />
          יש לבדוק את תיבת הדואר הנכנס או תיבת הספאם כדי לאשר את החשבון.
        </p>

        {/* Status Messages */}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 font-medium">⚠️ {error}</div>}
        {message && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 font-medium">✅ {message}</div>}

        {!isEditing ? (
          <div className="space-y-3">
            {/* FORCE RELOAD: Required to fetch the updated emailVerified status from Firebase token */}
            <button
              onClick={() => window.location.reload()}
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-md shadow-indigo-100"
            >
              {loading ? 'טוען...' : 'אישרתי במייל, תנו לי להיכנס'}
            </button>

            <button
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full bg-slate-100 text-slate-700 font-medium py-2.5 px-4 rounded-xl hover:bg-slate-200 transition text-sm disabled:opacity-50"
            >
              לא קיבלתי, שלח שוב
            </button>

            <div className="flex justify-between items-center pt-5 mt-6 border-t border-slate-100 text-xs font-medium">
              <button
                onClick={() => {
                  setNewEmail(currentUser?.email || '');
                  setIsEditing(true);
                }}
                className="text-indigo-600 hover:underline"
              >
                טעות במייל? עדכון כתובת
              </button>
              
              <button
                onClick={logout}
                className="text-rose-600 hover:underline"
              >
                התנתקות
              </button>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleUpdateEmailSubmit} className="space-y-4 text-right mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 mr-1">
                עדכון כתובת אימייל חדשה:
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="name@student.co.il"
                required
                disabled={loading}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm text-left focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="flex space-x-2 space-x-reverse text-xs font-medium">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'מעדכן...' : 'עדכן ושלח מחדש'}
              </button>
              
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={loading}
                className="bg-slate-200 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-300 transition"
              >
                ביטול
              </button>
            </div>
          </form>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-6 font-medium">הקמפוס - הרשת החברתית של הסטודנטים</p>
    </div>
  );
}

export default EmailVerificationPage;
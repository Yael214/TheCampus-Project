import { useState } from 'react';
import { sendEmailVerification, updateEmail } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

function EmailVerificationPage() {
    const { currentUser, logout } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

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

    const handleUpdateEmailSubmit = async (event) => {
        event.preventDefault();
        if (!newEmail) return;

        setError('');
        setMessage('');
        setLoading(true);

        try {
            const user = auth.currentUser;

            await updateEmail(user, newEmail);

            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { email: newEmail });

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
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 font-sans text-right" dir="rtl">
            <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-xl">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 animate-pulse">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-10 w-10"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0l-7.5-4.615a2.25 2.25 0 0 1-1.07-1.916V6.75"
                        />
                    </svg>
                </div>

                <h2 className="mb-3 text-2xl font-bold text-slate-800">רגע לפני שנכנסים לקמפוס...</h2>

                <p className="mb-6 text-sm leading-relaxed text-slate-600">
                    שלחנו קישור אימות לכתובת: <br />
                    <span className="break-all text-base font-semibold text-indigo-600">
                        {currentUser?.email || 'דוגמה@email.com'}
                    </span>{' '}
                    <br />
                    יש לבדוק את תיבת הדואר הנכנס או תיבת הספאם כדי לאשר את החשבון.
                </p>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700">
                        ⚠️ {error}
                    </div>
                )}
                {message && (
                    <div className="mb-4 rounded-lg border border-green-100 bg-green-50 p-3 text-sm font-medium text-green-700">
                        ✅ {message}
                    </div>
                )}

                {!isEditing ? (
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            disabled={loading}
                            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'טוען...' : 'אישרתי במייל, תנו לי להיכנס'}
                        </button>

                        <button
                            onClick={handleResendEmail}
                            disabled={loading}
                            className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                        >
                            לא קיבלתי, שלח שוב
                        </button>

                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 text-xs font-medium">
                            <button
                                onClick={() => {
                                    setNewEmail(currentUser?.email || '');
                                    setIsEditing(true);
                                }}
                                className="text-indigo-600 hover:underline"
                            >
                                טעות במייל? עדכון כתובת
                            </button>

                            <button onClick={logout} className="text-rose-600 hover:underline">
                                התנתקות
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdateEmailSubmit} className="mt-4 space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-right">
                        <div>
                            <label className="mb-1.5 mr-1 block text-xs font-semibold text-slate-700">
                                עדכון כתובת אימייל חדשה:
                            </label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(event) => setNewEmail(event.target.value)}
                                placeholder="name@student.co.il"
                                required
                                disabled={loading}
                                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-left text-sm transition focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex space-x-2 space-x-reverse text-xs font-medium">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-white transition hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? 'מעדכן...' : 'עדכן ושלח מחדש'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                disabled={loading}
                                className="rounded-lg bg-slate-200 px-4 py-2 text-slate-700 transition hover:bg-slate-300"
                            >
                                ביטול
                            </button>
                        </div>
                    </form>
                )}
            </div>
            <p className="mt-6 text-xs font-medium text-slate-400">הקמפוס - הרשת החברתית של הסטודנטים</p>
        </div>
    );
}

export default EmailVerificationPage;
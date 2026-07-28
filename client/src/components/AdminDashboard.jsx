import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

function AdminDashboard() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ text: '', isError: false });
    const [loading, setLoading] = useState(false);

    const handleMakeAdmin = async (event) => {
        event.preventDefault();
        if (!email) return;

        setLoading(true);
        setMessage({ text: '', isError: false });

        const functions = getFunctions(undefined, 'us-central1');
        const addAdminRole = httpsCallable(functions, 'addAdminRole');

        try {
            const result = await addAdminRole({ email });
            setMessage({ text: result.data.message, isError: false });
            setEmail('');
        } catch (error) {
            console.error('Error setting admin role:', error);
            setMessage({ text: error.message || 'שגיאה במינוי האדמין', isError: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto mt-10 max-w-xl rounded-[24px] border border-gray-100 bg-white p-8 text-right shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                <span className="text-3xl">⚙️</span>
                <div>
                    <h2 className="text-2xl font-bold text-[#2C3E7A]">פאנל ניהול מערכת</h2>
                    <p className="text-sm font-medium text-gray-400">אזור מוגן לאדמינים בלבד</p>
                </div>
            </div>

            <div className="mb-8 rounded-[20px] border border-indigo-100/50 bg-indigo-50/50 p-5">
                <h3 className="mb-2 text-base font-bold text-[#4F46E5]">מינוי אדמין חדש</h3>
                <p className="text-xs leading-relaxed text-[#2C3E7A] opacity-80">
                    הזנת כתובת האימייל של הסטודנט תעניק לו הרשאות ניהול מלאות (Custom Claims).
                    המשתמש יוכל למחוק פוסטים ותגובות של משתמשים אחרים ולגשת לפאנל זה.
                </p>
            </div>

            <form onSubmit={handleMakeAdmin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="mr-1 text-sm font-bold text-[#2C3E7A]">אימייל</label>
                    <input
                        type="email"
                        placeholder="student@gmail.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={loading}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 text-left text-[#2C3E7A] transition-all focus:border-[#4F46E5] focus:bg-white focus:outline-none"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !email}
                    className="mt-2 w-full rounded-xl bg-red-600 px-6 py-3.5 text-center font-bold text-white shadow-sm transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? 'מעדכן הרשאות...' : 'הפוך לאדמין במערכת'}
                </button>
            </form>

            {message.text && (
                <div
                    className={`mt-6 rounded-xl border p-4 text-center text-sm font-semibold ${
                        message.isError
                            ? 'border-red-200 bg-red-50 text-red-600'
                            : 'border-green-200 bg-green-50 text-green-600'
                    }`}
                >
                    {message.text}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
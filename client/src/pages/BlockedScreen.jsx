import { useAuth } from "../context/AuthContext";

/**
 * BlockedScreen Component
 * Displays a suspension notice to users whose accounts have been blocked by an administrator.
 * Provides a logout button to clear the authentication state and return to safety.
 */
const BlockedScreen = () => {
  // Retrieve logout action from authentication context
  const { logout } = useAuth();

  return (
    <div
      className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4"
      dir="rtl"
    >
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
        <div className="text-red-500 text-6xl mb-6">🚫</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">החשבון הושעה</h1>
        <p className="text-gray-600 mb-8 text-lg">
          הגישה שלך למערכת "הקמפוס" הוגבלה זמנית על ידי הנהלת האתר.
          <br />
          <br />
          אם לדעתך מדובר בטעות, ניתן לפנות לצוות התמיכה לבירור.
        </p>
        <button
          onClick={logout}
          className="bg-[#2C3E7A] text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-800 transition-colors w-full"
        >
          התנתקות וחזרה למסך הבית
        </button>
      </div>
    </div>
  );
};

export default BlockedScreen;

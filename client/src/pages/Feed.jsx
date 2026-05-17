function Feed() {
  return (
    <main className="flex-1 p-10 overflow-y-auto" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-black text-[#2C3E7A]">הפיד שלי</h2>
          <button className="bg-[#4F46E5] text-white px-8 py-3.5 rounded-[18px] font-bold hover:shadow-lg hover:shadow-indigo-200 transition-all border-none">
            + פוסט חדש
          </button>
        </div>

        <div className="bg-white p-24 rounded-[32px] text-center shadow-md border border-white/60">
          <div className="text-7xl mb-8">🎓</div>
          <h3 className="text-2xl font-bold text-[#2C3E7A] mb-3">ברוכה הבאה לקמפוס!</h3>
          <p className="text-gray-400 text-lg max-w-sm mx-auto">
            הפיד שלך עדיין ריק. תהיי הראשונה לשתף סיכום שיעור או לשאול שאלה!
          </p>
        </div>
      </div>
    </main>
  );
}

export default Feed;
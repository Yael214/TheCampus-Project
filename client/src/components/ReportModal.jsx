import React, { useState } from 'react';
import ReactDOM from 'react-dom';

function ReportModal({ isOpen, onClose, onSubmit }) {
  const [selectedReason, setSelectedReason] = useState('תוכן פוגעני או בלתי הולם');
  const [customText, setCustomText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle form submission and reset state values upon completion
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (selectedReason === 'אחר' && !customText.trim()) {
      alert('נא לפרט את סיבת הדיווח');
      return;
    }

    setIsSubmitting(true);
    await onSubmit(selectedReason, selectedReason === 'אחר' ? customText : '');
    setIsSubmitting(false);
    
    setCustomText('');
    setSelectedReason('תוכן פוגעני או בלתי הולם');
  };

  
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-lg font-bold text-slate-900 mb-1">דיווח על תוכן</h3>
        <p className="text-xs text-slate-500 mb-4">בחר את סיבת הדיווח כדי שנוכל לבדוק את הנושא:</p>

        <form onSubmit={handleFormSubmit} className="space-y-2.5">
          {/* Render standard report reasons as selectable options */}
          {[
            'תוכן פוגעני או בלתי הולם',
            'תוכן שאינו קשור לקהילה או לאפליקציה',
            'מידע שגוי או מטעה',
            'אחר'
          ].map((reason) => (
            <label 
              key={reason}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                selectedReason === reason 
                  ? 'border-indigo-500 bg-indigo-50/50 text-indigo-950 font-medium' 
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <input 
                type="radio" 
                name="reportReason" 
                value={reason}
                checked={selectedReason === reason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer shrink-0"
              />
              <span className="text-sm select-none">{reason}</span>
            </label>
          ))}

          {selectedReason === 'אחר' && (
            <div className="mt-3">
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="פרט כאן את סיבת הדיווח..."
                className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none transition"
                rows="3"
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              disabled={isSubmitting}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm shadow-indigo-200 cursor-pointer disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'שולח...' : 'שליחת דיווח'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body // Render modal directly into the document body using portal
  );
}

export default ReportModal;
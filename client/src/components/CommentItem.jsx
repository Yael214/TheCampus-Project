import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import ReportModal from './ReportModal';


function CommentItem({ user, comment, allComments, onAddComment, currentUser, depth = 0, isAdmin, onDeleteComment }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const [showMenu, setShowMenu] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // childReplies are the comments that have this comment's ID as their parentId. 
  const childReplies = allComments.filter(c => c.parentId === comment.commentId);

  // Check delete permissions
  const isAuthor = currentUser?.uid === comment.authorId;
  const canDelete = isAuthor || isAdmin;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) 
      return;
    
    await onAddComment(replyText, comment.commentId, user);
    setReplyText('');
    setIsReplying(false);
  };

  // save report
  const handleReportSubmit = async (selectedReason, customReason) => {
    try {
      const reportsRef = collection(db, "users", comment.authorId, "reports");
      
      // בדיקה האם המשתמש כבר דיווח על התגובה הזו בעבר
      const q = query(
        reportsRef, 
        where("targetId", "==", comment.commentId), 
        where("reporterUserId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("כבר דיווחת על תגובה זו בעבר.");
        setIsReportModalOpen(false);
        setShowMenu(false);
        return;
      }

      await addDoc(reportsRef, {
        targetId: comment.commentId,
        postId: comment.postId,
        targetType: "comment",
        reporterUserId: currentUser.uid,
        details: selectedReason === 'אחר' ? customReason : selectedReason,
        status: "pending",
        createdAt: serverTimestamp()
      });

      alert("הדיווח על התגובה נשלח בהצלחה למערכת.");
      setIsReportModalOpen(false);
      setShowMenu(false);
    } catch (error) {
      console.error("Error reporting comment:", error);
      alert("שגיאה בשליחת הדיווח, נסי שוב.");
    }
  };

  return (
    <div 
      className="mt-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm relative"
      style={{ marginRight: depth > 0 ? `${Math.min(depth * 12, 48)}px` : '0px' }}
    >
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="font-semibold text-xs text-slate-900">{comment.authorName}</span>

        {/* 3 Dots Menu */}
        <div className="relative z-10">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            onBlur={() => setTimeout(() => setShowMenu(false), 200)}
            className="text-slate-400 hover:text-slate-600 px-1.5 text-lg leading-none cursor-pointer"
          >
            ⋮
          </button>
          
          {showMenu && (
            <div className="absolute left-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-20">
              {canDelete && (
                <button
                  onClick={() => onDeleteComment(comment.commentId)}
                  className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  מחק תגובה
                </button>
              )}

              {!isAuthor && currentUser ? (
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="w-full text-right px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  דווח על תגובה
                </button>
              ) : !canDelete ? (
                <div className="w-full text-center px-4 py-2 text-sm text-slate-400 cursor-default">
                  אין פעולות
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      
      <p className="text-sm text-slate-600 leading-6">{comment.content}</p>

      {childReplies.length > 0 && (
        <div className="border-r border-slate-200/60 mt-1">
          {childReplies.map(reply => (
            /* recursive call to CommentItem */
            <CommentItem
              key={reply.commentId}
              comment={reply}
              allComments={allComments}
              onAddComment={onAddComment}
              user={user}
              currentUser={currentUser}
              depth={depth + 1}
              isAdmin={isAdmin}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </div>
      )}

      {/* Action buttons wrapper */}
      <div className="flex items-center gap-3 mt-1">
        {currentUser && (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 block transition cursor-pointer"
          >
            {isReplying ? 'ביטול' : 'הגב'}
          </button>
        )}
      </div>
      
      {isReplying && (
        <form onSubmit={handleReplySubmit} className="mt-2 flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`תגובה ל-${comment.authorName}...`}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
          <button type="submit" className="rounded-xl bg-[#4F46E5] px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-600 cursor-pointer">
            שלח
          </button>
        </form>
      )}

      {/* the Modal of the report*/}
      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}

export default CommentItem;
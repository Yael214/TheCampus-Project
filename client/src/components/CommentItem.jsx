import React, { useState } from 'react';

function CommentItem({ user, comment, allComments, onAddComment, currentUser, depth = 0, isAdmin, onDeleteComment }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  // childReplies are the comments that have this comment's ID as their parentId. 
  // This allows us to display replies nested under their parent comment.
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

  return (
    <div 
      className="mt-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm"
      style={{ marginRight: depth > 0 ? `${Math.min(depth * 12, 48)}px` : '0px' }}
    >
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="font-semibold text-xs text-slate-900">{comment.authorName}</span>
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
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 block transition"
          >
            {isReplying ? 'ביטול' : 'הגב'}
          </button>
        )}
        
        {canDelete && (
          <button
            onClick={() => onDeleteComment(comment.commentId)}
            className="text-xs font-semibold text-red-500 hover:text-red-700 block transition"
          >
            מחק
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
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
          <button type="submit" className="rounded-xl bg-[#4F46E5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600">
            שלח
          </button>
        </form>
      )}
    </div>
  );
}

export default CommentItem;
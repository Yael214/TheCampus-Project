import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentItem from './CommentItem';
import { useComments } from '../hooks/useComments';

// Get the post from fid/ forum page
function PostContainer({ post, showForumLink=true}) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // does the post's comment section is open or closed
  const [rootCommentText, setRootCommentText] = useState('');

  const { comments, loading, addComment } = useComments(post.id, isOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addComment(rootCommentText, user);
    setRootCommentText('');
  };

  // logic to separate root comments from replies (for simple nested display)
  const rootComments = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => c.parentId);
  const forumTagClass = 'bg-slate-100 text-slate-800';
  const commentCount = comments.length || post.commentsCount || 0;

  return (
    <div className="bg-white rounded-[14px] border border-slate-200/80 p-4 mb-4 shadow-sm transition hover:shadow-md" dir="rtl">
      {showForumLink && post.forumId && post.forumName && (
        <div className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold mb-3 ${forumTagClass}`}>
            <Link 
                // to={`/forum/${post.forumId}`} 
                to="feed" // temporary link for testing
                className="flex items-center gap-1 text-slate-800 hover:text-slate-900 transition"
            >
                {post.forumName}
            </Link>
        </div>
    )}

      <h2 className="text-base md:text-lg font-semibold text-slate-900 leading-6 mb-3">
        {post.title}
      </h2>

      <p className="text-sm text-slate-500 leading-6 mb-4 max-h-14 overflow-hidden">
        {post.content || ''}
      </p>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-white shrink-0">
          {post.authorName ? post.authorName.slice(0, 2) : 'ק'}
        </div>
        <p className="text-xs text-slate-500 flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
          {post.authorName}{post.createdAt ? ` · ${post.createdAt}` : ''}
        </p>
        <div className="inline-flex items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <span>💬</span>
            <span>{commentCount}</span>
          </span>
          {post.likes != null && (
            <span className="inline-flex items-center gap-1">
              <span>👍🏼</span>
              <span>{post.likes}</span>
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        {isOpen ? 'הסתר תגובות' : `הצג תגובות (${commentCount})`}
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-200/70 bg-slate-50 p-3 rounded-2xl">
          {rootComments.map(comment => (
            <CommentItem 
                key={comment.commentId}
                comment={comment}
                allComments={comments}
                currentUser={user}
                onAddComment={(text, parentId) => addComment(text, user, parentId)}
                depth={0}
              />
          ))}

          {/* form to add a new root comment (not a reply) */}
          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <input
              type="text"
              value={rootCommentText}
              onChange={(e) => setRootCommentText(e.target.value)}
              placeholder="כתוב תגובה פה..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
            <button type="submit" className="rounded-xl bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600">
              שלח
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default PostContainer;
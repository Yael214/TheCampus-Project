import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentItem from './CommentItem';
import { useComments } from '../hooks/useComments';
import { useLikes } from '../hooks/useLikes';

// Get the post from fid/ forum page
function PostContainer({ post, showForumLink=true}) {
  const { currentUser: user } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // does the post's comment section is open or closed
  const [rootCommentText, setRootCommentText] = useState('');

  const isLiked = user && post.likedBy?.includes(user.uid);

  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  useEffect(() => {
    setLiked(isLiked);
    setLikesCount(post.likesCount || 0);
  }, [isLiked, post.likesCount]);

  const { comments, loading, addComment } = useComments(post.id, isOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addComment(rootCommentText, user);
    setRootCommentText('');
  };

  const handleLikeClick = async () => {
    if (!user) {
      alert("היכנס לחשבון כדי לתת לייק");
      return;
    }
    // Optimistic UI updates
    const newLikedStatus = !liked;
    setLiked(newLikedStatus);
    setLikesCount(prev => newLikedStatus ? prev + 1 : prev - 1);

    try {
      await useLikes(post.id, user.uid, newLikedStatus);
      console.log("Database updated successfully");
    } catch (error) {
      // Revert states if database operation fails
      setLiked(!newLikedStatus);
      setLikesCount(prev => !newLikedStatus ? prev + 1 : prev - 1);
      console.error("Failed to update like in database", error);
    }
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
          {post.authorName}
          {post.createdAt ? ` · ${formatTimeAgo(post.createdAt)}` : ''}
        </p>
        <div className="inline-flex items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <span>💬</span>
            <span>{commentCount}</span>
          </span>
          {/* Like button with dynamic styling based on liked status */}
          <button 
            onClick={handleLikeClick}
            className={`inline-flex items-center gap-1 transition-all duration-200 active:scale-110 cursor-pointer ${
              liked 
                ? 'text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full' 
                : 'hover:text-slate-600'
            }`}
          >
            <span>{liked ? '👍' : '👍🏼'}</span>
            <span>{likesCount}</span>
          </button>
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


function formatTimeAgo(dateInput) {
  if (!dateInput) return '';

  let date;

  // check if it's a Firestore Timestamp object
  if (dateInput && typeof dateInput.toDate === 'function') {
    date = dateInput.toDate();
  } else if (dateInput && dateInput.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else {
    // if it's a regular date string or Date object
    date = new Date(dateInput);
  }

  // Invalid Date check
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  // if the date is in the future or in another edge case, we can just say "just now"
  if (diffInSeconds < 0) return 'ממש עכשיו';

  // calculate different time units
  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (diffInSeconds < 60) {
    return 'ממש עכשיו';
  }
  if (minutes < 60) {
    return minutes === 1 ? 'לפני דקה' : minutes === 2 ? 'לפני שתי דקות' : `לפני ${minutes} דקות`;
  }
  if (hours < 24) {
    return hours === 1 ? 'לפני שעה' : hours === 2 ? 'לפני שעתיים' : `לפני ${hours} שעות`;
  }
  if (days < 7) {
    return days === 1 ? 'אתמול' : days === 2 ? 'לפני יומיים' : `לפני ${days} ימים`;
  }
  if (weeks < 4) {
    return weeks === 1 ? 'לפני שבוע' : weeks === 2 ? 'לפני שבועיים' : `לפני ${weeks} שבועות`;
  }
  if (months < 12) {
    return months === 1 ? 'לפני חודש' : months === 2 ? 'לפני חודשיים' : `לפני ${months} חודשים`;
  }
  return years === 1 ? 'לפני שנה' : years === 2 ? 'לפני שנתיים' : `לפני ${years} שנים`;
}
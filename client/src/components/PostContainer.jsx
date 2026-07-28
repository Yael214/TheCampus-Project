import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentItem from './CommentItem';
import { useComments } from '../hooks/useComments';
import { useLikes } from '../hooks/useLikes'; 
import { db } from '../firebase/config';
import { collection, addDoc, doc, deleteDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'; 
import ReportModal from './ReportModal';
import { handleDeletePost } from '../utils/postDeleteUtils'; 

// Get the post from forum page
function PostContainer({ post, showForumLink = true, isAdmin }) {
    const { currentUser: user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [rootCommentText, setRootCommentText] = useState('');

    const isLiked = Boolean(user && post.likedBy?.includes(user.uid));
    const [liked, setLiked] = useState(isLiked);
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    
    // State for the 3 dots menu and report modal
    const [showMenu, setShowMenu] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Check if current user is the author or an admin to allow deletion
    const isAuthor = user?.uid === post.authorId;
    const canDelete = isAuthor || isAdmin;

    useEffect(() => {
        setLiked(isLiked);
        setLikesCount(post.likesCount || 0);
    }, [isLiked, post.likesCount]);

    const { comments, addComment } = useComments(post.postId, isOpen);

    const handleSubmit = async (event) => {
        event.preventDefault();
        await addComment(rootCommentText, user);
        setRootCommentText('');
    };

    const handleLikeClick = async () => {
        if (!user) {
            alert("היכנס לחשבון כדי לתת לייק");
            return;
        }

        const newLikedStatus = !liked;
        setLiked(newLikedStatus);
        setLikesCount((currentCount) => (newLikedStatus ? currentCount + 1 : currentCount - 1));

        try {
            await useLikes(post.postId, user.uid, newLikedStatus);
            console.log("Database updated successfully");
        } catch (error) {
            setLiked(!newLikedStatus);
            setLikesCount((currentCount) => (!newLikedStatus ? currentCount + 1 : currentCount - 1));
            console.error("Failed to update like in database", error);
        }
    };

    // Handle post deletion using centralized utility function
    const handleDelete = async () => {
        const confirmDelete = window.confirm("האם את בטוחה שברצונך למחוק את הפוסט?");
        if (!confirmDelete) return;

        let deleteFilesPermanently = false;
        if (post.attachments && post.attachments.length > 0) {
            deleteFilesPermanently = window.confirm(
                "האם למחוק גם את הקבצים המצורפים לצמיתות (כולל מחומרי הלימוד של הקורס)?"
            );
        }

        try {
            await handleDeletePost(post, deleteFilesPermanently);
            console.log("Post deleted successfully via UI");
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("שגיאה במחיקת הפוסט");
        }
    };

    // Handle reporting a post
    const handleReportSubmit = async (selectedReason, customReason) => {
        try {
            const reportsRef = collection(db, "users", post.authorId, "reports");

            const q = query(
                reportsRef, 
                where("targetId", "==", post.postId), 
                where("reporterUserId", "==", user.uid)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                alert("כבר דיווחת על פוסט זה בעבר. הדיווח שלך נמצא בבדיקה.");
                setIsReportModalOpen(false);
                setShowMenu(false);
                return;
            }

            await addDoc(reportsRef, {
                targetId: post.postId,
                targetType: "post",
                reporterUserId: user.uid,
                details: selectedReason === 'אחר' ? customReason : selectedReason,
                status: "pending",
                createdAt: serverTimestamp()
            });

            alert("הדיווח נשלח בהצלחה למערכת.");
            setIsReportModalOpen(false);
            setShowMenu(false);
        } catch (error) {
            console.error("Error reporting post:", error);
            alert("שגיאה בשליחת הדיווח, נסי שוב.");
        }
    };

    // Handle comment deletion (Passed down to CommentItem)
    const handleDeleteComment = async (commentId) => {
        const confirmDelete = window.confirm("האם את בטוחה שברצונך למחוק את התגובה?");
        if (!confirmDelete) return;

        try {
            const commentRef = doc(db, 'posts', post.postId, 'comments', commentId);
            await deleteDoc(commentRef);
            console.log("Comment deleted successfully");
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const getAttachmentStyle = (type) => {
        const lowerType = type?.toLowerCase() || '';
        if (lowerType.includes('pdf')) {
            return { icon: '📄', bg: 'border-red-100 bg-gray-50 text-red-700 hover:bg-red-100/70' };
        }
        if (lowerType.includes('image') || lowerType.includes('png') || lowerType.includes('jpg') || lowerType.includes('jpeg')) {
            return { icon: '🖼️', bg: 'border-emerald-100 bg-gray-50 text-emerald-700 hover:bg-emerald-100/70' };
        }
        if (lowerType.includes('video') || lowerType.includes('mp4')) {
            return { icon: '🎬', bg: 'border-amber-100 bg-gray-50 text-amber-700 hover:bg-amber-100/70' };
        }
        return { icon: '📎', bg: 'border-slate-100 bg-gray-50 text-slate-700 hover:bg-slate-100' };
    };

    const rootComments = comments.filter((comment) => !comment.parentId);
    const forumTagClass = 'bg-slate-100 text-slate-800';
    const commentCount = comments.length || 0;

    return (
        <div
            className="mb-4 rounded-2xl border border-slate-100/70 border-r-[3px] border-r-indigo-300/70 bg-white p-5 transition-all duration-250 hover:-translate-y-0.75"
            style={{ boxShadow: '0 2px 12px -2px rgba(0,0,0,0.06), 0 4px 16px -4px rgba(79,70,229,0.05)' }}
            onMouseEnter={(event) => {
                event.currentTarget.style.boxShadow = '0 8px 28px -6px rgba(79,70,229,0.14), 0 4px 16px -4px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(event) => {
                event.currentTarget.style.boxShadow = '0 2px 12px -2px rgba(0,0,0,0.06), 0 4px 16px -4px rgba(79,70,229,0.05)';
            }}
            dir="rtl"
        >
            <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                    {showForumLink && post.forumId && post.forumName && (
                        <div className={`mb-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${forumTagClass}`}>
                            <Link to={`/forum/${post.forumId}`} className="flex items-center gap-1 text-slate-800 transition hover:text-slate-900">
                                {post.forumName}
                            </Link>
                        </div>
                    )}
                    <h2 className="text-base font-semibold leading-6 text-slate-900 md:text-lg">{post.title}</h2>
                </div>

                {/* 3 Dots Menu Wrapper */}
                <div className="relative z-10 mr-2">
                    <button
                        onClick={() => setShowMenu((value) => !value)}
                        onBlur={() => setTimeout(() => setShowMenu(false), 200)}
                        className="px-2 text-xl leading-none text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                        ⋮
                    </button>

                    {showMenu && (
                        <div className="absolute left-0 mt-1 w-32 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg z-20">
                            {canDelete && (
                                <button onClick={handleDelete} className="w-full px-4 py-2 text-right text-sm text-red-600 transition hover:bg-red-50 cursor-pointer">
                                    מחק פוסט
                                </button>
                            )}

                            {!isAuthor && user && (
                                <button 
                                    onClick={() => setIsReportModalOpen(true)}
                                    className="w-full px-4 py-2 text-right text-sm text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                                >
                                    דווח על פוסט
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-3 mb-4 max-h-14 overflow-hidden text-sm leading-6 text-slate-500">{post.content || ''}</p>

            <div className="mb-4 flex flex-wrap gap-2">
                {post.attachments?.map((file, index) => {
                    const style = getAttachmentStyle(file.fileType || file.type);
                    return (
                        <a
                            key={`${file.fileUrl || file.url}-${index}`}
                            href={file.fileUrl || file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex max-w-60 items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${style.bg}`}
                            title={file.title || file.fileName || 'קובץ מצורף'}
                        >
                            <span className="shrink-0 text-sm">{style.icon}</span>
                            <span className="flex-1 truncate text-right">{file.title || file.fileName || 'הצג קובץ'}</span>
                        </a>
                    );
                })}
            </div>

            <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', boxShadow: '0 2px 8px rgba(79,70,229,0.35)' }}>
                    {post.authorName ? post.authorName.slice(0, 2) : 'ק'}
                </div>
                <p className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500">
                    {post.authorName}
                    {post.createdAt ? ` · ${formatTimeAgo(post.createdAt)}` : ''}
                </p>
                <div className="inline-flex items-center gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                        <span>💬</span>
                        <span>{commentCount}</span>
                    </span>
                    <button
                        onClick={handleLikeClick}
                        className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 transition-all duration-200 active:scale-110 ${
                            liked ? 'bg-indigo-50 font-bold text-indigo-600' : 'hover:text-slate-600'
                        }`}
                    >
                        <span>{liked ? '👍' : '👍🏼'}</span>
                        <span>{likesCount}</span>
                    </button>
                </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
                <button onClick={() => setIsOpen((value) => !value)} className="text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
                    {isOpen ? 'הסתר תגובות' : `הצג תגובות (${commentCount})`}
                </button>
            </div>

            {isOpen && (
                <div className="mt-4 rounded-2xl border-t border-slate-200/70 bg-slate-50 p-3 pt-4">
                    {rootComments.map((comment) => (
                        <CommentItem
                            key={comment.commentId}
                            user={user}
                            comment={comment}
                            allComments={comments}
                            currentUser={user}
                            onAddComment={(text, parentId) => addComment(text, user, parentId)}
                            depth={0}
                            isAdmin={isAdmin}
                            onDeleteComment={handleDeleteComment}
                        />
                    ))}

                    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
                        <input
                            type="text"
                            value={rootCommentText}
                            onChange={(event) => setRootCommentText(event.target.value)}
                            placeholder="כתוב תגובה פה..."
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                        <button type="submit" className="rounded-xl bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 cursor-pointer">
                            שלח
                        </button>
                    </form>
                </div>
            )}

            <ReportModal 
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={handleReportSubmit}
            />
        </div>
    );
}

export default PostContainer;

function formatTimeAgo(dateInput) {
    if (!dateInput) return '';

    let date;

    if (dateInput && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
    } else if (dateInput?.seconds) {
        date = new Date(dateInput.seconds * 1000);
    } else {
        date = new Date(dateInput);
    }

    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 0) return 'ממש עכשיו';

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
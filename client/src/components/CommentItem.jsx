import { useState } from 'react';

function CommentItem({
    user,
    comment,
    allComments,
    onAddComment,
    currentUser,
    depth = 0,
    isAdmin,
    onDeleteComment,
}) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');

    const childReplies = allComments.filter((item) => item.parentId === comment.commentId);
    const isAuthor = currentUser?.uid === comment.authorId;
    const canDelete = isAuthor || isAdmin;

    const handleReplySubmit = async (event) => {
        event.preventDefault();
        if (!replyText.trim()) return;

        await onAddComment(replyText, comment.commentId, user);
        setReplyText('');
        setIsReplying(false);
    };

    return (
        <div
            className="mt-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm"
            style={{ marginRight: depth > 0 ? `${Math.min(depth * 12, 48)}px` : '0px' }}
        >
            <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-900">{comment.authorName}</span>
            </div>

            <p className="text-sm leading-6 text-slate-600">{comment.content}</p>

            {childReplies.length > 0 && (
                <div className="mt-1 border-r border-slate-200/60">
                    {childReplies.map((reply) => (
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

            <div className="mt-1 flex items-center gap-3">
                {currentUser && (
                    <button
                        onClick={() => setIsReplying((value) => !value)}
                        className="block text-xs font-semibold text-indigo-500 transition hover:text-indigo-700"
                    >
                        {isReplying ? 'ביטול' : 'הגב'}
                    </button>
                )}

                {canDelete && (
                    <button
                        onClick={() => onDeleteComment(comment.commentId)}
                        className="block text-xs font-semibold text-red-500 transition hover:text-red-700"
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
                        onChange={(event) => setReplyText(event.target.value)}
                        placeholder={`תגובה ל-${comment.authorName}...`}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    />
                    <button
                        type="submit"
                        className="rounded-xl bg-[#4F46E5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600"
                    >
                        שלח
                    </button>
                </form>
            )}
        </div>
    );
}

export default CommentItem;
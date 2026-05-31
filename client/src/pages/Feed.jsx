import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserForums } from '../hooks/useUserForums';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
// Importing our shared modal and Shani's post container component
import NewPostModal from '../components/NewPostModal';
import PostContainer from '../components/PostContainer';

function Feed() {
    const { currentUser } = useAuth();
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Seed local context immediately with mock data structures matching Shani's post schema
    const [posts, setPosts] = useState([
        {
            id: 'mock-1',
            title: 'מישהו הבין את שאלה 4 בממן 11? — מרגיש שחסר משהו בנוסחה',
            content: 'הגעתי לתוצאה שונה מהפתרון שפורסם ולא מבין איפה אני טועה. ניסיתי כמה גישות אבל כולן מביאות לאותה תשובה שגויה לכאורה.',
            forumId: 'linear-algebra',
            forumName: 'אלגברה ליניארית',
            authorName: 'רועי לוי',
            likes: 2,
            commentsCount: 3,
            likedBy: []
        },
        {
            id: 'mock-2',
            title: 'מחפשת "חשבון אינפיניטסימלי א" של שטיינברג — מישהו יכול להשאיל?',
            content: 'צריכה את הספר לבחינה בעוד שבועיים. אשמח גם לצילום פרקים 3–5 אם אין אפשרות להשאיל את כל הספר.',
            forumId: 'infinitesimal',
            forumName: 'השאלת ספרים',
            authorName: 'אילנה דרור',
            likes: 0,
            commentsCount: 2,
            likedBy: []
        },
        {
            id: 'mock-3',
            title: 'סיקור המרצה — נושא מבני נתונים, הרצאה 9 (עדכון מלא)',
            content: 'העליתי סיכום של הרצאה 9 כולל כל הדוגמאות מהלוח וההסברים שהוספתי. מומלץ להשוות עם הסיכומים הקודמים.',
            forumId: 'data-structures',
            forumName: 'מבני נתונים',
            authorName: 'אביב בן-דוד',
            likes: 5,
            commentsCount: 0,
            likedBy: []
        }
    ]);

    const { forums: userCourses } = useUserForums();

    useEffect(() => {
        const postsCollectionRef = collection(db, 'posts');
        const q = query(postsCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const activeFeeds = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPosts(activeFeeds);
            }
            setLoading(false);
        }, (err) => {
            console.log("Database permissions block handled. Rendering layout mockup views safely.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <main className="flex-1 p-8 bg-[#F3F5FA] overflow-hidden flex flex-col items-start justify-start text-right h-[calc(100vh-56px)]" dir="rtl">
            <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
                
                {/* Header Area */}
                <header className="flex justify-between items-center mb-8 shrink-0 w-full">
                    <h2 className="text-3xl font-black text-[#2C3E7A] m-0">הפיד שלי</h2>
                    <button 
                        onClick={() => setIsPostModalOpen(true)}
                        className="bg-[#4F46E5] text-white px-6 py-3 rounded-xl font-bold border-none text-sm flex items-center gap-1.5 cursor-pointer hover:bg-indigo-700 transition-colors"
                    >
                        <span>פוסט חדש</span>
                        <span className="text-base font-light">+</span>
                    </button>
                </header>

                {/* Timeline rendering layout viewport */}
                <div className="flex-1 overflow-y-auto space-y-5 pl-2 pb-6 w-full">
                    {posts.map(post => (
                        /* Directly passing down iterated objects onto Shani's container layout element */
                        <PostContainer 
                            key={post.id} 
                            post={post} 
                            showForumLink={true} 
                        />
                    ))}
                </div>
            </div>

            {/* Global Standalone Post Creation Portal Anchor */}
            <NewPostModal 
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                userCourses={userCourses}
            />
        </main>
    );
}

export default Feed;
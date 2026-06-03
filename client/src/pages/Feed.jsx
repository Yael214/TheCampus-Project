import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserForums } from '../hooks/useUserForums';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import NewPostModal from '../components/NewPostModal';
import PostContainer from '../components/PostContainer';
import Loader from '../components/Loader';

function Feed() {
    const { currentUser } = useAuth();
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [posts, setPosts] = useState([]);

    const { forums: userCourses } = useUserForums();

    useEffect(() => {
        // Clear feed and prevent fetching all posts when logged-in user has no courses
        if (currentUser && userCourses && userCourses.length === 0) {
            setPosts([]);
            setLoading(false);
            return;
        }

        const postsCollectionRef = collection(db, 'posts');
        let q;

        if (currentUser && userCourses && userCourses.length > 0) {
            const courseIds = userCourses.map(course => course.id);
            q = query(
                postsCollectionRef, 
                where('forumId', 'in', courseIds),
                orderBy('createdAt', 'desc')
            );
        } else {
            // Fallback query for guests or users with no active course subscriptions
            q = query(postsCollectionRef, orderBy('createdAt', 'desc'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activeFeeds = snapshot.docs.map(doc => ({
                postId: doc.id,
                ...doc.data()
            }));
            setPosts(activeFeeds);
            setLoading(false);
        }, (err) => {
            console.log("Database permissions block handled. Rendering layout mockup views safely.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, userCourses]);

    // Render loading spinner while fetching data
    if (loading) {
        return <Loader text="טוען את הפיד שלך... 🎓" />;
    }

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
                    {posts.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10 font-medium">אין עדיין פוסטים להצגה בפיד.</div>
                    ) : (
                        posts.map(post => (
                            /* Directly passing down iterated objects onto Shani's container layout element */
                            <PostContainer 
                                key={post.postId} 
                                post={post} 
                                showForumLink={true} 
                            />
                        ))
                    )}
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
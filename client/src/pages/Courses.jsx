import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForumPosts } from '../hooks/useForumPosts';
import { useUserForums } from '../hooks/useUserForums';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import NewPostModal from '../components/NewPostModal';
import PostContainer from '../components/PostContainer';
import MaterialsSidebar from '../components/MaterialsSidebar'
     
function Courses() {
    const { currentUser, isAdmin } = useAuth();
    const params = useParams();
    const rawForumId = params.forumId; 

    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [forumDetails, setForumDetails] = useState(null);
    const [posts, setPosts] = useState([]);

    const safeForumId = rawForumId || 'react-programmin';
    const { forums } = useUserForums();
    const currentCourse = forums ? forums.find(f => f.id === safeForumId) : null;
    
    // Fetching live data directly from Shani/Naama's hook
    const { posts: apiPosts, loading: postsLoading, error: postsError } = useForumPosts(safeForumId) || { posts: [], loading: false, error: null };

    // REMOVED MOCK DATA: Now strictly mapping and synchronizing real database values
    useEffect(() => {
        if (!postsLoading && apiPosts) {
            const synchronizedFeeds = apiPosts.map(p => ({
                ...p,
                likes: p.likes ?? p.likesCount ?? 0
            }));
            setPosts(synchronizedFeeds);
        } else if (!postsLoading && !apiPosts) {
            setPosts([]);
        }
    }, [apiPosts, postsLoading]);

    useEffect(() => {
        const fetchForumDetails = async () => {
            if (!safeForumId) return; 
            try {
                const formattedId = safeForumId.charAt(0).toUpperCase() + safeForumId.slice(1);
                let forumDocRef = doc(db, 'forums', formattedId);
                let forumSnap = await getDoc(forumDocRef);
                
                if (!forumSnap.exists()) {
                    forumDocRef = doc(db, 'forums', safeForumId);
                    forumSnap = await getDoc(forumDocRef);
                }

                if (forumSnap.exists()) {
                    setForumDetails(forumSnap.data());
                }
            } catch (err) {
                console.error("Error fetching forum details from database:", err);
            }
        };

        fetchForumDetails();
    }, [safeForumId]);

    if (!safeForumId) {
        return <div className="p-8 text-center text-gray-500">טוען נתוני פורום...</div>;
    }

    return (
        <div className="w-full h-full p-8 flex flex-col items-start justify-start" dir="rtl">
            
            {/* Header Area */}
            <header className="mb-8 w-full block text-right">
                <h1 className="text-3xl font-black text-[#2C3E7A] m-0 p-0 block text-right w-full">
                    {forumDetails?.forumName || currentCourse?.name || "פיתוח אפליקציות ב-React"}
                </h1>
                <div className="text-gray-400 text-sm mt-2 font-medium w-full block text-right">
                    <span className="inline-block" style={{ marginLeft: '2rem' }}>
                        {forumDetails?.description || "מרחב לדיונים ושאלות על ריאקט"}
                    </span>
                    {forumDetails?.category && (
                        <span className="text-gray-400/60 font-normal inline-block">
                            תחום לימודים: <span className="font-semibold text-gray-400">{forumDetails.category}</span>
                        </span>
                    )}
                </div>
            </header>

            {/* Main content grid */}
            <div className="flex-1 flex overflow-hidden gap-8 w-full text-right">
                
                {/* Live Forum Feed */}
                <section className="flex-[2] overflow-y-auto space-y-4 pl-2 text-right">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-[#2C3E7A] flex items-center gap-2 m-0">
                            <span>💬</span> פוסטים ועדכונים בקורס
                        </h2>
                        <button onClick={() => setIsPostModalOpen(true)} className="bg-[#4F46E5] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-indigo-700 transition-colors">
                            <span>פוסט חדש</span>
                            <span className="text-sm font-light">+</span>
                        </button>
                    </div>
                    
                    {postsLoading ? (
                        <div className="text-center py-20 text-gray-400 italic text-sm">טוען הודעות מהפורום...</div>
                    ) : postsError ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-red-500 text-xs p-6 shadow-sm">
                            שגיאה בטעינת הפוסטים: {postsError}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="bg-white p-16 rounded-3xl text-center border border-white shadow-sm flex flex-col items-center justify-center w-full">
                            <span className="text-5xl mb-4">🎓</span>
                            <h3 className="font-bold text-[#2C3E7A] text-lg mb-1">הפורום עדיין ריק</h3>
                            <p className="text-gray-400 text-sm max-w-xs">אין עדיין פוסטים בקורס זה. תהיי הראשונה לפרסם פוסט!</p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <PostContainer 
                                key={post.postId} 
                                post={post} 
                                showForumLink={false}
                                isAdmin={isAdmin} 
                            />
                        ))
                    )}
                </section>

                <MaterialsSidebar forumId={safeForumId} />
            </div>

            <NewPostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                lockedForumId={safeForumId}
            />
        </div>
    );
}

export default Courses;
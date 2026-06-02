import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export function useForumPosts(forumId) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [posts, setPosts] = useState([]);

    // --- 1. קריאת פוסטים ---
    useEffect(() => {
        if (!forumId) {
            setPosts([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        
        // 🚨 שינוי 1: ניתוב לתת-קולקשן הנכון!
        const postsCollectionRef = collection(db, 'forums', forumId, 'posts');
        
        // 🚨 שינוי 2: הסרנו את פקודת ה-where
        const q = query(postsCollectionRef, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                setPosts([]);
                setLoading(false);
                return;
            }
            const fetchedPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(fetchedPosts);
            setError(null);
            setLoading(false);

        }, (err) => {
            console.error(err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [forumId]);

    // החזר רק את קריאת הפוסטים - יצירת פוסט הועברה להוק נפרד
    return { posts, loading, error };
}
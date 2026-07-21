import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export function useForumPosts(forumId) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [posts, setPosts] = useState([]);

    // Fetch posts from the global posts collection, filtered by forumId
    useEffect(() => {
        if (!forumId) {
            setPosts([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        
        // Query the root 'posts' collection and filter by forumId
        const postsCollectionRef = collection(db, 'posts');
        const q = query(postsCollectionRef, where('forumId', '==', forumId), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                setPosts([]);
                setLoading(false);
                return;
            }
            const fetchedPosts = snapshot.docs.map(doc => ({
                postId: doc.id,
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

    // Return read-only posts (post creation is handled by useCreateForumPost)
    return { posts, loading, error };
}
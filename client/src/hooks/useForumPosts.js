import {useEffect, useState} from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext.jsx';

export function useForumPosts(forumId) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [posts, setPosts] = useState([]);
    const {currentUser} = useAuth();

    useEffect(() => {
        if (!forumId) {
            setPosts([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const postsCollectionRef = collection(db, 'posts');
        const q = query(postsCollectionRef, where('forumId', '==', forumId) ,orderBy('createdAt', 'desc'));
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

    return { posts, loading, error };
}
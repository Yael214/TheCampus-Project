import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext.jsx';

export default function useCreateForumPost(forumId) {
    const { currentUser } = useAuth();

    const createPost = async (postData) => {
        if (!forumId) throw new Error('Missing forumId to create post');

        // Write to the global 'posts' collection (not a subcollection)
        const postsCollectionRef = collection(db, 'posts');
        const payload = {
            ...postData,
            forumId: forumId,
            createdAt: serverTimestamp(),
            likesCount: 0,
            likedBy: [],
            commentsCount: 0,
            authorId: postData.authorId || currentUser?.uid || 'anonymous-user',
            authorName: postData.authorName || currentUser?.displayName || 'סטודנט/ית',
        };

        const docRef = await addDoc(postsCollectionRef, payload);
        return { id: docRef.id };
    };

    return { createPost };
}

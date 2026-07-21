import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext.jsx';

export default function useCreateForumPost(forumId) {
    const { currentUser } = useAuth();

    const createPost = async (postData) => {
        if (!forumId) throw new Error('Missing forumId to create post');
        if (!currentUser?.uid) throw new Error('User must be signed in to create a post');

        // Extract raw URLs from attachments array to make querying easy later
        const attachmentUrls = postData.attachments 
            ? postData.attachments.map(att => att.fileUrl) 
            : [];
        
        // Write to the global 'posts' collection (not a subcollection)
        const postsCollectionRef = collection(db, 'posts');
        const payload = {
            ...postData,
            attachmentUrls,
            forumId,
            createdAt: serverTimestamp(),
            likesCount: 0,
            likedBy: [],
            commentsCount: 0,
            authorId: currentUser.uid,
            authorName: postData.authorName || currentUser.fullName || currentUser.displayName || 'סטודנט/ית',
        };

        const docRef = await addDoc(postsCollectionRef, payload);
        return { id: docRef.id };
    };

    return { createPost };
}

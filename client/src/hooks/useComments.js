import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

export const useComments = (postId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // if there's no postId, we can't fetch comments, so we just return early. This also prevents setting up a Firestore listener with an invalid path.
    if (!postId) return;

    setLoading(true);

    // 1. define the reference to the comments sub-collection for the specific post
    const commentsRef = collection(db, 'posts', postId, 'comments');
    
    // 2. create a query to order comments by their creation time (oldest first)
    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    // 3. set up a real-time listener to the comments collection using onSnapshot
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        commentId: doc.id, // include the document ID as commentId for easier reference when adding replies
        ...doc.data()
      }));

      setComments(fetchedComments);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching comments: ", error);
      setLoading(false);
    });

    // 4. cleanup function to unsubscribe from the listener when the component unmounts or when postId changes
    return () => unsubscribe();
  }, [postId]);

  // 5. addComment function to add a new comment to the Firestore collection. It takes the content of the comment, the user object (to get the author's info), and an optional parentId for replies.
  const addComment = async (content, user, parentId = null) => {
    if (!user) {
      alert("You must be logged in to comment.");
      return;
    }
    if (!content.trim()) 
      return;

    try {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      
      const newComment = {
        postId: postId,                     // the ID of the parent post
        authorId: user.uid,                 // user ID of the commenter
        authorName: user.fullName || 'אנונימי/ת', // the name of the commenter
        content: content,                   // the text content of the comment
        createdAt: serverTimestamp(),       // a timestamp of when the comment was created
      };
      
      // parentId is only added to the comment document if it's a reply to another comment. This allows us to later query and display comments in a nested manner if needed.
      if (parentId) {
        newComment.parentId = parentId;
      }

      // add the new comment document to the Firestore collection
      await addDoc(commentsRef, newComment);
    } catch (error) {
      console.error("Error adding comment: ", error);
      throw error;
    }
  };

  return { comments, loading, addComment };
};
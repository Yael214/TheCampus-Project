import { db } from '../firebase/config'; // תוודאי שהנתיב נכון
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';

/* 
* Custom hook to manage likes on posts, providing functions to toggle like status and update Firestore accordingly 
* @param {string} postId - The ID of the post to like/unlike
* @param {string} userId - The ID of the current user performing the like/unlike action
* @param {boolean} isAdding - Whether the action is to add a like (true) or remove a like (false)
* @returns {function} toggleLike - Function to call when the like button is clicked
*/

export const useLikes = async (postId, userId, isAdding) => {
  const postRef = doc(db, 'posts', postId);
    console.log(`Toggling like for post ${postId} by user ${userId}. Adding like: ${isAdding}`); // DEBUG LOG
  try {
    await updateDoc(postRef, {
      likedBy: isAdding ? arrayUnion(userId) : arrayRemove(userId),
      likesCount: increment(isAdding ? 1 : -1)
    });
  } catch (error) {
    console.error("Error updating likes:", error);
    throw error;
  }
};
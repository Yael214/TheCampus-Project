/**
 * Utility function for handling post deletion and its attachments.
 */
import { db, storage } from '../firebase/config';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

/**
 * @param {Object} post - The post object
 * @param {boolean} deleteFilesPermanently - Whether to delete files permanently from course materials
 */
export const handleDeletePost = async (post, deleteFilesPermanently = false) => {
  try {
    if (post.attachments && post.attachments.length > 0) {
      for (const attachment of post.attachments) {
        
        if (deleteFilesPermanently) {
          // Permanently delete file from storage
          if (attachment.storagePath) {
            try {
              await deleteObject(ref(storage, attachment.storagePath));
            } catch (e) { console.log("File already deleted from storage"); }
          } else if (attachment.fileUrl) {
            try {
              await deleteObject(ref(storage, attachment.fileUrl));
            } catch (e) { console.log("File already deleted from storage"); }
          }

          // Remove record from course materials collection
          const materialsQuery = query(
            collection(db, 'materials'), 
            where('fileUrl', '==', attachment.fileUrl)
          );
          const materialsSnapshot = await getDocs(materialsQuery);
          
          for (const materialDoc of materialsSnapshot.docs) {
            await deleteDoc(doc(db, 'materials', materialDoc.id));
          }
          console.log(`File and its material records deleted permanently: ${attachment.fileName || attachment.title}`);

        } else {
          // Smart deletion protecting course materials
          const materialsQuery = query(
            collection(db, 'materials'), 
            where('fileUrl', '==', attachment.fileUrl)
          );
          const materialsSnapshot = await getDocs(materialsQuery);

          if (materialsSnapshot.empty && attachment.storagePath) {
            try {
              await deleteObject(ref(storage, attachment.storagePath));
              console.log(`File deleted from storage: ${attachment.fileName || attachment.title}`);
            } catch (e) { console.log("Storage delete error:", e); }
          } else {
            console.log(`File retained in storage because it belongs to course materials: ${attachment.fileName || attachment.title}`);
          }
        }
      }
    }

    // Delete post document from Firestore
    const postRef = doc(db, 'posts', post.postId);
    await deleteDoc(postRef);
    console.log("Post document deleted successfully");

  } catch (error) {
    console.error("Error in handleDeletePost:", error);
    throw error;
  }
};
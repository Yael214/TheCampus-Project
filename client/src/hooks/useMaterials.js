import { useState, useEffect } from 'react';
import { db, storage } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, deleteDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export function useMaterials(forumId) {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch materials for the given forumId from Firestore
    useEffect(() => {
        if (!forumId) return;

        const materialsRef = collection(db, 'materials');
        const q = query(
            materialsRef,
            where('forumId', '==', forumId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMaterials = snapshot.docs.map(doc => ({
                materialId: doc.id,
                ...doc.data()
            }));
            setMaterials(fetchedMaterials);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching materials:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [forumId]);

    // A function to handle uploading a new material file and saving its metadata to Firestore.
    const uploadMaterial = async (title, file, user, saveToMaterials = false) => {
        if (!file || !user) return;

        try {
            // Save the file to Firebase Storage
            const fileId = `${Date.now()}_${file.name}`;
            const storagePath = `materials/${forumId}/${fileId}`;
            const fileRef = ref(storage, storagePath);
            const uploadResult = await uploadBytes(fileRef, file);
            const fileUrl = await getDownloadURL(uploadResult.ref);

            const fileMetaData = {
                fileName: file.name,
                fileUrl: fileUrl,
                fileType: file.type || 'application/octet-stream',
                storagePath: storagePath
            }
            // Save the material metadata to Firestore
            if (saveToMaterials) {
                await addDoc(collection(db, 'materials'), {
                    forumId: forumId,
                    uploadedBy: user.uid,
                    authorName: user.fullName,
                    title: title,
                    fileUrl: fileUrl,
                    fileType: file.type || 'application/octet-stream',
                    storagePath: storagePath,
                    isApproved: true, // default to true for now
                    createdAt: serverTimestamp()
                });
            };
            return fileMetaData;
        } catch (err) {
            console.error("Error uploading material:", err);
            throw err;
        }
    };
    const deleteMaterial = async (materialId, fileUrl, storagePath) => {
        try {
            // Delete from jeneral
            await deleteDoc(doc(db, 'materials', materialId));
            console.log("Material metadata deleted from Firestore");

            // Check if any post is using this file using array-contains query
            const postsQuery = query(
                collection(db, 'posts'), 
                where('attachmentUrls', 'array-contains', fileUrl)
            );
            const postsSnapshot = await getDocs(postsQuery);

            // Delete from Storage only if no post contains this file url
            if (postsSnapshot.empty && storagePath) {
                const fileStorageRef = ref(storage, storagePath);
                await deleteObject(fileStorageRef);
                console.log("File deleted from Storage permanently");
            } else {
                console.log("File kept in Storage because a post is referencing it");
            }
        } catch (err) {
            console.error("Error deleting material:", err);
            throw err;
        }
    };

    return { materials, loading, error, uploadMaterial, deleteMaterial };
}

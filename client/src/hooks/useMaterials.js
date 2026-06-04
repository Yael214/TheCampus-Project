import { useState, useEffect } from 'react';
import { db, storage } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
    const uploadMaterial = async (title, file, user) => {
        if (!file || !user) return;

        try {
            // Save the file to Firebase Storage
            const fileRef = ref(storage, `materials/${forumId}/${Date.now()}_${file.name}`);
            const uploadResult = await uploadBytes(fileRef, file);
            const fileUrl = await getDownloadURL(uploadResult.ref);

            // Save the material metadata to Firestore
            await addDoc(collection(db, 'materials'), {
                forumId: forumId,
                uploadedBy: user.uid,
                authorName: user.fullName,
                title: title,
                fileUrl: fileUrl,
                fileType: file.type || 'application/octet-stream',
                isApproved: true, // default to true for now
                createdAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Error uploading material:", err);
            throw err;
        }
    };

    return { materials, loading, error, uploadMaterial };
}

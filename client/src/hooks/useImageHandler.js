import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

export function useImageHandler() {
    const [loading, setLoading] = useState(false);

    // Check if the file is an image and has a valid extension
    const validateImage = (file) => {
        if (!file) return false;
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const isValidType = file.type.startsWith('image/');
        return isValidType && ['jpg', 'jpeg', 'png', 'webp'].includes(fileExtension);
    };

    // Extract the extension from the file name
    const getFileExtension = (file) => {
        if (!file || !file.name) return '';
        return file.name.split('.').pop().toLowerCase();
    };

    // Compress the image file before uploading
    const compressImageFile = async (file) => {
        if (!file || !file.type.startsWith('image/')) return file;
        const options = {
            maxSizeMB: 0.3,
            maxWidthOrHeight: 1200,
            useWebWorker: true
        };
        try {
            return await imageCompression(file, options);
        } catch (error) {
            console.error("Error compressing image:", error);
            return file;
        }
    };
    // Generate a unique storage path for the file to prevent overwriting
    const generateUniquePath = (originalPath, file) => {
        if (originalPath.includes("profile")) {
            const ext = getFileExtension(file);
            const folder = originalPath.substring(0, originalPath.lastIndexOf('/'));
            return `${folder}/profile_${Date.now()}.${ext}`;
        } else if (originalPath.includes("studyApproval")) {
            const ext = getFileExtension(file);
            const folder = originalPath.substring(0, originalPath.lastIndexOf('/'));
            return `${folder}/studyApproval_${Date.now()}.${ext}`;
        }
        return originalPath;
    };
    // Upload file to storage with server-side caching metadata
    const uploadFileToStorage = async (file, path) => {
        if (!file || !path) return null;

        try {
            setLoading(true);

            //Automatically compress the file if it is an image
            let fileToUpload = file;
            if (file.type && file.type.startsWith('image/')) {
                fileToUpload = await compressImageFile(file);
            }

            //Generate a unique file path with a timestamp to prevent browser caching issues (Cache Busting)
            const finalPath = generateUniquePath(path, fileToUpload);

            //Upload the processed file and its metadata to Firebase Storage
            const storageRef = ref(storage, finalPath);

            const metadata = {
                contentType: fileToUpload.type,
            };

            //Set server-side Cache-Control headers based on the final file destination
            if (finalPath.includes("profile")) {
                metadata.cacheControl = 'public, max-age=31536000'; // Cache for 1 year
            } else if (finalPath.includes("studyApproval")) {
                metadata.cacheControl = 'public, max-age=86400'; // Cache for 1 day
            }
            
            await uploadBytes(storageRef, fileToUpload, metadata);
            const downloadURL = await getDownloadURL(storageRef);
            
            
            return downloadURL;
        } catch (error) {
            console.error("Error uploading file to storage:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        validateImage,
        getFileExtension,
        uploadFileToStorage,
        loading
    };
}
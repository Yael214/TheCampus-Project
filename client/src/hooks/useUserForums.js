import {useAuth} from "../context/AuthContext.jsx";
import {useEffect, useState} from "react";
import {doc, onSnapshot} from "firebase/firestore";
import {db} from "../firebase/config";

export function useUserForums() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [forums, setForums] = useState([]);
    const {currentUser} = useAuth();

    useEffect(() => {
        if (!currentUser) {
            setForums([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
            if (!snapshot.exists()) {
                setForums([]);
                setLoading(false);
                return;
            }
            const userData = snapshot.data();
            const rawForumsMap = userData.followedForums || {};
            const processedForums = Object.values(rawForumsMap).map((forum) => ({
            id: forum.forumId,
            name: forum.forumName,
            //linkTo: `/forum/${forum.forumId}` // הוספת הכתובת לנתב כבר כאן
            }));
            setForums(processedForums);
            setError(null);
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
        
    },[currentUser]);


    return { forums, loading, error };
}

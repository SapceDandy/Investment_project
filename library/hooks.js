import { auth, firestore } from "../library/firebase";
import { useEffect, useState } from "react";
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';
import { useAuthState } from "react-firebase-hooks/auth";

export function useUserData() {
    const [user] = useAuthState(auth);
    const [username, setUsername] = useState(null);

    useEffect(() => {
        let unsubscribe;
        if (user) {
        const ref = doc(getFirestore(), 'users', user.uid);
        unsubscribe = onSnapshot(ref, (doc) => {
            setUsername(doc.data()?.username);
        });
        } else {
        setUsername(null);
        }

        return unsubscribe;
    }, [user])

    return { user, username }
}
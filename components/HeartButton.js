import { firestore, auth, increment } from "../library/firebase";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';

export default function Heart({ postRef }) {
    const heartRef = doc(postRef, "hearts", auth.currentUser.uid);
    const [heartDoc] = useDocument(heartRef);
    //console.log(heartDoc.exists())

    const addHeart = async () => {
        const uid = auth.currentUser.uid;
        const batch = firestore.batch();

        batch.update(postRef, { heartCount: increment(1)});
        batch.set(heartRef, { uid});
    };

    const removeHeart = async () => {
        const batch = firestore.batch();

        batch.update(postRef, { heartCount: increment(-1)});
        batch.set(heartRef)

        await batch.commit();
    };

    return (!heartDoc?.exists) ? (
        <button onClick = {removeHeart}>💔 Unheart</button>
    ) : (
        <button onClick = {addHeart}>💓 Heart</button>
    );
}
import { firestore, auth } from "../library/firebase";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc, increment, writeBatch } from 'firebase/firestore';
export default function Heart({ postRef }) {
    const heartRef = doc(postRef, "hearts", auth.currentUser.uid);
    const [heartDoc] = useDocument(heartRef);
    //console.log(heartDoc.exists())

    const addHeart = async () => {
        const uid = auth.currentUser.uid;
        const batch = writeBatch(firestore);

        batch.update(postRef, { heartCount: increment(1)});
        batch.set(heartRef, { uid});
    };

    const removeHeart = async () => {
        const batch = writeBatch(firestore);

        batch.update(postRef, { heartCount: increment(-1)});
        batch.set(heartRef)

        await batch.commit();
    };

    return !heartDoc?.exists ? (
        <button onClick = {removeHeart}>💔 Unheart</button>
    ) : (
        <button onClick = {addHeart}>💓 Heart</button>
    );
}
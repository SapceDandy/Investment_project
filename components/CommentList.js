import CommentsFeed from "../components/CommentsFeed";
import { firestore } from "../library/firebase";
import { doc, getDocs, getDoc, collection, query, limit, getFirestore, collectionGroup, setDoc, orderBy, where } from 'firebase/firestore';
import { useDocumentData, useCollection } from 'react-firebase-hooks/firestore';

export default function CommentList({post}) {
    const ref = collection(firestore, 'users', post.uid, 'posts', post.slug, "comments")
    const commentsQuery = query(ref, orderBy("createdAt", "desc"))
    
    const [querySnapshot] = useCollection(commentsQuery);
    
    const comments = querySnapshot?.docs.map((doc) => doc.data());
    
    return (
        <>
            <div className = "wrapper">
                <h1>Comment Section</h1>
                <div style = {{marginTop: "5rem"}}>
                    <CommentsFeed comments = {comments} admin/>
                </div>
            </div>
        </>
    );
}
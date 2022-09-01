import { firestore, getUser, postToJSON, auth } from '../../library/firebase';
//import AuthCheck from "../../components/AuthCheck";
import HeartButton from "../../components/HeartButton";
import { serverTimestamp, docs, doc, getDocs, getDoc, collection, query, limit, getFirestore, collectionGroup, setDoc, orderBy, where, addDoc } from 'firebase/firestore';
import PostContent from "../../components/PostContent";
import CommentList from "../../components/CommentList";
import { UserContext } from "../../library/context";
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import uniqid from 'uniqid';
import Link from 'next/link';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useContext, useState } from 'react';

export async function getStaticProps({ params }) {
    const { username, slug } = params;
    const userDoc = await getUser(username);

    let post;
    let path;

    if (userDoc) {
        const getPosts = doc(userDoc.ref, "posts", slug);
        post = postToJSON(await getDoc(getPosts));

        path = getPosts.path;
    }

    return {
        props: { post, path },
        revalidate: 100,
    }
}

export async function getStaticPaths() {
    const q = query(collectionGroup(firestore, 'posts'), limit(5));
    const snapshot = getDocs(q)
    const paths = (await snapshot).docs.map((doc) => {
        let { username, slug } = doc.data();
        username = `${username}`;
        slug = `${slug}`;
        return {
            params: { username, slug },
        };
    });

    return {
    paths,
    fallback: 'blocking',
    };
}

export default function Post(props) {
    const { user } = useContext(UserContext);
    const getPosts = doc(firestore, props?.path);
    const [realtimePost] = useDocumentData(getPosts);

    const post = realtimePost || props.post;

    return (
        /*<AuthCheck
            fallback = {
                <Link href="/enter">
                    You must sign-in to access this page
                </Link>
            }
        >*/ 
        <>
            <div className = "wrapper">
                <main className = "singlePost">
                    <section>
                        <PostContent post = {post} />
                    </section>
                    {/*<aside>
                        {currentUser?.uid === post?.uid && (
                        <Link href={`/admin/${post?.slug}`}>
                            <button className = "generalButton">Edit</button>
                        </Link>)}
                        {(currentUser?.uid !== post?.uid) && (
                            <button className = "generalButton" onClick = {() => trackPost()}>Track Post</button>
                        )}

                        {(currentUser?.uid !== post?.uid) && (
                            <button className = "generalButton" onClick = {() => trackPost()}>Stop Tracking</button>
                        )}
                    </aside> */}
                </main>
            </div>

            <div className = "commentSectionWrapper">
                <div className = "commentSectionTop">
                    <h1>Comment Section</h1>
                    {(!(!(user))) && <MakeComment post = {post} />}
                </div>
                <CommentList post = {post} />
            </div>
        </>
        /*</AuthCheck>*/
    )
}

function MakeComment({post}) {
    const { username } = useContext(UserContext);
    
    const [comment, setComment] = useState('');
    const commentId = uniqid();

    const isValid = comment.length !== 0;

    const createComment = async (e) => {
        e.preventDefault();
        const currentUserId = auth.currentUser.uid;
        const slug = post.slug;
        const uid = post.uid;
        const ref = doc(firestore, "users", post.uid, "posts", post.slug, "comments", `${commentId}`);
        
        const today = new Date();
        const currentDate = `${today.getFullYear()}-${today.getDate()}-${(today.getMonth()+1)}`;
        const monthsDict = {"1": "January", "2": "February", "3": "March", "4": "April", "5": "May", "6": "June", "7": "July", "8": "August", "9": "September", "10": "October", "11": "November", "12": "December"};
        const dayValue = currentDate.substring(5, 7);
        const monthNumber = (currentDate.length != 9) ? currentDate.substring(8, 10) : currentDate.substring(8, 9);
        const monthString = monthsDict[monthNumber];
        const yearValue = currentDate.substring(0, 4);

        const data = {
            comment,
            commentId,
            currentUserId,
            slug,
            uid,
            username,
            year: parseInt(yearValue),
            day: parseInt(dayValue),
            month: `${monthString}`,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            heartCount: 0,
        };

        await setDoc(ref, data);

        toast.success('Comment created!');

        setComment('');
    };

    return (
        <>
            <form className = "createNewCommentWrapper" onSubmit={createComment}>
                <input
                    value = {comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Type comment here..."
                />

                <button type="submit" disabled={!isValid}>
                    Create
                </button>
            </form>
        </>
    )
}
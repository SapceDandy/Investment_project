import { firestore, getUser, postToJSON } from '../../library/firebase';
import AuthCheck from "../../components/AuthCheck";
import HeartButton from "../../components/HeartButton";
import { doc, getDocs, getDoc, collection, query, limit, getFirestore, collectionGroup } from 'firebase/firestore';
import PostContent from "../../components/PostContent";
import { UserContext } from "../../library/context"

import Link from 'next/link';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useContext } from 'react';

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
    
    const q = query(collectionGroup(firestore, 'posts'), limit(10));
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
    const getPosts = doc(firestore, props.path);
    const [realtimePost] = useDocumentData(getPosts);

    const post = realtimePost || props.post;

    const { user: currentUser } = useContext(UserContext);

    return (
        <AuthCheck
            fallback = {
                <Link href="/enter">
                    You must sign-in to access this page
                </Link>
            }
        >
            <div className = "wrapper">
                <main className = "singlePost">
                    <section>
                        <PostContent post = {post} />
                    </section>

                    <aside>
                        {/*<p>
                        <strong>{post.heartCount || 0} 🤍</strong>
                        </p>   
                        <HeartButton postRef = {getPosts} />*/}
                        {currentUser?.uid === post.uid && (
                        <Link href={`/admin/${post.slug}`}>
                            <button className = "generalButton">Edit Post</button>
                        </Link>
                        )}
                    </aside> 
                </main>
            </div>
        </AuthCheck>
    )
}
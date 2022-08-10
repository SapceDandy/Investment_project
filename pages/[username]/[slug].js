import { firestore, getUser, postToJSON } from '../../components/firebase';
import { doc, getDocs, getDoc, collectionGroup, query, limit, getFirestore } from 'firebase/firestore';
import Post from "../../components/Post";

import Link from 'next/link';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useContext } from 'react';

export async function getStaticProps({ params }) {
    const { username, slug } = params;
    const userDoc = await getUser(username);

    let post;
    let path; 

    if (userDoc) {
        const getPosts = doc(getFirestore(), userDoc.ref.path, 'posts', slug);
        post = postToJSON(await getDoc(getPosts));

        path = getPosts.path;
    }

    return {
        props: { post, path },
        revalidate: 5000,
    }
}

export async function getStaticPaths() {
    
    const q = query(
    collectionGroup(getFirestore(), 'posts'),
    limit(20)
    )

    const snapshot = await getDocs(q);

    const paths = snapshot.docs.map((doc) => {
        const { slug, username } = doc.data();
        
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
    const getPosts = doc(getFirestore(), props.path);
    const [realtimePost] = useDocumentData(getPosts);

    const post = realtimePost || props.post;

    {/* const { user: currentUser } = useContext(UserContext);*/}

    return (
        <main>
            <section>
                <Post post = {post} />
            </section>

            {/*Need an Auth check*/}

        <aside>
            <strong>{post.heartCount || 0} 💔</strong>
        </aside>    

        </main>
    )
}
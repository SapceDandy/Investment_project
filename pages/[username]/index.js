import Profile from "../../components/Profile"
import Feed from "../../components/Feed";
import AuthCheck from "../../components/AuthCheck";
import { useRouter } from 'next/router';
import { getUser, postToJSON, firestore } from "../../library/firebase";
import { query, collection, where, getDocs, limit, orderBy, getFirestore} from "firebase/firestore";

import { useEffect } from "react";

export async function getServerSideProps({ query: urlQuery }) {
    const { username } = urlQuery;

    const userDoc = await getUser(username); 

    if (!userDoc) {
        return {
            notFound: true,
        };
    }

    let user = null;
    let posts = null;

    if (userDoc) {
        user = userDoc.data();

        const postsQuery = query(
            collection(firestore, userDoc.ref.path, 'posts'),
            where('published', '==', true),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
        posts = (await getDocs(postsQuery)).docs.map(postToJSON);
    }

    return {
        props: { user, posts },
    };
}

export default function UserPage({user, posts}) {

    return (
        <main>
            <AuthCheck fallback = {<Redirect to = "/enter" />} >
                <Profile user = {user}/>
                <Feed posts = {posts}/>
            </AuthCheck>
        </main>
    )
}

function Redirect({ to }) {
    const router = useRouter();
  
    useEffect(() => {
        router.push(to);
    }, [to])
}
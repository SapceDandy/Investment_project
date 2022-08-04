import Profile from "../../components/Profile"
import Feed from "../../components/Feed";
import { getUser, postToJSON, firestore } from "../../library/firebase";
import { query, collection, where, getDocs, limit, orderBy, getFirestore} from "firebase/firestore";

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
            collection(getFirestore(), userDoc.ref.path, 'posts'),
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
            <Profile user = {user}/>
            <Feed posts = {posts}/>
        </main>
    )
}
import Feed from "../components/Feed";
import Loader from "../components/Loader"
import { firestore, postToJSON } from '../library/firebase';
import { UserContext } from "../library/context";
import { Timestamp, query, where, orderBy, limit, collectionGroup, collection, getDocs, startAfter, getFirestore, doc } from 'firebase/firestore';
import { useState, useContext } from "react";

const numOfPosts = 5;

export async function getServerSideProps(context) {
  const ref = collectionGroup(firestore, "posts");

  const postsQuery = query(ref, where("published", "==", true), orderBy("createdAt", "desc"), limit(numOfPosts))

  const uploadPosts = (await getDocs(postsQuery)).docs.map(postToJSON);
  /*const q = query(collection(firestore, "users"));
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map((doc) => ({
    ...doc.data(), id: doc.id
  }));
  data.map((elem, index) => {
    data[index] = query(collection(firestore, "users", elem.id, "posts"));
  }).map( async (elem, index) => {
    data[index] = await getDocs(elem);
   
  }).map((elem, index) => {
    data[index] = elem.docs?.map((doc) => ({
      ...doc.data(),
    }));
  })

  const tes = snapshot.docs.map((doc) => ({
    ...doc.data(), id: doc.id
  }));

  const uploadPosts = JSON.stringify(data)*/

  return {
    props: { uploadPosts },
  }
}

export default function Home({uploadPosts}) {
  const { user, username } = useContext(UserContext);
  const [posts, setPosts] = useState(uploadPosts);
  const [loading, setLoading] = useState(false);

  const [feedBottom, setFeedBottom] = useState(false);

  const getPosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const lastInCurrentList = typeof last.createdAt === "number" ? Timestamp.fromMillis(last.createdAt) : last.createdArt;

    const ref = collectionGroup(firestore, "posts");

    const posts = query(ref, where("published", "==", true), orderBy("createdAt", "desc"), startAfter(lastInCurrentList), limit(numOfPosts));

    const loadedPosts = (await getDocs(posts)).docs.map((doc) => doc.data());

    setPosts(posts.concat(loadedPosts))
    setLoading(false);

    if (loadedPosts.length < numOfPosts) {
      setFeedBottom(true)
    }
  }

  return (
    <>
    {username &&
     (
      <>
        <div className = "mainLinks">
                <button>
                  ALL
                </button>
                <button>
                  Investors
                </button>
                <button>
                  Seeking Investment
                </button>
                <button>
                  Mentors
                </button>
              </div>

          <main>
            <Feed posts = {posts} />

            {!loading && !feedBottom && <button onClick = {getPosts}>Next</button>}

            <Loader show = {loading} />

            {feedBottom && "You have reached the end!"}

          </main>
      </>)
    }
    </>
  )
}

import Feed from "../components/Feed";
import Loader from "../components/Loader"
import { firestore, postToJSON } from '../library/firebase';
import { UserContext } from "../library/context";
import { Timestamp, query, where, orderBy, limit, collectionGroup, getDocs, startAfter, getFirestore } from 'firebase/firestore';
import Link from "next/link";
import { useState, useContext } from "react";

const numOfPosts = 5;

export async function getServerSideProp(context) {
  const ref = collectionGroup(getFirestore(), "posts");

  const posts = query(
    ref,
    where("published", "==", true),
    orderBy("createdAt", "desc"),
    limit(numOfPosts)
  )

  const uploadPosts = (await getDocs(posts)).docs.map(postToJSON);
  
  return {
    props: { uploadPosts },
  }
}

export default function Home(props) {
  const [posts, setPosts] = useState(props.uploadPosts);
  const [loading, setLoading] = useState(false);
  const { user, username } = useContext(UserContext);


  const [feedBottom, setFeedBottom] = useState(false);

  const getPosts = async () => {
    setLoading(true);
    const last = posts[postToJSON.length - 1];

    const lastInCurrentList = typeof last.createdAt === "number" ? Timestamp.fromMillis(last.createdAt) : last.createdArt;

    const ref = collectionGroup(getFirestore(), "posts");

    const posts = query(
      ref,
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      startAfter(lastInCurrentList),
      limit(numOfPosts)
    )

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

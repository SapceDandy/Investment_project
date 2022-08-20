import Feed from "../components/Feed";
import Loader from "../components/Loader"
import { firestore, postToJSON } from '../library/firebase';
import { UserContext } from "../library/context";
import { Timestamp, query, where, orderBy, limit, collectionGroup, getDocs, startAfter} from 'firebase/firestore';
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
  let [currentBtn, setCurrentBtn] = useState("all");

  //console.log(posts[posts.length - 1])

  async function investor() {
    const ref = collectionGroup(firestore, "posts");
  
    const postsQuery = query(ref, where("published", "==", true), where("status", "==", "investor"), orderBy("createdAt", "desc"), limit(numOfPosts))
  
    const invest = (await getDocs(postsQuery)).docs.map(postToJSON);

    setFeedBottom(false)
    setPosts(invest);
  }

  async function investment() {
    const ref = collectionGroup(firestore, "posts");
  
    const postsQuery = query(ref, where("published", "==", true), where("status", "==", "investment"), orderBy("createdAt", "desc"), limit(numOfPosts))
  
    const seek = (await getDocs(postsQuery)).docs.map(postToJSON);

    setFeedBottom(false)
    setPosts(seek);
  }

  async function mentor() {
    const ref = collectionGroup(firestore, "posts");
  
    const postsQuery = query(ref, where("published", "==", true), where("status", "==", "mentor"), orderBy("createdAt", "desc"), limit(numOfPosts))
  
    const ment = (await getDocs(postsQuery)).docs.map(postToJSON);

    setFeedBottom(false)
    setPosts(ment);
  }

  async function all() {
    const ref = collectionGroup(firestore, "posts");
  
    const postsQuery = query(ref, where("published", "==", true), orderBy("createdAt", "desc"), limit(numOfPosts))
  
    const invest = (await getDocs(postsQuery)).docs.map(postToJSON);

    setFeedBottom(false)
    setPosts(invest);
  }

  const getPosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const lastInCurrentList = typeof last.createdAt === "number" ? Timestamp.fromMillis(last.createdAt) : last.createdAt;

    const ref = collectionGroup(firestore, "posts");

    const postsQuery = query(ref, where("published", "==", true), orderBy("createdAt", "desc"), startAfter(lastInCurrentList), limit(numOfPosts));

    const loadedPosts = (await getDocs(postsQuery)).docs.map((doc) => doc.data());

    setPosts(posts.concat(loadedPosts))
    setLoading(false);

    if (loadedPosts.length < numOfPosts) {
      setFeedBottom(true)
    }
  }

  const getOtherTypes = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const lastInCurrentList = (typeof last.createdAt === "number") ? Timestamp.fromMillis(last.createdAt) : last.createdAt;

    const ref = collectionGroup(firestore, "posts");

    const postsQuery = query(ref, where("published", "==", true), where("status", "==", currentBtn), orderBy("createdAt", "desc"), startAfter(lastInCurrentList), limit(numOfPosts));

    const loadedPosts = (await getDocs(postsQuery)).docs.map((doc) => doc.data());

    setPosts(posts.concat(loadedPosts))
    setLoading(false);

    if (loadedPosts.length < numOfPosts) {
      setFeedBottom(true)
    }
  }

  /*const getInvestors = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const lastInCurrentList = typeof last.createdAt === "number" ? Timestamp.fromMillis(last.createdAt) : last.createdArt;

    const ref = collectionGroup(firestore, "posts");

    const posts = query(ref, where("published", "==", true), where("status", "==", "investor"), orderBy("createdAt", "desc"), startAfter(lastInCurrentList), limit(numOfPosts));

    const loadedPosts = (await getDocs(posts)).docs.map((doc) => doc.data());

    setPosts(posts.concat(loadedPosts))
    setLoading(false);

    if (loadedPosts.length < numOfPosts) {
      setFeedBottom(true)
    }
  }

  const getSeeking = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const lastInCurrentList = typeof last.createdAt === "number" ? Timestamp.fromMillis(last.createdAt) : last.createdArt;

    const ref = collectionGroup(firestore, "posts");

    const posts = query(ref, where("published", "==", true), where("status", "==", "seeking"), orderBy("createdAt", "desc"), startAfter(lastInCurrentList), limit(numOfPosts));

    const loadedPosts = (await getDocs(posts)).docs.map((doc) => doc.data());

    setPosts(posts.concat(loadedPosts))
    setLoading(false);

    if (loadedPosts.length < numOfPosts) {
      setFeedBottom(true)
    }
  }

  const getMentors = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const lastInCurrentList = typeof last.createdAt === "number" ? Timestamp.fromMillis(last.createdAt) : last.createdArt;

    const ref = collectionGroup(firestore, "posts");

    const posts = query(ref, where("published", "==", true), where("status", "==", "mentor"), orderBy("createdAt", "desc"), startAfter(lastInCurrentList), limit(numOfPosts));

    const loadedPosts = (await getDocs(posts)).docs.map((doc) => doc.data());

    setPosts(posts.concat(loadedPosts))
    setLoading(false);

    if (loadedPosts.length < numOfPosts) {
      setFeedBottom(true)
    }
  }*/

  return (
    <>
    {username &&
     (
      <>
        <div className = "mainLinkWrapper">
          <div className = "mainLinks">
                  <button style={{background: (currentBtn === "all") ? "gray" : null}} onClick = {() => all() && setCurrentBtn("all")}>
                    All
                  </button>
                  <button style={{background: (currentBtn === "investor") ? "red" : null}} onClick = {() => investor() && setCurrentBtn("investor")}>
                    Investors
                  </button>
                  <button style={{background: (currentBtn === "investment") ? "blue" : null}} onClick = {() => investment() && setCurrentBtn("investment")}>
                    Investment
                  </button>
                  <button style={{background: (currentBtn === "mentor") ? "orange" : null}} onClick = {() => mentor() && setCurrentBtn("mentor")}>
                    Mentors
                  </button>
          </div>
          </div>

          <main className = "pageIndexAlign">
            <Feed posts = {posts} />

            <div>
              {!loading && !feedBottom && (posts.length === numOfPosts) && <button className = "generalButton" onClick = {(currentBtn === "all") ? getPosts : getOtherTypes}>Next</button>}
            </div>

            <Loader show = {loading} />
            
            {feedBottom && <span>You have reached the end!</span>}

          </main>
      </>)
    }

    {!user && (
      <>
        Hello
      </>
    )}
    </>
  )
}

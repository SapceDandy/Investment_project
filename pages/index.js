import Feed from "../components/Feed";
import ReactPlayer from "react-player";
import Loader from "../components/Loader";
import algoliasearch from 'algoliasearch/lite';
import { Hit } from "../components/HitFeed"
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-hooks-web';
import { firestore, postToJSON } from '../library/firebase';
import { UserContext } from "../library/context";
import { Timestamp, query, where, orderBy, limit, collectionGroup, collection, getDocs, startAfter} from 'firebase/firestore';
import { useState, useContext } from "react";

const numOfPosts = 5;
const searchClient = algoliasearch('R4M0BO8C58', 'd998a625ec15d24aedf09a67607c1281');


export async function getServerSideProps(context) {
  const ref = collectionGroup(firestore, "posts");

  const postsQuery = query(ref, where("published", "==", true), orderBy("createdAt", "desc"), limit(numOfPosts))

  const uploadPosts = (await getDocs(postsQuery)).docs.map(postToJSON);

  return {
    props: { uploadPosts },
  }
}

export default function Home({uploadPosts}) {
  const { user, username } = useContext(UserContext);
  const [posts, setPosts] = useState(uploadPosts);
  const [loading, setLoading] = useState(false);
  const [feedBottom, setFeedBottom] = useState(false);
  const [currentBtn, setCurrentBtn] = useState("all");
  const [searching, setSearching] = useState(false)

  async function investor() {
    const ref = collectionGroup(firestore, "posts");
  
    const postsQuery = query(ref, where("published", "==", true), where("status", "==", "investor"), orderBy("createdAt", "desc"), limit(numOfPosts));
  
    const invest = (await getDocs(postsQuery)).docs.map(postToJSON);

    setFeedBottom(false);
    setCurrentBtn("investor");
    setPosts(invest);
  }

  async function investment() {
    const ref = collectionGroup(firestore, "posts");
  
    const postsQuery = query(ref, where("published", "==", true), where("status", "==", "investment"), orderBy("createdAt", "desc"), limit(numOfPosts))
  
    const seek = (await getDocs(postsQuery)).docs.map(postToJSON);

    setFeedBottom(false);
    setCurrentBtn("investment");
    setPosts(seek);
  }

  async function mentor() {
    const ref = collectionGroup(firestore, "posts");
  
    const postsQuery = query(ref, where("published", "==", true), where("status", "==", "mentor"), orderBy("createdAt", "desc"), limit(numOfPosts))
  
    const ment = (await getDocs(postsQuery)).docs.map(postToJSON);

    setFeedBottom(false);
    setCurrentBtn("mentor");
    setPosts(ment);
  }

  async function tracking() {
    const trackingDict = {};
    const ref = collection(firestore, "trackPost", user?.uid, "tracking");
    const refQuery = query(ref);
    
    const trackingDocs = (await getDocs(refQuery)).docs?.map((doc) => doc?.data());

    trackingDocs.forEach((docs) => {
      trackingDict[docs?.slug] = 1;
    })

    const newRef = collectionGroup(firestore, "posts")
    const postsQuery = query(newRef, orderBy("updatedAt", "desc"))

    let track = (await getDocs(postsQuery)).docs?.map((docs) => {
      return (
        (!(!trackingDict[docs?.id]) ?
        postToJSON(docs) :
        null)
      )
    });

    track = track.filter((docs) => docs != null);

    setFeedBottom(false);
    setCurrentBtn("tracking");
    setPosts(track);
  }

  async function all() {
    const ref = collectionGroup(firestore, "posts");
  
    const postsQuery = query(ref, where("published", "==", true), orderBy("createdAt", "desc"), limit(numOfPosts))
  
    const posts = (await getDocs(postsQuery)).docs.map(postToJSON);

    setFeedBottom(false);
    setCurrentBtn("all");
    setPosts(posts);
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
      setFeedBottom(true);
    }
  }

  return (
    <>
    {username &&
     (
      <>
        {searching && (
          <>
            <div className = "instantSearchWrapper">
                <InstantSearch searchClient = {searchClient} indexName="Posts">
                  <SearchBox className = "searchBox"/>
                  <Hits hitComponent = {Hit} />
                </InstantSearch>
            </div>
            <button className = "exitSearch" onClick={() => setSearching(false)}>Exit</button>
          </>
        )}

        {!searching && (
        <>
          <div className = "mainLinkWrapper">
            <div className = "mainLinks">
                    <button style={{background: (currentBtn === "all") ? "gray" : null}} onClick = {() => all()}>
                      All
                    </button>
                    <button style={{background: (currentBtn === "investor") ? "red" : null}} onClick = {() => investor()}>
                      Investors
                    </button>
                    <button style={{background: (currentBtn === "investment") ? "blue" : null}} onClick = {() => investment()}>
                      Investment
                    </button>
                    <button style={{background: (currentBtn === "mentor") ? "orange" : null}} onClick = {() => mentor()}>
                      Mentors
                    </button>
                    <button style={{background: (currentBtn === "tracking") ? "gray" : null}} onClick = {() => tracking()}>
                      Tracking
                    </button>
                    <button onClick={() => setSearching(true)}>
                      Search
                    </button>
            </div>
          </div>
            <main className = "pageIndexAlign">
              <Feed posts = {posts} />

              <div>
                {(!loading) && (!feedBottom) && (posts?.length !== 0) && (posts.length % numOfPosts === 0) && (<button className = "generalButton" onClick = {(currentBtn === "all") ? getPosts : getOtherTypes}>More</button>)}
              </div>

              <Loader show = {loading} />
              
              {(feedBottom) && (posts?.length !== 0) && (posts.length % numOfPosts !== 0) && (currentBtn !== "tracking") && (<span>You have reached the end!</span>)}

            </main>
          </>
          )}
      </>)
    }

    {!user && (
      <div className = "centerWelcomePage">
        <h1>Welcome to Devon's Investment App</h1>
        <span>This project was inspired by the <a style = {{fontWeight: "bold"}} href = "https://next.fireship.io/" target="_blank">Next Fireship</a> project - <a style = {{fontWeight: "bold"}} href = "https://github.com/fireship-io/next-firebase-course/tree/main" target="_blank">Next Fireship Repository</a></span>
        <div className = "reactPlayer">
          <ReactPlayer controls url="https://www.youtube.com/watch?v=7sDY4m8KNLc" />
        </div>
        <Feed posts = {posts} />
        {(!loading) && (!feedBottom) && (posts?.length !== 0) && (posts.length % numOfPosts === 0) && (<button className = "generalButton" onClick = {getPosts}>More</button>)}
        {(feedBottom) && (posts?.length !== 0) && (posts.length % numOfPosts !== 0) && (<span>You have reached the end!</span>)}
      </div>
    )}
    </>
  )
}
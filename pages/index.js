import Feed from "../components/Feed";
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

  async function tracking() {
    const trackingDict = {};
    const ref = collection(firestore, "trackPost", user?.uid, "tracking");
    const refQuery = query(ref);
    
    const trackingDocs = (await getDocs(refQuery)).docs?.map((doc) => doc?.data());

    trackingDocs.forEach((docs) => {
      trackingDict[docs?.slug] = 1;
    })

    const newRef = collectionGroup(firestore, "posts")
    const postsQuery = query(newRef, orderBy("updatedAt", "desc"), limit(numOfPosts))

    let track = (await getDocs(postsQuery)).docs?.map((docs) => {
      return (
        (!(!trackingDict[docs?.id]) ?
        postToJSON(docs) :
        null)
      )
    });

    track = track.filter((docs) => docs != null);

    setFeedBottom(false)
    setPosts(track);
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
                    <button style={{background: (currentBtn === "tracking") ? "gray" : null}} onClick = {() => tracking() && setCurrentBtn("tracking")}>
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
                {!loading && !feedBottom && (posts.length != 0) && (posts.length % numOfPosts === 0) && <button className = "generalButton" onClick = {(currentBtn === "all") ? getPosts : getOtherTypes}>Next</button>}
              </div>

              <Loader show = {loading} />
              
              {feedBottom && <span>You have reached the end!</span>}

            </main>
          </>
          )}
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
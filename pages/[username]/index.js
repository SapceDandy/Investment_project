import Profile from "../../components/Profile"
import Feed from "../../components/Feed";
import AuthCheck from "../../components/AuthCheck";
import { UserContext } from "../../library/context";
import { useContext, useState } from "react";
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/router';
import { getUser, postToJSON, firestore } from "../../library/firebase";
import { query, collection, where, getDocs, limit, orderBy, getFirestore, doc, setDoc, deleteDoc, collectionGroup, serverTimestamp, Timestamp, startAfter } from "firebase/firestore";
import { useEffect } from "react";
import Loader from "../../components/Loader";
import CurrentFeed from "../../components/CurrentFeed";
import FollowFeed from "../../components/FollowFeed";
import MessageList from "../../components/Messages";
import uniqid from 'uniqid';
import toast from 'react-hot-toast';

export async function getServerSideProps({ query: urlQuery }) {
    const { username } = urlQuery;

    const userDoc = await getUser(username); 

    if (!userDoc) {
        return {
            notFound: true,
        };
    }

    let user = null;
    let post = null;

    if (userDoc) {
        user = userDoc.data();

        const postsQuery = query(
            collection(firestore, userDoc.ref.path, 'posts'),
            where('published', '==', true),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
        post = (await getDocs(postsQuery)).docs.map(postToJSON);
    }

    return {
        props: { user, post },
    };
}

export default function UserPage({user, post}) {
    const { username, user: currentUser } = useContext(UserContext);
    const [currentlyPressed, setCurrentlyPressed] = useState("Posts");
    const lastUser = user?.username;
    const [equalLast, setEqualLast] = useState(null)
    const [currentPost, setCurrentPost] = useState(post);
    const [sendMessage, setSendMessage] = useState(false);
    const [feedBottom, setFeedBottom] = useState(false);
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState(post);

    let following = null;
    let getFollow = null;

    if (!(!username)) {
    getFollow = doc(firestore, "Following", username, "BeingFollowed", user?.username);
    }

    [following] = useDocumentData(!(!username) ? getFollow : null);

    async function Follow() {
        const ref = doc(firestore, "Following", username, "BeingFollowed", user?.username);

        const data = {
            displayName: user?.displayName,
            photoURL: user?.photoURL,
            username: user?.username
        }

        await setDoc(ref, data);

        toast.success(`You are following @${user?.username}!`);
    }

    async function UnFollow() {
        const ref = doc(firestore, "Following", username, "BeingFollowed", user?.username)
        await deleteDoc(ref);
        toast(`You are no longer following @${user?.username}`, { icon: '🗑️' });
    }

    async function Tracking() {
        const trackingDict = {};
        const ref = collection(firestore, "trackPost", currentUser?.uid, "tracking");
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
       
        setCurrentPost(track);
        setCurrentlyPressed("Tracking");
    }

    async function Following() {
        const ref = collection(firestore, "Following", user?.username, "BeingFollowed");
        const refQuery = query(ref, orderBy("username", "desc"), limit(5));
        
        const following = (await getDocs(refQuery)).docs?.map((doc) => doc?.data());

        setCurrentPost(following);
        setCurrentlyPressed("Following");
        setFeedBottom(false);
    }

    const getFollowing = async () => {
        setLoading(true);
        const last = currentPost[currentPost.length - 1];

        const lastInCurrentList = last?.username;

        const ref = collection(firestore, "Following", username, "BeingFollowed");

        const postsQuery = query(ref, orderBy("username", "desc"), startAfter(lastInCurrentList), limit(5));

        const loadingFollowers = (await getDocs(postsQuery)).docs.map((doc) => doc.data());

        setCurrentPost(currentPost.concat(loadingFollowers))
        setLoading(false);

        if (loadingFollowers.length < 5) {
            setFeedBottom(true)
        }
    }

    async function MyMessages() {
        const ref = collection(firestore, "MessageGroup", username, "With");
        const refQuery = query(ref, orderBy("createdAt", "desc"), limit(5));
        
        const currentMessage = (await getDocs(refQuery)).docs?.map((doc) => doc?.data());

        setCurrentlyPressed("MyMessages");
        setCurrentPost(currentMessage);
        setFeedBottom(false);
    }

    const getMessages = async () => {
        setLoading(true);
        const last = currentPost[currentPost.length - 1];

        const lastInCurrentList = typeof last.createdAt === "number" ? Timestamp.fromMillis(last.createdAt) : last.createdAt;
        
        const ref = collection(firestore, "MessageGroup", username, "With");

        const messageQuery = query(ref, orderBy("createdAt", "desc"), startAfter(lastInCurrentList), limit(5));

        const loadMessages = (await getDocs(messageQuery)).docs.map((doc) => doc.data());

        setCurrentPost(currentPost.concat(loadMessages))
        setLoading(false);

        if (loadMessages.length < 5) {
            setFeedBottom(true)
        }
    }

    const getPosts = async () => {
        setLoading(true);
        const last = posts[posts.length - 1];

        const lastInCurrentList = typeof last.createdAt === "number" ? Timestamp.fromMillis(last.createdAt) : last.createdAt;

        const ref = collectionGroup(firestore, "posts");

        const postsQuery = query(ref, where("username", "==", user?.username), where("published", "==", true), orderBy("createdAt", "desc"), startAfter(lastInCurrentList), limit(5));

        const loadedPosts = (await getDocs(postsQuery)).docs.map((doc) => doc.data());

        setPosts(posts.concat(loadedPosts))
        setLoading(false);

        if (loadedPosts.length < 5) {
            setFeedBottom(true)
        }
    }

    async function CurrentPosts() {
        const ref = collectionGroup(firestore, "posts");

        const postsQuery = query(ref, where("username", "==", user?.username), where("published", "==", true), orderBy("createdAt", "desc"), limit(5));

        const loadedPosts = (await getDocs(postsQuery)).docs.map((doc) => doc.data());

        setCurrentlyPressed("Posts");
        setPosts(loadedPosts)
    }

    return (
        <main className = "wrapper">
            <AuthCheck fallback = {<Redirect to = "/enter" />}>
                {(lastUser !== equalLast) && (CurrentPosts()) && (setEqualLast(lastUser))}
                <Profile user = {user}/>
                {(username === user?.username) && (
                <div className = "userProfileButtons">
                    <button type = "button" style = {{background: (currentlyPressed === "Posts") ? "dimgrey" : null}} onClick = {() => setCurrentlyPressed("Posts")}>My Posts</button>
                    <button type = "button" style = {{background: (currentlyPressed === "Following") ? "dimgrey" : null}} onClick = {() => Following()}>Following</button>
                    <button type = "button" style = {{background: (currentlyPressed === "Tracking") ? "dimgrey" : null}} onClick = {() =>  Tracking()}>Tracking</button>
                    <button type = "button" style = {{background: (currentlyPressed === "MyMessages") ? "dimgrey" : null}} onClick = {() =>  MyMessages()}>Messages</button>
                </div>)}
                {(username !== user?.username) && (
                    <div className = "userProfileButtons">
                        {(following?.username !== user?.username) && (<button type = "button" onClick = {() => Follow()}>Follow</button>)}
                        {(following?.username === user?.username) && (<button type = "button" onClick = {() => UnFollow()}>Unfollow</button>)}
                        <button type = "button" style = {{background: (sendMessage) ? "dimgrey" : null}}onClick = {() => setSendMessage(!sendMessage)}>Send Message</button>
                    </div>
                )}

                {(username === user?.username) && (  
                    (currentlyPressed === "Posts") ? <Feed posts = {posts} userPage/> :
                    (currentlyPressed === "Following") ? <FollowFeed currentPost = {currentPost} /> :
                    (currentlyPressed === "Tracking") ? <CurrentFeed currentPost = {currentPost}/> :
                    <MessageList currentPost = {currentPost}/>
                )}

                {(username !== user?.username) && (!sendMessage) && (
                    <Feed posts = {posts}/>
                )}

                {(username !== user?.username) && (sendMessage) && (
                    <Message user = {user} username = {username} currentUser = {currentUser}/>
                )}

                {(!loading) && (!feedBottom) && (currentlyPressed === "MyMessages") && (currentPost?.length !== 0) && (currentPost?.length % 5 === 0) && (<button type = "button" className = "userMoreButton" onClick = {() => getMessages()}>More</button>)}
                {(currentlyPressed === "Posts") && (!loading) && (!feedBottom) && (posts?.length !== 0) && (posts.length % 5 === 0) && (<button type = "button" className = "userMoreButton" onClick = {() => getPosts()}>More</button>)}
                {(currentlyPressed === "Following") && (!loading) && (!feedBottom) && (currentPost?.length !== 0) && (currentPost.length % 5 === 0) && (<button type = "button" className = "userMoreButton" onClick = {() => getFollowing()}>More</button>)}
                <Loader show = {loading} />
                
                {/*(feedBottom) && (currentlyPressed === "MyMessages")  && (currentPost?.length !== 0) && (<span style = {{marginBottom: "2rem"}}>You have reached the end!</span>)*/}
                {(feedBottom) && (currentlyPressed === "Posts") && (posts?.length !== 0) && (<span style = {{marginBottom: "2rem"}}>You have reached the end!</span>)}
                {(feedBottom) && ((currentlyPressed === "Following") || (currentlyPressed === "MyMessages")) && (currentPost?.length !== 0) && (<span style = {{marginBottom: "2rem"}}>You have reached the end!</span>)}
            </AuthCheck>
        </main>
    )
}

function Message({user, username, currentUser}) {
    const [theTitle, setTheTitle] = useState("");
    const [theMessage, setTheMessage] = useState("");

    const messageSent = async() => {
        const noTitle = uniqid();
        theTitle = (theTitle === "") ? noTitle : theTitle;
        const ref = collectionGroup(firestore, "users");
        const queryRef = query(ref, where("username", "==", user?.username));

        const newDoc = (await getDocs(queryRef)).docs.map((docs) => docs.data());

        const firstPerson = doc(firestore, "MessageGroup", username, "With", user?.username);
        const secondPerson = doc(firestore, "MessageGroup", user?.username, "With", username);

        const firstPersonData = {
            writtenBy: username,
            messageWith: username,
            username: user?.username,
            uid: newDoc[0]?.uid,
            title: (theTitle === noTitle) ? null : theTitle,
            message: theMessage,
            createdAt: serverTimestamp()
        }

        const secondPersonData = {
            writtenBy: username,
            messageWith: user?.username,
            username: username,
            uid: currentUser?.uid,
            title: (theTitle === noTitle) ? null : theTitle,
            message: theMessage,
            createdAt: serverTimestamp()
        }

        await setDoc(firstPerson, firstPersonData);
        await setDoc(secondPerson, secondPersonData);

        const refOne = doc(firestore, "MessageGroup", username, "With", user?.username, "Messages", theTitle);
        const refTwo = doc(firestore, "MessageGroup", user?.username, "With", username, "Messages", theTitle);

        const data = {
            title: (theTitle === noTitle) ? null : theTitle,
            message: theMessage,
            sentBy: username,
            sentTo: user?.username,
            createdAt: serverTimestamp()
        }

        await setDoc(refOne, data);
        await setDoc(refTwo, data);

        toast.success(`You have sent @${user?.username} a message!`);
        setTheTitle("");
        setTheMessage("");
    }

    return (
        <form className = "messageWrapper">
            <div>
                <label for = "title">Title</label>
                <input placeholder = "Add a title..." type = "text" id = "title" name = "title" value = {theTitle} onChange = {(e) => setTheTitle(e.target.value)} />
            </div>
            
            <div style = {{ marginBottom: "1rem", width: "100%", textAlign: "center" }}>
                <span style = {{fontStyle: "italic"}}>Title can't be longer than 35 characters</span>
                {(theTitle.length > 35) && (<span style = {{color: "red"}}>You have exceeded the title character limit</span>)}
            </div>

            <div>
                <label for = "message">Message <span style = {{color: "red"}}>*</span></label>
                <input placeholder = "Write message..." type = "text" id = "message" name = "message" value = {theMessage} onChange = {(e) => setTheMessage(e.target.value)} />
            </div>
            <div className = "send">
                <button type = "button" onClick = {() => messageSent()} disabled = {(theMessage === "") || (theTitle.length > 35)}>Send</button>
            </div>
        </form>
    )
}

function Redirect({ to }) {
    const router = useRouter();
  
    useEffect(() => {
        router.push(to);
    }, [to])
}
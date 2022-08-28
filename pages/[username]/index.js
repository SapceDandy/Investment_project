import Profile from "../../components/Profile"
import Feed from "../../components/Feed";
import AuthCheck from "../../components/AuthCheck";
import { UserContext } from "../../library/context";
import { useContext, useState } from "react";
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/router';
import { getUser, postToJSON, firestore } from "../../library/firebase";
import { query, collection, where, getDocs, limit, orderBy, getFirestore, doc, setDoc, deleteDoc, collectionGroup, serverTimestamp } from "firebase/firestore";
import { useEffect } from "react";
import CurrentFeed from "../../components/CurrentFeed";
import FollowFeed from "../../components/FollowFeed";
import MessageList from "../../components/Messages";
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
    let posts = null;

    if (userDoc) {
        user = userDoc.data();

        const postsQuery = query(
            collection(firestore, userDoc.ref.path, 'posts'),
            where('published', '==', true),
            orderBy('createdAt', 'desc')
          );
        posts = (await getDocs(postsQuery)).docs.map(postToJSON);
    }

    return {
        props: { user, posts },
    };
}

export default function UserPage({user, posts}) {
    const { username, user: currentUser } = useContext(UserContext);
    const [currentlyPressed, setCurrentlyPressed] = useState("Posts");
    const [currentPost, setCurrentPost] = useState(posts);
    const [sendMessage, setSendMessage] = useState(false);

    let following = null;
    let getFollow = null;

    {!(!username) ?
    (getFollow = doc(firestore, "Following", username, "BeingFollowed", user?.username)) &&
    ([following] = useDocumentData(getFollow)) : null}

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
       
        setCurrentlyPressed("Tracking");
        setCurrentPost(track);
    }

    async function Following() {
        const ref = collection(firestore, "Following", user?.username, "BeingFollowed");
        const refQuery = query(ref);
        
        const following = (await getDocs(refQuery)).docs?.map((doc) => doc?.data());

        setCurrentlyPressed("Following");
        setCurrentPost(following);
    }

    async function MyMessages() {
        console.log("Username: ", username)
        const ref = collection(firestore, "MessageGroup", username, "With");
        const refQuery = query(ref);
        
        const currentMessage = (await getDocs(refQuery)).docs?.map((doc) => doc?.data());

        //console.log("Username: ", username)
        console.log("Message: ", currentMessage)
        console.log("Ref: ", ref)
        setCurrentlyPressed("MyMessages");
        setCurrentPost(currentMessage);
    }

    return (
        <main className = "wrapper">
            <AuthCheck fallback = {<Redirect to = "/enter" />} >
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
                {console.log("Current Message: ", currentPost)}
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
            </AuthCheck>
        </main>
    )
}

function Message({user, username, currentUser}) {
    console.log("Current: ", user)
    const [theTitle, setTheTitle] = useState("");
    const [theMessage, setTheMessage] = useState("");

    const messageSent = async() => {
        const ref = collectionGroup(firestore, "users");
        const queryRef = query(ref, where("username", "==", user?.username));

        const newDoc = (await getDocs(queryRef)).docs.map((docs) => docs.data());

        console.log("New Doc: ", newDoc)

        const firstPerson = doc(firestore, "MessageGroup", username, "With", user?.username);
        const secondPerson = doc(firestore, "MessageGroup", user?.username, "With", username);

        const firstPersonData = {
            writtenBy: username,
            messageWith: username,
            username: user?.username,
            uid: newDoc[0]?.uid,
            title: theTitle,
            message: theMessage,
            createdAt: serverTimestamp()
        }

        const secondPersonData = {
            writtenBy: username,
            messageWith: user?.username,
            username: username,
            uid: currentUser?.uid,
            title: theTitle,
            message: theMessage,
            createdAt: serverTimestamp()
        }

        await setDoc(firstPerson, firstPersonData);
        await setDoc(secondPerson, secondPersonData);

        const refOne = doc(firestore, "MessageGroup", username, "With", user?.username, "Messages", theTitle);
        const refTwo = doc(firestore, "MessageGroup", user?.username, "With", username, "Messages", theTitle);

        const data = {
            title: theTitle,
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
            <div>
                <label for = "message">Message</label>
                <input placeholder = "Add a title..." type = "text" id = "message" name = "message" value = {theMessage} onChange = {(e) => setTheMessage(e.target.value)} />
            </div>
            <div className = "send">
                <button type = "button" onClick = {() => messageSent()} disabled = {theMessage === ""}>Send</button>
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
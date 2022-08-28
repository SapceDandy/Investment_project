import Profile from "../../components/Profile"
import Feed from "../../components/Feed";
import AuthCheck from "../../components/AuthCheck";
import { UserContext } from "../../library/context";
import { useContext, useState } from "react";
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/router';
import { getUser, postToJSON, firestore } from "../../library/firebase";
import { query, collection, where, getDocs, limit, orderBy, getFirestore, doc, setDoc, deleteDoc, collectionGroup} from "firebase/firestore";
import { useEffect } from "react";
import CurrentFeed from "../../components/CurrentFeed";
import FollowFeed from "../../components/FollowFeed";
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
    const [sendMessage, setSendMessage] = useState(false)

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

    async function Messages() {

    }

    function Message() {
        const [title, setTitle] = useState("");
        const [message, setMessage] = useState("");

        const messageSent = async() => {
            const refSent = doc(firestore, "MessageSent", username, "SentTo", user?.username, "Message", title);
            const refRecieved = doc(firestore, "MessageRecieved", user?.username, "SentBy", username, "Message", title);

            const data = {
                title: title,
                message: message,
                sentBy: username,
                sentTo: user?.username,
                createdAt: serverTimestamp()
            }

            await setDoc(refSent, data);
            await setDoc(refRecieved, data);

            toast.success(`You have sent @${user?.username} a message!`);
            setSendMessage(false)
        }

        return (
            <form className = "messageWrapper">
                <div>
                    <label for = "title">Title</label>
                    <input placeholder = "Add a title..." type = "text" id = "title" name = "title" value = {title} onChange = {(e) => setTitle(e.target.value)} />
                </div>
                <div>
                    <label for = "message">Message</label>
                    <input placeholder = "Add a title..." type = "text" id = "message" name = "message" value = {message} onChange = {(e) => setMessage(e.target.value)} />
                </div>
                <div className = "send">
                    <button type = "button" onClick = {() => messageSent()} disabled = {message === ""}>Send</button>
                </div>
            </form>
        )
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
                    <button type = "button" style = {{background: (currentlyPressed === "Tracking") ? "dimgrey" : null}} onClick = {() =>  Messages()}>Messages</button>
                </div>)}
                {(username !== user.username) && (
                    <div className = "userProfileButtons">
                        {(following?.username !== user?.username) && (<button type = "button" onClick = {() => Follow()}>Follow</button>)}
                        {(following?.username === user?.username) && (<button type = "button" onClick = {() => UnFollow()}>Unfollow</button>)}
                        <button type = "button" onClick = {() => setSendMessage(!sendMessage)}>Send Message</button>
                    </div>
                )}
                {(username === user?.username) && (  
                    (currentlyPressed === "Posts") ? <Feed posts = {posts} userPage/> :
                    (currentlyPressed === "Following") ? <FollowFeed currentPost = {currentPost} /> :
                    <CurrentFeed currentPost = {currentPost}/>
                )}
                {(username !== user?.username) && (!sendMessage) && (
                    <Feed posts = {posts}/>
                )}
                {(username !== user?.username) && (sendMessage) && (
                    <Message />
                )}
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
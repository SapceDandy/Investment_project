import Profile from "../../components/Profile"
import Feed from "../../components/Feed";
import AuthCheck from "../../components/AuthCheck";
import { UserContext } from "../../library/context";
import { useContext, useState } from "react";
import { useDocumentData, useCollection, Timestamp } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/router';
import { getUser, postToJSON, firestore } from "../../library/firebase";
import { query, collection, where, getDocs, limit, orderBy, getFirestore, doc, setDoc, deleteDoc, collectionGroup, serverTimestamp } from "firebase/firestore";
import { useEffect } from "react";
import CurrentFeed from "../../components/CurrentFeed";
import FollowFeed from "../../components/FollowFeed";
import MessageList from "../../components/Messages";
import uniqid from 'uniqid';
import toast from 'react-hot-toast';
import User from "./[user]";
import Loader from "../../components/Loader";

export default function MessagesIndex() {
    let [currentPost, setCurrentPost] = useState(null);
    const [feedBottom, setFeedBottom] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user, username } = useContext(UserContext);
    let messageQuery = null;

    if (!(!username)) {
        const messageCollection = collection(firestore, "MessageGroup", username, "With");
        messageQuery = query(messageCollection, orderBy("createdAt", "desc"), limit(10));
    };
    
    const [col] = useCollection(!(!username) ? messageQuery : null);
    if (currentPost === null) currentPost = col?.docs?.map((docs) => docs?.data());

    const getMessages = async () => {
        setLoading(true);
        const last = posts[posts.length - 1];
        const lastInCurrentList = typeof last.createdAt === "number" ? Timestamp.fromMillis(last.createdAt) : last.createdAt;

        const ref = collection(firestore, "MessageGroup", username, "With");

        const messagesQuery = query(ref, orderBy("createdAt", "desc"), startAfter(lastInCurrentList), limit(10));
        
        const loadedMessages = (await getDocs(messagesQuery)).docs.map((doc) => doc.data());

        setPosts(posts.concat(loadedMessages))
        setLoading(false);

        if (loadedMessages.length < numOfPosts) {
            setFeedBottom(true)
        }
    }

    return (
        <div className = "messagesPageWrapper">
            <h1>Messages</h1>
            <MessageList currentPost = {currentPost}/>
            {(!loading) && (!feedBottom) && (currentPost?.length != 0) && (currentPost?.length % 10 === 0) && (<button type = "button" onClick = {() => getMessages()}>More</button>)}
            {((feedBottom) || (currentPost?.length % 10 != 0)) && (<span style = {{fontStyle: "italic"}}>You have no more messages</span>)}
            <Loader show = {loading} />
        </div>
    )
}
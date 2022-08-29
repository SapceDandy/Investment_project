import Profile from "../../components/Profile"
import Feed from "../../components/Feed";
import AuthCheck from "../../components/AuthCheck";
import { UserContext } from "../../library/context";
import { useContext, useState } from "react";
import { useDocumentData, useCollection } from 'react-firebase-hooks/firestore';
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

export default function MessagesIndex() {
    let [currentPost, setCurrentPost] = useState(null);
    const { user, username } = useContext(UserContext);
    let messageQuery = null;

    if (!(!username)) {
        const messageCollection = collection(firestore, "MessageGroup", username, "With");
        messageQuery = query(messageCollection, orderBy("createdAt", "desc"), limit(10));
    };
    
    const [col] = useCollection(!(!username) ? messageQuery : null);
    if (currentPost === null) currentPost = col?.docs?.map((docs) => docs?.data());

    return (
        <div className = "messagesPageWrapper">
            <h1>Messages</h1>
            <MessageList currentPost = {currentPost}/>
            <button>More</button>
        </div>
    )
}
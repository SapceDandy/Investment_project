import AuthCheck from '../../components/AuthCheck';
import { firestore, auth } from '../../library/firebase';
import { serverTimestamp, doc, setDoc, deleteDoc, getDocs, updateDoc, collection, collectionGroup, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { useState, useEffect, useContext } from 'react';
import { UserContext } from "../../library/context";
import { useRouter } from 'next/router';
import { useDocumentData, useCollection, Timestamp } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import Loader from "../../components/Loader";
import uniqid from 'uniqid';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { devNull } from 'os';

export default function User() {
    const { user: currentUser, username } = useContext(UserContext);   
    const [loading, setLoading] = useState(false);
    const [feedBottom, setFeedBottom] = useState(false);
    const [currentTitle, setCurrentTitle] = useState("");
    const [currentMessage, setCurrentMessage] = useState("");
    let [message, setMessage] = useState(null)
    const router = useRouter();
    const { user } = router.query;
    let queryRef = null;

    if (!(!username)) {
        const ref = collection(firestore, "MessageGroup", username, "With", user, "Messages");
        queryRef = query(ref, orderBy("createdAt", "desc"), limit(10));
    };
    
    const [col] = useCollection(!(!username) ? queryRef : null);
    if (message === null) message = col?.docs?.map((docs) => docs?.data());

    const messageSent = async() => {
        const noTitle = uniqid();
        currentTitle = (currentTitle === "") ? noTitle : currentTitle;
        const ref = collectionGroup(firestore, "users");
        const newQueryRef = query(ref, where("username", "==", user));

        const newDoc = (await getDocs(newQueryRef)).docs.map((docs) => docs.data());

        const firstPerson = doc(firestore, "MessageGroup", username, "With", user);
        const secondPerson = doc(firestore, "MessageGroup", user, "With", username);

        const firstPersonData = {
            writtenBy: username,
            messageWith: username,
            username: user,
            uid: newDoc[0]?.uid,
            title: (currentTitle === noTitle) ? null : currentTitle,
            message: currentMessage,
            createdAt: serverTimestamp()
        }

        const secondPersonData = {
            writtenBy: username,
            messageWith: user,
            username: username,
            uid: currentUser?.uid,
            title: (currentTitle === noTitle) ? null : currentTitle,
            message: currentMessage,
            createdAt: serverTimestamp()
        }

        await setDoc(firstPerson, firstPersonData);
        await setDoc(secondPerson, secondPersonData);

        const refOne = doc(firestore, "MessageGroup", username, "With", user, "Messages", currentTitle);
        const refTwo = doc(firestore, "MessageGroup", user, "With", username, "Messages", currentTitle);

        const data = {
            title: (currentTitle === noTitle) ? null : currentTitle,
            message: currentMessage,
            sentBy: username,
            sentTo: user,
            createdAt: serverTimestamp()
        }

        await setDoc(refOne, data);
        await setDoc(refTwo, data);

        toast.success(`You have sent @${user} a message!`);
        setCurrentTitle("");
        setCurrentMessage("");
    }

    const getMessages = async () => {
        setLoading(true);
        const last = message[message?.length - 1];
        const lastInCurrentList = typeof last?.createdAt === "number" ? Timestamp?.fromMillis(last?.createdAt) : last?.createdAt;
        const ref = collection(firestore, "MessageGroup", username, "With", user, "Messages");
        let newQueryRef = query(ref, orderBy("createdAt", "desc"), startAfter(lastInCurrentList), limit(10));
        const loadedPosts = (await getDocs(newQueryRef))?.docs?.map((docs) => docs?.data());

        setMessage(message.concat(loadedPosts))
        setLoading(false);

        if (loadedPosts.length < 10) {
            setFeedBottom(true)
        }
    }

    return (
        <>
            <h1 className = "centerUserMessageText">@{user}</h1>
            <Link href = "/messages">
                <button className = "centerUserMessageBackButton">Back</button>
            </Link>
            <div className = "userMessageWrapper">
                <div className = "messageFeedWrapper">
                    {!(!message) ? message?.map((currentMessage) => <MessageFeed currentMessage = {currentMessage} />) : null}
                    {(!loading) && (!feedBottom) && (message?.length != 0) && (message?.length % 10 === 0) && (<button onClick = {() => getMessages()}>More</button>)}
                    {(feedBottom) && (<span style = {{fontStyle: "italic"}}>You have no more messages</span>)}
                    <Loader show = {loading} />
                </div>
            </div>
            <div className = "createMessage">
                <form className = "createMessageForm">
                    <div className = "createMessegeContent">
                        <div className = "createMessageTitle">
                            <input placeholder = "Title: 35 characters or less..."type = "text" id = "title" name = "title" value = {currentTitle} onChange = {(e) => setCurrentTitle(e.target.value)}/>
                        </div>
                        <div className = "createMessageMessage">
                            <input placeholder = "Message: required..." type = "text" id = "title" name = "title" value = {currentMessage} onChange = {(e) => setCurrentMessage(e.target.value)}/>
                        </div>
                        <button type = "button" disabled = {(currentMessage === "") || (currentTitle.length > 35)} onClick = {() => messageSent()}>Send</button>
                    </div>
                    <div>

                        {(currentTitle.length > 35) && (<span style = {{color: "red"}}>You have exceeded the titel character limit</span>)}
                    </div>
                </form>
            </div>
        </>
    )
}

function MessageFeed({ currentMessage }) {
    const { user: currentUser, username } = useContext(UserContext);

    const date = (typeof currentMessage?.createdAt === 'number') ? new Date(currentMessage?.createdAt) : currentMessage?.createdAt?.toDate();
    let hours = date?.getHours();
    let amOrPM = (hours >= 12) ? "PM" : "AM";
    hours = (hours > 12) ? (hours - 12) : (hours === 0) ? 12 : hours;
    let minutes = date?.getMinutes();
    minutes = (minutes < 10) ? "0" + minutes : minutes;

    return (
        <div className = {(username !== currentMessage?.sentBy) ? "messageFeedLeft" :  "messageFeedRight"}>
            {(username === currentMessage?.sentBy) && (<div className = "timeLeft">
                <span>{hours}:{minutes} {amOrPM}</span>
            </div>)}
            <div className = "tempContainer">
                {(username === currentMessage?.sentBy) && (<div style = {{textAlign: "right"}}>
                    <Link href = {`/${currentMessage?.sentBy}`}>
                        <div className = "linkedMessageWrapper">
                            <span className = "linkedMessage" style = {{fontWeight: "bold"}}>@{currentMessage?.sentBy}</span>
                        </div>
                    </Link>
                    <span style = {{fontStyle: "italic"}}>{currentMessage?.title}</span>
                </div>)}
                {(username !== currentMessage?.sentBy) && (<div style = {{textAlign: "left"}}>
                    <Link href = {`/${currentMessage?.sentBy}`}>
                        <span className = "linkedMessage" style = {{fontWeight: "bold"}}>@{currentMessage?.sentBy}</span>
                    </Link>
                    <span style = {{fontStyle: "italic"}}>{currentMessage?.title}</span>
                </div>)}
                <span className = "messageSpan">{currentMessage?.message}</span>
            </div>
            {(username !== currentMessage?.sentBy) && (<div className = "timeRight">
                <span>{hours}:{minutes} {amOrPM}</span>
            </div>)}
        </div>
    )
}
import AuthCheck from '../../components/AuthCheck';
import { firestore, auth } from '../../library/firebase';
import { serverTimestamp, doc, setDoc, deleteDoc, updateDoc, collection, query, where, orderBy } from 'firebase/firestore';
import { useState, useEffect, useContext } from 'react';
import { UserContext } from "../../library/context";
import { useRouter } from 'next/router';
import { useDocumentData, useCollection } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function User() {
    const { user: currentUser, username } = useContext(UserContext);
    const [currentTitle, setCurrentTitle] = useState("");
    const [currentMessage, setCurrentMessage] = useState("");
    const router = useRouter();
    const { user } = router.query;
    let message = null;
    let queryRef = null;

    if (!(!username)) {
        const ref = collection(firestore, "MessageGroup", username, "With", user, "Messages");
        queryRef = query(ref, orderBy("createdAt", "desc"));
    };
    
    const [col] = useCollection(!(!username) ? queryRef : null);
    message = col?.docs?.map((docs) => docs?.data());

    return (
        <>
            <h1 className = "centerUserMessageText">@{user}</h1>
            <div className = "userMessageWrapper">
                <div className = "messageFeedWrapper">
                    {!(!message) ? message.map((currentMessage) => <MessageFeed currentMessage = {currentMessage} />) : null}
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
                        <button type = "button" disabled = {(currentMessage === "") || (currentTitle.length > 35)}>Send</button>
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
                        <span className = "linkedMessage" style = {{fontWeight: "bold"}}>@{currentMessage?.sentBy}</span>
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
            {/*<div className = {(username !== currentMessage?.sentBy) ? "timeLeft" :  "timeRight"}>
                <span>words</span>
            </div>*/}
        </div>
    )
}
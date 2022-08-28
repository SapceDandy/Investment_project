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
    const router = useRouter();
    const { user } = router.query;
    let message = null;

    if (!(!username)) {
        const ref = collection(firestore, "MessageGroup", username, "With", user, "Messages");
        const queryRef = query(ref, orderBy("createdAt", "desc"))
        const [col] = useCollection(queryRef)

        message = col?.docs?.map((docs) => docs?.data())

        console.log("User Route: ", user);
        console.log("Current User: ", currentUser);
        console.log("Username: ", username);
    };

    console.log("Messsage: ", message);

    return (
        <>
            <h1>@{user}</h1>
            <div className = "userMessageWrapper">
                <div className = "messageFeedWrapper">
                    {!(!message) ? message.map((currentMessage) => <MessageFeed currentMessage = {currentMessage} />) : null}
                </div>
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
                <div>
                    <span>{currentMessage?.title}</span>
                    <span>{currentMessage?.sentBy}</span>
                </div>
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
import Link from "next/link";
import { firestore } from "../library/firebase";
import { UserContext } from "../library/context";
import { useContext } from "react";
import { collection, deleteDoc, doc, getDocs, limit, query, where } from "firebase/firestore";
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function MessageList({ currentPost, admin }) {
    //console.log("Word: ", currentPost)
    return currentPost ? currentPost.map((post) => <PostItem post = {post} key = {post?.slug} admin = {admin} />) : null;
}

function PostItem({ post, admin = false }) {
    //console.log("Post: ", post)
    const { user, username } = useContext(UserContext);
    const postRef = doc(firestore, "users", post?.uid);
    const [userId] = useDocumentData(postRef);
    const messageWith = userId?.username;
    //console.log("Person being messaged: ", post?.username);
    //console.log("username", username);
    //console.log("Post: ", post)

    const date = (typeof post?.createdAt === 'number') ? new Date(post?.createdAt) : post?.createdAt?.toDate();
    let hours = date?.getHours();
    let amOrPM = (hours >= 12) ? "PM" : "AM";
    hours = (hours > 12) ? (hours - 12) : (hours === 0) ? 12 : hours;
    let minutes = date?.getMinutes();
    minutes = (minutes < 10) ? "0" + minutes : minutes;

    //const newPostRef = collection(firestore, "MessageGroup", post?.username, "With", username, "Messages");
    //const queryNewPostRef = query(newPostRef, where("createdAt", "==", "desc"), limit(1));
    //const [userMessage] = useCollection(newPostRef);
    //console.log("Usermessage: ", userMessage);

    return (
        <div className = "wholeFeed">
            <div className = "topOfFeedCard">
                <Link href = {`/messages/${messageWith}`}>
                    <a className = "feedCardTitle">
                        <h2>{(!userId?.displayName) ? userId?.username : userId?.displayName}</h2>
                    </a>
                </Link>
                <Link href = {`/${userId?.username}`}> 
                    <div className = "useInfoMessage">
                        <img style = {{ width: "30px", height: "30px", borderRadius: "50px"}} src = {userId?.photoURL} />     
                        <a>
                            <strong>@{userId?.username}</strong>
                        </a>   
                    </div>
                </Link>
            </div>
            <Link href = {`/messages/${messageWith}`}>
                <div className = "wholeFeedLink"></div>
            </Link>
            <div className = "messageGroup above">
                <span className = "left">{post?.title}</span>
                <span className = "right">@{post?.writtenBy}</span>
            </div>
            <div className = "messageGroup bellow">
                <span className = "left">{post?.message}</span>
                <span className = "right">{hours}:{minutes} {amOrPM}</span>
            </div>
        </div>
    )
}
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { serverTimestamp, docs, doc, deleteDoc, getDocs, getDoc, collection, query, limit, getFirestore, collectionGroup, setDoc, orderBy, where, addDoc } from 'firebase/firestore';
import { auth, firestore } from "../library/firebase";
import { useState } from "react";
import { useDocumentData } from 'react-firebase-hooks/firestore';
import toast from 'react-hot-toast';

export default function PostContent({ post }) {
  const currentUser = auth.currentUser.uid;

  const TrackPost = async() => {
    const ref = doc(firestore, "trackPost", currentUser, "tracking", post?.slug);

    const data = {
        slug: post.slug,
        uid: post.uid
    }

    await setDoc(ref, data);

    toast.success('Post Is Being Tracked!');
  }

  async function DeleteTracking() {
    const ref = doc(firestore, "trackPost", currentUser, "tracking", post?.slug);
    await deleteDoc(ref);
    toast('You are no longer tracking ', { icon: '🗑️' });
  }

  const getTracking = doc(firestore, "trackPost", currentUser, "tracking", post?.slug);
  const [tracked] = useDocumentData(getTracking);
  
  const [response, setResponse] = useState("")
  const date = (typeof post?.createdAt === 'number') ? new Date(post?.createdAt) : post?.createdAt?.toDate();
  const monthsDict = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"};
  const month = date?.getMonth() + 1;
  const monthString = monthsDict[month];
  const day = date?.getDate();
  const year = date?.getFullYear();
  let hours = date?.getHours();
  let amOrPM = (hours >= 12) ? "PM" : "AM";
  hours = (hours > 12) ? (hours - 12) : (hours === 0) ? 12 : hours;
  let minutes = date?.getMinutes();
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  
  return (
    <>
      <div className = "postContentTop">
        <div className = "postContentTitleWrapper">
          <h1>{post?.title}</h1>
        </div>
        <div className = "postContentUserWrapper">
          <span>
            <div>
              Written by {' '}
              <Link href={`/${post.username}/`}>
                <a style = {{fontWeight: "bold"}}> @{post.username}</a>
              </Link>{' '}
            </div>
            <div>
              {`${monthString} ${day}, ${year} @${hours}:${minutes} ${amOrPM}`}
            </div>
          </span>
        </div>
      </div>
      <span style = {{fontStyle: "italic"}}>Header:</span>
      <div className = "postContentSpan"><ReactMarkdown>{post?.header}</ReactMarkdown></div>
      <span style = {{fontStyle: "italic"}}>Content:</span>
      <div className = "postContentSpan"><ReactMarkdown>{post?.content}</ReactMarkdown></div>
      {currentUser !== post.uid && (
      <form className="createNewResponseWrapper">
        {/*<label for = "response">If you are interested send a response</label><br />*/}
        <input placeholder="Responed if interested..." type = "text" id = "response" name = "response" value = {response} onChange = {(e) => setResponse(e.target.value)}></input>
        <button type = "button" disabled = {response === ""} >Send</button>
      </form>)}
      <span className = "postStatusSpan" style = {{color: (post?.status === "investor") ? "red" : (post?.status === "investment") ? "blue" : (post?.status === "mentor") ? "orange" : "lightgrey"}}>#<ReactMarkdown>{post?.status}</ReactMarkdown></span>
      <div className = "postContentBottomRight">
        {currentUser === post?.uid && (
        <Link href={`/admin/${post?.slug}`}>
            <button className = "generalButtonBottomRight">Edit</button>
        </Link>)}
        {(currentUser !== post?.uid) && (tracked?.slug !== post?.slug) && (
            <button className = "generalButtonBottomRight" onClick = {() => TrackPost()}>Track Post</button>
        )}

        {(currentUser?.uid !== post?.uid) && (tracked?.slug === post?.slug) && (
            <button className = "generalButtonBottomRight" onClick = {() => DeleteTracking()}>Stop Tracking</button>
        )}
      </div> 
    </> 
  );
}
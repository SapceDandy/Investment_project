import Link from "next/link";
import { firestore } from "../library/firebase"
import { UserContext } from "../library/context";
import { useContext, useState } from "react";
import { collectionGroup, deleteDoc, doc } from "firebase/firestore";
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function SubCommentsFeed({subComments}) {
    return (subComments?.length != 0) ? subComments?.map((subComments) => <Comment subComments = {subComments} />) : <div style = {{marginBottom: "2rem"}}>There are currently no subcomments... but you can be the first!</div>;
}

function DeleteCommentButton({ subCommentRef }) {
    const deleteComment = async () => {
        const doIt = confirm('are you sure!');
        if (doIt) {
        await deleteDoc(subCommentRef);
        toast('Comment annihilated ', { icon: '🗑️' });
        }
    };

    return (
        <button onClick={deleteComment}>
        Delete
        </button>
    );
}


function Comment({ subComments }) {
    const subCommentRef = doc(firestore, "users", subComments?.uid, "posts", subComments?.slug, "comments", subComments?.lastPost, "subComments", subComments?.subCommentId)
    const { user } = useContext(UserContext);

    const date = (typeof subComments?.createdAt === 'number') ? new Date(subComments?.createdAt) : subComments?.createdAt?.toDate();
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
            <div className = "wholeFeedSubComments">
                <div className = "topLevelOfComment">
                    <span className = "spanLeft">{subComments.subComment}</span>
                    <Link href = {`/${subComments.username}`}>
                        <span className = "commentUsername spanRight">@{subComments.username}</span>
                    </Link>
                </div>


                <div className = "bottomLevelOfComment">
                    <span className = "spanLeft">{`${monthString} ${day}, ${year} @ ${hours}:${minutes} ${amOrPM}`}</span>
                    {/*<footer>
                        <span>
                            {words} words. {read} min read
                        </span>
                        <span>💕 {post.heartCount} Likes</span>
                    </footer>*/}

                    {console.log("User ID: ", user.uid)}
                    {console.log("Sub ID: ", subComments.uid)}

                    {(user.uid === subComments.currentUserId) && (
                        <div className = "adminFeed spanRight">
                            <DeleteCommentButton subCommentRef={subCommentRef} />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
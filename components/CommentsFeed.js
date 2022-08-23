import Link from "next/link";
import { firestore } from "../library/firebase"
import { UserContext } from "../library/context";
import { useContext } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function CommentsFeed({ comments }) {
    console.log(comments)
    return (comments?.length != 0) ? comments?.map((comments) => <Comment comments = {comments} />) : <div style = {{marginBottom: "2rem"}}>There are currently no comments... but you can be the first!</div>;
}

function DeleteCommentButton({ commentsRef }) {
    const deleteComment = async () => {
        const doIt = confirm('are you sure!');
        if (doIt) {
        await deleteDoc(commentsRef);
        toast('Comment annihilated ', { icon: '🗑️' });
        }
    };

    return (
        <button onClick={deleteComment}>
        Delete
        </button>
    );
}


function Comment({ comments }) {
    const commentsRef = doc(firestore, "users", comments.uid, "posts", comments.slug, "comments", comments.commentId)
    const { user } = useContext(UserContext);

    const date = (typeof comments?.createdAt === 'number') ? new Date(comments?.createdAt) : comments?.createdAt?.toDate();
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
        <div className = "wholeFeedComments">
            <div className = "topLevelOfComment">
                <span className = "spanLeft">{comments.comment}</span>
                <Link href = {`/${comments.username}`}>
                    <span className = "commentUsername spanRight">@{comments.username}</span>
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

                {user && (
                    <div className = "adminFeed spanRight">
                        <DeleteCommentButton commentsRef={commentsRef} />
                    </div>
                )}
            </div>
        </div>
    )
}
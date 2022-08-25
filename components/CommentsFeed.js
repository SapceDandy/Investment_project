import Link from "next/link";
import { firestore, auth } from "../library/firebase";
import { UserContext } from "../library/context";
import { useContext, useState } from "react";
import { serverTimestamp, setDoc, deleteDoc, doc, collection, query, orderBy } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import SubCommentsFeed from "../components/SubCommentsFeed";
import uniqid from 'uniqid';
import toast from 'react-hot-toast';

export default function CommentsFeed({ comments }) {
    return (comments?.length != 0) ? comments?.map((comments) => <Comment comments = {comments} />) : <div style = {{marginBottom: "2rem"}}>There are currently no comments... but you can be the first!</div>;
}

function DeleteCommentButton({ commentRef }) {
    const deleteComment = async () => {
        const doIt = confirm('are you sure!');
        if (doIt) {
        await deleteDoc(commentRef);
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
    const commentRef = doc(firestore, "users", comments?.uid, "posts", comments?.slug, "comments", comments?.commentId);
    const { user } = useContext(UserContext);
    const [userReplied, setUserReplied] = useState(false);
    const [showSubs, setShowSubs] = useState(false);


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
        <>
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
                            <button style = {{background: (showSubs) ? "dimgrey" : null}} onClick = {() => (showSubs) ? setShowSubs(false) : setShowSubs(true)}>Comments {/*(counter !== 0) ? `${counter}` : null*/}</button>
                            <button style = {{background: (userReplied) ? "dimgrey" : null}} onClick = {() => (userReplied) ? setUserReplied(false) : setUserReplied(true)}>Reply</button>
                            <DeleteCommentButton commentRef = {commentRef} />
                        </div>
                    )}
                </div>
            </div>
            <div>
                {showSubs && (
                    <div className = "createNewSubCommentWrapperReplies">
                        <ReplyList comments = {comments} />
                    </div>
                )}
                {userReplied && (
                    <div>
                        <Reply comments = {comments} />
                    </div>
                )}
            </div>
        </>
    )
}

function ReplyList({comments}) {
    const ref = collection(firestore, "users", comments.uid, "posts", comments.slug, "comments", comments.commentId, "subComments")
    const subCommentsQuery = query(ref, orderBy("createdAt", "desc"))
    
    const [querySnapshot] = useCollection(subCommentsQuery);
    
    const subComments = querySnapshot?.docs.map((doc) => doc.data());
    
    return (
        <>
            <div>
                <SubCommentsFeed subComments = {subComments} />
            </div>
        </>
    );
}


function Reply({comments}) {
    const { username } = useContext(UserContext);
    const [subComment, setSubComment] = useState('');
    const subCommentId = uniqid();
    const isValid = subComment.length !== 0;

    const createSubComment = async (e) => {
        e.preventDefault();
        const currentUserId = auth.currentUser.uid;
        const slug = comments.slug;
        const lastPost = comments.commentId;
        const uid = comments.uid;
        const ref = doc(firestore, "users", comments.uid, "posts", comments.slug, "comments", comments.commentId, "subComments", `${subCommentId}`);
        
        const today = new Date();
        const currentDate = `${today.getFullYear()}-${today.getDate()}-${(today.getMonth()+1)}`;
        const monthsDict = {"1": "January", "2": "February", "3": "March", "4": "April", "5": "May", "6": "June", "7": "July", "8": "August", "9": "September", "10": "October", "11": "November", "12": "December"};
        const dayValue = currentDate.substring(5, 7);
        const monthNumber = (currentDate.length != 9) ? currentDate.substring(8, 10) : currentDate.substring(8, 9);
        const monthString = monthsDict[monthNumber];
        const yearValue = currentDate.substring(0, 4);

        const data = {
            subComment,
            subCommentId,
            currentUserId,
            lastPost,
            slug,
            uid,
            username,
            year: parseInt(yearValue),
            day: parseInt(dayValue),
            month: `${monthString}`,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            heartCount: 0,
        };

        await setDoc(ref, data);

        toast.success('Comment created!');

        setSubComment('');
    };

    return (
        <>
            <div className = "createNewSubCommentWrapperBottomSpacing">
                <form className = "createNewSubCommentWrapper" onSubmit = {createSubComment}>
                    <input
                        value = {subComment}
                        onChange={(e) => setSubComment(e.target.value)}
                        placeholder="Type comment here..."
                    />

                    <button type="submit" disabled={!isValid} >
                        Create
                    </button>
                </form>
            </div>
        </>
    )
}

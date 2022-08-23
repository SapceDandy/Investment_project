import Link from "next/link";
import { firestore } from "../library/firebase"
import { UserContext } from "../library/context";
import { useContext } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function CommentsFeed({ comments, admin }) {
    return (comments) ? comments.map((comments) => <Comment comments = {comments} admin = {admin} />) : null;
}

function DeleteCommentButton({ commentsRef }) {
    const router = useRouter();

    const deleteComment = async () => {
        const doIt = confirm('are you sure!');
        if (doIt) {
        await deleteDoc(commentsRef);
        toast('Comment annihilated ', { icon: '🗑️' });
        }
        router.reload()
    };

    return (
        <button onClick={deleteComment}>
        Delete
        </button>
    );
}


function Comment({ comments, admin = false }) {
    const commentsRef = doc(firestore, "users", comments.uid, "posts", comments.slug, "comments", comments.commentId)

    const { user, username } = useContext(UserContext);

    return (
        <div className = "wholeFeed">
            <div className = "topOfFeedCard">
                <a className = "feedCardTitle">
                    <h2>{comments.comment}</h2>
                </a>
            </div>

            <div className = "postStatusWrap">
                {/*<footer>
                    <span>
                        {words} words. {read} min read
                    </span>
                    <span>💕 {post.heartCount} Likes</span>
                </footer>*/}

                {user && (
                    <div className = "adminFeed">
                        <DeleteCommentButton commentsRef={commentsRef} />
                    </div>
                )}
            </div>
        </div>
    )
}
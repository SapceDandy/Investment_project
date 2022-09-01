import Link from "next/link";
import { firestore } from "../library/firebase";
import { UserContext } from "../library/context";
import { useContext } from "react";
import { deleteDoc, doc, getDocs } from "firebase/firestore";
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function CurrentFeed({ currentPost, admin }) {
    return currentPost ? currentPost.map((post) => <PostItem post = {post} key = {post?.slug} admin = {admin} />) : null;
}

function DeletePostButton({ postRef }) {
    //const router = useRouter();

    const deletePost = async () => {
        const doIt = confirm('are you sure!');
        if (doIt) {
        await deleteDoc(postRef);
        toast('post annihilated ', { icon: '🗑️' });
        }
        //router.reload()
    };

    return (
        <button onClick={deletePost}>
        Delete
        </button>
    );
}

function PostItem({ post, admin = false }) {
    const postRef = doc(firestore, "users", post?.uid, "posts", post?.slug);
    const lastUser = doc(firestore, "users", post?.uid)
    const lastUserDoc = useDocumentData(lastUser);

    const { user, username } = useContext(UserContext);
    let tracked = null;
    let getTracking = null;

    if (!(!user)) {
        getTracking = doc(firestore, "trackPost", user?.uid, "tracking", post?.slug);
    }

    [tracked] = useDocumentData((!(!user)) ? getTracking : null);

    return (
        <div className = "wholeFeed">
            <div className = "topOfFeedCard">
                {(post?.published) ? (<Link href={`/${post?.username}/${post?.slug}`}>  
                <a className = "feedCardTitle">
                    <h2>{post?.title}</h2>
                </a>
                </Link>) : (<a className = "feedCardTitle">
                                <h2>{post?.title}</h2>
                            </a>)}
                <Link href = {`/${post?.username}`}> 
                    <div className = "userInfo">
                        {(tracked?.slug === post?.slug) && <span style = {{color: "green", marginRight: ".5rem"}}>Tracking</span>}
                        <img style = {{ width: "30px", height: "30px", borderRadius: "50px"}} src = {(lastUserDoc[0]?.photoURL) ? lastUserDoc[0]?.photoURL : "Banana.jpg"}/>     
                        <a>
                            <strong>@{post?.username}</strong>
                        </a>   
                    </div>
                </ Link>
            </div>

            {(post?.published) && (<Link href={`/${post?.username}/${post?.slug}`}>
                <div className = "feedLink"></div>
            </Link>)}

            <div className = "feedHeader">
                {post?.header}
            </div>

            <div className = "postStatusWrap">
                <div className = "postStatus" style = {{background: (post?.status === "investor") ? "red": (post?.status === "mentor") ? "orange" : (post.status === "investment") ? "blue": "grey"}}>
                    {post?.status}
                </div>
            </div>
        </div>
    )
}
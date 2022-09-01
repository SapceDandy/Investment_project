import Link from "next/link";
import { firestore } from "../library/firebase";
import { UserContext } from "../library/context";
import { useContext, useState } from "react";
import { deleteDoc, doc, getDocs } from "firebase/firestore";
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Loader from "./Loader";

export default function Feed({ posts, admin, userPage }) {
    return posts ? posts.map((post) => <PostItem post = {post} key = {post?.slug} admin = {admin} userPage = {userPage}/>) : null;
}

function PostItem({ post, admin = false, userPage = false}) {
    const postRef = doc(firestore, "users", post?.uid, "posts", post?.slug);
    const lastUser = doc(firestore, "users", post?.uid)
    const lastUserDoc = useDocumentData(lastUser);
    const [loading, setLoading] = useState(false)
    const [isntDeleted, setIsntDeleted] = useState(true)

    const { user, username } = useContext(UserContext);
    let tracked = null;
    let getTracking = null;

    if (!(!user)) {
        getTracking = doc(firestore, "trackPost", user?.uid, "tracking", post?.slug);
    }

    [tracked] = useDocumentData((!(!user)) ? getTracking : null);

    function DeletePostButton() {
        //const router = useRouter();
    
        const deletePost = async () => {
            const doIt = confirm('are you sure!');
            if (doIt) {
                await deleteDoc(postRef);
                toast('post annihilated ', { icon: '🗑️' });
                setIsntDeleted(false)
            }
            //router.reload()
        };
    
        return (
            <button onClick={deletePost}>
                Delete
            </button>
        );
    }

    return (
        <div className = "wholeFeed">
            <div className = "topOfFeedCard">
                {(post?.published) ? (<Link href={`/${post?.username}/${post?.slug}`}>  
                <a className = "feedCardTitle" onClick = {() => setLoading(true)}>
                    <h2>{post?.title}</h2>
                    <div style = {{display: "flex", marginLeft: "1rem"}}>
                        <Loader show = {loading}/>
                    </div>
                </a>
                </Link>) : (<a className = "feedCardTitle">
                                <h2>{post?.title}</h2>
                            </a>)}
                <Link href = {(!(!(user))) ? `/${post?.username}` : "/enter"}> 
                    <div className = "userInfo">
                        {(tracked?.slug === post?.slug) && <span style = {{color: "green", marginRight: ".5rem"}}>Tracking</span>}
                        <img style = {{ width: "30px", height: "30px", borderRadius: "50px"}} src = {(lastUserDoc[0]?.photoURL) ? lastUserDoc[0]?.photoURL : "Banana.jpg"} />     
                        <a>
                            <strong>@{post?.username}</strong>
                        </a>   
                    </div>
                </ Link>
            </div>

            {(post?.published) && (isntDeleted) && (<Link href={`/${post?.username}/${post?.slug}`}>
                <div className = "feedLink" onClick = {() => setLoading(true)}></div>
            </Link>)}

            <div className = "feedHeader">
                {post?.header}
            </div>

            <div className = "postStatusWrap">
                <div className = "postStatus" style = {{background: (post?.status === "investor") ? "red": (post?.status === "mentor") ? "orange" : (post.status === "investment") ? "blue": "grey"}}>
                    {post?.status}
                </div>
            

                {/*<footer>
                    <span>
                        {words} words. {read} min read
                    </span>
                    <span>💕 {post.heartCount} Likes</span>
                </footer>*/}

                {(user?.uid === post?.uid) && (isntDeleted) && (
                    <div className = "adminFeed">
                        {admin && ((post?.published) ? <p style = {{color: "green"}}>Live</p> : <p style = {{color: "red"}}>Unpublished</p>)}
                        <Link href={`/admin/${post?.slug}`}>
                            <h3>
                                <button>Edit</button>
                            </h3>
                        </Link>
                        {(!userPage) && (<DeletePostButton />)}
                    </div>
                )}
                {(user?.uid === post?.uid) && (!isntDeleted) && (
                    <div className = "adminFeed">
                        <button disabled>Post Deleted</button>
                    </div>
                )}
            </div>
        </div>
    )
}
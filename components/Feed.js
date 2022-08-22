import Link from "next/link";
import { firestore } from "../library/firebase"
import { UserContext } from "../library/context";
import { useContext } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function Feed({ posts, admin }) {
    return posts ? posts.map((post) => <PostItem post = {post} key = {post.slug} admin = {admin} />) : null;
}

function DeletePostButton({ postRef }) {
    const router = useRouter();

    const deletePost = async () => {
        const doIt = confirm('are you sure!');
        if (doIt) {
        await deleteDoc(postRef);
        toast('post annihilated ', { icon: '🗑️' });
        }
        router.reload()
    };

    return (
        <button onClick={deletePost}>
        Delete
        </button>
    );
}

function PostItem({ post, admin = false }) {
    const postRef = doc(firestore, "users", post.uid, "posts", post.slug)

    const { user, username } = useContext(UserContext);

    return (
        <div className = "wholeFeed">
            <div className = "topOfFeedCard">
                <Link href={`/${post.username}/${post.slug}`}>  
                    <a className = "feedCardTitle">
                        <h2>{post.title}</h2>
                    </a>
                </Link>

                <Link href = {`/${post.username}`}> 
                    <div className = "userInfo">
                        <img style={{ width: "30px", height: "30px", borderRadius: "50px"}} src = {user?.photoURL} />     
                            <a>
                                <strong>@{post.username}</strong>
                            </a>   
                    </div>
                </ Link>
            </div>

            <Link href={`/${post.username}/${post.slug}`}>
                <div className = "feedLink"></div>
            </Link>

            <div className = "feedHeader">
                    {post.header}
            </div>

            <div className = "postStatusWrap">
                <div className = "postStatus" style = {{background: (post.status === "investor") ? "red": (post.status === "mentor") ? "orange" : (post.status === "investment") ? "blue": "grey"}}>
                    {post.status}
                </div>
            

                {/*<footer>
                    <span>
                        {words} words. {read} min read
                    </span>
                    <span>💕 {post.heartCount} Likes</span>
                </footer>*/}

                {user && (
                    <div className = "adminFeed">
                        {admin && ((post.published) ? <p style = {{color: "green"}}>Live</p> : <p style = {{color: "red"}}>Unpublished</p>)}
                        <Link href={`/admin/${post.slug}`}>
                            <h3>
                                <button>Edit</button>
                            </h3>
                        </Link>
                        <DeletePostButton postRef={postRef} />
                    </div>
                )}
            </div>
        </div>
    )
}
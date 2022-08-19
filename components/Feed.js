import Link from "next/link";
import { UserContext } from "../library/context";
import { useContext } from "react";

export default function Feed({ posts, admin }) {
    return posts ? posts.map((post) => <PostItem post = {post} key = {post.slug} admin = {admin} />) : null;
}

function PostItem({ post, admin = false }) {
    {/*const words = post?.content.trim().split(/\s+/g).length;
    const read = (words/ 100 + 1).toFixed(0);*/}

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
                    <div className = "postStatus" style = {{background: (post.status === "investor") ? "red": (post.status === "mentor") ? "orange" : "blue"}}>
                        #{post.status}
                    </div>
                

                    {/*<footer>
                        <span>
                            {words} words. {read} min read
                        </span>
                        <span>💕 {post.heartCount} Likes</span>
                    </footer>*/}

                    {admin && (
                        <div className = "adminFeed">
                            {post.published ? <p style = {{color: "green"}}>Live</p> : <p style = {{color: "red"}}>Unpublished</p>}
                            <Link href={`/admin/${post.slug}`}>
                                <h3>
                                <button>Edit</button>
                                </h3>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
    )
}
import Link from "next/link";
import { firestore } from "../library/firebase";
import { UserContext } from "../library/context";
import { useContext, useState, useRef } from "react";
import { deleteDoc, doc, getDocs } from "firebase/firestore";
import toast from 'react-hot-toast';

export default function FollowFeed({ currentPost, admin }) {
    return currentPost ? currentPost.map((post) => <PostItem post = {post} key = {post?.slug} admin = {admin} />) : null;
}

function PostItem({ post, admin = false }) {
    const [isFollowing, setIsFollowing] = useState(true);
    const { username } = useContext(UserContext);

    const postRef = doc(firestore, "Following", username, "BeingFollowed", post?.username);

    function UnFollowButton() {

        const unfollow = async () => {   
            setIsFollowing(false);
            await deleteDoc(postRef);
            toast(`You have unfollowed @${post?.username}`, { icon: '🗑️' });
        };
    
        return (
            <button onClick = {unfollow}>
                Unfollow
            </button>
        );
    }

    return (
        <div className = "wholeFeedFollowFeed">
            <div className = "topOfFeedCardFollowFeed">
                <a className = "feedCardTitle">
                    <h2>{(!post?.displayName) ? (post?.username) : post?.displayName}</h2>
                </a>
                <Link href = {`/${post?.username}`}> 
                    <div className = "userInfo">
                        <img style = {{ width: "30px", height: "30px", borderRadius: "50px"}} src = {(post?.photoURL) ? post?.photoURL : "Banana.jpg"} />     
                        <a>
                            <strong>@{post?.username}</strong>
                        </a>   
                    </div>
                </ Link>
                {console.log(isFollowing)}
                {(isFollowing === true) && (<div className = "unFollowButtonWrapper">
                    <UnFollowButton />
                </div>)}
                {(isFollowing === false) && (<div className = "unFollowButtonWrapper">
                    <button disabled>Unfollowed</button>
                </div>)}
            </div>
        </div>
    )
}
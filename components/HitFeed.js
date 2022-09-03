import Link from "next/link";
import { firestore } from "../library/firebase";
import { doc, deleteDoc} from "firebase/firestore";
import { UserContext } from "../library/context";
import { useContext } from "react";
import { useRouter } from 'next/router';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import toast from 'react-hot-toast';

export function Hit({ hit }) {
    const { user, username } = useContext(UserContext);
    const lastUser = doc(firestore, "users", hit?.uid)
    const lastUserDoc = useDocumentData(lastUser);
    const postRef = doc(firestore, "users", hit?.uid, "posts", hit.slug)
    return (
        <>
            {hit?.published === true && (<div className = "wholeFeed">
                <div className = "topOfFeedCard">
                    <Link href={`/${hit?.username}/${hit?.slug}`}>  
                        <a className = "feedCardTitle">
                            <h2>{hit.title}</h2>
                        </a>
                    </Link>

                    <Link href = {`/${hit?.username}`}> 
                        <div className = "userInfo">
                            <img style={{ width: "30px", height: "30px", borderRadius: "50px"}} src = {(!(!lastUserDoc[0]?.photoURL)) ? lastUserDoc[0]?.photoURL : "Banana.jpg"} />     
                                <a>
                                    <strong>@{hit?.username}</strong>
                                </a>   
                        </div>
                    </ Link>
                </div>

                <Link href={`/${hit?.username}/${hit?.slug}`}>
                    <div className = "feedLink"></div>
                </Link>

                <div className = "feedHeader">
                    {hit?.header}
                </div>

                <div className = "postStatusWrap">
                    <div className = "postStatus" style = {{background: (hit?.status === "investor") ? "red": (hit?.status === "mentor") ? "orange" : (hit?.status === "investment") ? "blue": "grey"}}>
                        {hit.status}
                    </div>

                    {user && (
                        <div className = "adminFeedHit">
                            <Link href={`/admin/${hit.slug}`}>
                                <h3>
                                    <button>Edit</button>
                                </h3>
                            </Link>
                            <DeletePostButton postRef={postRef}  onClick = {() => router.reload()}/>
                        </div>
                    )}
                </div>
            </div>)}
        </>
    )
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
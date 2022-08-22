import Link from "next/link";
import { UserContext } from "../library/context";
import { useContext } from "react";

export function Hit({ hit }) {
    const { user } = useContext(UserContext);

    return (
        <>
            {hit.published === true && (<div className = "wholeFeed">
                <div className = "topOfFeedCard">
                    <Link href={`/${hit.username}/${hit.slug}`}>  
                        <a className = "feedCardTitle">
                            <h2>{hit.title}</h2>
                        </a>
                    </Link>

                    <Link href = {`/${hit.username}`}> 
                        <div className = "userInfo">
                            <img style={{ width: "30px", height: "30px", borderRadius: "50px"}} src = {user?.photoURL} />     
                                <a>
                                    <strong>@{hit.username}</strong>
                                </a>   
                        </div>
                    </ Link>
                </div>

                <Link href={`/${hit.username}/${hit.slug}`}>
                    <div className = "feedLink"></div>
                </Link>

                <div className = "feedHeader">
                    {hit.header}
                </div>

                <div className = "postStatusWrap">
                    <div className = "postStatus" style = {{background: (hit.status === "investor") ? "red": (hit.status === "mentor") ? "orange" : (hit.status === "investment") ? "blue": "grey"}}>
                        {hit.status}
                    </div>

                    {user && (
                        <div className = "adminFeed">
                            {/*admin && ((hit.published) ? <p style = {{color: "green"}}>Live</p> : <p style = {{color: "red"}}>Unpublished</p>)*/}
                            <Link href={`/admin/${hit.slug}`}>
                                <h3>
                                    <button>Edit</button>
                                </h3>
                            </Link>
                            {/*<DeletePostButton postRef={postRef} />*/}
                        </div>
                    )}
                </div>
            </div>)}
        </>
    )
}
import Link from "next/link";
import { useContext, useRef, useEffect, forwardRef } from "react";
import { UserContext } from "../library/context";
import { auth } from '../library/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function Navbar({forwardedRef}) {
    const [ ref, ref2, ref3, ref4] = forwardedRef;
    
    const { user, username } = useContext(UserContext);
    const router = useRouter();

    const signOutNow = () => {
        signOut(auth);
        router.reload();
    }

    return (
        <nav className = "navbar">
            <ul style = {{columnGap: !username ? "calc(100vw - 300px)" : "calc(100vw - 500px)"}}>
                <li>
                    <Link href = "/">
                        <button className = "btn-logo" ref = {ref}>Investment App</button>
                    </Link>
                </li>

                {username && (
                    <>
                        <div>
                            <li>
                                <button onClick={signOutNow} ref = {ref2}> 
                                        Sign-out 
                                </button>
                            </li>
                            <li>
                            <Link href = "/admin">
                                <button ref = {ref3}>Create Post</button>
                            </Link>
                            </li>
                            <li>
                            <Link href = {`/${username}`}>
                                <img src = {(user?.photoURL) ? user?.photoURL : "Banana.jpg"} ref = {ref4} />
                            </Link>
                            </li>
                        </div>
                    </>
                )}

                {!username && (
                    <li>
                        <Link href = "/enter">
                            <button ref = {ref2}>Log-in</button>
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    )
}
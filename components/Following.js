import Link from "next/link";
import { firestore } from "../library/firebase";
import { UserContext } from "../library/context";
import { useContext } from "react";
import { deleteDoc, doc, getDocs, collection } from "firebase/firestore";
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function Following({user}) {
    console.log(user)
    /*const getFollowing  = collection(firestore, "Following", user.user.username, "BeingFollowed");
    const following = (await getDocs(getFollowing)).docs.map((docs) => docs.data());
    return (
        (following.length >= 1) ? (following.map((follow) => <FollowingItems follow = {follow}/>)) : null
    )*/
}

function FollowingItems({follow}) {

}
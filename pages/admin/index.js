import AuthCheck from "../../components/AuthCheck";
import Feed from '../../components/Feed';
import { UserContext } from '../../library/context';
import { firestore, auth } from '../../library/firebase';
import { serverTimestamp, query, collection, orderBy, setDoc, doc } from 'firebase/firestore';

import { useContext, useState } from 'react';
import { useRouter } from 'next/router';

import { useCollection } from 'react-firebase-hooks/firestore';
import kebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';

export default function AdminPostsPage(props) {
    return (
        <main>
            <AuthCheck>
                <PostList />
                <CreateNewPost />
            </AuthCheck>
        </main>
    )
}

function PostList() {
  const ref = collection(firestore, 'users', auth.currentUser.uid, 'posts')
  const postQuery = query(ref, orderBy("published"), orderBy("createdAt", "desc"))

  const [querySnapshot] = useCollection(postQuery);

  const posts = querySnapshot?.docs.map((doc) => doc.data());

  return (
    <>
      <div className = "wrapper">
          <h1 style={{position: "fixed", top: "3rem", zIndex: 3, background: "lightgrey", width: "100%", textAlign: "center", paddingTop: "1rem", paddingBottom: "1rem"}}>Manage your Posts</h1>
        <div style = {{marginTop: "5rem"}}>
          <Feed posts = {posts} admin/>
        </div>
      </div>
    </>
  );
}
  
function CreateNewPost() {
  const router = useRouter();
  const { username } = useContext(UserContext);
  const [title, setTitle] = useState('');

  const slug = encodeURI(kebabCase(title));

  const isValid = title.length > 3 && title.length < 100;

  const createPost = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser.uid;
    const ref = doc(firestore, 'users', uid, 'posts', slug);
    
    const today = new Date();
    const currentDate = `${today.getFullYear()}-${today.getDate()}-${(today.getMonth()+1)}`;
    const monthsDict = {"1": "January", "2": "February", "3": "March", "4": "April", "5": "May", "6": "June", "7": "July", "8": "August", "9": "September", "10": "October", "11": "November", "12": "December"};
    const dayValue = currentDate.substring(5, 7);
    const monthNumber = (currentDate.length != 9) ? currentDate.substring(8, 10) : currentDate.substring(8, 9);
    const monthString = monthsDict[monthNumber];
    const yearValue = currentDate.substring(0, 4);

    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      status: "none",
      header: null,
      content: null,
      year: parseInt(yearValue),
      day: parseInt(dayValue),
      month: `${monthString}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0,
    };

    await setDoc(ref, data);

    toast.success('Post created!');

    router.push(`/admin/${slug}`);
  };

  return (
    <form className = "createNewPostWrapper" onSubmit={createPost}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title goes here..."
      />
      <button type="submit" disabled={!isValid}>
        Create
      </button>
    </form>
  );
}
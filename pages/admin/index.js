import AuthCheck from "../../components/AuthCheck";
import Feed from '../../components/Feed';
import { UserContext } from '../../library/context';
import { firestore, auth } from '../../library/firebase';
import { serverTimestamp, query, collection, orderBy, getFirestore, setDoc, doc } from 'firebase/firestore';

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
    const postQuery = query(ref, orderBy('createdAt'))
  
    const [querySnapshot] = useCollection(postQuery);
  
    const posts = querySnapshot?.docs.map((doc) => doc.data());
    console.log("Admin: ", postQuery) 
  
    return (
      <>
        <h1>Manage your Posts</h1>
        <Feed posts = {posts} admin/>
      </>
    );
  }
  
  function CreateNewPost() {
    const router = useRouter();
    const { username } = useContext(UserContext);
    const [title, setTitle] = useState('');
  
    // Ensure slug is URL safe
    const slug = encodeURI(kebabCase(title));
  
    // Validate length
    const isValid = title.length > 3 && title.length < 100;
  
    // Create a new post in firestore
    const createPost = async (e) => {
      e.preventDefault();
      const uid = auth.currentUser.uid;
      const ref = doc(firestore, 'users', uid, 'posts', slug);
  
      // Tip: give all fields a default value here
      const data = {
        title,
        slug,
        uid,
        username,
        published: false,
        All: true,
        investor: false,
        seeking: false,
        mentor: false,
        header: 'Header here...',
        content: 'Type here...',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        heartCount: 0,
      };
  
      await setDoc(ref, data);
  
      toast.success('Post created!');
  
      // Imperative navigation after doc is set
      router.push(`/admin/${slug}`);
    };
  
    return (
      <form onSubmit={createPost}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article Goes Here"
        />
        {/*<p>
          <strong>Slug:</strong> {slug}
        </p>*/}
        <button type="submit" disabled={!isValid}>
          Create New Post
        </button>
      </form>
    );
  }
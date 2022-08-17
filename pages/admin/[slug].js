import AuthCheck from '../../components/AuthCheck';
import { firestore, auth } from '../../library/firebase';
import { serverTimestamp, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

import { useState } from 'react';
import { useRouter } from 'next/router';

import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminPostEdit(props) {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
}

function PostManager() {
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { slug } = router.query;

  const postRef = doc(firestore, 'users', auth.currentUser.uid, 'posts', slug)

  const [post] = useDocumentData(postRef);

  return (
    <main>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm postRef = {postRef} defaultValues = {post} preview = {preview} />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button>Live view</button>
            </Link>
            <DeletePostButton postRef={postRef} />
          </aside>
        </>
      )}
    </main>
  );
}

function PostForm({ defaultValues, postRef, preview }) {
  const { register, handleSubmit, formState: {errors, isDirty, isValid}, reset, watch } = useForm({ defaultValues, mode: 'onChange' });

  //const { isValid, isDirty } = formState;

  const updatePost = async ({ content, published }) => {
    const payLoad = {
      content,
      published,
      updatedAt: serverTimestamp(),
    }
    //await setDoc(postRef, payLoad, {merge: true});
    await updateDoc(postRef, payLoad);
    /*postRef.update({
      content,
      published,
      updatedAt: serverTimestamp(),
    })*/

    reset({ content, published });

    toast.success('Post updated successfully!');
  };

  return (
    <>
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div>
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}

      <div>
        {/*<ImageUploader />*/}

        <textarea
          {...register("content", {
            maxLength: { 
              value: 20000, 
              message: 'content is too long' 
            },
            minLength: { value: 10, message: 'content is too short' },
            required: { value: true, message: 'content is required' },
          })}
        ></textarea>

        {errors.content && <p>{errors.content.message}</p>}

        <fieldset>
          <input name="published" type="checkbox" {...register("published")} />
          <label>Published</label>
        </fieldset>

        <button type="submit" disabled={!isDirty || !isValid}>
          Save Changes
        </button>
      </div>
    </form>
    </>
  );
}

function DeletePostButton({ postRef }) {
  const router = useRouter();

  const deletePost = async () => {
    const doIt = confirm('are you sure!');
    if (doIt) {
      await deleteDoc(postRef);
      router.push('/admin');
      toast('post annihilated ', { icon: '🗑️' });
    }
  };

  return (
    <button onClick={deletePost}>
      Delete
    </button>
  );
}
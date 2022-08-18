import AuthCheck from '../../components/AuthCheck';
import { firestore, auth } from '../../library/firebase';
import { serverTimestamp, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

import { useState, useEffect } from 'react';
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

            <PostForm postRef = {postRef} defaultValues = {post} preview = {preview} />
          </section>

          <aside>
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
  {/*const [state, setState] = useState(false);
  const [state2, setState2] = useState(false);
const [state3, setState3] = useState(false);*/}

  //console.log("S1: ", state, ",S2: ", state2, ",S3: ", state3);

  const updatePost = async ({ content, published, header, status}) => {
    const payLoad = {
      content,
      header,
      published,
      status,
      updatedAt: serverTimestamp(),
    }
    //await setDoc(postRef, payLoad, {merge: true});
    await updateDoc(postRef, payLoad);

    reset({ content, published, header, status});

    toast.success('Post updated successfully!');
  };

  {/*function S1() {
    setState(true);
    setState2(false);
    setState3(false);
  }

  function S2() {
    setState2(true);
    setState(false);
    setState3(false);
  } 

  function S3() {
    setState3(true);
    setState(false);
    setState2(false);
  }*/}

  return (
    <>
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div>
          <ReactMarkdown>{watch('header')}</ReactMarkdown>
        </div>
      )}

      <div>
        {/*<ImageUploader />*/}
        <textarea
          {...register("header", {
            maxLength: { 
              value: 150, 
              message: 'Header is too long' 
            },
            minLength: { value: 10, message: 'Header is too short' },
            required: { value: true, message: 'Header is required' },
          })}
        ></textarea>

        <textarea
          {...register("content", {
            maxLength: { 
              value: 20000, 
              message: 'Content is too long' 
            },
            minLength: { value: 10, message: 'Content is too short' },
            required: { value: true, message: 'Content is required' },
          })}
        ></textarea>

        {errors.content && <p>{errors.content.message}</p>}
        
        {/*<fieldset>

          <input type="checkbox" checked = {state} id = "investor" onClick = {() => S1()} {...register("investor")} />
          <label for = "investor">Investor</label>
        
          <input type="checkbox" checked = {state2} id = "seeking" onClick = {() => S2()} {...register("seeking")} />
          <label for = "seeking">Seeking Investment</label>

          <input type="checkbox" checked = {state3} id = "mentor" onClick = {() => S3()} {...register("mentor")} />
          <label for = "mentor">Mentor</label>

        </fieldset>*/}

        <fieldset>
          <h2>Type</h2>
          <input {...register("status", {
            required: { value: true, message: 'Type is required' },
          })}  type="radio" id = "investor" value = "investor" />
          <label for = "investor">Investor</label>

          <input {...register("status", {
            required: { value: true, message: 'Type is required' },
          })} type="radio" id = "seeking" value = "seeking" />
          <label for = "seeking">Seeking Investment</label>

          <input {...register("status", {
            required: { value: true, message: 'Type is required' },
          })} type="radio" id = "mentor" value = "mentor" />
          <label for = "mentor">Mentor</label>
        </fieldset>

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
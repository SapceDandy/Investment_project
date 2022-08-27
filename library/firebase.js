import { initializeApp, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore, collection, where, getDocs, query, limit } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAdh_qwPj0elO0rQg3aquE3Sc7UQ76xeWA",
  authDomain: "investment-project-e5f31.firebaseapp.com",
  projectId: "investment-project-e5f31",
  storageBucket: "investment-project-e5f31.appspot.com",
  messagingSenderId: "1002999613817",
  appId: "1:1002999613817:web:b26416d2e6a6872c90c7a8",
  measurementId: "G-TY4Y2BNYKE"
} 
 
function createFirebaseApp(config) {
  try {
    return getApp();
  } catch {
    return initializeApp(config);
  }
}

const firebaseApp = createFirebaseApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const googleAuthProvider = new GoogleAuthProvider();
export const gitHubAuthProvider = new GithubAuthProvider();

export const firestore = getFirestore(firebaseApp);

export const storage = getStorage(firebaseApp);
export const STATE_CHANGED = 'state_changed';

export async function getUser(username) {

  const q = query(
    collection(firestore, 'users'), 
    where('username', '==', username),
    limit(1)
  )

  const userDoc = ( await getDocs(q) ).docs[0];
  return userDoc;
}

export function postToJSON(doc) {
  const data = doc.data();
  return {
    ...data,
    createdAt: data?.createdAt.toMillis() || 0,
    updatedAt: data?.updatedAt.toMillis() || 0,
  };
}
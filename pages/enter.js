import { auth, firestore, googleAuthProvider } from "../library/firebase"
import { doc, writeBatch, getDoc, getFirestore } from 'firebase/firestore';
import { signInWithPopup, signInAnonymously, signOut, getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { UserContext } from "../library/context";
import { useEffect, useState, useCallback, useContext } from 'react';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';
import Index from "../pages/index";
import Link from "next/link";
import { async } from "@firebase/util";
//import { delay } from "lodash";

export default function EnterPage(props) {
    const { user, username } = useContext(UserContext);

    return(
      <main>
          {(!user) ? 
          <SignInButton /> :
          (!username) ?
          < UsernameForm />: 
          <Redirect to = "/" />
          }
      </main>
    )
}

function Redirect({ to }) {
  const router = useRouter();

  useEffect(() => {
    router.push(to);
  }, [to])
}

function SignInButton() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [seePassword, setSeePassword] = useState(false)
  const [passwordCheck, setPasswordCheck] = useState("")
  const [seePasswordCheck, setSeePasswordCheck] = useState(false)
  const auth = getAuth();

  const signInWithGoogle = async() => {
      await signInWithPopup(auth, googleAuthProvider);
  }

  async function onSubmit() {
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("Error Code: ", errorCode);
      console.log("Error Message: ", errorMessage);
    });
  }

  return (
    <div className = "signUpWrapper">
      <form className = "signUpForm">
        <div className = "signUpInfo">
          <label for = "email">Email</label>
          <input type = "text" id = "email" name = "Email" value = {email} onChange = {(e) => setEmail(e.target.value)}/>
        </div>
        {(email !== "") && !(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email)) && (<span style = {{color: "red"}}>You must enter a valid email</span>)}
        
        <div className = "signUpInfo">
          <label for = "password">Password</label>
          <div className = "passwordAndSee">
            <input type = {(seePassword) ? "text" : "password"} id = "password" name = "password" value = {password} onChange = {(e) => setPassword(e.target.value)} />
            <button type = "button" onClick={() => setSeePassword(!seePassword)}>See</button>
          </div>
        </div>

        <div className = "passwordInfo"> 
          <span>{`At least one digit [0-9]`}</span>
          <span>{`At least one lowercase character [a-z]`}</span>
          <span>{`At least one uppercase character [A-Z]`}</span>
          <span>{`At least one special character [*.!@#$%^&(){}[]:;<>,.?/~_+-=|\]`}</span>
          <span>{`At least 8 characters in length, but no more than 32`}</span>
        </div>

        {!(password.match(`^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[]:;<>,.?/~_+-=|\]).{8,32}$`)) && (password !== "") && (<span style = {{color: "red"}}>Your password must meet the requirements shown above</span>)}

        <div className = "signUpInfo">
          <label for = "passwordCheck">Password Check</label>
          <div className = "passwordAndSee">
            <input type = {(seePasswordCheck) ? "text" : "password"} id = "passwordCheck" name = "passwordCheck" value = {passwordCheck} onChange = {(e) => setPasswordCheck(e.target.value)} />
            <button type = "button" onClick={() => setSeePasswordCheck(!seePasswordCheck)}>See</button>
          </div>
        </div>

        {((password !== passwordCheck) && (passwordCheck !== "")) && (
          <span style = {{color: "red"}}>Theh information you entered in password must be the same as the information in password check</span>
        )}
        
        <div className = "submitSignUpForm">
          <button type = "submit" onClick = {() => onSubmit()}>Login</button>
        </div>
      </form>

      <button className = "goggleSingInBtn" onClick = {signInWithGoogle}>
          <img src = {'/google-png.png'} width="30px"/> Sign in with Google
      </button>
    </div>
  );
}

/*function SignOutButton() {
    return (
      <button style = {{background: "transparent", borderColor: "transparent"}} onClick = {() => signOut(auth)}/>
    )
}*/

function UsernameForm() {
  const [formValue, setFormValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, username } = useContext(UserContext);

  const onSubmit = async (e) => {
    e.preventDefault();

    // Create refs for both documents
    const userDoc = doc(getFirestore(), 'users', user.uid);
    const usernameDoc = doc(getFirestore(), 'usernames', formValue);

    // Commit both docs together as a batch write.
    const batch = writeBatch(getFirestore());
    batch.set(userDoc, { username: formValue, photoURL: user.photoURL, displayName: user.displayName });
    batch.set(usernameDoc, { uid: user.uid });

    await batch.commit();
  };

  const onChange = (e) => {
    // Force form value typed in form to match correct format
    const val = e.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    // Only set form value if length is < 3 OR it passes regex
    if (val.length < 3) {
      setFormValue(val);
      setLoading(false);
      setIsValid(false);
    }

    if (re.test(val)) {
      setFormValue(val);
      setLoading(true);
      setIsValid(false);
    }
  };

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue]);

  // Hit the database for username match after each debounced change
  // useCallback is required for debounce to work
  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const ref = doc(getFirestore(), 'usernames', username);
        const snap = await getDoc(ref);
        console.log('Firestore read executed!', snap.exists());
        setIsValid(!snap.exists());
        setLoading(false);
      }
    }, 500),
    []
  );

  return (
    <>
    {!username && (
        <section className = "chooseUserSection">
          <h3>Choose Username</h3>
          <form onSubmit={onSubmit}>
            <div>
              <input name="username" placeholder="myname" value={formValue} onChange={onChange} style = {{ border:  isValid ? "5px solid green" : "5px solid white"}}/>
              {/*<UsernameMessage username={formValue} isValid={isValid} loading={loading} />*/}
              <button type="submit" className="btn-green" disabled = {!isValid}>
                Choose
              </button>
            </div>
          </form>
        </section>
    )}
    </>
  );
}

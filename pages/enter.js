import { googleAuthProvider, gitHubAuthProvider } from "../library/firebase"
import { doc, writeBatch, getDoc, getFirestore } from 'firebase/firestore';
import { signInWithPopup, signInWithEmailAndPassword, getAuth, createUserWithEmailAndPassword, updateProfile  } from 'firebase/auth';
import { UserContext } from "../library/context";
import { useEffect, useState, useCallback, useContext } from 'react';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';
import Link from "next/link";
//import { delay } from "lodash";


export default function EnterPage(props) {
    //const checkForUsername = doc(firestore, "user")
    const { username, user } = useContext(UserContext);
    //const { alreadyUser, setAlready}
    //const timer = setTimeout(1000)
    console.log("User: ", user?.metadata?.creationTime.slice(0, 21))
    const currentT = new Date().toUTCString();
    console.log("Current: ", currentT.slice(0, 21))
    return(
      <main>
          {(!user) && (<SignInButton />)}
          {((!username)) && (user?.metadata?.creationTime.slice(0, 21) === currentT.slice(0, 21)) && (user) && (<UsernameForm username = {username}/>)} 
          {((user) && (username)) && (<Redirect to = "/" />)}
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logInEmail, setLogInEmail] = useState("");
  const [logInPassword, setLogInPassword] = useState("");
  const [seeLogInPassword, setSeeLogInPassword] = useState(false);
  const [seePassword, setSeePassword] = useState(false);
  const [passwordCheck, setPasswordCheck] = useState("");
  const [seePasswordCheck, setSeePasswordCheck] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("")
  const regexEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
  const regexPassword = new RegExp(`^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[.!$%&.?]).{8,32}$`);
  const auth = getAuth();

  const signInWithGoogle = async() => {
    await signInWithPopup(auth, googleAuthProvider)
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`${errorCode}: ${errorMessage}`)
    });
  }

  const signUp = async() => {
    await createUserWithEmailAndPassword(auth, email, password)
    .then((currentUser) => {
      return updateProfile(currentUser.user, {
        displayName: `${firstName} ${lastName}`
      })
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`${errorCode}: ${errorMessage}`)
    });
  }

  const signIn = async() => {
    await signInWithEmailAndPassword(auth, logInEmail, logInPassword)
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`${errorCode}: ${errorMessage}`)
    });
  }

  const signInWithGitHub = async() => {
    await signInWithPopup(auth, gitHubAuthProvider)
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`${errorCode}: ${errorMessage}`)
    });
  }

  return (
    <div className = "signUpInWrapper">
      <div className = "formWrapper">
        <form className = "signUpForm">
          <h3>Sign-up</h3>
          <div className = "signUpInfo">
            <label for = "email">Email<span style ={{color: "red"}}>*</span></label>
            <input type = "text" id = "email" name = "Email" value = {email} onChange = {(e) => setEmail(e.target.value)}/>
          </div>
          {(email !== "") && !(regexEmail.test(email)) && (<span style = {{color: "red"}}>You must enter a valid email</span>)}

          <div className = "fullName">
            <div>
              <label for = "firstName">First Name<span style ={{color: "red"}}>*</span></label>
              <input type = "text" id = "firstName" name = "firstName" value = {firstName} onChange = {(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label for = "lastName">Last Name<span style ={{color: "red"}}>*</span></label>
              <input type = "text" id = "lastName" name = "lastName" value = {lastName} onChange = {(e) => setLastName(e.target.value)} />
            </div>
          </div>
          
          <div className = "signUpInfo">
            <label for = "password">Password<span style ={{color: "red"}}>*</span></label>
            <div className = "passwordAndSee">
              <input type = {(seePassword) ? "text" : "password"} id = "password" name = "password" value = {password} onChange = {(e) => setPassword(e.target.value)} />
              <button type = "button" style = {{background: (seePassword) ? "dimgrey" : null}} onClick={() => setSeePassword(!seePassword)} disabled = {(password === "")}>See</button>
            </div>
          </div>

            <span style = {{textAlign: "center"}}>{`At least one digit [0-9], one lowercase character [a-z], one uppercase character [A-Z], one special character .!$%&.?, and at least 8 characters in length, but no more than 32`}</span>

          {!(regexPassword.test(password)) && (password !== "") && (<span style = {{color: "red"}}>Your password must meet the requirements shown above</span>)}

          <div className = "signUpInfo">
            <label for = "passwordCheck">Password Check<span style ={{color: "red"}}>*</span></label>
            <div className = "passwordAndSee">
              <input type = {(seePasswordCheck) ? "text" : "password"} id = "passwordCheck" name = "passwordCheck" value = {passwordCheck} onChange = {(e) => setPasswordCheck(e.target.value)} />
              <button type = "button" style = {{background: (seePasswordCheck) ? "dimgrey" : null}} onClick={() => setSeePasswordCheck(!seePasswordCheck)} disabled = {(passwordCheck === "")}>See</button>
            </div>
          </div>

          {((password !== passwordCheck) && (passwordCheck !== "")) && (
            <span style = {{color: "red"}}>The information you entered in password must be the same as the information in password check</span>
          )}

          <button className = "submitSignUpForm" type = "button" onClick = {() => signUp()} disabled = {(password !== passwordCheck) || !(regexPassword.test(password)) || !(regexEmail.test(email))}>SignUp</button>
        </form>

        <form className = "signUpForm">
          <h3>Sign-in</h3>
          <div className = "signUpInfo">
            <label for = "logInEmail">Email</label>
            <input type = "text" id = "logInmail" name = "Email" value = {logInEmail} onChange = {(e) => setLogInEmail(e.target.value)}/>
          </div>
          
          <div className = "signUpInfo">
            <label for = "logInpassword">Password</label>
            <div className = "passwordAndSee">
              <input type = {(seeLogInPassword) ? "text" : "password"} id = "password" name = "password" value = {logInPassword} onChange = {(e) => setLogInPassword(e.target.value)} />
              <button type = "button" style = {{background: (seeLogInPassword) ? "dimgrey" : null}} onClick={() => setSeeLogInPassword(!seeLogInPassword)} disabled = {(logInPassword === "")}>See</button>
            </div>
          </div>

          <button className = "submitSignUpForm" type = "button" onClick = {() => signIn()} disabled = {(logInPassword === "") || (logInEmail === "")}>Login</button>
        </form>
      </div>

      <div style = {{display: "flex", flexDirection: "row", columnGap: "2vw"}}>
        <button className = "popUpSingInBtn" onClick = {signInWithGoogle}>
            <img src = {'/google-png.png'} width="30px"/> Sign in with Google
        </button>

        <button className = "popUpSingInBtn" onClick = {signInWithGitHub}>
            <img src = {'/github.png'} width="30px"/> Sign in with GitHub
        </button>
      </div>
    </div>
  );
}

function UsernameForm() {
  const [formValue, setFormValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, username } = useContext(UserContext);

  const onSubmit = async (e) => {
    e.preventDefault();

    const userDoc = doc(getFirestore(), 'users', user?.uid);
    const usernameDoc = doc(getFirestore(), 'usernames', formValue);

    const batch = writeBatch(getFirestore());
    batch.set(userDoc, { username: formValue, photoURL: (user?.photoURL) ? user?.photoURL : null, displayName: user?.displayName, uid: user.uid });
    batch.set(usernameDoc, { uid: user.uid });

    await batch.commit();
  };

  const onChange = (e) => {
    const val = e.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

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

export default function Profile({ user }) {
    console.log("Profile User: ", user)
    return(
        <div className = "userProfile">
            <img src={user.photoURL}/>
            <p>
                <i>@{user.username}</i>
            </p>
            <h1>{user.displayName}</h1>
        </div>
    )
}
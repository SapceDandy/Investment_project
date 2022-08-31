export default function Profile({ user }) {
    return(
        <div className = "userProfile">
            <img src={(user?.photoURL) ? user?.photoURL : "Banana.jpg"}/>
            <p>
                <i>@{user?.username}</i>
            </p>
            <h1>{user?.displayName}</h1>
        </div>
    )
}
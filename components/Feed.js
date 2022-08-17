import Link from "next/link";

export default function Feed({ posts, admin }) {
    return posts ? posts.map((post) => <PostItem post = {post} key = {post.slug} admin = {admin} />) : null;
}

function PostItem({ post, admin = false }) {
    const words = post?.content.trim().split(/\s+/g).length;
    const read = (words/ 100 + 1).toFixed(0);

    return (
        <div>
            <Link href = {`/${post.username}`}>
                <a>
                    <strong>By @{post.username}</strong>
                </a>
            </Link>

            <Link href={`/${post.username}/${post.slug}`}>
                <h2>
                <a>{post.title}</a>
                </h2>
            </Link>

            <footer>
                <span>
                    {words} words. {read} min read
                </span>
                <span>💕 {post.heartCount} Likes</span>
            </footer>

            {admin && (
                <>
                    <Link href={`/admin/${post.slug}`}>
                        <h3>
                        <button>Edit</button>
                        </h3>
                    </Link>

                    {post.published ? <p >Live</p> : <p >Unpublished</p>}
                </>
            )}
        </div>
    )
}
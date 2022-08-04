import 

export async function getStaticProps({ params }) {
    const { username, slug } = params;
    const userDoc = await getUserWithUsername(username);
}

export default function Post(props) {
    return (
        <main>

        </main>
    )
}
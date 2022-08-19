import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function PostContent({ post }) {
    const createdAt = typeof post?.createdAt === 'number' ? new Date(post.createdAt) : post.createdAt.toDate();
    const timeString = createdAt.toISOString();
    const monthsDict = {"01": "January", "02": "February", "03": "March", "04": "April", "05": "May", "06": "June", "07": "July", "08": "August", "09": "September", "10": "October", "11": "November", "12": "December"};
    const day = (timeString[8] != 0) ? timeString.substr(8, 2) : timeString.substr(9, 1);
    const monthNumber = timeString.substr(5, 2);
    const monthString = monthsDict[monthNumber];
    const year = timeString.substr(0, 4);
    const time = timeString.substr(12, 4)

    return (
        <div>
          <h1>{post?.title}</h1>
          <span>
            Written by{' '}
            <Link href={`/${post.username}/`}>
              <a style = {{fontWeight: "bold"}}>@{post.username}</a>
            </Link>{' '}
            on {`${monthString} ${day}, ${year} at ${time}`}
          </span>
          <ReactMarkdown>{post?.header}</ReactMarkdown>
          <ReactMarkdown>{post?.content}</ReactMarkdown>
          <ReactMarkdown>{post?.status}</ReactMarkdown>
        </div>
    );
}
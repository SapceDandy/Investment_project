import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function PostContent({ post }) {
    const date = (typeof post?.createdAt === 'number') ? new Date(post?.createdAt) : post?.createdAt?.toDate();
    const monthsDict = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"};
    const month = date?.getMonth() + 1;
    const monthString = monthsDict[month];
    const day = date?.getDate();
    const year = date?.getFullYear();
    let hours = date?.getHours();
    let amOrPM = (hours >= 12) ? "PM" : "AM";
    hours = (hours > 12) ? (hours - 12) : (hours === 0) ? 12 : hours;
    let minutes = date?.getMinutes();
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    
    return (
      <>
        <div className = "postContentTop">
          <div className = "postContentTitleWrapper">
            <h1>{post?.title}</h1>
          </div>
          <div className = "postContentUserWrapper">
            <span>
              <div>
                Written by {' '}
                <Link href={`/${post.username}/`}>
                  <a style = {{fontWeight: "bold"}}> @{post.username}</a>
                </Link>{' '}
              </div>
              <div>
                {`${monthString} ${day}, ${year} @ ${hours}:${minutes} ${amOrPM}`}
              </div>
            </span>
          </div>
        </div>
        <div className = "postContentSpan"><ReactMarkdown>{post?.header}</ReactMarkdown></div>
        <div className = "postContentSpan"><ReactMarkdown>{post?.content}</ReactMarkdown></div>
        <form className="createNewResponseWrapper">
          <label for = "response">If you are interested send a response</label><br />
          <input placeholder="Enter response here..." type = "text" id = "response" name = "response"></input>
          <input type = "submit" value = "Send" />
        </form>
        <span className = "postStatusSpan" style = {{color: (post?.status === "investor") ? "red" : (post?.status === "investment") ? "blue" : (post?.status === "mentor") ? "orange" : "lightgrey"}}>#<ReactMarkdown>{post?.status}</ReactMarkdown></span>
      </> 
    );
}
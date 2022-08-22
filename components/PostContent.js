import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function PostContent({ post }) {
    const createdAt = (typeof post?.createdAt === 'number') ? new Date(post.createdAt) : post.createdAt.toDate();
    const timeString = createdAt.toISOString();
    const monthsDict = {"01": "January", "02": "February", "03": "March", "04": "April", "05": "May", "06": "June", "07": "July", "08": "August", "09": "September", "10": "October", "11": "November", "12": "December"};
    const day = (timeString[8] != 0) ? timeString.substr(8, 2) : timeString.substr(9, 1);
    const monthNumber = timeString.substr(5, 2);
    const monthString = monthsDict[monthNumber];
    const year = timeString.substr(0, 4); 
    const time = timeString.substr(13, 3);
    
    const postHours = timeString.substr(12, 1);
    const utcHours = new Date().getUTCHours();
    const timeZoneHours = new Date().getHours();
    const timeZoneDifference = parseInt(utcHours) - parseInt(timeZoneHours);
    const amOrPm = ((parseInt(postHours) - timeZoneDifference) >= 0) ? "PM" : "AM";
    let actualHour = Math.abs(parseInt(postHours) + timeZoneDifference);
    actualHour = (actualHour === 0) ? 12 : actualHour;

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
                {`${monthString} ${day}, ${year} at ${actualHour}${time} ${amOrPm}`}
              </div>
            </span>
          </div>
        </div>
        <div className = "postContentSpan"><ReactMarkdown>{post?.header}</ReactMarkdown></div>
        <div className = "postContentSpan"><ReactMarkdown>{post?.content}</ReactMarkdown></div>
        <form>
          <label for = "response">If you are interested send a response</label><br />
          <input placeholder="Enter response here..." type = "text" id = "response" name = "response"></input>
          <input type = "submit" value = "Send" />
        </form>
        <span className = "postStatusSpan" style = {{color: (post?.status === "investor") ? "red" : (post?.status === "investment") ? "blue" : (post?.status === "mentor") ? "orange" : "lightgrey"}}>#<ReactMarkdown>{post?.status}</ReactMarkdown></span>
      </> 
    );
}
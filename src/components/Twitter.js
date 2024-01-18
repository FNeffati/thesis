import React, {useEffect, useState} from "react";
import "../styling/Twitter.css"


function Twitter({timeFrame, County, AccountTypeList, onTweetsFetched, onDateRangeFetched}) {
    const [tweets, setTweets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchTweets = () => {

        fetch('/get_tweets',
            {
                'method':'POST',
                headers : {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify([timeFrame, County, AccountTypeList])
            })
            .then((response) => response.json())
            .then((data) => {
                setTweets(data);
                onTweetsFetched(data);
                setCurrentPage(1);

                if (data.length > 0) {
                    const dates = data.map(tweet => new Date(tweet.time.$date)); // Assuming 'time' is the date field
                    const minDate = new Date(Math.min(...dates));
                    const maxDate = new Date(Math.max(...dates));
                    onDateRangeFetched(minDate, maxDate);
                }
            })
            .catch((error) => console.error(error));
    };

    useEffect(() => {
        fetchTweets();
    }, [timeFrame, County, AccountTypeList]);


    const [searchTerm, setSearchTerm] = useState('');

    const highlightText = (text, term) => {
        const regex = new RegExp(term, 'gi');
        return text.replace(regex, (match) => `<span class="highlight">${match}</span>`);
    };

    const filteredTweets = tweets.filter((tweet) =>
        tweet.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [tweetsPerPage] = useState(10);

    const indexOfLastTweet = currentPage * tweetsPerPage;
    const indexOfFirstTweet = indexOfLastTweet - tweetsPerPage;
    const currentTweets = filteredTweets.slice(indexOfFirstTweet, indexOfLastTweet);
    const totalPages = Math.ceil(filteredTweets.length / tweetsPerPage);


    const formatDate = (dateObj) => {
        let isoDateString;
        if (typeof dateObj === 'object' && dateObj.hasOwnProperty('$date')) {
            isoDateString = dateObj['$date'];
        } else {
            isoDateString = dateObj;
        }

        const date = new Date(isoDateString);
        if (isNaN(date.getTime())) {
            console.error("Invalid Date:", isoDateString);
            return "Invalid Date";
        }

        return date.toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };


    return(
        <div className="twitter_container">
            <div className="tweets_header">
                <input
                    className="tweet_search_bar"
                    type="text"
                    placeholder="Filter tweets"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="tweets_container">
                <ul>
                    {Array.isArray(currentTweets) && currentTweets.length > 0 ? (
                        currentTweets.map((tweet) => (
                            <div className="tweet">
                                <div className="tweet_top">
                                    <img
                                        src={tweet.image}
                                        alt={"#"}
                                        className="profile_image"
                                    />
                                    <a className="username" href={"http://www.x.com/" + tweet.username}>@{tweet.username}</a>
                                </div>

                                <div className="tweet_mid">
                                    <p
                                        className="tweet_text"
                                        dangerouslySetInnerHTML={{
                                            __html: highlightText(tweet.text, searchTerm),
                                        }}
                                    ></p>
                                </div>

                                <div className="tweet_bottom">
                                    <p className="tweet_time">{formatDate(tweet.time)}</p>
                                    <p className="tweet_location">{tweet.location}</p>
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="tweet_mid">
                            <p className="no_match">No Tweets match your filters.</p>
                        </div>
                    )}
                </ul>
            </div>
            <div className="pagination">
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
    )
}

export default Twitter;
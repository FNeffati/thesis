import React, {useState} from "react";
import TimeFrameSelector from "./TimeFrameSelector";
import Twitter from "./Twitter";
import "../styling/Body.css"
import WordCloud from "./WordCloud";
import FloridaMap from "./FloridaMap";
import MultiSelectDropdown from "./MultiSelectDropdown";
import DownloadButton from "./DownloadButton";
import DropDown from "./DropDown";




function Body() {

    const Account_Type_Options = ["Academic", "Government", "Media", "Other", "Tourism"]
    const County_Options = ["Pasco", "Pinellas", "Hillsborough", "Manatee", "Sarasota"]
    const Word_Cloud_Options = ["Geo Tags", "Non-Geo Tags"]

    const [SelectedTimeFrame, setTimeFrame] = useState("")
    const [selectedWordCloudOption, setWordCloudOption] = useState("")

    const [tweets, setTweets] = useState([]);
    const [tweetCounts, setTweetCounts] = useState([]);
    const [selectedAccountOptions, setAccountOptions] = useState([])
    const [selectedCountyOptions, setCountyOptions] = useState([])



    const handleTweets = (newTweets) => {
        setTweets(newTweets);
    };
    const handleTimeFrameChange = (start, end) => {
        setTimeFrame(start + " " + end)
    };

    const [dateRange, setDateRange] = useState({ minDate: null, maxDate: null });

    const handleDateRangeFetched = (minDate, maxDate) => {
        setDateRange({ minDate, maxDate });
    };

    const handleTweetsCounts = (counts) =>
    {
        setTweetCounts(counts)
    }


    const callback = (value, context) => {
        switch (context) {
            case "WordCloudOption":
                setWordCloudOption(value)
                break;
            case "CountyOptions":
                setCountyOptions(Array.from(value))
                break;
            case "AccountTypeOptions":
                setAccountOptions(Array.from(value))
                break;
            default:
                break;
        }
    };


    return(
        <div>

            <div className="filter_menus">
                <div className="filter_item">
                    <TimeFrameSelector
                        onTimeFrameChange={handleTimeFrameChange}
                        dateRange={dateRange}
                    />

                </div>
                <div>
                    <MultiSelectDropdown options={Account_Type_Options}
                                         title={"AccountTypeOptions"}
                                         callback={(value) => callback(value, "AccountTypeOptions")}/>
                </div>

                <div>
                    <MultiSelectDropdown options={County_Options}
                                         title={"CountyOptions"}
                                         callback={(value) => callback(value, "CountyOptions")}/>
                </div>

                <div>
                    <DownloadButton Tweets={tweets}/>
                </div>

            </div>

            <div className="App_Body">
                <div className="twitter_container">
                    <Twitter timeFrame={SelectedTimeFrame}
                             County={selectedCountyOptions}
                             AccountTypeList={selectedAccountOptions}
                             onTweetsFetched={handleTweets}
                             onDateRangeFetched={handleDateRangeFetched}/>
                </div>

                <div className="word_cloud_container">
                    <div>
                        <DropDown options={Word_Cloud_Options}
                                  title={"WordCloudOption"}
                                  callback={(value) => callback(value, "WordCloudOption")}/>
                    </div>

                    <WordCloud cloud_type={selectedWordCloudOption}
                               tweets={tweets}
                               onTweetsFetched={handleTweetsCounts}/>
                </div>

                <div className="Florida_map">
                    <FloridaMap tweetCounts={tweetCounts}/>
                </div>

            </div>
        </div>
    )
}

export default Body
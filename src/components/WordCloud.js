import React, {useEffect, useState} from "react";
import "../styling/WordCloud.css"
import ReactWordcloud from 'react-wordcloud';
import 'tippy.js/dist/tippy.css';





const WordCloud = ({cloud_type, tweets, onTweetsFetched}) => {

    const [words, setWords] = useState([]);

    const fetchTerms = () => {
        fetch('/get_terms',
            {
                'method':'POST',
                headers : {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify([cloud_type, tweets])
            })
            .then((response) => response.json())
            .then((data) => {
                setWords(data.value1)
                onTweetsFetched(data.value2)
            })
            .catch((error) => {
                console.error(error);
            });
    };

    useEffect(() => {
        if (tweets.length === 0) {
            setWords([{ text: 'NO TWEETS AVAILABLE', value: 64 }]);
        }
    }, [tweets]);

    useEffect(() => {
        if (tweets.length !== 0) {
            console.log("TERMS FETCHED")
            fetchTerms();
        }
    }, [tweets, cloud_type]);

    useEffect(() => {
        if (tweets.length !== 0 && words.length === 0) {
            setWords([{ text: 'NO HASHTAGS AVAILABLE', value: 64 }]);
        }
    }, [words, tweets]);

    const options = {
        rotations: 1,
        rotationAngles: [0],
        fontSizes: [15,60],

        colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"],
        enableTooltip: true,
        deterministic: false,
        fontFamily: "impact",
        fontStyle: "normal",
        fontWeight: "normal",
        padding: 1,
        scale: "sqrt",
        spiral: "archimedean",
        transitionDuration: 1000

    };
    const size = [500, 600];

    return (

        <div className="all">
            <ReactWordcloud
                words={words}
                options={options}
                size={size}
                padding={0}

            />
        </div>
    )
};

export default WordCloud


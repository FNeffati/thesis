import React from "react";
import "../styling/DownloadButton.css"

function DownloadButton({ Tweets }) {
    const download = () => {
        const jsonData = JSON.stringify(Tweets);

        const blob = new Blob([jsonData], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "tweets.json";

        a.click();

        window.URL.revokeObjectURL(url);
        a.remove();
    };

    return (
        <div className={"DownloadButton"}>
            <div onClick={download}>Download current dataset</div>
        </div>
    );
}

export default DownloadButton
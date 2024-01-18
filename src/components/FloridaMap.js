import React, {useEffect, useState} from 'react';
import {MapContainer, TileLayer, GeoJSON} from 'react-leaflet';
import floridaCounties from './geojson-fl-counties-fips.json';
import "../styling/FloridaMap.css"


const FloridaMap = ({ tweetCounts }) => {
    // const [, setHighlightedCounty] = useState(null);

    const normalizeTweetCounts = (tweetCounts) => {
        const maxCount = Math.max(...Object.values(tweetCounts));
        const normalizedCounts = {};

        for (const county in tweetCounts) {
            normalizedCounts[county] = tweetCounts[county] / maxCount;
        }

        return normalizedCounts;
    };

    const normalizedTweetCounts = normalizeTweetCounts(tweetCounts);

    const getColor = (normalizedCount) => {
        const intensity = Math.round(255 * normalizedCount);
        return `rgb(${255 - intensity}, ${0}, ${0})`;
    };

    const style = (feature) => {
        const countyName = feature.properties.NAME;
        const tweetCount = normalizedTweetCounts[countyName] || 0;
        const fillColor = getColor(tweetCount);

        return {
            fillColor: fillColor,
            fillOpacity: 0.9,
            color: 'white',
            weight: 1,
        };
    };

    const [hoverInfo, setHoverInfo] = useState({ show: false, county: '', x: 0, y: 0 });
    const onEachFeature = (county, layer) => {
        layer.on('mouseover', function (e) {
            const mapContainerRect = document.querySelector('.map_div').getBoundingClientRect();
            const x = e.originalEvent.clientX - mapContainerRect.left;
            const y = e.originalEvent.clientY - mapContainerRect.top;
            setHoverInfo({ show: true, county: county.properties.NAME, x: x, y: y });
        });

        layer.on('mouseout', function () {
            setHoverInfo({ show: false, county: '', x: 0, y: 0 });
        });
    };


    /*useEffect(() => {
        if (userSelectedCounty) {
            if (userSelectedCounty !== "All") {
                setHighlightedCounty(userSelectedCounty);
            }
        } else {
            setHighlightedCounty(null);
        }
    }, [userSelectedCounty]);*/

    // return (
    //     <div className="map_div">
    //         <MapContainer center={[27.766279, -82.686783]} zoom={8} style={{ height: 650, width: '100%' }}>
    //             <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    //             <GeoJSON
    //                 data={floridaCounties}
    //                 style={style}
    //             />
    //         </MapContainer>
    //     </div>
    // );

    return (
        <div className="map_div">
            <MapContainer center={[27.766279, -82.686783]} zoom={8} style={{ height: 650, width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <GeoJSON
                    data={floridaCounties}
                    style={style}
                    onEachFeature={onEachFeature}
                />
            </MapContainer>
            {hoverInfo.show && (
                <div
                    className="map-hover-popup"
                    style={{ left: hoverInfo.x+900, top: hoverInfo.y+200 }}
                >
                    {hoverInfo.county} - Tweets: {tweetCounts[hoverInfo.county] || 0}
                </div>
            )}

        </div>
    );
};


export default FloridaMap;

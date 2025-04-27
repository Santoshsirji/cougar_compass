'use client'; // This component needs state and effects

import React, { useState, useEffect } from 'react';
import { getRecentEventsForTicker, RecentEventTickerItem } from '@/app/actions/getRecentEventsForTicker';

export function EventTicker() {
    const [tickerItems, setTickerItems] = useState<RecentEventTickerItem[]>([]);
    const [isLoadingTicker, setIsLoadingTicker] = useState(true);
    const [tickerError, setTickerError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoadingTicker(true);
        setTickerError(null);
        getRecentEventsForTicker(5) // Fetch latest 5 event titles
            .then(data => {
                setTickerItems(data);
            })
            .catch(err => {
                console.error("Failed to fetch ticker events:", err);
                setTickerError("Could not load latest news.");
            })
            .finally(() => {
                setIsLoadingTicker(false);
            });
    }, []); // Run only once on mount

    // Construct ticker text
    const tickerText = isLoadingTicker 
        ? "Loading latest news..."
        : tickerError
        ? tickerError
        : tickerItems.length > 0
        ? tickerItems.map(item => item.title).join(' || ') // Join titles with separator
        : "No recent events to display.";

    return (
        <div className="ticker">
            <div className="text">{tickerText}</div>
            {/* Include ticker styles here */}
            <style jsx>{`
                .ticker {
                    position: fixed; 
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background-color: #c40000; /* Red */
                    color: white;
                    padding: 10px 0;
                    white-space: nowrap;
                    overflow: hidden;
                    box-sizing: border-box;
                    z-index: 1000; /* Ensure it's above other content */
                    height: 50px; /* Explicit height */
                    display: flex; /* Use flex to vertically center */
                    align-items: center; /* Vertically center text */
                }

                .text {
                    display: inline-block;
                    padding-left: 100%; /* Start offscreen */
                    animation: ticker-scroll 30s linear infinite; /* Adjust duration as needed */
                    font-size: 16px;
                }

                @keyframes ticker-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }

                /* Hover effect to pause */
                .ticker:hover .text {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
} 
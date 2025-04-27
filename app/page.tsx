'use client'; // Required for useState, useEffect

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRecentEventsForTicker, RecentEventTickerItem } from '@/app/actions/getRecentEventsForTicker'; // Import action and type
import { GraduationCap, CalendarDays, Briefcase } from 'lucide-react'; // Import icons for features

export default function HomePage() {
    const messages = ["For a Cool College-Life", "Your Everyday Assistant", "Welcome to Coop!"];
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    // State for ticker
    const [tickerItems, setTickerItems] = useState<RecentEventTickerItem[]>([]);
    const [isLoadingTicker, setIsLoadingTicker] = useState(true);
    const [tickerError, setTickerError] = useState<string | null>(null);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 5000); // Change message every 5 seconds

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [messages.length]); // Re-run effect if messages array length changes

    // Effect for fetching ticker data
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
        <>
            <div className="main-content">
                {/* Image on the left with fade effect */}
                <div className="cooper">
                     {/* Assuming image is in public/images/ */}
                    <img src="/images/coop_sitting.png" alt="Cooper Sitting" className="left-image" />
                </div>
                
                {/* Text content on the right */}
                <div className="text-content">
                    <div className="text-pop">{messages[currentMessageIndex]}</div>
                    
                    <div className="features">
                        <div className="featuree">
                            <div className="feature-icon">📍</div>
                            <div className="info">
                                <h3>Excel in Academia</h3>
                                <p>Share your goals and let's plan together.</p>
                            </div>
                        </div>
                        
                        <div className="featuree">
                            <div className="feature-icon">⏰</div>
                            <div className="info">
                                <h3>Planner, Schedule, and Updates</h3>
                                <p>Get the latest schedule changes and notifications.</p>
                            </div>
                        </div>
                        
                        <div className="featuree">
                            <div className="feature-icon">⭐</div>
                            <div className="info">
                                <h3>Know your potential</h3>
                                <p>Explore extra-curriculars and career options.</p>
                            </div>
                        </div>
                        <div className="login">
                             {/* Use Link component for internal navigation */}
                             <Link href="/auth/login" passHref>
                                 <button className="login-btn">Login / Sign Up with Google</button>
                             </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- New About Section --- */}
            <section className="about-section">
                <h2>Your Campus Companion</h2>
                <p>
                    CoopGuide is designed to streamline your university experience. 
                    Access academic planning tools, stay updated on campus events, manage schedules, 
                    and explore career opportunities all in one place. 
                    Let Coop be your guide to success at Caldwell University!
                </p>
            </section>

            {/* --- New Key Features Section --- */}
            <section className="key-features-section">
                <h2>Explore CoopGuide Modules</h2>
                <div className="features-grid">
                    <Link href="/academia" className="feature-card">
                         <GraduationCap size={40} className="feature-card-icon" />
                         <h3>Academia</h3>
                         <p>Plan courses, track progress, and view schedules.</p>
                    </Link>
                    <Link href="/collegelife" className="feature-card">
                        <CalendarDays size={40} className="feature-card-icon" />
                         <h3>College Life</h3>
                         <p>Discover events, check shuttle times, and stay connected.</p>
                    </Link>
                    <Link href="/career" className="feature-card">
                         <Briefcase size={40} className="feature-card-icon" />
                         <h3>Career</h3>
                         <p>Explore career paths and resources for your future.</p>
                    </Link>
                </div>
            </section>

            <div className="ticker">
                <div className="text">{tickerText}</div>
            </div>

            {/* Scoped CSS using styled-jsx */}
            <style jsx>{`
                body {
                    margin: 0;
                    overflow-x: hidden;
                    font-family: 'Segoe UI', Tahoma, Verdana, sans-serif;
                    background-color: #f9f9f9; /* Light background for contrast */
                }

                .nav {
                    background-color: #c40000; /* Red */
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 20px;
                    height: 80px;
                    color: white;
                }

                /* Removed nav img style as it's handled inline now */

                .nav .slogan {
                    font-size: 35px;
                    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                    font-weight: bold;
                }

                .notificationbtn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .notificationbtn svg {
                    width: 30px;  /* Adjust size as needed */
                    height: 30px;
                    color: white; /* Makes the icon white */
                    transition: transform 0.2s;
                }

                .notificationbtn:hover svg {
                    transform: scale(1.1);  /* Slight grow effect on hover */
                    color: #ffcccc; /* Light red on hover */
                }

                /* Main Content */
                .main-content {
                    position: relative;
                    height: 80vh; /* Adjust as needed, consider navbar height */
                    display: flex;
                     min-height: 500px; /* Ensure content is visible */
                    background-color: white; /* White background for this section */
                }

                .cooper {
                    position: relative;
                    width: 50%;
                    height: 100%; /* Adjusted height */
                    overflow: hidden;
                }

                .left-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 70%, rgba(0,0,0,0));
                    mask-image: linear-gradient(to right, rgba(0,0,0,1) 70%, rgba(0,0,0,0));
                }

                .text-content {
                    width: 50%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 0 40px;
                    /* Background gradient might need adjustment depending on layout */
                    /* background: linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0.8)); */
                }

                .text-pop {
                    font-size: 50px;
                    font-weight: bold;
                    /* Replacing JS animation with CSS for potentially smoother effect */
                    animation: popText 5s infinite ease-in-out; 
                    text-align: center;
                    color: #333;
                    margin-bottom: 30px;
                    min-height: 60px; /* Ensure space for text */
                }

                .features {
                    display: flex;
                    flex-direction: column;
                    gap: 15px; /* Slightly reduced gap */
                }

                .featuree {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .feature-icon {
                    font-size: 24px;
                    color: #c40000;
                }

                .info h3 {
                    margin: 0;
                    color: #c40000;
                    font-size: 20px;
                }

                .info p {
                    margin: 5px 0 0;
                    color: #555;
                }

                 /* CSS Animation for text pop */
                 @keyframes popText {
                    0%, 100% { opacity: 0; transform: translateY(15px); }
                    10%, 40% { opacity: 1; transform: translateY(0); }
                    50%, 90% { opacity: 0; transform: translateY(-15px); }
                }

                /* News Ticker */
                .ticker {
                    background: black;
                    color: white;
                    overflow: hidden;
                    white-space: nowrap;
                    position: fixed;
                    bottom: 0;
                    left: 0; /* Ensure it starts from left edge */
                    width: 100%;
                    height: 50px;
                    line-height: 50px; /* Vertically center text */
                    padding: 0; /* Remove padding */
                    box-sizing: border-box;
                    z-index: 500; /* Ensure it's above page content but below modals/sidebars */
                }

                .ticker .text {
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 20px; /* Slightly smaller ticker text */
                    display: inline-block;
                    padding-left: 100%; /* Start off screen */
                    animation: tickerMove 60s linear infinite; /* Adjust duration as needed */
                }

                .login {
                    text-align: center; /* Center the button */
                    margin-top: 25px; /* Add some space above */
                }

                 /* Removed login h2 styles */

                 /* Removed .auth-buttons styles */

                .login-btn {
                    padding: 12px 30px;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background-color: #c40000;
                    color: white;
                    border: 2px solid #c40000;
                }

                 /* Removed signup-btn styles */

                .login-btn:hover {
                    background-color: #a30000; /* Darker red */
                    border-color: #a30000;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                 /* Removed signup-btn:hover styles */

                @keyframes tickerMove {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-150%); } /* Adjust end point based on text length */
                }

                /* --- About Section Styles --- */
                 .about-section {
                    padding: 60px 40px;
                    text-align: center;
                    background-color: #f0f0f0; /* Slightly different background */
                 }
                 .about-section h2 {
                    font-size: 36px;
                    color: #c40000;
                    margin-bottom: 20px;
                 }
                 .about-section p {
                    font-size: 18px;
                    color: #444;
                    max-width: 800px;
                    margin: 0 auto;
                    line-height: 1.6;
                 }

                /* --- Key Features Section Styles --- */
                .key-features-section {
                    padding: 60px 40px;
                    background-color: white; /* White background */
                }
                 .key-features-section h2 {
                    font-size: 36px;
                    color: #c40000;
                    text-align: center;
                    margin-bottom: 40px;
                 }
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Responsive grid */
                    gap: 30px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .feature-card {
                    background-color: #fff;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    padding: 30px 25px;
                    text-align: center;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    color: inherit;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }
                .feature-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 15px rgba(0,0,0,0.1);
                    border-color: #c40000;
                }
                .feature-card-icon {
                    color: #c40000;
                    margin-bottom: 15px;
                }
                .feature-card h3 {
                    font-size: 22px;
                    color: #333;
                    margin-bottom: 10px;
                }
                .feature-card p {
                    font-size: 16px;
                    color: #666;
                    line-height: 1.5;
                }
            `}</style>
        </>
    );
}

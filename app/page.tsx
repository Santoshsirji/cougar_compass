'use client'; // Required for useState, useEffect

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap, CalendarDays, Briefcase } from 'lucide-react'; 
import { useSession } from 'next-auth/react'; // Import useSession

export default function HomePage() {
    const messages = ["For a Cool College-Life", "Your Everyday Assistant", "Welcome to Coop!"];
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const { data: session, status } = useSession(); // Get session status

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 5000); 
        
        return () => clearInterval(intervalId);
    }, [messages.length]); 

    return (
        <>
            <div className="main-content">
                
                <div className="cooper">
                     
                    <img src="/images/coop_sitting.png" alt="Cooper Sitting" className="left-image" />
                </div>
                
               
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
                        
                        {status !== 'authenticated' && (
                            <div className="login">
                               
                                <Link href="/auth/login" passHref>
                                    <button className="login-btn">Login / Sign Up with Google</button>
                                </Link>
                            </div>
                        )}
                        {status === 'authenticated' && (
                             <div className="login"> 
                                <Link href="/dashboard" passHref>
                                     <button className="login-btn dashboard-btn">Go to Dashboard</button> {/* Style as needed */}
                                 </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

           
            <section className="about-section">
                <h2>Your Campus Companion</h2>
                <p>
                    Cougar Compass is designed to streamline your university experience. 
                    Access academic planning tools, stay updated on campus events, manage schedules, 
                    and explore career opportunities all in one place. 
                    Let Compass be your guide to success at Caldwell University!
                </p>
            </section>

            
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
                    50%, 90% { opacity: 1; transform: translateY(0); } 
                    95% { opacity: 0; transform: translateY(-15px); } 
                }

                /* News Ticker */
                /* .ticker {
                    position: fixed; 
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background-color: #c40000; 
                    color: white;
                    padding: 10px 0;
                    white-space: nowrap;
                    overflow: hidden;
                    box-sizing: border-box;
                    z-index: 1000;
                    height: 50px;
                    display: flex; 
                    align-items: center; 
                }

                .ticker .text {
                    display: inline-block;
                    padding-left: 100%;
                    animation: ticker-scroll 30s linear infinite;
                    font-size: 16px;
                }

                @keyframes ticker-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }

                .ticker:hover .text {
                    animation-play-state: paused;
                } */

                .login {
                    margin-top: 25px; /* Add some space above the button */
                    text-align: center; /* Center the button */
                }

                 /* Removed login h2 styles */

                 /* Removed .auth-buttons styles */

                .login-btn {
                    padding: 12px 25px;
                    font-size: 16px;
                    font-weight: bold;
                    color: white;
                    background-color: #c40000; /* Theme red */
                    border: none;
                    border-radius: 25px; /* Rounded corners */
                    cursor: pointer;
                    transition: background-color 0.3s ease, transform 0.2s ease;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                 /* Removed signup-btn styles */

                .login-btn:hover {
                    background-color: #a00000; /* Darker red on hover */
                    transform: translateY(-2px); /* Slight lift */
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

                /* Optional: Style the dashboard button differently if needed */
                 /* .dashboard-btn { 
                     background-color: #0056b3; Example: blue for dashboard 
                 } 
                 .dashboard-btn:hover { 
                     background-color: #004494; Darker blue 
                 } */
            `}</style>
        </>
    );
}

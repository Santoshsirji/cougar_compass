'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head'; // Import Head for FontAwesome link

export default function AcademiaPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeNavItem, setActiveNavItem] = useState('Academia'); // Set initial active item

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleNavClick = (itemName: string) => {
        setActiveNavItem(itemName);
        // Navigation will be handled by Link components
    };

    return (
        <>
            {/* Add FontAwesome CDN Link - Consider moving to layout.tsx */}
            <Head>
                 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
            </Head>

            {/* Removed Nav Section */}

            {/* Sidebar using conditional className */}
            <div id="notificationSidebar" className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button className="close-btn" onClick={toggleSidebar}>✖</button>
                <h2>Announcements</h2>
                <ul>
                    {/* TODO: Make these dynamic later */}
                    <li>📢 Add/Drop deadline: Friday!</li>
                    <li>📢 Final exam schedule available!</li>
                    <li>📢 Meet your advisor before registration!</li>
                    <li>📢 Library open late for finals!</li>
                </ul>
            </div>

            <div className="main-content">
                <div className="cooper">
                    <img src="/images/study.png" alt="Studying Students" className="veksler" />
                </div>

                <div className="text-content">
                    <div className="academia-title">Plan Like a Pro</div>
                    
                    <div className="academic-buttons">
                        {/* Link to internal page - Updated Structure */}
                        <Link href="/academia/course-suggestion" className="academic-btn">
                            <i className="fas fa-book-open"></i>
                            Course Suggestions
                            <span className="academic-description">Get personalized course recommendations</span>
                        </Link>
                        
                        {/* Link to external site */}
                        <button className="academic-btn" onClick={() => window.open('https://meet.google.com/', '_blank')}>
                            <i className="fas fa-calendar-check"></i>
                            Meeting Setup
                            <span className="academic-description">Schedule appointments with advisors</span>
                        </button>
                        
                         {/* Link to internal page - Updated Structure */}
                        <Link href="/weekly-schedule" className="academic-btn"> 
                            {/* Assuming route exists */}
                            <i className="fas fa-calendar-alt"></i>
                            Weekly Schedule
                            <span className="academic-description">View and manage your class schedule</span>
                        </Link>
                        
                        {/* Link to external site */}
                        <button className="academic-btn" onClick={() => window.open('https://caldwell.blackboard.com/', '_blank')}>
                            <i className="fas fa-university"></i>
                            Blackboard Access
                            <span className="academic-description">Go to your learning portal</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="ticker">
                {/* TODO: Make ticker dynamic */}
                <div className="text">Important: Add/Drop deadline is this Friday || Final exam schedule now available || Meet with your advisor before registration || Library extended hours during finals week...</div>
            </div>

            <style jsx>{`
                body {
                    margin: 0;
                    overflow-x: hidden;
                    font-family: 'Segoe UI', Tahoma, Verdana, sans-serif;
                }

                .nav {
                    /* padding-left: 50%; removed as it pushed content too far */
                    background-color: #c40000;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 20px;
                    height: 80px;
                    color: white;
                }

                /* nav img handled inline */

                .nav-menu {
                    /* padding-left: 50%; removed */
                    display: flex;
                    gap: 30px;
                    margin-left: auto; /* Push menu towards center/right */
                     margin-right: auto; /* Push menu towards center/left */ 
                     flex-grow: 1; /* Allow menu to take space */
                     justify-content: center; /* Center items within menu space */
                }

                .nav-item {
                    /* padding-left: 50%; removed */
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    padding: 8px 12px;
                    border-radius: 5px;
                    transition: all 0.3s ease;
                     text-decoration: none; /* Remove underline from links */
                     color: white; /* Ensure text is white */
                }

                .nav-item:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                }

                .nav-item.active {
                    background-color: rgba(255, 255, 255, 0.3);
                }

                .nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .notification-wrapper {
                    cursor: pointer; /* Make the wrapper clickable */
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
                    width: 30px;
                    height: 30px;
                    color: white;
                    transition: transform 0.2s;
                }

                .notificationbtn:hover svg {
                    transform: scale(1.1);
                    color: #ffcccc;
                }

                .sidebar {
                    position: fixed;
                    top: 0;
                    right: -320px; /* Hidden initially */
                    width: 300px;
                    height: 100vh; /* Fix the height to exactly viewport */
                    background-color: #fff;
                    box-shadow: -2px 0 8px rgba(0,0,0,0.2);
                    padding: 20px;
                    transition: right 0.3s ease;
                    z-index: 1000;
                    overflow-y: auto;
                }

                .sidebar.open {
                    right: 0;
                }

                .sidebar h2 {
                    margin-top: 40px; /* moved down to make space for the X button */
                    color: #c40000;
                    text-align: center;
                }

                .sidebar ul {
                    list-style: none;
                    padding: 0;
                    margin-top: 20px;
                }

                .sidebar ul li {
                    margin: 15px 0;
                    font-size: 16px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 10px;
                }

                /* Close button styling */
                .close-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #c40000;
                    border: none;
                    color: white;
                    font-size: 22px;
                    font-weight: bold;
                    cursor: pointer;
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    transition: background 0.3s ease;
                }

                .close-btn:hover {
                    background: #900000;
                }


                .main-content {
                    position: relative;
                    height: calc(100vh - 80px - 50px); /* Full height minus nav and ticker */
                    display: flex;
                    min-height: 600px; /* Ensure visibility */
                }

                .cooper {
                    position: relative;
                    width: 50%;
                    height: 100%; /* Changed from 105% */
                    overflow: hidden;
                }

                .veksler {
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
                    /* background: linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0.8)); */
                }

                .academia-title {
                    font-size: 50px;
                    font-weight: bold;
                    text-align: center;
                    color: #c40000;
                    margin-bottom: 30px;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
                }

                .academic-buttons {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-top: 20px;
                }

                .academic-btn {
                    padding: 20px;
                    border: none;
                    border-radius: 10px;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    height: 120px;
                    background-color: white;
                    color: #333;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    border: 2px solid #c40000;
                     text-decoration: none; /* For link wrapping */
                }

                .academic-btn:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
                    background-color: #c40000;
                    color: white;
                }

                .academic-btn i {
                    font-size: 30px;
                    margin-bottom: 10px;
                }

                .academic-description {
                    font-size: 14px;
                    font-weight: normal;
                    margin-top: 8px;
                    opacity: 0.8;
                }

                /* News Ticker */
                .ticker {
                    background: black;
                    color: white;
                    overflow: hidden;
                    white-space: nowrap;
                    position: fixed;
                    bottom: 0;
                    left: 0; /* Added */
                    width: 100%;
                    height: 50px;
                    line-height: 50px; /* Added */
                    padding: 0; /* Changed */
                    box-sizing: border-box; /* Added */
                }

                .ticker .text {
                    /* padding-top: 1%; removed */
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 20px;
                    display: inline-block;
                    padding-left: 100%;
                    animation: tickerMove 60s linear infinite; /* Adjusted duration */
                }


                @keyframes tickerMove {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-150%); } /* Adjusted end point */
                }
            `}</style>
        </>
    );
} 
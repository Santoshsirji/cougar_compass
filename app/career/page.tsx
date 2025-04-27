'use client';

import React from 'react';
import Link from 'next/link';
import Head from 'next/head'; // Import Head for FontAwesome link

export default function CareerPage() {
    // Navbar and Sidebar are handled by layout and Navbar component respectively

    return (
        <>
            {/* Add FontAwesome CDN Link - Consider moving to layout.tsx */}
            <Head>
                 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
            </Head>

            <div className="main-content">
                <div className="image-container">
                    {/* Replace with a relevant career-focused image */} 
                    <img src="/images/career_image.png" alt="Professional Setting" className="side-image" />
                </div>

                <div className="text-content">
                    <div className="career-title">Launch Your Future</div>
                    
                    <div className="career-buttons">
                        {/* Example Button 1: Link to external job board */}
                        <button className="career-btn" onClick={() => window.open('https://caldwell.joinhandshake.com/', '_blank')}> {/* Replace with actual link */} 
                            <i className="fas fa-briefcase"></i>
                            Job & Internship Search
                            <span className="career-description">Find opportunities on Handshake</span>
                        </button>
                        
                        {/* Example Button 2: Link to internal resource page */} 
                        <button onClick={() => window.location.href="/career/resources"} className="career-btn"> {/* Assuming route exists */} 
                            <i className="fas fa-file-alt"></i>
                            Resume & Cover Letter Help
                            <span className="career-description">Access guides and templates</span>
                        </button>

                        {/* Example Button 3: Link to contact/scheduling */}
                        <button onClick={() => window.location.href="/career/advising"} className="career-btn"> {/* Assuming route exists */} 
                            <i className="fas fa-comments"></i>
                            Career Advising
                            <span className="career-description">Connect with a career counselor</span>
                        </button>
                        
                        {/* Example Button 4: Link to events */}
                        <button onClick={() => window.location.href="/weekly-schedule"} className="career-btn"> {/* Optional query param */} 
                            <i className="fas fa-calendar-check"></i>
                            Networking Events
                            <span className="career-description">Attend workshops and fairs</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Ticker is handled by layout.tsx */}
            {/* <div className="ticker">
                <div className="text">Career Fair next month! || Resume workshop this Wednesday || Internship application deadlines approaching...</div>
            </div> */} 

            <style jsx>{`
                /* Base styles */
                body {
                    margin: 0;
                    overflow-x: hidden;
                    font-family: 'Segoe UI', Tahoma, Verdana, sans-serif;
                }

                /* Main Layout */
                .main-content {
                    position: relative;
                     /* Adjust height considering Navbar (80px) and Ticker (50px) */
                     height: calc(100vh - 80px - 50px); 
                    display: flex;
                    min-height: 600px; 
                }

                .image-container {
                    position: relative;
                    width: 50%;
                    height: 100%; 
                    overflow: hidden;
                }

                .side-image { 
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    /* Optional fade effect */
                    -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 70%, rgba(0,0,0,0));
                    mask-image: linear-gradient(to right, rgba(0,0,0,1) 70%, rgba(0,0,0,0));
                }

                .text-content {
                    width: 50%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center; /* Center content horizontally */
                    padding: 40px;
                    background: #f9f9f9; /* Light background for contrast */
                }

                .career-title {
                    font-size: 48px;
                    font-weight: bold;
                    text-align: center;
                    color: #c40000;
                    margin-bottom: 40px;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.1);
                }

                /* Buttons */
                .career-buttons {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr); /* Keep 2 columns */
                    gap: 25px;
                    width: 100%;
                    max-width: 700px; /* Allow slightly wider grid */
                }

                .career-btn {
                    padding: 25px 20px; /* More padding */
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-size: 18px;
                    font-weight: 600; /* Slightly bolder */
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    min-height: 140px; /* Taller buttons */
                    background-color: white;
                    color: #333;
                    box-shadow: 0 3px 6px rgba(0,0,0,0.07);
                    text-decoration: none; 
                }

                .career-btn:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 7px 14px rgba(0,0,0,0.1);
                    border-color: #c40000;
                     /* Optional: Add subtle background color change on hover */
                     /* background-color: #fff8f8; */
                }
                
                .career-btn i {
                    font-size: 32px; /* Larger icons */
                    margin-bottom: 15px;
                    color: #c40000; 
                    transition: color 0.3s ease;
                }
                /* Optional: Icon color change on hover */
                /* .career-btn:hover i {
                     color: #a30000;
                } */

                .career-description {
                    font-size: 14px;
                    font-weight: normal;
                    margin-top: 10px;
                    opacity: 0.8;
                    color: #555;
                    transition: color 0.3s ease;
                    line-height: 1.4;
                }
                 /* Optional: Description color change on hover */
                 /* .career-btn:hover .career-description {
                     color: #c40000;
                } */

                /* Ticker styles are now in Navbar.tsx or layout */
                
            `}</style>
        </>
    );
} 
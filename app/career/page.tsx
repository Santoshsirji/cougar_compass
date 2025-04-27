'use client';

import React from 'react';
import Link from 'next/link';
import Head from 'next/head'; // Import Head for FontAwesome link

export default function CareerPage() {
    
    return (
        <>
            <Head>
                 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
            </Head>

            <div className="main-content">
                <div className="image-container">

                    <img src="/images/career_image.png" alt="Professional Setting" className="side-image" />
                </div>

                <div className="text-content">
                    <div className="career-title">Launch Your Future</div>
                    
                    <div className="career-buttons">

                        <button className="career-btn" onClick={() => window.open('https://caldwell.joinhandshake.com/', '_blank')}> {/* Replace with actual link */} 
                            <i className="fas fa-briefcase"></i>
                            Job & Internship Search
                            <span className="career-description">Find opportunities on Handshake</span>
                        </button>
                        
                       
                        <Link href="https://www.caldwell.edu/wp-content/uploads/2023/05/New-Graduate-Guide.pdf" target="_blank" rel="noopener noreferrer" className="career-btn"> {/* Added target and rel for external PDF */}
                            <i className="fas fa-file-alt"></i>
                            Resume & Cover Letter Help
                            <span className="career-description">Access guides and templates</span>
                        </Link>

                        
                         <Link href="https://www.caldwell.edu/alumni/alumni-career-resources/#:~:text=Call%20973%2D618%2D3290%20or,Follow%20us%20on%20Instagram%20%40careers_cu" target="_blank" rel="noopener noreferrer" className="career-btn"> {/* Added target and rel for external link */} 
                            <i className="fas fa-comments"></i>
                            Career Advising
                            <span className="career-description">Connect with a career counselor</span>
                        </Link>
                        
                       
                         <Link href="https://www.caldwell.edu/conference-services/" target="_blank" rel="noopener noreferrer" className="career-btn"> {/* Added target and rel for external link */} 
                            <i className="fas fa-calendar-check"></i>
                            Networking Events
                            <span className="career-description">Attend workshops and fairs</span>
                        </Link>
                    </div>
                </div>
            </div>


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
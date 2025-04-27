'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head'; // Import Head for FontAwesome link

export default function CollegeLifePage() {

    return (
        <>
            <Head>
                 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
            </Head>


            <div className="main-content">
                <div className="cooper">
                    <img src="/images/stalls.png" alt="Campus Life" className="veksler" />
                </div>

                <div className="text-content">
                    <div className="collegelife-title">For a Holistic College Experience!</div>
                    
                    <div className="life-buttons">
                        <Link href="/events" className="life-btn">
                            <i className="fas fa-calendar-alt"></i>
                            Events
                            <span className="life-description">Get Involved on Campus</span>
                        </Link>
                        
                        <Link href="/shuttle" className="life-btn">
                            <i className="fas fa-bus"></i> {/* Changed icon */} 
                            Cougar Express
                            <span className="life-description">Plan your ride</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="ticker">
                <div className="text">Upcoming Event: Movie Night on the Green this Friday! || Shuttle running on weekend schedule || Check out the new club fair next week...</div>
            </div>

            <style jsx>{`
                /* Reuse relevant styles from academia, adapt as needed */
                body {
                    margin: 0;
                    overflow-x: hidden;
                    font-family: 'Segoe UI', Tahoma, Verdana, sans-serif;
                }

                /* Navbar and Sidebar styles are now in Navbar.tsx */

                .main-content {
                    position: relative;
                    height: calc(100vh - 80px - 50px); /* Full height minus assumed nav and ticker */
                    display: flex;
                    min-height: 600px; /* Ensure visibility */
                }

                .cooper {
                    position: relative;
                    width: 50%;
                    height: 100%; 
                    overflow: hidden;
                }

                .veksler { /* Renamed from left-image for clarity if needed */
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
                }

                .collegelife-title { /* Renamed from academia-title */
                    font-size: 48px; /* Slightly adjusted */
                    font-weight: bold;
                    text-align: center;
                    color: #c40000;
                    margin-bottom: 40px; /* More space */
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.1);
                }

                .life-buttons { /* Renamed from academic-buttons */
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Adjust minmax */
                    gap: 25px;
                    margin-top: 20px;
                    max-width: 600px; /* Limit width */
                    margin-left: auto;
                    margin-right: auto;
                }

                .life-btn { /* Renamed from academic-btn */
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
                    min-height: 130px; /* Slightly taller */
                    background-color: white;
                    color: #333;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.08);
                    border: 2px solid #e0e0e0; /* Lighter border */
                    text-decoration: none; 
                }

                .life-btn:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.12);
                    border-color: #c40000;
                    background-color: #c40000;
                    color: white;
                }
                .life-btn:hover .life-description {
                     color: rgba(255, 255, 255, 0.8);
                }

                .life-btn i {
                    font-size: 30px;
                    margin-bottom: 12px;
                    color: #c40000; /* Icon color */
                    transition: color 0.3s ease;
                }
                .life-btn:hover i {
                     color: white;
                }

                .life-description { /* Renamed */
                    font-size: 14px;
                    font-weight: normal;
                    margin-top: 8px;
                    opacity: 0.9;
                    color: #555;
                    transition: color 0.3s ease;
                }

                /* News Ticker */
                .ticker {
                    background: black;
                    color: white;
                    overflow: hidden;
                    white-space: nowrap;
                    position: fixed;
                    bottom: 0;
                    left: 0; 
                    width: 100%;
                    height: 50px;
                    line-height: 50px; 
                    padding: 0; 
                    box-sizing: border-box; 
                    z-index: 500;
                }

                .ticker .text {
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 20px;
                    display: inline-block;
                    padding-left: 100%;
                    animation: tickerMove 60s linear infinite; 
                }


                @keyframes tickerMove {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-150%); } 
                }
            `}</style>
        </>
    );
} 
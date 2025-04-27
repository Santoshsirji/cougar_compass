'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Use Next.js Image for optimization
import { useSession, signOut } from 'next-auth/react'; // Hook to get session data and signOut
import { getNotifications } from '@/app/actions/getNotifications'; // Import the action
import type { Notification } from '@prisma/client'; // Import the Notification type
import { Loader2, LogOut, User } from 'lucide-react'; // Keep existing icons if used, add Bell
import { IoNotificationsOutline } from "react-icons/io5"; // Import react-icon
import { formatDistanceToNow } from 'date-fns'; // For relative time
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"; // Import Dropdown components

export function Navbar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { data: session, status } = useSession(); // Get session and status
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const [notificationError, setNotificationError] = useState<string | null>(null);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        // Optionally clear error when opening?
        // if (!isSidebarOpen) setNotificationError(null);
    };

    // Fetch notifications when session loads
    useEffect(() => {
        if (status === 'authenticated') {
            setIsLoadingNotifications(true);
            setNotificationError(null);
            getNotifications()
                .then(data => {
                    setNotifications(data);
                })
                .catch(err => {
                    console.error("Failed to fetch notifications:", err);
                    setNotificationError("Couldn't load notifications.");
                })
                .finally(() => {
                    setIsLoadingNotifications(false);
                });
        }
         if (status === 'unauthenticated') {
             setNotifications([]); // Clear notifications if logged out
        }
    }, [status]); // Re-run when session status changes

    // Determine profile image URL - use session image or default
    const profileImageUrl = session?.user?.image || '/images/profile_logo.png'; // Default path
    const notificationCount = notifications.length;

  return (
    <>
            <header className="navbar">
                <div className="logo">
                    <Link href="/" passHref>
                         {/* Assuming logo is in public/images/ */}
                        <Image src="/images/hack.png" alt="Logo" width={180} height={60} style={{height: 'auto'}} priority />
                    </Link>
                </div>
                <div className="nav-right">
                    <nav className="nav-links">
                        {/* Conditionally render Dashboard link */}
                        {status === 'authenticated' && (
                            <Link href="/dashboard">Dashboard</Link>
                        )}
                        {/* Existing Links */}
                        <Link href="/academia">Academia</Link>
                        <Link href="/collegelife">College Life</Link> {/* Assuming route exists */}
                        <Link href="/career">Career</Link> {/* Assuming route exists */}
                    </nav>
                    <div className="profile-icons">
                        <div className="notification-wrapper" onClick={toggleSidebar}>
                            <button className="notificationbtn" title="Notifications">
                                <IoNotificationsOutline size={28} color="white" />
                            </button>
                            {/* Update badge based on fetched count */}
                            {status === 'authenticated' && notificationCount > 0 && (
                                <span className="badge">{notificationCount}</span> 
                            )}
                        </div>
                         {/* Profile Picture & Dropdown */} 
                         {session && ( 
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
              <Image
                                        src={profileImageUrl} 
                                        alt="Profile" 
                                        className="profile-pic" 
                width={40}
                height={40}
                                        title={session.user?.name || 'Profile'}
                                        style={{ borderRadius: '50%', cursor: 'pointer' }} // Added cursor pointer
                                    />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end"> 
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <Link href="/profile" passHref>
                                        <DropdownMenuItem>
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}> 
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sign Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                         )}
                         {!session && ( // Show login link if not logged in
                              <Link href="/auth/login" className="login-link">Login</Link>
                         )}
            </div>
            </div>
            </header>

            {/* Sidebar Structure */}
            <div id="notificationSidebar" className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                 <button className="close-btn" onClick={toggleSidebar}>✖</button>
                <h2>Notifications</h2>
                {isLoadingNotifications ? (
                    <div className="loading-state">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p>Loading...</p>
                    </div>
                 ) : notificationError ? (
                     <p className="error-state">{notificationError}</p>
                 ) : notifications.length === 0 ? (
                     <p className="empty-state">No new notifications.</p>
                 ) : (
                    <ul>
                        {notifications.map(notif => (
                            <li key={notif.id} title={`${notif.message}\n${formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}`}>
                                <strong>{notif.title}</strong>
                                <p className="message-preview">{notif.message}</p>
                                <span className="timestamp">
                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                </span>
                            </li>
                        ))}
                    </ul>
                 )}
            </div>
            {/* Overlay for closing sidebar */}
            
            {isSidebarOpen && <div id="overlay" onClick={toggleSidebar}></div>}

            {/* CSS Styles */}
            <style jsx>{`
                .navbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 30px; /* Increased padding */
                    background-color: #c40000; /* Match theme */
                    color: white;
                    height: 80px; /* Match theme */
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .logo img {
                    height: 60px; /* Adjust based on actual logo size */
                    width: auto; /* Maintain aspect ratio */
                }
                
                .nav-right {
                    display: flex;
                    align-items: center;
                    gap: 40px; /* Space between nav links and profile icons */
                }

                .nav-links {
                    display: flex;
                    gap: 30px;
                }

                .nav-links a {
                    color: white;
                    text-decoration: none;
                    font-size: 18px; /* Match theme */
                    font-weight: bold; /* Match theme */
                    padding: 8px 12px; /* Match theme */
                    border-radius: 5px; /* Match theme */
                    transition: background-color 0.3s ease;
                }

                .nav-links a:hover {
                    background-color: rgba(255, 255, 255, 0.2); /* Match theme */
                }
                /* Add .active class styles if needed later using useRouter */

                .profile-icons {
                    display: flex;
                    align-items: center;
                    gap: 15px; /* Space between notification and profile */
                }

                .notification-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                }

                .notificationbtn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 5px; /* Adjust padding */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                     margin-right: 5px; /* Space before badge */
                }

                .notificationbtn svg {
                    width: 28px; /* Slightly smaller */
                    height: 28px;
                    color: white;
                    transition: transform 0.2s;
                }

                .notificationbtn:hover svg {
                    transform: scale(1.1);
                    color: #ffcccc;
                }

                .badge {
                    position: absolute; 
                    top: 0px; 
                    right: 0px; 
                    background-color: white; 
                    color: #c40000; 
                    border-radius: 50%;
                    padding: 2px 6px;
                    font-size: 11px;
                    font-weight: bold;
                    /* Adjust position slightly if needed */
                    transform: translate(30%, -30%); 
                }

                .profile-pic {
                    height: 40px;
                    width: 40px;
                    border-radius: 50%;
                    cursor: pointer; /* Indicate it might be clickable later */
                    border: 2px solid white; /* Optional: Add border */
                }
                
                .login-link {
                    color: white;
                    font-weight: bold;
                    text-decoration: none;
                    padding: 8px 15px;
                    border: 1px solid white;
                    border-radius: 5px;
                    transition: all 0.3s ease;
                }
                .login-link:hover {
                     background-color: white;
                     color: #c40000;
                }

                /* Sidebar Styles */
                .sidebar {
                    position: fixed;
                    top: 0;
                    right: -320px; /* Hidden initially */
                    width: 300px;
                    height: 100vh;
                    background-color: #fff;
                    box-shadow: -2px 0 8px rgba(0,0,0,0.2);
                    padding: 20px;
                    transition: right 0.3s ease;
                    z-index: 1001; /* Above overlay */
                    overflow-y: auto;
                    color: #333; /* Default text color */
                }

                .sidebar.open {
                    right: 0;
                }

                .sidebar h2 {
                    margin-top: 40px; 
                    color: #c40000;
                    text-align: center;
                    margin-bottom: 25px;
                }

                .sidebar ul {
                    list-style: none;
                    padding: 0;
                }

                .sidebar ul li {
                    margin: 15px 0;
                    font-size: 16px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                    cursor: pointer; /* Indicate items might be clickable */
                    transition: color 0.2s ease;
                    position: relative; /* For timestamp positioning */
                }
                .sidebar ul li:hover {
                     color: #c40000;
                }

                .close-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: #eee;
                    border: none;
                    color: #555;
                    font-size: 20px;
                    font-weight: bold;
                    cursor: pointer;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    line-height: 30px; /* Center the X */
                    text-align: center;
                    transition: all 0.3s ease;
                }

                .close-btn:hover {
                    background: #ddd;
                     color: #c40000;
                    transform: rotate(90deg);
                }

                /* Added Sidebar States */
                 .loading-state, .empty-state, .error-state {
                     text-align: center;
                     margin-top: 40px;
                     color: #666;
                 }
                 .loading-state svg {
                     margin: 0 auto 10px;
                     color: #c40000;
                 }
                 .error-state {
                     color: #d9534f; /* Error color */
                 }
                 .message-preview {
                     font-size: 0.9em;
                     color: #555;
                     margin: 5px 0;
                     overflow: hidden;
                     text-overflow: ellipsis;
                     display: -webkit-box;
                     -webkit-line-clamp: 2; /* Limit to 2 lines */
                     -webkit-box-orient: vertical;  
                 }
                 .timestamp {
                     font-size: 0.75em;
                     color: #999;
                     position: absolute;
                     bottom: 10px;
                     right: 0;
                 }

                /* Overlay */
                #overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 1000; /* Below sidebar */
                    display: block; /* Initially hidden by sidebar logic */
                }
            `}</style>
    </>
  );
}

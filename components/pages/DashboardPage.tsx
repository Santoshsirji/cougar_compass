'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

/* ------------------------
| Dashboard Button Component |
------------------------- */
interface DashboardButtonProps {
  href?: string;
  externalLink?: string;
  icon: string;
  title: string;
  description: string;
}

function DashboardButton({ href, externalLink, icon, title, description }: DashboardButtonProps) {
  if (href) {
    return (
      <Link
        href={href}
        className="relative flex flex-col items-center justify-center gap-2 bg-white text-gray-800 border-2 border-red-700 rounded-lg p-6 hover:bg-red-700 hover:text-white transition shadow-md hover:shadow-lg h-36 text-center"
      >
        <i className={`${icon} text-3xl`}></i>
        <span className="font-bold text-lg">{title}</span>
        <p className="text-xs opacity-80">{description}</p>
      </Link>
    );
  }

  return (
    <button
      onClick={() => externalLink && window.open(externalLink, '_blank', 'noopener,noreferrer')}
      className="flex flex-col items-center justify-center gap-2 bg-white text-gray-800 border-2 border-red-700 rounded-lg p-6 hover:bg-red-700 hover:text-white transition shadow-md hover:shadow-lg h-36 text-center"
    >
      <i className={`${icon} text-3xl`}></i>
      <span className="font-bold text-lg">{title}</span>
      <p className="text-xs opacity-80">{description}</p>
    </button>
  );
}

/* -------------------
| Dashboard Page Main |
-------------------- */
export default function DashboardPage() {
  const [activeItem, setActiveItem] = useState('Academia');

  const navItems = ['Academia', 'College Life', 'Career', 'Profile'];

  const dashboardResources: DashboardButtonProps[] = [
    {
      href: '/dashboard/course_suggestions',
      icon: 'fas fa-book-open',
      title: 'Course Suggestions',
      description: 'Get personalized course recommendations',
    },
    {
      href: '/dashboard/meeting_scheduler',
      icon: 'fas fa-calendar-check',
      title: 'Meeting Setup',
      description: 'Schedule appointments with advisors',
    },
    {
      href: '/dashboard/weekly_schedule',
      icon: 'fas fa-calendar-alt',
      title: 'Weekly Schedule',
      description: 'View and manage your class schedule',
    },
    {
      externalLink: 'https://blackboard.example.com',
      icon: 'fas fa-university',
      title: 'Blackboard Access',
      description: 'Go to your learning portal',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-red-700 text-white px-6 md:px-10 h-20">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <Image src="/images/hack.png" alt="Cougar Hacks Logo" width={50} height={50} priority />
        </a>

        {/* Nav Menu */}
        <div className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveItem(item)}
              className={`px-4 py-2 rounded-md font-semibold transition ${
                activeItem === item ? 'bg-white bg-opacity-30' : 'hover:bg-white hover:bg-opacity-20'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Notifications */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Notifications"
            className="p-2 rounded-full hover:bg-red-500 transition"
          >
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col md:flex-row h-[calc(100vh-80px)]">
        {/* Left Image Section */}
        <div className="relative w-full md:w-1/2 h-80 md:h-full">
          <Image
            src="/images/coop_sitting.png"
            alt="Cooper Sitting"
            fill
            className="object-cover object-center mask-gradient-right"
            priority
          />
        </div>

        {/* Text and Buttons Section */}
        <section className="flex flex-col justify-center w-full md:w-1/2 bg-gradient-to-l from-white to-white/80 p-8 space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-red-700 drop-shadow-sm">
            Academic Success Center
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardResources.map((resource) => (
              <DashboardButton
                key={resource.title}
                {...resource}
              />
            ))}
          </div>
        </section>
      </main>

      {/* News Ticker */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: '-100%' }}
        transition={{ repeat: Infinity, duration: 100, ease: 'linear' }}
        className="fixed bottom-0 w-full bg-black text-white text-center py-3 overflow-hidden"
      >
        <p className="whitespace-nowrap text-lg font-mono">
          Important: Add/Drop deadline is this Friday || Final exam schedule now available || Meet
          with your advisor before registration || Library extended hours during finals week...
        </p>
      </motion.div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface AcademicButtonProps {
  href?: string;
  externalLink?: string;
  icon: string;
  title: string;
  description: string;
}

function AcademicButton({ href, externalLink, icon, title, description }: AcademicButtonProps) {
  if (href) {
    return (
      <Link
        href={href}
        className="relative flex flex-col items-center justify-center gap-2 bg-white text-gray-800 border-2 border-red-700 rounded-lg p-6 hover:bg-red-700 hover:text-white transition shadow-md hover:shadow-lg h-36"
      >
        <i className={`${icon} text-3xl`}></i>
        <span className="font-bold text-lg">{title}</span>
        <p className="text-xs opacity-80 text-center">{description}</p>
      </Link>
    );
  }

  return (
    <button
      onClick={() => externalLink && window.open(externalLink, '_blank', 'noopener,noreferrer')}
      className="flex flex-col items-center justify-center gap-2 bg-white text-gray-800 border-2 border-red-700 rounded-lg p-6 hover:bg-red-700 hover:text-white transition shadow-md hover:shadow-lg h-36"
    >
      <i className={`${icon} text-3xl`}></i>
      <span className="font-bold text-lg">{title}</span>
      <p className="text-xs opacity-80 text-center">{description}</p>
    </button>
  );
}

export default function AcademiaPage() {

  const academicResources: AcademicButtonProps[] = [
    {
      href: '/academia/course_suggestion',
      icon: 'fas fa-book-open',
      title: 'Course Suggestions',
      description: 'Get personalized course recommendations',
    },
    {
      externalLink: 'https://meet.google.com/',
      icon: 'fas fa-calendar-check',
      title: 'Meeting Setup',
      description: 'Schedule appointments with advisors',
    },
    {
      href: '/weekly_schedule',
      icon: 'fas fa-calendar-alt',
      title: 'Weekly Schedule',
      description: 'View and manage your class schedule',
    },
    {
      externalLink: 'https://caldwell.blackboard.com/',
      icon: 'fas fa-university',
      title: 'Blackboard Access',
      description: 'Go to your learning portal',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden font-sans">
      {/* Main Content */}
      <main className="flex flex-col md:flex-row h-[calc(100vh-80px)]">
        {/* Image Section */}
        <div className="relative w-full md:w-1/2 h-80 md:h-full">
          <Image
            src="/images/study.png"
            alt="Studying Students"
            fill
            className="object-cover object-center mask-gradient-right"
            priority
          />
        </div>

        {/* Text + Academic Buttons Section */}
        <section className="flex flex-col justify-center w-full md:w-1/2 bg-gradient-to-l from-white to-white/80 p-8 space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-red-700 drop-shadow-sm">
            Plan Like a Pro
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {academicResources.map((resource) => (
              <AcademicButton
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
        transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
        className="fixed bottom-0 w-full bg-black text-white text-center py-3 overflow-hidden"
      >
        <p className="whitespace-nowrap text-lg font-mono">
          Important: Add/Drop deadline is this Friday || Final exam schedule now available ||
          Meet with your advisor before registration || Library extended hours during finals week...
        </p>
      </motion.div>
    </div>
  );
}

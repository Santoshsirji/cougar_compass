'use client'; // Mark as a Client Component to use hooks

import Image from 'next/image';
import Link from 'next/link';
// Import icons from react-icons
import { FaCompass, FaGraduationCap, FaThumbsUp } from 'react-icons/fa';
import { useSession } from 'next-auth/react'; // Import useSession


export default function DashboardPage() {
  // Get session data using NextAuth.js hook
  const { data: session, status } = useSession();

  // Determine the user's name, handle loading and unauthenticated states
  const userName = status === 'loading' ? '...' : session?.user?.name || 'Guest';

  return (
    <div className="flex h-screen  bg-white">
      {/* Left Column: Image */}
      <div className="w-1/2 hidden lg:block relative">
        <Image
          src="/images/coolcoop.png" // Make sure this path is correct
          alt="Cougar Mascot High Five"
          layout="fill"
          objectFit="cover"
          priority // Prioritize loading this image
        />
        {/* Gradient overlay with reduced fade effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-white"></div>
      </div>

      {/* Right Column: Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="max-w-md w-full">
          {/* Logo/Title */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            {/* Compass Icon */}
            <FaCompass className="text-red-700 text-4xl" />
            <h1 className="text-4xl font-bold text-red-700">
              CougarCompass
            </h1>
            {/* Graduation Cap Icon */}
            <FaGraduationCap className="text-red-700 text-4xl" />
          </div>

          {/* Welcome Message - Now dynamic */}
          <h2 className="text-2xl font-semibold text-red-700 mb-6 text-center">
            Welcome, {userName}!
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-center mb-8">
            CougarCompass is your guide through college life — from academics and campus activities to career exploration. Our mission is to help you discover your path and make the most of every opportunity at Caldwell University.
          </p>

          {/* Meet the Team Link */}
          <div className="text-center">
            <Link href="/dashboard/about">
              <span className="inline-flex items-center text-red-700 font-medium hover:underline cursor-pointer">
                {/* Thumbs Up Icon */}
                <FaThumbsUp className="mr-2" />
                Meet the Team
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

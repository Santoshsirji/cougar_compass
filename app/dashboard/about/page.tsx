'use client'; 
import Image from 'next/image';
import { useState } from 'react'; 

// Define an interface for the team member data
interface TeamMember {
  name: string;
  imageUrl: string;
  title: string;
  university: string;
  email: string;
  linkedin: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Aditya Acharya',
    imageUrl: '/images/team_members/Aditya.png',
    title: 'B.S. in Computer Science (Class of 2028)',
    university: 'Caldwell University, NJ',
    email: 'aacharya4@email.com', // Extracted from mailto link
    linkedin: 'https://www.linkedin.com/in/aditya-acharya-102b9124a/',
  },
  {
    name: 'Kishor Baniya',
    imageUrl: '/images/team_members/Kishor.png',
    title: 'B.S. in Computer Science and Mathematics (Class of 2028)',
    university: 'Caldwell University, NJ',
    email: 'kbaniya@caldwell.edu',
    linkedin: 'https://www.linkedin.com/in/kishor-baniya-7164bb213/',
  },
  {
    name: 'Sandesh Gautam',
    imageUrl: '/images/team_members/Sandesh.png',
    title: 'B.S. in Computer Science (Class of 2028)',
    university: 'Caldwell University, NJ',
    email: 'sgautam1@caldwell.edu', // Extracted from mailto link
    linkedin: 'https://www.linkedin.com/in/sandesh-gautam-a793b1351/',
  },
  {
    name: 'Santosh Raut',
    imageUrl: '/images/team_members/Santosh.png',
    title: 'B.S. in Computer Science (Class of 2028)',
    university: 'Caldwell University, NJ',
    email: 'sraut2@caldwell.edu',
    linkedin: 'https://www.linkedin.com/in/santosh-raut-a3916a27a/',
  },
];

// Updated Card Component with Copy Email Functionality
const TeamMemberCard = ({ member }: { member: TeamMember }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(member.email).then(() => {
      setCopied(true);
      // Reset the copied state after a short delay
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy email: ', err);
      // Optionally: handle the error, e.g., show an error message
    });
  };

  return (
    // Lighter background, padding, rounded corners, subtle shadow
    <div className="bg-gray-50 rounded-lg shadow-sm p-6 flex flex-col items-center text-center border border-gray-200">
      <Image
        src={member.imageUrl}
        alt={`Profile picture of ${member.name}`}
        width={80} // Smaller image size
        height={80}
        className="rounded-full mb-4 object-cover ring-1 ring-gray-300"
      />
      {/* Adjusted text styling */}
      <h3 className="text-lg font-semibold mb-1 text-gray-900">{member.name}</h3>
      <p className="text-xs text-gray-600 font-normal mb-1 px-2">{member.title}</p>
      <p className="text-xs text-gray-500 mb-1">{member.university}</p>
      <p className="text-xs text-gray-500 mb-4">{member.email}</p>
      {/* Button styling */}
      <div className="flex space-x-2 mt-auto w-full justify-center">
        {/* Copy Email Button */}
        <button
          onClick={handleCopyEmail}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition duration-150 ease-in-out text-center ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
        >
          {copied ? 'Copied!' : 'Copy Email'}
        </button>
        <a href={member.linkedin}
           target="_blank"
           rel="noopener noreferrer"
           className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition duration-150 ease-in-out text-center">
          LinkedIn
        </a>
      </div>
    </div>
  );
};

export default function AboutPage() {
  return (
    // White background, padding for content area
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Mascot Image - Centered */}
      <div className="flex justify-center mb-12">
        <Image
          // TODO: Replace with actual mascot image path
          src="/images/coop_sleeping.png"
          alt="Caldwell Mascot"
          width={500} // Adjust width as needed
          height={300} // Adjust height based on image aspect ratio
          objectFit="contain"
        />
      </div>

      {/* Team Member Grid - Centered */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.email} member={member} />
          ))}
        </div>
      </div>
      {/* Optional: Removed Back to Dashboard link and Heading to match image */}
    </div>
  );
} 
import Link from 'next/link';

interface AcademicButtonProps {
  href?: string;
  externalLink?: string;
  icon: string;
  title: string;
  description: string;
}

function AcademicButton({ href, externalLink, icon, title, description }: AcademicButtonProps) {
  // Decide the wrapper element: a button (for external) or a Link (for internal)
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
      onClick={() => {
        if (externalLink) {
          window.open(externalLink, '_blank', 'noopener,noreferrer');
        }
      }}
      className="flex flex-col items-center justify-center gap-2 bg-white text-gray-800 border-2 border-red-700 rounded-lg p-6 hover:bg-red-700 hover:text-white transition shadow-md hover:shadow-lg h-36"
    >
      <i className={`${icon} text-3xl`}></i>
      <span className="font-bold text-lg">{title}</span>
      <p className="text-xs opacity-80 text-center">{description}</p>
    </button>
  );
}

export default AcademicButton;

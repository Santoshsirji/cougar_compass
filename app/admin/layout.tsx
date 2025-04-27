import Link from 'next/link';
import { ReactNode } from 'react';
import { Home, Bell, CalendarDays, Bus, LogOut } from 'lucide-react'; // Icons for nav and LogOut icon
// import SignOutButton from '@/components/SignOutButton'; // Assuming you have this - Temporarily removed
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button'; // Import Button for placeholder

// Simple Sidebar Navigation component
async function AdminSidebar() {
    const session = await getServerSession(authOptions);
    const userName = session?.user?.name || 'Admin User';

    return (
        <div className="w-64 pt-16 bg-gray-800 text-white flex flex-col h-screen">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Admin Panel</h2>
                <p className="text-sm text-gray-400">Welcome, {userName}</p>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <Link href="/admin" className="flex items-center p-2 rounded hover:bg-gray-700">
                    <Home className="mr-3 h-5 w-5" /> Dashboard
                </Link>
                <Link href="/admin/notifications" className="flex items-center p-2 rounded hover:bg-gray-700">
                    <Bell className="mr-3 h-5 w-5" /> Notifications
                </Link>
                 <Link href="/admin/events" className="flex items-center p-2 rounded hover:bg-gray-700">
                    <CalendarDays className="mr-3 h-5 w-5" /> Events
                </Link>
                <Link href="/admin/shuttle-schedule" className="flex items-center p-2 rounded hover:bg-gray-700">
                    <Bus className="mr-3 h-5 w-5" /> Shuttle Schedule
                </Link>
            </nav>
            <div className="p-4 border-t border-gray-700">
                 {/* <SignOutButton /> */}
                 {/* Placeholder Button - Replace with actual SignOutButton later */}
                 <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700 hover:text-white">
                     <LogOut className="mr-3 h-5 w-5" /> Sign Out (Placeholder)
                 </Button>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 pt-20 px-5 bg-gray-100">
         
         {children}
      </main>
    </div>
  );
} 
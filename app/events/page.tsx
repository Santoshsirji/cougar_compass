import { getPublicEvents } from "@/app/actions/getPublicEvents";
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, MapPin } from 'lucide-react';

// Revalidate data every hour (optional)
export const revalidate = 3600; 

export default async function EventsPage() {
    const events = await getPublicEvents();

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-center mb-10 text-red-700">Upcoming Events</h1>

            {events.length === 0 ? (
                <p className="text-center text-gray-500 text-lg">No upcoming events scheduled. Check back soon!</p>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-200">
                            {event.imageUrl ? (
                                <div className="relative h-48 w-full">
                                    <Image 
                                        src={event.imageUrl}
                                        alt={event.title}
                                        layout="fill"
                                        objectFit="cover"
                                        className="transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                            ) : (
                                 <div className="h-48 w-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                                     <Calendar size={48} className="text-red-500 opacity-50" />
                                 </div>
                            )}
                            <div className="p-6 flex flex-col flex-grow">
                                <h2 className="text-2xl font-semibold mb-2 text-gray-800 hover:text-red-700 transition-colors">{event.title}</h2>
                                <div className="flex items-center text-sm text-gray-600 mb-3">
                                    <Calendar size={16} className="mr-2 text-red-600 flex-shrink-0" />
                                    <span>{format(new Date(event.date), 'EEEE, MMMM do, yyyy 'at' h:mm a')}</span> 
                                </div>
                                {event.location && (
                                    <div className="flex items-center text-sm text-gray-600 mb-4">
                                        <MapPin size={16} className="mr-2 text-red-600 flex-shrink-0" />
                                        <span>{event.location}</span>
                                    </div>
                                )}
                                <p className="text-gray-700 mb-5 flex-grow">
                                    {event.description || 'More details coming soon.'}
                                </p>
                                {/* Optional: Add a button or link if needed */}
                                {/* <button className="mt-auto bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors self-start">Learn More</button> */} 
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 
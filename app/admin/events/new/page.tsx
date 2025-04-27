'use client';

import { EventForm } from '../_components/EventForm';
import { createEvent } from '@/app/actions/eventActions';

export default function CreateEventPage() {
    return (
        <div className="space-y-6">
            {/* Optional: Add a heading or breadcrumbs if desired */}
             {/* <h1 className="text-3xl font-bold">Create New Event</h1> */}
            <EventForm
                onSubmitAction={createEvent} // Pass the createEvent server action
                formTitle="Create New Event"
                formDescription="Fill in the details for the new event."
                submitButtonText="Create Event"
                // initialData is omitted/undefined for create mode
            />
        </div>
    );
} 
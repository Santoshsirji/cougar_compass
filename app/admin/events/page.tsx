'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { getEvents, deleteEvent, EventWithCreator, createEvent, updateEvent } from '@/app/actions/eventActions';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Edit, PlusCircle, Loader2, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EventForm } from './_components/EventForm';
import { ScrollArea } from "@/components/ui/scroll-area";

// Define the event form schema type
type EventFormValues = {
    title: string;
    description?: string;
    date: Date;
    location?: string;
    imageUrl?: string;
};

export default function AdminEventsPage() {
    const [events, setEvents] = useState<EventWithCreator[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, startSubmitTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventWithCreator | null>(null);
    const { toast } = useToast();

    // Wrap fetchEvents in useCallback
    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedEvents = await getEvents();
            setEvents(fetchedEvents);
        } catch (err) {
            console.error("Failed to fetch events:", err);
            toast({ title: "Error", description: "Failed to load events. Please try again later.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]); // Added toast as dependency

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleOpenDialog = (event: EventWithCreator | null = null) => {
        setEditingEvent(event);
        setIsDialogOpen(true);
    };

    // Create wrapper functions for the form submission
    const handleCreateEvent = async (formData: EventFormValues) => {
        const result = await createEvent(formData);
        if (result.success) fetchEvents(); // Refetch on success
        return result;
    };

    const handleUpdateEvent = async (formData: EventFormValues) => {
        if (!editingEvent) return { success: false, message: "No event selected for update" };
        const result = await updateEvent(editingEvent.id, formData);
        if (result.success) fetchEvents(); // Refetch on success
        return result;
    };

    const handleDelete = (eventId: string) => {
        startSubmitTransition(async () => {
            const result = await deleteEvent(eventId);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                fetchEvents();
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to delete event.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <ScrollArea className="h-full">
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Manage Events</h2>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()}> 
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
                            </DialogHeader>
                            <EventForm 
                                initialData={editingEvent}
                                onSubmitAction={editingEvent ? handleUpdateEvent : handleCreateEvent}
                                formTitle={editingEvent ? "Edit Event" : "Add New Event"}
                                formDescription={editingEvent ? "Update event details" : "Create a new campus event"}
                                submitButtonText={editingEvent ? "Update" : "Create"}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Existing Events</CardTitle>
                        <CardDescription>View, edit, or delete campus events.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p>Loading events...</p>
                        ) : events.length > 0 ? (
                            <Table>
                                <TableHeader><TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow></TableHeader>
                                <TableBody>
                                    {events.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell className="font-medium">{event.title}</TableCell>
                                            <TableCell>{format(new Date(event.date), 'PPpp')}</TableCell>
                                            <TableCell>{event.location || '-'}</TableCell>
                                            <TableCell>{event.createdBy?.name || 'N/A'}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="icon" onClick={() => handleOpenDialog(event)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    size="icon" 
                                                    onClick={() => handleDelete(event.id)}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/> }
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p>No events found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
    );
} 
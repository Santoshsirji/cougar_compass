'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { getEvents, deleteEvent, EventWithCreator } from '@/app/actions/eventActions';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Edit, PlusCircle, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

export default function AdminEventsPage() {
    const [events, setEvents] = useState<EventWithCreator[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPendingDelete, startDeleteTransition] = useTransition();
    const { toast } = useToast();

    const fetchEvents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedEvents = await getEvents();
            setEvents(fetchedEvents);
        } catch (err) {
            console.error("Failed to fetch events:", err);
            setError("Failed to load events. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = (eventId: string, eventTitle: string) => {
        startDeleteTransition(async () => {
            const result = await deleteEvent(eventId);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                // Refetch events to update the list
                fetchEvents();
                // Or filter locally: setEvents(currentEvents => currentEvents.filter(event => event.id !== eventId));
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Events</h1>
                <Link href="/admin/events/new" passHref>
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Create New Event</Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Events List</CardTitle>
                    <CardDescription>View, edit, or delete campus events.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {error && <p className="text-destructive text-center py-10">{error}</p>}
                    {!isLoading && !error && events.length === 0 && (
                        <p className="text-center text-muted-foreground py-10">No events found.</p>
                    )}
                    {!isLoading && !error && events.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-medium">{event.title}</TableCell>
                                        <TableCell>{format(new Date(event.date), 'PPP')}</TableCell>
                                        <TableCell>{event.location || 'N/A'}</TableCell>
                                        <TableCell>{event.createdBy?.name || 'Unknown'}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/admin/events/${event.id}/edit`} passHref>
                                                <Button variant="ghost" size="icon" aria-label="Edit Event">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" aria-label="Delete Event" disabled={isPendingDelete}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the event titled "{event.title}".
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel disabled={isPendingDelete}>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(event.id, event.title)}
                                                            disabled={isPendingDelete}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            {isPendingDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 
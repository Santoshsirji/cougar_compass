'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { getShuttleScheduleForDate } from '@/app/actions/getShuttleScheduleForDate';
import type { FormattedShuttleSchedule } from '@/types/shuttle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export default function ViewShuttleSchedulePage() {
    const { data: session, status } = useSession();
    const [schedule, setSchedule] = useState<FormattedShuttleSchedule | null | undefined>(undefined); // undefined: loading, null: not found
    const [currentDate, setCurrentDate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Get today's date, zero out time for consistent query
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setCurrentDate(today);

        const fetchSchedule = async (targetDate: Date) => {
            setIsLoading(true);
            setError(null);
            try {
                // Call the new action with Date
                const fetchedSchedule = await getShuttleScheduleForDate(targetDate);
                setSchedule(fetchedSchedule);
            } catch (err) {
                console.error("Failed to fetch schedule:", err);
                setError("Could not load the schedule for today. Please try again later.");
                setSchedule(null); // Indicate error/not found
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedule(today);

    }, []); // Run once on mount

    const renderScheduleTable = (route: NonNullable<FormattedShuttleSchedule>['routes'][number]) => (
        <div key={route.name} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{route.name}</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        {route.stops.map((stop, index) => (
                            <TableHead key={`${route.name}-stop-${index}`}>{stop}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {route.times.map((timeRow, rowIndex) => (
                        <TableRow key={`${route.name}-row-${rowIndex}`}>
                            {timeRow.map((time, timeIndex) => (
                                <TableCell key={`${route.name}-row-${rowIndex}-time-${timeIndex}`}>{time || '-'}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Shuttle Schedule</h1>
                 {/* Conditional Admin Link */} 
                 {status === 'authenticated' && session?.user?.role === 'ADMIN' && (
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/shuttle-schedule">
                            <Settings className="mr-2 h-4 w-4" /> Manage Schedules
                        </Link>
                    </Button>
                )}
             </div>

            <Card>
                <CardHeader>
                    <CardTitle>Today's Schedule ({currentDate?.toLocaleDateString() || 'Loading...'})</CardTitle>
                    {schedule?.notes && (
                        <CardDescription>Notes: {schedule.notes}</CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-1/4" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    ) : error ? (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : schedule ? (
                        schedule.routes.map(renderScheduleTable)
                    ) : (
                        <Alert>
                            <AlertTitle>No Schedule Available</AlertTitle>
                            <AlertDescription>
                                There is no shuttle schedule published for {currentDate?.toLocaleDateString()}. Please check back later or contact support if you believe this is an error.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 
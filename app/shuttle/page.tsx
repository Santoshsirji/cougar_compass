'use client';

// Global imports
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format, startOfDay, isBefore } from 'date-fns';
import { Loader2, Info, Calendar as CalendarIcon, Clock } from 'lucide-react';

// Local imports
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getShuttleSchedule, ParsedShuttleScheduleData } from '@/app/actions/getShuttleSchedule';

type DisplayShuttleSchedule = {
    notes: string | null;
    routes: {
        name: string;
        stops: string[];
        times: string[][];
    }[];
};

const DEFAULT_SCHEDULE: DisplayShuttleSchedule = {
    notes: "This is the default schedule, displayed when no specific schedule is available for the selected date. Please check back later for updates.",
    routes: [
        {
            name: "To Newark Penn Station",
            stops: [
                "Caldwell University", "Pine St. - Verona", "Whole Foods - MNT", "Lackawanna - MNT", 
                "Venner Park - BLM", "Municipal Plaza - BLM", "Hill St - BLM", "Watsessing Ave - BLM", 
                "Summer Ave - Newark", "NPS - Newark"
            ],
            times: [
                ["6:55", "-", "-", "-", "-", "-", "-", "-", "-", "7:30"],
                ["8:20", "-", "-", "-", "-", "-", "-", "-", "-", "9:00"],
                ["9:50", "-", "-", "-", "-", "-", "-", "-", "-", "10:30"],
                ["12:30", "12:33", "12:38", "12:40", "12:45", "12:51", "12:54", "12:57", "1:03", "1:15"],
                ["2:00", "2:03", "2:08", "2:10", "2:15", "2:21", "2:24", "2:27", "2:33", "2:45"],
                ["3:10", "3:13", "3:18", "3:20", "3:25", "3:31", "3:34", "3:37", "3:43", "3:55"],
                ["5:30", "5:35", "5:41", "5:45", "5:51", "5:58", "6:02", "6:04", "6:10", "6:20"],
                ["7:15", "7:20", "7:26", "7:31", "7:36", "7:43", "7:47", "7:49", "7:55", "8:05"],
                ["8:45", "8:50", "8:56", "9:01", "9:06", "9:13", "9:17", "9:19", "9:25", "9:35"],
                ["10:10", "-", "-", "-", "-", "-", "-", "-", "-", "10:40"]
            ],
        },
        {
            name: "To Caldwell University",
            stops: [
                "NPS - Newark", "Summer Ave - Newark", "Watsessing Ave - BLM", "Hill St - BLM", 
                "Municipal Plaza - BLM", "Venner Park - BLM", "Lackawanna - MNT", "Whole Foods - MNT", 
                "Pine St. - Verona", "Caldwell University"
            ],
            times: [
                ["7:30", "7:43", "7:49", "7:52", "7:58", "8:00", "8:03", "8:07", "8:16", "8:20"],
                ["9:00", "9:13", "9:19", "9:22", "9:26", "9:28", "9:33", "9:37", "9:46", "9:50"],
                ["10:30", "10:43", "10:49", "10:53", "10:57", "10:59", "11:02", "11:06", "11:15", "11:20"],
                ["1:15", "1:24", "1:28", "1:31", "1:35", "1:37", "1:39", "1:43", "1:54", "1:57"],
                ["2:45", "-", "-", "-", "-", "-", "-", "-", "-", "3:10"],
                ["3:55", "-", "-", "-", "-", "-", "-", "-", "-", "4:30"],
                ["6:20", "-", "-", "-", "-", "-", "-", "-", "-", "7:00"],
                ["8:05", "8:11", "8:13", "8:15", "8:17", "8:21", "8:24", "8:29", "8:35", "8:40"],
                ["9:35", "-", "-", "-", "-", "-", "-", "-", "-", "10:00"],
                ["10:40", "10:48", "10:54", "10:57", "11:00", "11:02", "11:06", "11:10", "11:16", "11:21"]
            ],
        },
    ],
};

export default function ShuttlePage() {
    const today = startOfDay(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
    const [scheduleData, setScheduleData] = useState<DisplayShuttleSchedule | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [usingDefault, setUsingDefault] = useState(false);

    const fetchSchedule = async (date: Date) => {
        setIsLoading(true);
        setError(null);
        setUsingDefault(false);
        setScheduleData(null); // Clear previous specific schedule
        console.log(`Fetching schedule for: ${format(date, 'yyyy-MM-dd')}`);

        try {
            const result = await getShuttleSchedule(date);
            console.log("Fetched data:", result);
            if (result) {
                // Map ParsedShuttleScheduleData to DisplayShuttleSchedule
                setScheduleData({ notes: result.notes, routes: result.routes });
                setUsingDefault(false);
            } else {
                setScheduleData(DEFAULT_SCHEDULE); // Use default if no specific schedule found
                setUsingDefault(true);
            }
        } catch (err) {
            console.error("Failed to fetch shuttle schedule:", err);
            setError("Failed to load schedule. Please try again later.");
            setScheduleData(DEFAULT_SCHEDULE); // Fallback to default on error
            setUsingDefault(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedDate) {
            fetchSchedule(selectedDate);
        } else {
            
            setScheduleData(DEFAULT_SCHEDULE);
            setUsingDefault(true);
            setIsLoading(false);
            setError(null);
        }
        
    }, [selectedDate]); 

    
    const displaySchedule: DisplayShuttleSchedule | null = scheduleData;

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(startOfDay(date)); 
        } else {
            setSelectedDate(undefined);
        }
    };

    const disabledMatcher = { before: today };

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold">Shuttle Schedule</h1>

            
            <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
                <Clock className="h-4 w-4 text-blue-600" />
                <AlertTitle className="font-semibold">Operating Information</AlertTitle>
                <AlertDescription>
                    The shuttle operates Monday through Thursday, from 7:30 AM to 10:00 PM. Schedules are subject to change. Please select a specific date to view the applicable schedule.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date Selection */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Select Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            disabled={disabledMatcher}
                            initialFocus
                        />
                        {selectedDate && (
                            <p className="text-sm text-center mt-2 text-muted-foreground">
                                Selected: {format(selectedDate, "PPP")}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Schedule Display */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>
                            Schedule for {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Default"}
                        </CardTitle>
                            {isLoading && (
                                <div className="flex items-center text-sm text-muted-foreground pt-2">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading schedule...
                                </div>
                            )}
                            {error && !isLoading && (
                                <Alert variant="destructive" className="mt-2">
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            {usingDefault && !isLoading && !error && (
                                <Alert variant="default" className="mt-2 bg-blue-50 border border-blue-200 text-blue-800">
                                    <Info className="h-4 w-4 text-blue-600" />
                                    <AlertTitle>Using Default Schedule</AlertTitle>
                                    <AlertDescription>
                                        No specific schedule found for {selectedDate ? format(selectedDate, "PPP") : "the selected date"}. Showing the standard schedule.
                                    </AlertDescription>
                                </Alert>
                            )}
                    </CardHeader>
                    <CardContent>
                        {!isLoading && displaySchedule ? (
                            <div>
                                {displaySchedule.notes && (
                                    <div className="mb-4 p-3 bg-gray-100 rounded-md border border-gray-200">
                                        <p className="text-sm font-medium text-gray-800">Notes:</p>
                                        <p className="text-sm text-gray-600">{displaySchedule.notes}</p>
                                    </div>
                                )}
                                {displaySchedule.routes && displaySchedule.routes.length > 0 ? (
                                    <Tabs defaultValue={displaySchedule.routes[0]?.name || "route-0"} className="w-full">
                                        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                            {displaySchedule.routes.map((route, index) => (
                                                <TabsTrigger key={route.name || `route-${index}`} value={route.name || `route-${index}`}>
                                                    {route.name || `Route ${index + 1}`}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                        {displaySchedule.routes.map((route, index) => (
                                            <TabsContent key={route.name || `route-${index}`} value={route.name || `route-${index}`}>
                                                <div className="overflow-x-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                {route.stops.map((stop, stopIndex) => (
                                                                    <TableHead key={`${stop}-${stopIndex}`}>{stop}</TableHead>
                                                                ))}
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {route.times.map((timeRow, timeIndex) => (
                                                                <TableRow key={`time-row-${timeIndex}`}>
                                                                    {timeRow.map((time, cellIndex) => (
                                                                        <TableCell key={`time-${timeIndex}-${cellIndex}`}>{time}</TableCell>
                                                                    ))}
                                                                    {/* Add empty cells if timeRow is shorter than stops array */}
                                                                    {Array.from({ length: Math.max(0, route.stops.length - timeRow.length) }).map((_, padIndex) => (
                                                                        <TableCell key={`pad-${timeIndex}-${padIndex}`}></TableCell>
                                                                    ))}
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                ) : (
                                    <p className="text-center text-muted-foreground py-4">No routes available in this schedule.</p>
                                )}
                            </div>
                        ) : (
                            !isLoading && <p className="text-center text-muted-foreground py-4">Select a date to view the schedule.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 
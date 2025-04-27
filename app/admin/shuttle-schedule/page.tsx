'use client';

import { useState, useEffect, useTransition } from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Edit, Loader2 } from "lucide-react";

import { getShuttleSchedules, ShuttleScheduleOverview } from "@/app/actions/getShuttleSchedules";
import { getShuttleScheduleById } from "@/app/actions/getShuttleScheduleById";
import type { ShuttleScheduleWithUpdater } from "@/types/shuttle";
import { ShuttleScheduleForm } from "./_components/ShuttleScheduleForm";


export default function ShuttleSchedulePage() {
    const [schedules, setSchedules] = useState<ShuttleScheduleOverview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoadingDialog, setIsLoadingDialog] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ShuttleScheduleWithUpdater | null>(null);
    const [, startTransition] = useTransition();

    // Fetch schedules on component mount
    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setIsLoading(true);
        try {
            const fetchedSchedules = await getShuttleSchedules();
            setSchedules(fetchedSchedules);
        } catch (error) {
            console.error("Failed to fetch schedules:", error);
            // Handle error display if needed
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (scheduleOverview: ShuttleScheduleOverview | null = null) => {
        if (scheduleOverview) {
            // Editing existing schedule: Fetch full data
            setIsLoadingDialog(true);
            setIsDialogOpen(true);
            setEditingSchedule(null);
            startTransition(async () => {
                try {
                    const fullSchedule = await getShuttleScheduleById(scheduleOverview.id);
                    if (fullSchedule) {
                        setEditingSchedule(fullSchedule);
                    } else {
                        console.error("Failed to fetch full schedule details for ID:", scheduleOverview.id);
                        setIsDialogOpen(false);
                    }
                } catch (error) {
                    console.error("Error fetching full schedule:", error);
                    setIsDialogOpen(false);
                } finally {
                     setIsLoadingDialog(false);
                }
            });
        } else {
            // Creating new schedule
            setEditingSchedule(null);
            setIsLoadingDialog(false);
            setIsDialogOpen(true);
        }
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingSchedule(null);
    };

    // Callback for successful form submission
    const handleFormSuccess = () => {
        handleDialogClose();
        fetchSchedules();
    };

    return (
        <ScrollArea className="h-full">
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Shuttle Schedules</h2>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                             <Button onClick={() => handleOpenDialog(null)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add New Schedule
                             </Button>
                        </DialogTrigger>
                        <DialogContent className="w-full min-w-[80vw] max-h-[85vh] overflow-y-auto">
                             <DialogHeader>
                                 <DialogTitle>
                                     {editingSchedule ? `Edit Schedule: ${new Date(editingSchedule.date).toLocaleDateString()}` : "Create New Schedule"}
                                 </DialogTitle>
                             </DialogHeader>
                             {isLoadingDialog ? (
                                <div className="flex justify-center items-center min-h-[300px]"> <Loader2 className="h-8 w-8 animate-spin" /> </div>
                             ) : isDialogOpen ? (
                                <ShuttleScheduleForm 
                                    initialData={editingSchedule}
                                    onSubmitSuccess={handleFormSuccess}
                                />
                             ) : (
                                <p>Loading schedules...</p>
                             )}
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Existing Schedules</CardTitle>
                        <CardDescription>Manage shuttle bus schedules by date.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p>Loading schedules...</p>
                        ) : schedules.length > 0 ? (
                            <Table>
                                <TableHeader><TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead>Last Updated By</TableHead>
                                        <TableHead>Last Updated At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow></TableHeader>
                                <TableBody>
                                    {schedules.map((schedule) => (
                                        <TableRow key={schedule.id}>
                                             <TableCell className="font-medium">{new Date(schedule.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{schedule.notes || "-"}</TableCell>
                                            <TableCell>{schedule.updatedBy?.name || "N/A"}</TableCell>
                                            <TableCell>{new Date(schedule.updatedAt).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                 <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(schedule)}> 
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                 </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p>No schedules created yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
    );
} 
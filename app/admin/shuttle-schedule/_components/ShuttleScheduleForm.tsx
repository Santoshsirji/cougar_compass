'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useState, useTransition, useEffect } from 'react';
import { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, PlusCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { upsertShuttleSchedule } from "@/app/actions/upsertShuttleSchedule";
import { deleteShuttleSchedule } from "@/app/actions/deleteShuttleSchedule";
import { shuttleScheduleFormSchema, type ShuttleFormValues } from "@/lib/schemas/shuttle";
import type { ShuttleScheduleWithUpdater } from "@/types/shuttle";
import { RouteFormSection } from "./RouteFormSection";

interface ShuttleScheduleFormProps {
    initialData?: ShuttleScheduleWithUpdater | null;
    onSubmitSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

const isStringArray = (value: unknown): value is string[] => 
    Array.isArray(value) && value.every(item => typeof item === 'string');

const isTimesArray = (value: unknown, stopsLength: number): value is (string | null)[][] =>
    Array.isArray(value) && 
    value.every(row => 
        Array.isArray(row) && 
        row.length === stopsLength &&
        row.every(item => typeof item === 'string' || item === null)
    );

const defaultStopsNewark = [
    'Caldwell University', 'Pine St. - Verona', 'Whole Foods - MNT', 'Lackawanna - MNT', 
    'Venner Park - BLM', 'Municipal Plaza - BLM', 'Hill St - BLM', 'Watsessing Ave - BLM', 
    'Summer Ave - Newark', 'NPS - Newark'
];
const defaultTimesNewark = [
    ['6:55', '-', '-', '-', '-', '-', '-', '-', '-', '7:30'],
    ['8:20', '-', '-', '-', '-', '-', '-', '-', '-', '9:00'],
    ['9:50', '-', '-', '-', '-', '-', '-', '-', '-', '10:30'],
    ['12:30', '12:33', '12:38', '12:40', '12:45', '12:51', '12:54', '12:57', '1:03', '1:15'],
    ['2:00', '2:03', '2:08', '2:10', '2:15', '2:21', '2:24', '2:27', '2:33', '2:45'],
    ['3:10', '3:13', '3:18', '3:20', '3:25', '3:31', '3:34', '3:37', '3:43', '3:55'],
    ['5:30', '5:35', '5:41', '5:45', '5:51', '5:58', '6:02', '6:04', '6:10', '6:20'],
    ['7:15', '7:20', '7:26', '7:31', '7:36', '7:43', '7:47', '7:49', '7:55', '8:05'],
    ['8:45', '8:50', '8:56', '9:01', '9:06', '9:13', '9:17', '9:19', '9:25', '9:35'],
    ['10:10', '-', '-', '-', '-', '-', '-', '-', '-', '10:40']
];

const defaultStopsCaldwell = [
    'NPS - Newark', 'Summer Ave - Newark', 'Watsessing Ave - BLM', 'Hill St - BLM', 
    'Municipal Plaza - BLM', 'Venner Park - BLM', 'Lackawanna - MNT', 'Whole Foods - MNT', 
    'Pine St. - Verona', 'Caldwell University'
];
const defaultTimesCaldwell = [
    ['7:30', '7:43', '7:49', '7:52', '7:58', '8:00', '8:03', '8:07', '8:16', '8:20'],
    ['9:00', '9:13', '9:19', '9:22', '9:26', '9:28', '9:33', '9:37', '9:46', '9:50'],
    ['10:30', '10:43', '10:49', '10:53', '10:57', '10:59', '11:02', '11:06', '11:15', '11:20'],
    ['1:15', '1:24', '1:28', '1:31', '1:35', '1:37', '1:39', '1:43', '1:54', '1:57'],
    ['2:45', '-', '-', '-', '-', '-', '-', '-', '-', '3:10'],
    ['3:55', '-', '-', '-', '-', '-', '-', '-', '-', '4:30'],
    ['6:20', '-', '-', '-', '-', '-', '-', '-', '-', '7:00'],
    ['8:05', '8:11', '8:13', '8:15', '8:17', '8:21', '8:24', '8:29', '8:35', '8:40'],
    ['9:35', '-', '-', '-', '-', '-', '-', '-', '-', '10:00'],
    ['10:40', '10:48', '10:54', '10:57', '11:00', '11:02', '11:06', '11:10', '11:16', '11:21']
];

const defaultScheduleData: ShuttleFormValues['scheduleData'] = [
    { name: "To Newark Penn Station", stops: defaultStopsNewark, times: defaultTimesNewark },
    { name: "To Caldwell University", stops: defaultStopsCaldwell, times: defaultTimesCaldwell }
];

function formatDataForForm(scheduleData: Prisma.JsonValue | undefined): ShuttleFormValues['scheduleData'] {
    const defaultRoute = { name: '', stops: [''], times: [['']] };
    if (!scheduleData || typeof scheduleData !== 'object' || scheduleData === null) {
        return [defaultRoute];
    }

    const typedData = scheduleData as Prisma.JsonObject;
    const routes: ShuttleFormValues['scheduleData'] = [];

    for (const routeName in typedData) {
        const routeDetails = typedData[routeName] as Prisma.JsonObject | undefined;
        
        if (routeDetails && 
            isStringArray(routeDetails.stops) && 
            routeDetails.stops.length > 0 &&
            isTimesArray(routeDetails.times, routeDetails.stops.length) &&
            routeDetails.times.length > 0
            ) {
            
            const currentStops = routeDetails.stops;
            const currentTimes = routeDetails.times;

            const formattedTimes = currentTimes.map(row =>
                row.map(time => time ?? '') 
            );

            routes.push({
                 name: routeName,
                 stops: currentStops, 
                 times: formattedTimes 
            });
        } else {
            console.warn(`Skipping route "${routeName}" due to invalid stops/times structure in JSON data.`);
        }
    }
    return routes.length > 0 ? routes : [defaultRoute];
}

export function ShuttleScheduleForm({ initialData, onSubmitSuccess, onDeleteSuccess }: ShuttleScheduleFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isSaving, startSaveTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const isEditing = !!initialData;
    const scheduleId = initialData?.id;

    const form = useForm<ShuttleFormValues>({
        resolver: zodResolver(shuttleScheduleFormSchema),
        defaultValues: {
            date: initialData?.date ? new Date(initialData.date) : new Date(),
            notes: initialData?.notes || '',
            scheduleData: initialData ? formatDataForForm(initialData.scheduleData) : defaultScheduleData,
        },
    });

    const { fields: routeFields, append: appendRoute, remove: removeRoute } = useFieldArray({ control: form.control, name: "scheduleData" });

    useEffect(() => {
        const resetDate = initialData?.date ? new Date(initialData.date) : new Date();
        resetDate.setHours(0,0,0,0);
        form.reset({
            date: resetDate,
            notes: initialData?.notes || '',
            scheduleData: initialData ? formatDataForForm(initialData.scheduleData) : defaultScheduleData
        });
    }, [initialData, form.reset]);

    async function onSubmit(data: ShuttleFormValues) {
        console.log("Form Data Submitted:", JSON.stringify(data, null, 2));
        startSaveTransition(async () => {
            const dataToUpsert = isEditing && scheduleId ? { ...data, id: scheduleId } : data;
            console.log("Data to Upsert:", dataToUpsert);
            const result = await upsertShuttleSchedule(dataToUpsert);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                onSubmitSuccess?.();
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    }

    async function handleDelete() {
        if (!scheduleId) {
            toast({ title: "Error", description: "Cannot delete unsaved schedule.", variant: "destructive" });
            return;
        }

        startDeleteTransition(async () => {
            const result = await deleteShuttleSchedule({ id: scheduleId });
            if (result.success) {
                toast({ title: "Success", description: result.message });
                if (onDeleteSuccess) {
                    onDeleteSuccess();
                } else {
                    router.push('/admin/shuttle-schedule');
                }
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Schedule Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <FormField
                             control={form.control}
                             name="date"
                             render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Schedule Date *</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    disabled={isEditing || isSaving || isDeleting}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        const newDate = new Date(date);
                                                        newDate.setHours(0,0,0,0);
                                                        field.onChange(newDate);
                                                    } else {
                                                         field.onChange(date);
                                                    }
                                                }}
                                                initialFocus
                                                disabled={isEditing || isSaving || isDeleting}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        {isEditing ? "Date cannot be changed once a schedule is created." : "Select the date this schedule applies to."}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control} name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Optional notes for this schedule (e.g., Holiday Schedule, Reduced Service)" {...field} disabled={isSaving || isDeleting} />
                                    </FormControl>
                                    <FormDescription>Any relevant information about this specific schedule.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                 <Card>
                     <CardHeader>
                        <CardTitle>Routes & Times</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {routeFields.map((routeField, index) => (
                             <RouteFormSection
                                key={routeField.id}
                                routeIndex={index}
                                removeRoute={removeRoute}
                                control={form.control}
                                register={form.register}
                                setValue={form.setValue}
                                getValues={form.getValues}
                                formState={form.formState}
                                canRemoveRoute={routeFields.length > 1}
                            />
                         ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendRoute({ name: "", stops: [""], times: [[""]] })} disabled={isSaving || isDeleting}> <PlusCircle className="mr-2 h-4 w-4" /> Add Route </Button>
                     </CardContent>
                </Card>

                <div className="flex justify-end space-x-3 sticky bottom-0 bg-background py-4 px-6 border-t -mx-6 -mb-8 rounded-b-lg">
                     {isEditing && scheduleId && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button type="button" variant="destructive" disabled={isDeleting || isSaving}>
                                     {isDeleting ? "Deleting..." : "Delete Schedule"}
                                 </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the shuttle schedule
                                    for {initialData?.date ? format(new Date(initialData.date), "PPP") : "this date"}.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    {isDeleting ? "Deleting..." : "Yes, delete schedule"}
                                 </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     )}
                    <Button type="submit" disabled={isSaving || isDeleting}>
                        {isSaving ? "Saving..." : (isEditing ? "Save Changes" : "Create Schedule")}
                    </Button>
                </div>
            </form>
        </Form>
    );
} 
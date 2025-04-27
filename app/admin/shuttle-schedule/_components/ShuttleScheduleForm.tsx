'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import {  DatePicker } from "@/components/ui/date-picker";

import { upsertShuttleSchedule } from "@/app/actions/upsertShuttleSchedule";
import { deleteShuttleSchedule } from "@/app/actions/deleteShuttleSchedule";
import { shuttleScheduleFormSchema, ShuttleFormValues } from "@/lib/schemas/shuttle";
import type { ShuttleScheduleWithUpdater } from "@/types/shuttle";
import { RouteFormSection } from "./RouteFormSection";

interface ShuttleScheduleFormProps {
    initialData: ShuttleScheduleWithUpdater | null;
    onSubmitSuccess: () => void;
}

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

type ScheduleDataType = Record<string, { stops: string[], times: string[][] }>;

function formatDataForForm(prismaData: ScheduleDataType | null | undefined): ShuttleFormValues['scheduleData'] {
     if (!prismaData || typeof prismaData !== 'object') return [];
     return Object.keys(prismaData).map(routeName => ({
        name: routeName,
        stops: prismaData[routeName]?.stops || [],
        times: prismaData[routeName]?.times || [],
    }));
}

export function ShuttleScheduleForm({ initialData, onSubmitSuccess }: ShuttleScheduleFormProps) {
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const { toast } = useToast();
    const isEditing = !!initialData;

    const form = useForm<ShuttleFormValues>({
        resolver: zodResolver(shuttleScheduleFormSchema),
        defaultValues: initialData ? {
            date: initialData.date ? new Date(initialData.date) : undefined,
            notes: initialData.notes ?? '',
            scheduleData: formatDataForForm(initialData.scheduleData),
        } : {
            date: undefined,
            notes: '',
            scheduleData: [
                { name: 'To Newark', stops: defaultStopsNewark, times: defaultTimesNewark },
                { name: 'To Caldwell', stops: defaultStopsCaldwell, times: defaultTimesCaldwell },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "scheduleData",
    });

    useEffect(() => {
        if (initialData) {
            const resetDate = initialData.date ? new Date(initialData.date) : undefined;
            form.reset({
                date: resetDate,
                notes: initialData.notes ?? '',
                scheduleData: formatDataForForm(initialData?.scheduleData),
            });
        } else {
             form.reset({
                 date: undefined,
                 notes: '',
                 scheduleData: [
                     { name: 'To Newark', stops: defaultStopsNewark, times: defaultTimesNewark },
                     { name: 'To Caldwell', stops: defaultStopsCaldwell, times: defaultTimesCaldwell },
                 ],
             });
        }
    }, [initialData, form]);

    async function onSubmit(data: ShuttleFormValues) {
        const dataToUpsert = isEditing ? { ...data, id: initialData!.id } : data;
        
        startTransition(async () => {
            try {
                const result = await upsertShuttleSchedule(dataToUpsert);
                if (result.success) {
                    toast({ title: "Success", description: result.message });
                    onSubmitSuccess();
                } else {
                    toast({ title: "Error", description: result.message || "Failed to save schedule.", variant: "destructive" });
                }
            } catch (error: unknown) {
                console.error("Submit error:", error);
                 let message = "An unexpected error occurred.";
                 if (error instanceof Error) message = error.message;
                toast({ title: "Error", description: message, variant: "destructive" });
            }
        });
    }

    const handleDelete = () => {
        if (!initialData?.id) return;
        startDeleteTransition(async () => {
            try {
                const result = await deleteShuttleSchedule(initialData.id);
                 if (result.success) {
                    toast({ title: "Success", description: result.message });
                    onSubmitSuccess();
                } else {
                    toast({ title: "Error", description: result.message, variant: "destructive" });
                }
            } catch (error: unknown) {
                 console.error("Delete error:", error);
                 let message = "Failed to delete schedule.";
                 if (error instanceof Error) message = error.message;
                 toast({ title: "Error", description: message, variant: "destructive" });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Schedule Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger>
                                        <FormControl>
                                            <DatePicker 
                                                selected={field.value}
                                                onSelect={field.onChange}
                                            />
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date("1900-01-01")}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., Finals week schedule, Reduced service..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <h3 className="text-lg font-medium border-t pt-4">Routes</h3>
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <RouteFormSection 
                            key={field.id} 
                            routeIndex={index}
                            removeRoute={remove}
                            control={form.control}
                            register={form.register}
                            setValue={form.setValue}
                            getValues={form.getValues}
                            formState={form.formState}
                            canRemoveRoute={fields.length > 1}
                        />
                    ))}
                </div>

                 <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', stops: [''], times: [['']] })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Route
                </Button>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                     {isEditing && (
                         <Button 
                            type="button" 
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting || isPending}
                        >
                             {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                             Delete Schedule
                         </Button>
                     )}
                    <Button type="submit" disabled={isPending || isDeleting}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isEditing ? "Update Schedule" : "Create Schedule"}
                    </Button>
                </div>
            </form>
        </Form>
    );
} 
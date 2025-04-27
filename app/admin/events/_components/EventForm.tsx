'use client';

import { useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import type { EventWithCreator } from '@/app/actions/eventActions'; // Reuse type if needed

// Zod schema for event validation (mirroring the one in eventActions)
// We define it here again for client-side validation with react-hook-form
const eventFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().optional(),
  date: z.date({ required_error: 'Event date is required.' }), // Use z.date for Calendar
  location: z.string().optional(),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')), 
});

type EventFormValues = z.infer<typeof eventFormSchema>;

// Define a more specific type for the server action result
type ServerActionResult = {
    success: boolean;
    message: string;
    // Use Zod's flattened error type if that's what the action returns
    errors?: z.inferFlattenedErrors<typeof eventFormSchema>['fieldErrors'];
};

interface EventFormProps {
    initialData?: EventWithCreator | null; // Event data for editing
    onSubmitAction: (data: EventFormValues) => Promise<ServerActionResult>; // Server action (create or update)
    formTitle: string;
    formDescription: string;
    submitButtonText: string;
}

export function EventForm({
    initialData,
    onSubmitAction,
    formTitle,
    formDescription,
    submitButtonText,
}: EventFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: initialData?.title || '',
            description: initialData?.description || '',
            // Ensure date is a Date object; handle potential string/Date from server
            date: initialData?.date ? new Date(initialData.date) : undefined,
            location: initialData?.location || '',
            imageUrl: initialData?.imageUrl || '',
        },
    });

     // Reset form if initialData changes (e.g., navigating between edit pages)
     useEffect(() => {
        if (initialData) {
            form.reset({
                title: initialData.title,
                description: initialData.description || '',
                date: new Date(initialData.date),
                location: initialData.location || '',
                imageUrl: initialData.imageUrl || '',
            });
        } else {
            // Reset to empty for create form
             form.reset({
                title: '', description: '', date: undefined, location: '', imageUrl: ''
            });
        }
    }, [initialData, form]);


    const onSubmit = (values: EventFormValues) => {
        startTransition(async () => {
            try {
                // No need to check initialData here if onSubmitAction handles both create/update
                const result = await onSubmitAction(values);

                if (result.success) {
                    toast({ title: "Success", description: result.message });
                    router.push('/admin/events');
                    router.refresh();
                } else {
                    // Handle potential Zod flattened errors
                    const errorMessages = result.errors 
                        ? Object.entries(result.errors)
                            .map(([field, messages]) => `${field}: ${messages?.join(', ')}`)
                            .join('\n')
                        : result.message;
                    toast({ 
                        title: "Error", 
                        description: errorMessages || "Failed to save event.", 
                        variant: "destructive" 
                    });
                }
            } catch (error: unknown) {
                console.error("Error saving event:", error);
                let message = "An unexpected error occurred.";
                if (error instanceof Error) {
                    message = error.message;
                }
                toast({ title: "Error", description: message, variant: "destructive" });
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{formTitle}</CardTitle>
                <CardDescription>{formDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event Title *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Spring Fling" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Provide details about the event..."
                                            {...field}
                                            disabled={isPending}
                                            value={field.value ?? ''} // Handle potential null/undefined
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date */}
                         <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date *</FormLabel>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                             <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                     disabled={isPending}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP") // Format Date object
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
                                                onSelect={field.onChange} // react-hook-form handles the value as Date
                                                disabled={(date) => date < new Date("1900-01-01") || isPending } // Example disabled dates
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Location */}
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Campus Green, Newman Center" {...field} disabled={isPending} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Image URL */}
                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image URL</FormLabel>
                                    <FormControl>
                                        <Input type="url" placeholder="https://example.com/image.jpg" {...field} disabled={isPending} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2">
                             <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}> Cancel </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {submitButtonText}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 
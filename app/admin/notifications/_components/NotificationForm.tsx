'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTransition } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { createNotification } from "@/app/actions/createNotification";
import { cn } from "@/lib/utils";

// Zod schema (can be defined here or imported if shared)
const notificationFormSchema = z.object({
    title: z.string().min(1, { message: "Title is required." }),
    message: z.string().min(1, { message: "Message is required." }),
    expiresAt: z.date().optional().nullable(),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

interface NotificationFormProps {
    // initialData?: NotificationWithCreator | null; // For editing later
    onSubmitSuccess?: () => void; // Callback after successful submission
}

export function NotificationForm({ onSubmitSuccess }: NotificationFormProps) {
    const { toast } = useToast();
    const [isSaving, startTransition] = useTransition();
    // const isEditing = !!initialData;

    const form = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationFormSchema),
        defaultValues: {
            title: '', // initialData?.title || '',
            message: '', // initialData?.message || '',
            expiresAt: null // initialData?.expiresAt || null,
        },
    });

    async function onSubmit(data: NotificationFormValues) {
        startTransition(async () => {
            // Logic for editing vs creating would go here if initialData existed
             const result = await createNotification(data);
            
            if (result.success) {
                toast({ title: "Success", description: result.message });
                form.reset(); // Reset form on success
                onSubmitSuccess?.(); // Call the callback (e.g., close dialog)
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title *</FormLabel>
                            <FormControl>
                                <Input placeholder="Important Announcement" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Message *</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter the notification details here..."
                                    className="resize-none"
                                    {...field}
                                    rows={5}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Expires At (Optional)</FormLabel>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
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
                                        selected={field.value ?? undefined}
                                        onSelect={(date: Date | undefined) => field.onChange(date || null)} // Pass null if date is cleared
                                        disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))} // Disable past dates
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end pt-4">
                     <Button type="submit" disabled={isSaving}>
                         {isSaving ? "Creating..." : "Create Notification"} 
                         {/* Button text would change if editing */} 
                     </Button>
                 </div>
            </form>
        </Form>
    );
} 
'use server';

import { z } from 'zod';
import { getServerSession } from 'next-auth'; // Import getServerSession
import { authOptions } from '@/lib/auth'; // Updated import path
import { db } from '@/lib/db'; // Assuming prisma client is exported from lib/db
import { Role } from '@prisma/client'; // Import Role enum
import { revalidatePath } from 'next/cache';

// Zod schema for event validation
const eventSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().optional(),
  date: z.coerce.date({ message: 'Invalid date format' }), // Coerce string/number to Date
  location: z.string().optional(),
  imageUrl: z.string().url({ message: 'Invalid image URL' }).optional().or(z.literal('')), // Optional, allow empty string
});

export type EventWithCreator = Awaited<ReturnType<typeof getEvents>>[number];

// Action to get all events
export async function getEvents() {
  try {
    const events = await db.event.findMany({
      orderBy: {
        date: 'desc', // Order by event date, newest first
      },
      include: {
        createdBy: {
          select: { name: true, id: true }, // Select only necessary user fields
        },
      },
    });
    return events;
  } catch (error) {
    console.error('Failed to fetch events:', error);
    // Return empty array or throw a custom error
    return [];
  }
}

// Action to create a new event
export async function createEvent(formData: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { success: false, message: 'Unauthorized: Admin access required.' };
  }
  const userId = session.user.id;

  const result = eventSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, message: 'Invalid form data.', errors: result.error.flatten().fieldErrors };
  }

  const { title, description, date, location, imageUrl } = result.data;

  try {
    await db.event.create({
      data: {
        title,
        description: description || null, // Store null if empty
        date,
        location: location || null,
        imageUrl: imageUrl || null,
        createdById: userId,
      },
    });
    revalidatePath('/admin/events'); // Revalidate the events page cache
    revalidatePath('/events'); // Also revalidate public events page if exists
    return { success: true, message: 'Event created successfully.' };
  } catch (error) {
    console.error('Failed to create event:', error);
    return { success: false, message: 'Database error: Failed to create event.' };
  }
}

// Action to update an existing event
export async function updateEvent(eventId: string, formData: unknown) {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return { success: false, message: 'Unauthorized: Admin access required.' };
    }

    const result = eventSchema.safeParse(formData);
    if (!result.success) {
      return { success: false, message: 'Invalid form data.', errors: result.error.flatten().fieldErrors };
    }

    // Check if event exists
    const existingEvent = await db.event.findUnique({ where: { id: eventId } });
    if (!existingEvent) {
        return { success: false, message: 'Event not found.' };
    }

    const { title, description, date, location, imageUrl } = result.data;

    try {
        await db.event.update({
            where: { id: eventId },
            data: {
                title,
                description: description || null,
                date,
                location: location || null,
                imageUrl: imageUrl || null,
                // createdById remains unchanged
            },
        });
        revalidatePath('/admin/events');
        revalidatePath('/events'); // Also revalidate public events page if exists
        return { success: true, message: 'Event updated successfully.' };
    } catch (error) {
        console.error('Failed to update event:', error);
        return { success: false, message: 'Database error: Failed to update event.' };
    }
}


// Action to delete an event
export async function deleteEvent(eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { success: false, message: 'Unauthorized: Admin access required.' };
  }

  // Check if event exists before attempting delete
  const existingEvent = await db.event.findUnique({ where: { id: eventId } });
    if (!existingEvent) {
        // Optionally return success if goal is idempotent deletion
        // return { success: true, message: 'Event already deleted or never existed.' };
        return { success: false, message: 'Event not found.' };
    }

  try {
    await db.event.delete({
      where: { id: eventId },
    });
    revalidatePath('/admin/events');
    revalidatePath('/events'); // Also revalidate public events page if exists
    return { success: true, message: 'Event deleted successfully.' };
  } catch (error) {
    console.error('Failed to delete event:', error);
    return { success: false, message: 'Database error: Failed to delete event.' };
  }
} 
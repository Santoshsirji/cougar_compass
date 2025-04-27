'use server';

import { db } from "@/lib/db";
import { Prisma, Event } from "@prisma/client";

// Define the type for the data we expect to return for the public page
// Exclude creator info if not needed publicly
export type PublicEvent = Prisma.EventGetPayload<{
    select: {
        id: true,
        title: true,
        description: true,
        date: true,
        location: true,
        imageUrl: true,
        createdAt: true, // Optional: useful for sorting if dates are the same
    }
}>;

/**
 * Fetches current and upcoming events for public display.
 * Filters events where the date is today or later.
 * Orders events by date ascending (soonest first).
 */
export async function getPublicEvents(): Promise<PublicEvent[]> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to the beginning of the day for comparison

        const events = await db.event.findMany({
            where: {
                date: { gte: today } // Get events from today onwards
            },
            orderBy: {
                date: 'asc', // Show upcoming events first
            },
            select: {
                id: true,
                title: true,
                description: true,
                date: true,
                location: true,
                imageUrl: true,
                createdAt: true,
            }
        });

        return events;

    } catch (error) {
        console.error("Error fetching public events:", error);
        return []; // Return empty array on error
    }
} 
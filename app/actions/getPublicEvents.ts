'use server';

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Define the type explicitly with selected fields
export type PublicEvent = Prisma.EventGetPayload<{
  select: {
    id: true,
    title: true,
    description: true,
    date: true,
    location: true,
    imageUrl: true,
    createdAt: true,
    // Explicitly exclude: createdById, updatedAt, createdBy
  }
}>;

/**
 * Fetches current and upcoming events for public display.
 * Filters events where the date is today or later.
 * Orders events by date ascending (soonest first).
 */
export async function getPublicEvents(): Promise<PublicEvent[]> {
    try {
        const events = await db.event.findMany({
            where: {
                date: { 
                    gte: new Date() // Only fetch events from today onwards
                }
            },
            orderBy: {
                date: 'asc', 
            },
            select: {
                id: true,
                title: true,
                description: true,
                date: true,
                location: true,
                imageUrl: true,
                createdAt: true,
                // Exclude createdById, updatedAt, createdBy
            }
        });
        // Cast to ensure type safety, though select should handle it
        return events as PublicEvent[];
    } catch (error) {
        console.error("Error fetching public events:", error);
        return [];
    }
} 
'use server';

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Define the return type, including the creator's name
export type EventWithCreator = Prisma.EventGetPayload<{
  include: {
    createdBy: {
      select: {
        name: true;
        id: true;
      }
    }
  }
}>;

/**
 * Fetches all events, ordered by date (newest first).
 * Includes the name of the admin user who created the event.
 */
export async function getEvents(): Promise<EventWithCreator[]> {
    try {
        const events = await db.event.findMany({
            orderBy: {
                date: 'desc', // Reverted back to 'date'
            },
            include: {
                createdBy: { // Include the related User record
                    select: {
                        name: true, // Only select the user's name
                        id: true    // And ID if needed
                    }
                }
            }
        });

        // console.log(`getEvents: Found ${events.length} events.`); // Optional logging
        return events;

    } catch (error) {
        console.error("Error fetching events:", error);
        // Depending on error handling strategy, you might throw, return [], or return a specific error object
        throw new Error("Failed to fetch events."); // Throwing error for now
    }
} 
'use server';

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Define the type for the data we expect to return
// Includes ID needed for links/keys, updatedAt, and updater's name
export type ShuttleScheduleOverview = Prisma.ShuttleScheduleGetPayload<{
    select: {
        id: true,
        date: true,
        notes: true,
        updatedAt: true,
        // Include who updated it
        updatedBy: { select: { name: true } }
    }
}>;

/**
 * Fetches all shuttle schedules, ordered by date descending.
 */
export async function getShuttleSchedules(): Promise<ShuttleScheduleOverview[]> {
    try {
        const schedules = await db.shuttleSchedule.findMany({
            orderBy: {
                date: 'desc', // Show most recent dates first
            },
            select: {
                id: true,
                date: true,
                notes: true,
                updatedAt: true,
                updatedBy: { select: { name: true } } // Include updater's name
            }
        });

        return schedules;

    } catch (error) {
        console.error("Error fetching shuttle schedules:", error);
        throw new Error("Failed to fetch shuttle schedules."); // Or return empty array
    }
} 
'use server';

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Define the type for the data we expect to return
export type ShuttleScheduleData = Prisma.ShuttleScheduleGetPayload<{
    select: {
        id: true,
        date: true,
        notes: true,
        scheduleData: true, // includes the JSON field
        updatedAt: true,
        userId: true // ID of user who last updated
    }
}>;

/**
 * Fetches the shuttle schedule for a specific date.
 * Returns null if no schedule is found for that date.
 */
export async function getShuttleSchedule(targetDate: Date): Promise<ShuttleScheduleData | null> {
    try {
        // Optional: Ensure only date part is used if needed
        // targetDate.setHours(0,0,0,0);

        const schedule = await db.shuttleSchedule.findUnique({
            where: { date: targetDate },
            select: {
                id: true,
                date: true,
                notes: true,
                scheduleData: true,
                updatedAt: true,
                userId: true,
                // Optionally include updatedBy user details if needed later
                // updatedBy: { select: { name: true, id: true } }
            }
        });

        if (!schedule) {
            console.log(`getShuttleSchedule: No schedule found for ${targetDate.toLocaleDateString()}`);
            return null;
        }

        // Ensure Prisma's JsonValue is compatible or cast if necessary,
        // though Prisma types usually handle this.
        return schedule;

    } catch (error) {
        console.error(`Error fetching shuttle schedule for ${targetDate.toLocaleDateString()}:`, error);
        // Consider more specific error handling or re-throwing
        return null;
    }
} 
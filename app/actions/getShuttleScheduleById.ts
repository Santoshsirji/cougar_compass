'use server';

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { ShuttleScheduleWithUpdater } from "@/types/shuttle"; // Use the detailed type

/**
 * Fetches a single shuttle schedule by its ID, including full details.
 */
export async function getShuttleScheduleById(id: string): Promise<ShuttleScheduleWithUpdater | null> {
    if (!id) {
        console.log("getShuttleScheduleById: No ID provided.");
        return null;
    }

    try {
        const schedule = await db.shuttleSchedule.findUnique({
            where: { id: id },
            include: {
                updatedBy: { // Include the related user
                    select: {
                        name: true, // Select the user's name
                        // id: true // Optionally include user ID if needed by the form
                    },
                },
            },
        });

        if (!schedule) {
            console.log(`getShuttleScheduleById: No schedule found for ID: ${id}`);
            return null;
        }

        // Type assertion might be needed if Prisma's inferred type doesn't perfectly match
        // but usually `include` makes it align with relation types.
        return schedule as ShuttleScheduleWithUpdater;

    } catch (error) {
        console.error(`Error fetching shuttle schedule by ID ${id}:`, error);
        throw new Error("Failed to fetch shuttle schedule details."); // Or return null
    }
} 
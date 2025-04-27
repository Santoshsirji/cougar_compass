'use server';

// Global imports
// Removed unused Prisma import

// Local imports
import { db } from "@/lib/db";
import type { ShuttleScheduleWithUpdater } from "@/types/shuttle"; // Import the specific type needed

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
            where: { id },
            include: {
                updatedBy: {
                    select: {
                        name: true,
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
        console.error(`Error fetching shuttle schedule with ID ${id}:`, error);
        return null;
    }
} 
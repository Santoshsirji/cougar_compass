'use server';

import { db } from "@/lib/db";
import { DayOfWeek, Prisma } from "@prisma/client";
import type { FormattedShuttleRoute, FormattedShuttleSchedule } from "@/types/shuttle"; // Import the types

// Helper function to parse the Prisma JSON into our formatted structure
function parseAndFormatScheduleData(jsonData: Prisma.JsonValue | null): FormattedShuttleRoute[] {
    const routes: FormattedShuttleRoute[] = [];
    if (!jsonData || typeof jsonData !== 'object' || jsonData === null) {
        return routes; // Return empty if no data
    }

    const scheduleObject = jsonData as Prisma.JsonObject;

    for (const routeName in scheduleObject) {
        const routeDetails = scheduleObject[routeName] as Prisma.JsonObject;
        // Basic validation of the structure within the JSON
        if (
            routeDetails && 
            typeof routeDetails === 'object' && 
            Array.isArray(routeDetails.stops) && 
            Array.isArray(routeDetails.times) &&
            // Ensure stops are strings and times are arrays of strings
            routeDetails.stops.every((s): s is string => typeof s === 'string') &&
            routeDetails.times.every((t): t is string[] => Array.isArray(t) && t.every((ts): ts is string => typeof ts === 'string'))
        ) {
            routes.push({
                name: routeName,
                stops: routeDetails.stops as string[],
                times: routeDetails.times as string[][],
            });
        } else {
             console.warn(`Skipping invalid route data found in JSON for route: ${routeName}`);
        }
    }
    return routes;
}

export async function getShuttleScheduleForDay(dayOfWeek: DayOfWeek): Promise<FormattedShuttleSchedule | null> {
    try {
        console.log(`Fetching schedule for day: ${dayOfWeek}`);
        const schedule = await db.shuttleSchedule.findUnique({
            where: { dayOfWeek: dayOfWeek },
            select: {
                dayOfWeek: true,
                notes: true,
                scheduleData: true, // Select the JSON data
                // No need to select updater info for the public page
            },
        });

        if (!schedule) {
            console.log(`No schedule found for ${dayOfWeek}.`);
            return null; // No schedule found for this day
        }

        // Parse the JSON data into the desired format
        const formattedRoutes = parseAndFormatScheduleData(schedule.scheduleData);

        const result: FormattedShuttleSchedule = {
            dayOfWeek: schedule.dayOfWeek,
            notes: schedule.notes,
            routes: formattedRoutes,
        };
        
        // console.log(`Returning formatted schedule for ${dayOfWeek}:`, result); // Optional debug log
        return result;

    } catch (error) {
        console.error(`Error fetching shuttle schedule for ${dayOfWeek}:`, error);
        // Re-throw or return null/error indicator based on desired error handling
        throw new Error(`Failed to fetch schedule for ${dayOfWeek}.`);
    }
} 
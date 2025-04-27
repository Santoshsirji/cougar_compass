'use server';

import { db } from "@/lib/db";
// import { DayOfWeek, Prisma } from "@prisma/client"; // DayOfWeek no longer needed
import { Prisma } from "@prisma/client";
import type { FormattedShuttleRoute, FormattedShuttleSchedule } from "@/types/shuttle"; // Import the types

// Type Guards
const isStringArray = (value: unknown): value is string[] => 
    Array.isArray(value) && value.every(item => typeof item === 'string');

const isTimesArray = (value: unknown, stopsLength: number): value is (string | null)[][] =>
    Array.isArray(value) && 
    value.every(row => 
        Array.isArray(row) && 
        row.length === stopsLength &&
        row.every(item => typeof item === 'string' || item === null)
    );

// Helper function remains the same
function parseAndFormatScheduleData(jsonData: Prisma.JsonValue | null): FormattedShuttleRoute[] {
    const routes: FormattedShuttleRoute[] = [];
    if (!jsonData || typeof jsonData !== 'object' || jsonData === null) {
        return routes; 
    }
    const scheduleObject = jsonData as Prisma.JsonObject;
    for (const routeName in scheduleObject) {
        const routeDetails = scheduleObject[routeName] as Prisma.JsonObject | undefined;
        
        // Use refined type guards
        if (routeDetails && 
            isStringArray(routeDetails.stops) && 
            routeDetails.stops.length > 0 && // Now safe
            isTimesArray(routeDetails.times, routeDetails.stops.length) &&
            routeDetails.times.length > 0 // Now safe
            ) { 
            
            const currentStops = routeDetails.stops; // Type is string[]
            const currentTimes = routeDetails.times; // Type is (string | null)[][]

            routes.push({
                name: routeName,
                stops: currentStops, 
                 // Assuming times in DB are (string | null)[][]
                 // If they can be string[][], adjust the isTimesArray guard
                times: currentTimes as string[][], // Cast needed if return type is strict string[][]
            });
        } else {
             console.warn(`Skipping invalid route data found in JSON for route: ${routeName}`);
        }
    }
    return routes;
}

// Renamed function and changed parameter type
export async function getShuttleScheduleForDate(targetDate: Date): Promise<FormattedShuttleSchedule | null> {
    try {
        // Optional: Ensure only the date part is used for querying
        // const queryDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const queryDate = targetDate; // Assuming time part is zeroed out or handled elsewhere
        
        console.log(`Fetching schedule for date: ${queryDate.toLocaleDateString()}`);
        
        const schedule = await db.shuttleSchedule.findUnique({
            where: { date: queryDate }, // Use date field
            select: {
                date: true, // Select date field
                notes: true,
                scheduleData: true, 
            },
        });

        if (!schedule) {
            console.log(`No schedule found for ${queryDate.toLocaleDateString()}.`);
            return null; 
        }

        const formattedRoutes = parseAndFormatScheduleData(schedule.scheduleData);

        const result: FormattedShuttleSchedule = {
            date: schedule.date, // Use schedule.date
            notes: schedule.notes,
            routes: formattedRoutes,
        };
        
        return result;

    } catch (error) {
        console.error(`Error fetching shuttle schedule for ${targetDate.toLocaleDateString()}:`, error);
        throw new Error(`Failed to fetch schedule for ${targetDate.toLocaleDateString()}.`);
    }
} 
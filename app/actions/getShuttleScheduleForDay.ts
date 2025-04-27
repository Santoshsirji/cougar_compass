'use server';

// Global imports
import { Prisma } from "@prisma/client";

// Local imports
import { db } from "@/lib/db";
import type { FormattedShuttleRoute, FormattedShuttleSchedule } from "@/types/shuttle";

function parseAndFormatScheduleData(jsonData: Prisma.JsonValue | null): FormattedShuttleRoute[] {
    const routes: FormattedShuttleRoute[] = [];
    if (!jsonData || typeof jsonData !== 'object' || jsonData === null) {
        return routes;
    }

    const scheduleObject = jsonData as Prisma.JsonObject;

    for (const routeName in scheduleObject) {
        const routeDetails = scheduleObject[routeName] as Prisma.JsonObject;
        if (
            routeDetails && 
            typeof routeDetails === 'object' && 
            Array.isArray(routeDetails.stops) && 
            Array.isArray(routeDetails.times) &&
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

export async function getShuttleScheduleForDay(targetDate: Date): Promise<FormattedShuttleSchedule | null> { 
    try {
        console.log(`Fetching schedule for date: ${targetDate.toISOString()}`);
        const schedule = await db.shuttleSchedule.findUnique({
            where: { date: targetDate }, 
            select: {
                date: true,
                notes: true,
                scheduleData: true,
            },
        });

        if (!schedule) {
            console.log(`No schedule found for ${targetDate.toISOString()}.`);
            return null;
        }

        const formattedRoutes = parseAndFormatScheduleData(schedule.scheduleData);

        const result: FormattedShuttleSchedule = {
            date: schedule.date,
            notes: schedule.notes,
            routes: formattedRoutes,
        };
        
        return result;

    } catch (error) {
        console.error(`Error fetching shuttle schedule for ${targetDate.toISOString()}:`, error);
        return null;
    }
} 
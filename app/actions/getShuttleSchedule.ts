'use server';

// Global imports
import { Prisma } from "@prisma/client";

// Local imports
import { db } from "@/lib/db";
import type { FormattedShuttleRoute } from "@/types/shuttle";

function parseAndFormatScheduleData(jsonData: Prisma.JsonValue | null): FormattedShuttleRoute[] {
    const routes: FormattedShuttleRoute[] = [];
    if (!jsonData || typeof jsonData !== 'object' || jsonData === null) {
        return routes;
    }

    for (const routeName in jsonData) {
        if (Object.prototype.hasOwnProperty.call(jsonData, routeName)) {
            const routeDetails = (jsonData as Prisma.JsonObject)[routeName] as Prisma.JsonObject;
            if (
                routeDetails && 
                typeof routeDetails === 'object' && 
                Array.isArray(routeDetails.stops) && 
                Array.isArray(routeDetails.times) &&
                routeDetails.stops.every((s): s is string => typeof s === 'string') &&
                routeDetails.times.every((t): t is (string | null)[] => 
                    Array.isArray(t) && 
                    t.every((ts): ts is string | null => typeof ts === 'string' || ts === null)
                )
            ) {
                const mappedTimes = (routeDetails.times as (string | null)[][]).map(row => 
                    row.map(time => time ?? '')
                );

                routes.push({
                    name: routeName,
                    stops: routeDetails.stops as string[],
                    times: mappedTimes as string[][],
                });
            } else {
                console.warn(`Skipping invalid route data found in JSON for route: ${routeName}`);
            }
        }
    }
    return routes;
}

export type ParsedShuttleScheduleData = {
    id: string;
    date: Date;
    notes: string | null;
    routes: FormattedShuttleRoute[];
    updatedAt: Date;
    userId: string; 
};

export async function getShuttleSchedule(targetDate: Date): Promise<ParsedShuttleScheduleData | null> {
    try {
        const startOfDayUTC = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0));
        const startOfNextDayUTC = new Date(startOfDayUTC);
        startOfNextDayUTC.setUTCDate(startOfNextDayUTC.getUTCDate() + 1);
        
        console.log(`getShuttleSchedule: Fetching schedule for date range: >= ${startOfDayUTC.toISOString()} and < ${startOfNextDayUTC.toISOString()}`);

        const schedule = await db.shuttleSchedule.findFirst({
            where: { 
                date: { 
                    gte: startOfDayUTC, 
                    lt: startOfNextDayUTC  
                }
             }, 
            select: {
                id: true,
                date: true,
                notes: true,
                scheduleData: true, 
                updatedAt: true,
                userId: true,
            },
            orderBy: {
                date: 'asc' 
            }
        });

        if (!schedule) {
            console.log(`getShuttleSchedule: No schedule found within the range for ${targetDate.toLocaleDateString()}`);
            return null;
        }
        
        console.log(`getShuttleSchedule: Found schedule ID ${schedule.id} for ${targetDate.toLocaleDateString()}, parsing data...`);

        
        const formattedRoutes = parseAndFormatScheduleData(schedule.scheduleData);
        
        console.log(`getShuttleSchedule: Parsed ${formattedRoutes.length} routes.`);

        const result: ParsedShuttleScheduleData = {
            id: schedule.id,
            date: schedule.date,
            notes: schedule.notes,
            routes: formattedRoutes, 
            updatedAt: schedule.updatedAt,
            userId: schedule.userId
        };

        return result;

    } catch (error) {
        console.error(`Error fetching shuttle schedule for ${targetDate.toLocaleDateString()}:`, error);
        return null;
    }
} 
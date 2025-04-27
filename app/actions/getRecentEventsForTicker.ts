'use server';

import { db } from "@/lib/db";

// Type for the returned data (just title and date for context)
export type RecentEventTickerItem = {
    id: string;
    title: string;
    date: Date;
};

/**
 * Fetches the titles and dates of the most recent events for the news ticker.
 * Limits the results to a specified number (e.g., 5).
 */
export async function getRecentEventsForTicker(limit: number = 5): Promise<RecentEventTickerItem[]> {
    try {
        const recentEvents = await db.event.findMany({
            take: limit, // Limit the number of results
            orderBy: {
                date: 'desc', // Get the most recent events based on their date
            },
            select: {
                id: true,
                title: true,
                date: true, // Include date for potential display logic or sorting confirmation
            },
        });

        return recentEvents;

    } catch (error) {
        console.error("Error fetching recent events for ticker:", error);
        return []; // Return empty array on error
    }
} 
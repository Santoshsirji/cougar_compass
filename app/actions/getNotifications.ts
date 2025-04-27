'use server';

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Re-introduce the type including creator info
export type NotificationWithCreator = Prisma.NotificationGetPayload<{
    include: {
        createdBy: {
            select: {
                name: true;
                id: true;
            }
        }
    }
}>;

// No specific input needed, fetching general notifications

/**
 * Fetches active notifications for display, including creator info.
 * Currently fetches notifications that have not expired.
 * Requires user to be logged in.
 */
export async function getNotifications(): Promise<NotificationWithCreator[]> {
    try {
        // Ensure user is logged in to view notifications
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            console.log("getNotifications: User not authenticated.");
            return []; // Return empty array if not logged in
        }

        const now = new Date();

        const notifications = await db.notification.findMany({
            where: {
                OR: [
                    { expiresAt: null }, // Notifications that never expire
                    { expiresAt: { gte: now } } // Notifications that have not yet expired
                ]
            },
            orderBy: {
                createdAt: 'desc', // Show newest first
            },
            include: { // Use include to get related creator data
                 createdBy: {
                     select: {
                         name: true,
                         id: true    
                     }
                 }
            }
            // Removed select clause as include is now used
        });

        // Type assertion is usually not needed with include, but good practice
        return notifications as NotificationWithCreator[]; 

    } catch (error) {
        console.error("Error fetching notifications:", error);
        // Depending on error handling strategy, could throw or return empty
        return []; 
    }
} 
// Global imports
// Removed unused Prisma import

// Local imports
import { db } from "@/lib/db";
import type { NotificationWithCreator } from "./getNotifications"; // Assuming this type exists

export async function getNotificationById(id: string): Promise<NotificationWithCreator | null> {
    try {
        const notification = await db.notification.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return notification;
    } catch (error) {
        console.error(`Error fetching notification with ID ${id}:`, error);
        return null;
    }
} 
'use server';

import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== Role.ADMIN) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const existingNotification = await db.notification.findUnique({
            where: { id: notificationId },
        });

        if (!existingNotification) {
            // return { success: true, message: "Notification already deleted." }; // Option 1: Idempotent
            return { success: false, message: "Notification not found." };    // Option 2: Strict
        }

        await db.notification.delete({
            where: { id: notificationId },
        });

        revalidatePath('/admin/notifications'); // Revalidate admin page
        // Optionally revalidate other pages if notifications are shown elsewhere

        return { success: true, message: "Notification deleted successfully." };
    } catch (error: unknown) { // Use unknown
        console.error("Error deleting notification:", error);
        let message = "Failed to delete notification.";
        if (error instanceof Error) {
            message = error.message;
        }
        return { success: false, message };
    }
} 
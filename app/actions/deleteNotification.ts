'use server';

import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== Role.ADMIN) {
            return { success: false, message: "Unauthorized: Admin access required." };
        }

        if (!notificationId) {
            return { success: false, message: "Notification ID is required." };
        }

        await db.notification.delete({
            where: { id: notificationId },
        });

        revalidatePath('/admin/notifications'); // Revalidate path to reflect deletion
        revalidatePath('/dashboard'); // Also revalidate dashboard

        return { success: true, message: "Notification deleted successfully!" };

    } catch (error) {
        console.error("Error deleting notification:", error);
        // Handle cases where the notification might not be found (e.g., PrismaClientKnownRequestError P2025)
        if ((error as any)?.code === 'P2025') {
             return { success: false, message: "Notification not found." };
        }
        return { success: false, message: "Failed to delete notification." };
    }
} 
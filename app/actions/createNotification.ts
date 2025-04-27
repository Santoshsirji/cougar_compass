'use server';

import { z } from "zod";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

// Schema for input validation
const createNotificationSchema = z.object({
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),
    expiresAt: z.date().optional().nullable(), // Optional expiry date
});

type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

export async function createNotification(data: CreateNotificationInput): Promise<{ success: boolean; message: string }> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== Role.ADMIN) {
            return { success: false, message: "Unauthorized: Admin access required." };
        }

        const validation = createNotificationSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, message: "Invalid data provided." };
        }

        const { title, message, expiresAt } = validation.data;
        const userId = session.user.id;

        await db.notification.create({
            data: {
                title: title,
                message: message,
                expiresAt: expiresAt,
                userId: userId, // Link to the admin user who created it
            },
        });

        revalidatePath('/admin/notifications'); // Revalidate path to show the new notification
        revalidatePath('/dashboard'); // Also revalidate dashboard if notifications are shown there

        return { success: true, message: "Notification created successfully!" };

    } catch (error) {
        console.error("Error creating notification:", error);
        return { success: false, message: "Failed to create notification." };
    }
} 
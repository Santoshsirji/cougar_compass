'use server';

import { z } from "zod";
import { db } from "@/lib/db";
import { Prisma, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

// Schema to validate the input (just the ID)
const deleteEventSchema = z.object({
    id: z.string().min(1, "Event ID is required."),
});

export async function deleteEvent(data: { id: string }): Promise<{ success: boolean; message: string }> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id || session.user.role !== Role.ADMIN) {
            return { success: false, message: "Unauthorized: Admin access required." };
        }

        const validation = deleteEventSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, message: "Invalid Event ID provided." };
        }

        const { id } = validation.data;
        const userId = session.user.id; // For logging

        console.log(`Attempting to delete event ${id} by user ${userId}`);

        // Check if event exists before deleting (optional, delete ignores if not found)
        const existingEvent = await db.event.findUnique({ where: { id } });
        if (!existingEvent) {
            return { success: false, message: "Event not found." };
        }

        await db.event.delete({
            where: { id: id },
        });

        console.log(`Event ${id} deleted successfully.`);

        // Revalidate paths
        revalidatePath('/admin/events');
        revalidatePath('/events'); // Revalidate public page if it exists

        return { success: true, message: `Event "${existingEvent.title}" deleted successfully!` };

    } catch (error: any) {
        console.error(`Error deleting event ${data.id}:`, error);
        // Handle specific errors if needed
        return { success: false, message: "Database error: Failed to delete event." };
    }
} 
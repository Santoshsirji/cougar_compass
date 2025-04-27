'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function deleteShuttleSchedule(id: string): Promise<{ success: boolean; message: string }> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') { 
            return { success: false, message: "Unauthorized" };
        }

        // Optional: Check if schedule exists before deleting
        const existingSchedule = await db.shuttleSchedule.findUnique({
            where: { id },
        });

        if (!existingSchedule) {
            // Decide if this is an error or success (idempotency)
            // return { success: true, message: "Schedule already deleted or never existed." };
             return { success: false, message: "Schedule not found." };
        }

        await db.shuttleSchedule.delete({
            where: { id: id },
        });

        // Revalidate relevant paths
        revalidatePath('/admin/shuttle-schedule');
        revalidatePath('/shuttle'); // Revalidate public page too

        return { success: true, message: `Schedule for ${existingSchedule.date.toLocaleDateString()} deleted successfully.` };

    } catch (error: unknown) { // Use unknown
        console.error(`Error deleting shuttle schedule with ID ${id}:`, error);
        let message = "Failed to delete schedule.";
        if (error instanceof Error) {
            message = error.message;
        }
        return { success: false, message };
    }
} 
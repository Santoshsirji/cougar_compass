'use server';

import { z } from "zod";
import { db } from "@/lib/db";
import { Prisma, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

const deleteScheduleSchema = z.object({
    id: z.string().min(1, "Schedule ID is required."),
});

export async function deleteShuttleSchedule(data: { id: string }): Promise<{ success: boolean; message: string }> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id || session.user.role !== Role.ADMIN) {
            return { success: false, message: "Unauthorized: Admin access required." };
        }

        const validation = deleteScheduleSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, message: "Invalid Schedule ID provided." };
        }

        const { id } = validation.data;

        // Check if it exists (optional, delete ignores if not found)
        const existingSchedule = await db.shuttleSchedule.findUnique({ where: { id } });
        if (!existingSchedule) {
            return { success: false, message: "Shuttle schedule not found." };
        }

        await db.shuttleSchedule.delete({
            where: { id: id },
        });

        console.log(`Shuttle schedule ${id} (Date: ${existingSchedule.date.toLocaleDateString()}) deleted successfully.`);

        // Revalidate relevant paths
        revalidatePath('/admin/shuttle');
        revalidatePath('/shuttle'); // Public page

        return { success: true, message: `Schedule for ${existingSchedule.date.toLocaleDateString()} deleted successfully!` };

    } catch (error: any) {
        console.error(`Error deleting shuttle schedule ${data.id}:`, error);
        return { success: false, message: "Database error: Failed to delete schedule." };
    }
} 
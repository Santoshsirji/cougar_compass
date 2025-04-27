'use server';

import { z } from "zod";
import { db } from "@/lib/db";
import { Prisma, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

// Zod schema for input validation
const updateScheduleSchema = z.object({
    date: z.date({ required_error: "A date for this schedule is required." }),
    notes: z.string().optional(),
    scheduleData: z.any(), // Accept any valid JSON structure for now
                         // TODO: Consider defining a stricter Zod schema for scheduleData
                         // based on the expected JSON structure if needed for validation.
});

type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

export async function updateShuttleSchedule(data: UpdateScheduleInput): Promise<{ success: boolean; message: string }> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id || session.user.role !== Role.ADMIN) {
            return { success: false, message: "Unauthorized: Admin access required." };
        }

        const validation = updateScheduleSchema.safeParse(data);
        if (!validation.success) {
            console.error("Update schedule validation failed:", validation.error.errors);
            return { success: false, message: "Invalid data provided." };
        }

        const { date, notes, scheduleData } = validation.data;
        const userId = session.user.id; // Get admin user ID

        console.log(`Attempting to update/create schedule for ${date.toLocaleDateString()} by user ${userId}`);

        await db.shuttleSchedule.upsert({
            where: { date: date },
            update: {
                notes: notes,
                scheduleData: scheduleData as Prisma.InputJsonValue, // Cast to Prisma JSON type
                userId: userId, // Track who updated it
            },
            create: {
                date: date,
                notes: notes,
                scheduleData: scheduleData as Prisma.InputJsonValue, // Cast to Prisma JSON type
                userId: userId, // Track who created it
            },
        });

        console.log(`Shuttle schedule for ${date.toLocaleDateString()} updated successfully.`);
        
        // Revalidate the admin shuttle path to reflect changes immediately
        revalidatePath('/admin/shuttle-schedule');
        revalidatePath('/shuttle');

        return { success: true, message: `Schedule for ${date.toLocaleDateString()} updated successfully!` };

    } catch (error: any) {
        // Handle potential unique constraint violation
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
           return { success: false, message: `Error: A schedule already exists for ${data.date.toLocaleDateString()}. Please edit the existing schedule.` };
        }
        console.error(`Error updating shuttle schedule for ${data.date?.toLocaleDateString()}:`, error);
        return { success: false, message: "Failed to update schedule." };
    }
} 
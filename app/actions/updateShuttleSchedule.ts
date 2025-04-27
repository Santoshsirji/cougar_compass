'use server';

// Global imports
import { z } from "zod";
import { Prisma, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

// Local imports
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const updateScheduleSchema = z.object({
    date: z.date({ required_error: "A date for this schedule is required." })
            .transform(date => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))), 
    notes: z.string().optional(),
    scheduleData: z.any(),
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
        const userId = session.user.id;

        // Day Validation
        const dayOfWeek = date.getUTCDay(); // 0=Sun, 6=Sat
        if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) { // Sun, Fri, Sat
             return { success: false, message: "Schedules can only be set for Monday through Thursday." };
        }

        console.log(`Attempting to update/create schedule for ${date.toLocaleDateString('en-CA', { timeZone: 'UTC' })} by user ${userId}`);

        await db.shuttleSchedule.upsert({
            where: { date: date },
            update: {
                notes: notes,
                scheduleData: scheduleData as Prisma.InputJsonValue,
                userId: userId, 
            },
            create: {
                date: date,
                notes: notes,
                scheduleData: scheduleData as Prisma.InputJsonValue,
                userId: userId, 
            },
        });

        console.log(`Shuttle schedule for ${date.toLocaleDateString('en-CA', { timeZone: 'UTC' })} updated successfully.`);
        
        revalidatePath('/admin/shuttle-schedule');
        revalidatePath('/shuttle');

        return { success: true, message: `Schedule for ${date.toLocaleDateString('en-CA', { timeZone: 'UTC' })} updated successfully!` };

    } catch (error: unknown) {
        const dateString = data.date ? new Date(data.date).toLocaleDateString() : 'the selected date';
        console.error(`Error updating shuttle schedule for ${dateString}:`, error);

        let message = `Failed to update schedule for ${dateString}.`;

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            message = `Error: A schedule already exists for ${dateString}. Please edit the existing schedule.`;
        } else if (error instanceof Error) {
            message = error.message;
        }
        
        return { success: false, message: message };
    }
} 
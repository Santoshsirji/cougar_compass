'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { shuttleScheduleFormSchema, type ShuttleFormValues } from "@/lib/schemas/shuttle";



export async function upsertShuttleSchedule(data: ShuttleFormValues): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated." };
    }
    if (session.user.role !== 'ADMIN') {
        return { success: false, message: "Unauthorized." };
    }

    const validation = shuttleScheduleFormSchema.safeParse(data);
    if (!validation.success) {
      console.error("Schedule validation failed:", validation.error.errors);
      
      const errorMessages = validation.error.errors.map(e => `${e.path.join('.') || 'scheduleData'}: ${e.message}`).join("; ");
      return { success: false, message: `Validation Error: ${errorMessages || "Invalid data format."}` };
    }

    const { date, notes, scheduleData } = validation.data;
    const userId = session.user.id;

    const scheduleJson: Prisma.JsonObject = {};
    scheduleData.forEach(route => {
        const timesWithNulls = route.times.map(row => row.map(time => time === undefined || time === '' ? null : time)); // Treat empty string as null too
        scheduleJson[route.name] = { stops: route.stops, times: timesWithNulls };
    });

    console.log(`Upserting schedule for ${date.toISOString().split('T')[0]} by user ${userId}`);

    await db.shuttleSchedule.upsert({
      where: { date: date }, 
      update: {
        notes: notes || null,
        scheduleData: scheduleJson,
        userId: userId,
      },
      create: {
        date: date, 
        notes: notes || null,
        scheduleData: scheduleJson,
        userId: userId,
      },
    });

    console.log(`Successfully upserted schedule for ${date.toISOString().split('T')[0]}`);

    
    revalidatePath('/admin/shuttle-schedule');
    revalidatePath('/shuttle'); 

    return { success: true, message: `Schedule for ${date.toLocaleDateString()} saved successfully.` };

  } catch (error: unknown) {
    const dateString = data.date ? data.date.toLocaleDateString() : 'the specified date';
    console.error(`Error saving shuttle schedule for ${dateString}:`, error);

    let message = `Failed to save schedule for ${dateString}.`;

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        message = `Error: A schedule already exists for ${dateString}. Please edit the existing schedule.`;
    } else if (error instanceof Error) {
        message = error.message;
    }

    return { success: false, message: message };
  }
} 
'use server';

// import { z } from "zod"; // Removed as it's no longer needed here
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
// import { DayOfWeek, Prisma } from "@prisma/client"; // DayOfWeek no longer needed
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { shuttleScheduleFormSchema, type ShuttleFormValues } from "@/lib/schemas/shuttle"; // Import schema and type

// Function to parse the form input into the Prisma JSON structure - NO LONGER NEEDED with new schema
/*
function parseScheduleData(inputData: ShuttleFormValues['scheduleData']): Prisma.JsonObject {
  const scheduleJson: Prisma.JsonObject = {};

  inputData.forEach(route => {
    // Data is already in the correct array format
    scheduleJson[route.name] = {
      stops: route.stops, // Already an array
      times: route.times, // Already a 2D array
    };
  });

  return scheduleJson;
}
*/

export async function upsertShuttleSchedule(data: ShuttleFormValues): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated." };
    }
    if (session.user.role !== 'ADMIN') {
        return { success: false, message: "Unauthorized." };
    }

    // Validate the raw input data using the updated schema
    const validation = shuttleScheduleFormSchema.safeParse(data);
    if (!validation.success) {
      console.error("Schedule validation failed:", validation.error.errors);
      // Construct a more detailed error message
      const errorMessages = validation.error.errors.map(e => `${e.path.join('.') || 'scheduleData'}: ${e.message}`).join("; ");
      return { success: false, message: `Validation Error: ${errorMessages || "Invalid data format."}` };
    }

    // Use date instead of dayOfWeek
    const { date, notes, scheduleData } = validation.data;
    const userId = session.user.id;

    // --- Convert validated scheduleData to Prisma JSON --- 
    const scheduleJson: Prisma.JsonObject = {};
    scheduleData.forEach(route => {
        const timesWithNulls = route.times.map(row => row.map(time => time === undefined || time === '' ? null : time)); // Treat empty string as null too
        scheduleJson[route.name] = { stops: route.stops, times: timesWithNulls };
    });

    console.log(`Upserting schedule for ${date.toISOString().split('T')[0]} by user ${userId}`);
    // console.log("Data to save:", JSON.stringify(scheduleJson, null, 2)); // For debugging

    await db.shuttleSchedule.upsert({
      where: { date: date }, // Use date as the unique identifier
      update: {
        notes: notes || null,
        scheduleData: scheduleJson,
        userId: userId,
      },
      create: {
        date: date, // Set date on create
        notes: notes || null,
        scheduleData: scheduleJson,
        userId: userId,
      },
    });

    console.log(`Successfully upserted schedule for ${date.toISOString().split('T')[0]}`);

    // Revalidate both admin and user paths
    revalidatePath('/admin/shuttle-schedule');
    revalidatePath('/shuttle'); // Revalidate user page too

    return { success: true, message: `Schedule for ${date.toLocaleDateString()} saved successfully.` };

  } catch (error: any) {
    // Handle potential unique constraint violation nicely
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Extract the date from the error or use the input data
        // Prisma error messages for unique constraints on DateTime might be tricky to parse reliably.
        // Let's use the input date for the message.
        return { success: false, message: `Error: A schedule already exists for ${data.date.toLocaleDateString()}. Please edit the existing schedule.` };
    }
    console.error(`Error upserting shuttle schedule for ${data.date?.toLocaleDateString()}:`, error);
    return { success: false, message: error.message || "Failed to save schedule. An unknown error occurred." };
  }
} 
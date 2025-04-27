'use server';

import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ClassStanding, CourseStatus, DayOfWeek } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Define nested schemas for complex array types

// Define the occurrence schema first (or inline)
const scheduleOccurrenceSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek), // Day is required
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
});

const courseScheduleEntrySchema = z.object({
  courseCode: z.string().min(1, "Course code is required"),
  courseName: z.string().min(1, "Course name is required"),
  semester: z.string().min(1, "Semester is required"),
  status: z.nativeEnum(CourseStatus),
  grade: z.string().optional().nullable(),
  // Use the occurrence schema here
  occurrences: z.array(scheduleOccurrenceSchema).optional(), 
});

const courseTakenEntrySchema = z.object({
  courseCode: z.string().min(1, "Course code is required"),
  courseName: z.string().min(1, "Course name is required"),
  semester: z.string().min(1, "Semester is required"),
  grade: z.string().min(1, "Grade is required"),
  creditHours: z.number().int().min(0, "Credit hours must be non-negative"),
});

// Define the schema for the data we expect from the form
// Only include fields that the user is allowed to edit
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").optional(),
  phone: z.string().optional().or(z.literal('')), // Allow empty string
  mobile: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  zipcode: z.string().optional().or(z.literal('')),
  studentId: z.string().optional().or(z.literal('')),
  major: z.string().min(1, "Major is required."), // Keep major required
  minor: z.string().optional().or(z.literal('')),
  classStanding: z.nativeEnum(ClassStanding).optional(),
  // degreeCatalogYear might be editable, depends on rules
  gpa: z.number().min(0).max(5).optional(), // Added GPA (adjust max if needed)
  lastTermGpa: z.number().min(0).max(5).optional(), // Added Last Term GPA (adjust max if needed)
  academicStanding: z.string().optional().or(z.literal('')), // Added Academic Standing
  academicHonors: z.string().optional().or(z.literal('')), // Added Academic Honors
  honorsProgram: z.boolean().optional(),
  holdsAndWarnings: z.string().optional().or(z.literal('')), // Added Holds/Warnings
  advisor: z.string().optional().or(z.literal('')),
  auditFile: z.string().optional().or(z.literal('')), // URL or path
  courseSchedule: z.array(courseScheduleEntrySchema).optional(), // Added Course Schedule
  coursesTaken: z.array(courseTakenEntrySchema).optional(), // Added Courses Taken
});

// Define the input type locally based on the schema
type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Only export the async server action function
export async function updateUserProfile(data: UpdateProfileInput): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return { success: false, message: "Not authenticated" };
    }

    // Validate input data (even though form should validate, good practice)
    const validation = updateProfileSchema.safeParse(data);
    if (!validation.success) {
      console.error("Update validation failed:", validation.error.errors);
      return { success: false, message: "Invalid data provided." };
    }

    const updateData = validation.data;

    // --- Log the validated data before DB update ---
    console.log("Attempting to update profile for user:", session.user.id);
    console.log("Validated updateData:", JSON.stringify(updateData, null, 2)); 
    // Specifically log the course schedule part
    console.log("Course Schedule being sent to DB:", JSON.stringify(updateData.courseSchedule, null, 2));

    await db.user.update({
      where: { id: session.user.id },
      data: {
        // Map validated data fields to prisma update fields
        name: updateData.name,
        phone: updateData.phone || undefined,
        mobile: updateData.mobile || undefined,
        address: updateData.address || undefined,
        city: updateData.city || undefined,
        zipcode: updateData.zipcode || undefined,
        studentId: updateData.studentId || undefined,
        major: updateData.major,
        minor: updateData.minor || undefined,
        classStanding: updateData.classStanding,
        honorsProgram: updateData.honorsProgram,
        advisor: updateData.advisor || undefined,
        auditFile: updateData.auditFile || undefined,
        gpa: updateData.gpa,
        lastTermGpa: updateData.lastTermGpa,
        academicStanding: updateData.academicStanding || undefined,
        academicHonors: updateData.academicHonors || undefined,
        holdsAndWarnings: updateData.holdsAndWarnings || undefined,
        courseSchedule: updateData.courseSchedule,
        coursesTaken: updateData.coursesTaken,
      },
    });
   
    console.log("Profile updated successfully in DB.");
    
    // Revalidate the profile page path so it shows fresh data after update
    revalidatePath('/profile');

    return { success: true, message: "Profile updated successfully!" };

  } catch (error: unknown) {
    console.error("Error updating user profile:", error);
    let message = "Failed to update profile.";
    if (error instanceof Error) {
        message = error.message;
    }
    return { success: false, message };
  }
} 
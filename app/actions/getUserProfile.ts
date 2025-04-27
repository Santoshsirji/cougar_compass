'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from '@prisma/client';

// Define the type for the user profile data we want to return
// Exclude sensitive fields like password
// Include auditFileData (Bytes) and remove auditFile (String)
export type UserProfileData = Prisma.UserGetPayload<{
  select: {
    id: true,
    role: true,
    name: true,
    email: true,
    phone: true,
    mobile: true,
    address: true,
    city: true,
    zipcode: true,
    studentId: true,
    major: true,
    minor: true,
    classStanding: true,
    degreeCatalogYear: true,
    gpa: true,
    lastTermGpa: true,
    academicStanding: true,
    academicHonors: true,
    honorsProgram: true,
    holdsAndWarnings: true,
    advisor: true,
    auditFileData: true,
    courseSchedule: true,
    coursesTaken: true,
    image: true,
    imageURL: true,
    createdAt: true,
  }
}>

export async function getUserProfile(): Promise<UserProfileData | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      console.error("getUserProfile: No session or user ID found.");
      return null; // Or throw an error if preferred
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        phone: true,
        mobile: true,
        address: true,
        city: true,
        zipcode: true,
        studentId: true,
        major: true,
        minor: true,
        classStanding: true,
        degreeCatalogYear: true,
        gpa: true,
        lastTermGpa: true,
        academicStanding: true,
        academicHonors: true,
        honorsProgram: true,
        holdsAndWarnings: true,
        advisor: true,
        auditFileData: true,
        courseSchedule: true,
        coursesTaken: true,
        image: true,
        imageURL: true,
        createdAt: true,
        // Explicitly DO NOT select password
      },
    });

    if (!user) {
      console.error("getUserProfile: User not found in DB for ID:", session.user.id);
      return null;
    }

    // The 'user' object should now match UserProfileData
    // Cast to ensure type safety if needed, though select should handle it
    const profileData = user as UserProfileData; 

    return profileData;

  } catch (error) {
    console.error("Error fetching user profile:", error);
    // Depending on error handling strategy, you might throw, return null, or return a specific error object
    return null;
  }
} 
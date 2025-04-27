'use server';

// Remove fs/promises and path imports as we no longer write to disk
// import { writeFile, mkdir } from 'fs/promises';
// import path from 'path';
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

// Define validation schema for the file
const fileSchema = z.instanceof(File).refine(
    (file) => file.size > 0, 
    { message: "File cannot be empty." }
).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB limit
    { message: "File size must be 5MB or less." }
).refine(
    (file) => file.type === "application/pdf",
    { message: "Only PDF files are allowed." }
);

// Define schema for the FormData input
const uploadSchema = z.object({
  auditFile: fileSchema,
});

/**
 * Uploads the audit file (as BSON binary data) for the logged-in user.
 * @param fileData Buffer containing the PDF file data.
 * @returns Promise resolving to success/failure status and message.
 */
export async function uploadAuditFile(fileData: Buffer): Promise<{ success: boolean; message: string }> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { success: false, message: "Not authenticated" };
    }
    const userId = session.user.id;

    if (!fileData || fileData.length === 0) {
        return { success: false, message: "No file data received." };
    }

    // Basic validation: Check if it looks like a PDF (optional but recommended)
    // PDF files start with "%PDF-"
    const pdfMagicNumber = Buffer.from("%PDF-");
    if (!fileData.slice(0, pdfMagicNumber.length).equals(pdfMagicNumber)) {
        return { success: false, message: "Invalid file type. Only PDF files are allowed." };
    }

    try {
        await db.user.update({
            where: { id: userId },
            data: {
                auditFileData: fileData, // Store the Buffer directly
            },
        });

        console.log(`Audit file uploaded successfully for user: ${userId}`);
        
        // Revalidate the profile page to show the audit file status potentially
        revalidatePath('/profile'); 
        revalidatePath('/profile/edit');

        return { success: true, message: "Audit file uploaded successfully!" };

    } catch (error: unknown) { // Use unknown
        console.error(`Error uploading audit file for user ${userId}:`, error);
        let message = "Failed to upload audit file.";
        if (error instanceof Error) {
            message = error.message;
        }
        return { success: false, message };
    }
} 
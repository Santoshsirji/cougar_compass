'use server';

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

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

export async function uploadAuditFile(formData: FormData): Promise<{ success: boolean; message: string, filePath?: string } > {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return { success: false, message: "Unauthorized: User not logged in." };
        }
        const userId = session.user.id;

        const file = formData.get('auditFile');
        
        // Validate the file using Zod schema
        const validation = uploadSchema.safeParse({ auditFile: file });

        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            return { 
                success: false, 
                message: errors.auditFile?.[0] ?? "Invalid file provided.", 
            };
        }

        const validatedFile = validation.data.auditFile;

        // Create a unique filename (e.g., userId-timestamp.pdf)
        const uniqueSuffix = `${userId}-${Date.now()}`;
        const fileExtension = path.extname(validatedFile.name);
        const uniqueFilename = `${uniqueSuffix}${fileExtension}`;

        // Define upload directory (within /public for accessibility)
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'audits');
        const relativeFilePath = `/uploads/audits/${uniqueFilename}`; // Path to store in DB
        const absoluteFilePath = path.join(uploadDir, uniqueFilename);

        // Ensure upload directory exists
        await mkdir(uploadDir, { recursive: true });

        // Read file buffer and write to disk
        const buffer = Buffer.from(await validatedFile.arrayBuffer());
        await writeFile(absoluteFilePath, buffer);

        console.log(`File saved to: ${absoluteFilePath}`);
        console.log(`Updating user ${userId} with audit file path: ${relativeFilePath}`);

        // Update user record in database
        await db.user.update({
            where: { id: userId },
            data: { auditFile: relativeFilePath },
        });

        // Revalidate the profile path to show the updated info
        revalidatePath('/profile');
        revalidatePath('/profile/edit'); // Revalidate edit page too

        return { success: true, message: "Audit file uploaded successfully!", filePath: relativeFilePath };

    } catch (error: any) {
        console.error("Error uploading audit file:", error);
        // Provide a more specific error message if possible
        if (error.code === 'ENOENT') { // Example: Handling directory creation errors
             return { success: false, message: "Server error: Could not create upload directory." };
        }
        return { success: false, message: "Database error: Failed to upload file." };
    }
} 
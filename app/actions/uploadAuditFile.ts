'use server';

// Remove fs/promises and path imports as we no longer write to disk
// import { writeFile, mkdir } from 'fs/promises';
// import path from 'path';
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

export async function uploadAuditFile(formData: FormData): Promise<{ success: boolean; message: string } > {
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

        // Read file into a Buffer
        const buffer = Buffer.from(await validatedFile.arrayBuffer());

        console.log(`Updating user ${userId} with audit file data (size: ${buffer.length} bytes)`);

        await db.user.update({
            where: { id: userId },
            data: { 
                auditFileData: buffer, 
            },
        });

        // Revalidate the profile path to show the updated info
        revalidatePath('/profile');
        revalidatePath('/profile/edit'); // Revalidate edit page too

        return { success: true, message: "Audit file uploaded successfully!" };

    } catch (error: any) {
        console.error("Error uploading audit file:", error);
        return { success: false, message: "Database error: Failed to upload file." };
    }
} 
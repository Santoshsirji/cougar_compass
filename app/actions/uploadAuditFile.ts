'use server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Uploads the audit file (as BSON binary data) for the logged-in user.
 * @param formData FormData containing the audit file under the key 'auditFile'.
 * @returns Promise resolving to success/failure status and message.
 */
export async function uploadAuditFile(formData: FormData): Promise<{ success: boolean; message: string }> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { success: false, message: "Not authenticated" };
    }
    const userId = session.user.id;

    const file = formData.get('auditFile') as File | null;

    if (!file) {
        return { success: false, message: "No file found in form data." };
    }

    // Convert File to Buffer
    let fileData: Buffer;
    try {
        const arrayBuffer = await file.arrayBuffer();
        fileData = Buffer.from(arrayBuffer);
    } catch (error) {
        console.error("Error converting file to buffer:", error);
        return { success: false, message: "Error processing file." };
    }

    if (!fileData || fileData.length === 0) {
        return { success: false, message: "No file data received after processing." };
    }

    // Basic validation: Check if it looks like a PDF (optional but recommended)
    const pdfMagicNumber = Buffer.from("%PDF-");
    if (!fileData.slice(0, pdfMagicNumber.length).equals(pdfMagicNumber)) {
        return { success: false, message: "Invalid file type. Only PDF files are allowed." };
    }

     // Optional: Add size validation (example: 5MB limit)
    if (fileData.length > 5 * 1024 * 1024) {
        return { success: false, message: "File size exceeds 5MB limit." };
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
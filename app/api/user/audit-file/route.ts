import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const userId = session.user.id;

        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                auditFileData: true, // Select only the binary data
            },
        });

        if (!user || !user.auditFileData) {
            return new NextResponse('Audit file not found', { status: 404 });
        }

        // auditFileData is already a Buffer from Prisma/MongoDB
        const fileBuffer = user.auditFileData;

        // Return the buffer with correct headers
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                // Suggest filename, browser may override
                'Content-Disposition': 'inline; filename="academic_audit.pdf"',
                // Optional: Set cache control if needed
                // 'Cache-Control': 'private, max-age=0, must-revalidate',
            },
        });

    } catch (error) {
        console.error("Error fetching audit file:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 
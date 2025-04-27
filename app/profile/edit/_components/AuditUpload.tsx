'use client';

import { useState, useTransition, useRef } from 'react';
import { uploadAuditFile } from '@/app/actions/uploadAuditFile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, FileText, ExternalLink, Download } from 'lucide-react';
import Link from 'next/link';

interface AuditUploadProps {
    hasCurrentAuditFile: boolean | null | undefined;
}

export function AuditUpload({ hasCurrentAuditFile }: AuditUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, startUploadTransition] = useTransition();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null); 
    const [hasFile, setHasFile] = useState(!!hasCurrentAuditFile); 

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
             if (file.size > 5 * 1024 * 1024) {
                 toast({ title: "Error", description: "File size exceeds 5MB limit.", variant: "destructive" });
                 setSelectedFile(null);
                 if(fileInputRef.current) fileInputRef.current.value = "";
                 return;
             }
             if (file.type !== 'application/pdf') {
                 toast({ title: "Error", description: "Only PDF files are allowed.", variant: "destructive" });
                 setSelectedFile(null);
                  if(fileInputRef.current) fileInputRef.current.value = "";
                 return;
             }
            setSelectedFile(file);
        } else {
            setSelectedFile(null);
        }
    };

    const handleUpload = () => {
        if (!selectedFile) {
            toast({ title: "Info", description: "Please select a PDF file first.", variant: "default" });
            return;
        }

        const formData = new FormData();
        formData.append('auditFile', selectedFile);

        startUploadTransition(async () => {
            const result = await uploadAuditFile(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                setSelectedFile(null);
                if(fileInputRef.current) fileInputRef.current.value = "";
                setHasFile(true);
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    const downloadApiRoute = '/api/user/audit-file';

    return (
        <div className="space-y-4 rounded-md border p-4">
             <h4 className="font-medium leading-none">Academic Audit File (PDF)</h4>
             {hasFile ? (
                <div className="text-sm text-muted-foreground flex items-center space-x-2">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span>Current file uploaded.</span>
                    <Link 
                        href={downloadApiRoute}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline inline-flex items-center"
                    >
                        View / Download
                        <Download className="h-3 w-3 ml-1" />
                    </Link>
                </div>
             ) : (
                <p className="text-sm text-muted-foreground">No audit file uploaded yet.</p>
             )}

            <div className="flex items-center space-x-2">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="audit-pdf">Upload New PDF (Max 5MB)</Label>
                    <Input
                        id="audit-pdf"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        ref={fileInputRef}
                         className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                </div>
                <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    size="sm"
                    className="self-end"
                 >
                    {isUploading ? (
                         <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                    ) : (
                         <><Upload className="mr-2 h-4 w-4" /> Upload</>
                     )}
                 </Button>
             </div>
             {selectedFile && !isUploading && (
                 <p className="text-xs text-muted-foreground">Selected: {selectedFile.name}</p>
             )}
         </div>
    );
} 
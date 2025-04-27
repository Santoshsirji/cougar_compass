'use client';

// Global imports
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle, Zap } from 'lucide-react';

// Local imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";


type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

export default function ScheduleGeneratorPage() {
    const { data: session, status: sessionStatus } = useSession();
    const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
    const [message, setMessage] = useState<string | null>(null);

    const handleGenerateClick = async () => {
        if (sessionStatus === 'authenticated' && session?.user?.id) {
            setGenerationStatus('generating');
            setMessage(null);
            try {
                const userId = session.user.id;
                console.log(`Requesting schedule generation for user ID: ${userId}`);
                
                const response = await axios.get(
                    'https://api-call-8tmd.onrender.com/generate_schedule',
                    {
                        params: { id: userId }, 
                        headers: { 'Accept': 'application/json' } 
                    }
                );

                console.log('API Response Status:', response.status);
                console.log('API Response Data:', response.data);

                if (response.data?.message) {
                    setGenerationStatus('success');
                    setMessage(response.data.message); 
                } else {
                    setGenerationStatus('error');
                    setMessage("Received an unexpected response from the server.");
                }

            } catch (err: any) {
                console.error("Failed to generate schedule:", err);
                let errorMessage = "An unknown error occurred during schedule generation.";
                if (axios.isAxiosError(err)) {
                    errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || errorMessage;
                    if (err.response?.status) {
                        errorMessage = `API Error (${err.response.status}): ${errorMessage}`;
                    }
                } else if (err instanceof Error) {
                    errorMessage = err.message;
                }
                setGenerationStatus('error');
                setMessage(errorMessage);
            }
        }
    };

    if (sessionStatus === 'loading') {
        return (
            <div className="container mx-auto p-4 flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading user session...</span>
            </div>
        );
    }

    if (sessionStatus === 'unauthenticated') {
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Authentication Required</AlertTitle>
                    <AlertDescription>
                        You need to be logged in to generate schedules.
                        <Link href="/auth/login" className="font-medium text-primary underline underline-offset-4 ml-1">
                            Login here.
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold">Generate Course Schedules</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Schedule Generation</CardTitle>
                    <CardDescription>
                        Click the button below to generate potential course schedules based on your academic audit file.
                        This process may take a moment.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    <Button 
                        onClick={handleGenerateClick} 
                        disabled={generationStatus === 'generating' || sessionStatus !== 'authenticated'}
                        size="lg"
                    >
                        {generationStatus === 'generating' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Zap className="mr-2 h-4 w-4" />
                        )}
                        {generationStatus === 'generating' ? 'Generating Schedules...' : 'Generate My Schedules'}
                    </Button>

                    {/* Status Messages */} 
                    {generationStatus === 'success' && message && (
                        <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}
                    {generationStatus === 'error' && message && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import * as z from "zod"; // Keep zod if needed elsewhere, or remove if not
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Form schema and useForm hook are no longer needed

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { status } = useSession();
  const error = searchParams.get("error");

  // Redirect if user is already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  // Show error toast if OAuth account creation failed
  useEffect(() => {
    if (error === "OAuthCreateAccount") {
      toast({
        title: "Login Error",
        description: "Could not create account. Please contact support if this issue persists.",
        variant: "destructive",
      });
      // Optionally remove the error from URL after showing toast
      router.replace('/auth/login', { scroll: false });
    }
  }, [error, toast, router]);

  // If still checking auth status, show loading
  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  const handleGoogleSignIn = () => {
    setIsLoading(true); // Set loading state
    signIn("google", { callbackUrl });
    // No need to set isLoading false here, page will redirect or error will show
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Use your Google account to sign in.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
             {/* Only Google Button */}
            <Button
              variant="outline"
              type="button"
                className="w-full"
                onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
                 {isLoading ? (
                  <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-current rounded-full"></span>
                 ) : (
                  <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                 )}
                {isLoading ? "Signing in..." : "Sign in with Google"}
            </Button>
          </CardContent>
           {/* Footer can be removed or simplified */}
           {/* <CardFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              Some footer text if needed.
            </p>
          </CardFooter> */}
        </Card>
      </main>
    </div>
  );
} 
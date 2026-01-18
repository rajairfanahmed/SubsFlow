"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-4">
      <div className="bg-white p-8 rounded-[32px] shadow-prism border border-slate-100 max-w-md w-full">
          <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Something went wrong!</h2>
          <p className="text-slate-500 mb-8">
            {error.message || "An unexpected error occurred. Please try again or contact support."}
          </p>
          <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.href = "/"} variant="outline">
                  Go Home
              </Button>
              <Button onClick={reset} className="bg-slate-900 text-white hover:bg-slate-800">
                  Try Again
              </Button>
          </div>
      </div>
    </div>
  );
}

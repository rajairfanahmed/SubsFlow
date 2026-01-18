'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error Caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] px-6">
          <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-[0px_50px_100px_-20px_rgba(50,50,93,0.25)] border border-slate-100 text-center">
            
            {/* Icon */}
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>

            {/* Heading */}
            <h2 className="font-serif text-3xl text-slate-900 mb-3">
              System Encountered an Error
            </h2>

            {/* User Friendly Message */}
            <p className="text-slate-500 mb-6 font-sans">
              We apologize for the inconvenience. Our team has been notified.
            </p>

            {/* Technical Details (Visible only in Dev or if needed) */}
            <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left border border-slate-100 overflow-hidden">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Error Details</p>
              <p className="text-sm text-red-600 font-medium font-mono break-words">
                {error.message || "Unknown Application Error"}
              </p>
              {error.digest && (
                <p className="text-xs text-slate-400 mt-1">Digest: {error.digest}</p>
              )}
            </div>

            {/* Actions */}
            <button
              onClick={reset}
              className="w-full py-3 bg-[#0F172A] text-white rounded-full font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

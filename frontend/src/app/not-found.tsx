import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] relative overflow-hidden">
      {/* Background Mesh Gradients (Prism Style) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg px-6">
        {/* Large Decorative 404 */}
        <h1 className="font-serif text-[150px] leading-none text-slate-900/10 select-none">
          404
        </h1>
        
        <div className="-mt-12">
          <h2 className="font-serif text-4xl text-slate-900 mb-4">
            Page not found
          </h2>
          <p className="text-slate-500 text-lg mb-8 font-sans">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="px-8 py-3 bg-[#0F172A] text-white rounded-full font-medium hover:scale-105 transition-transform duration-300 shadow-lg shadow-slate-900/20"
            >
              Back to Home
            </Link>
            <Link 
              href="/dashboard"
              className="px-8 py-3 bg-white text-slate-900 border border-slate-200 rounded-full font-medium hover:bg-slate-50 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

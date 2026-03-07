import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-neutral-200/50 p-8 md:p-12 text-center relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-3">
            <FileQuestion className="w-10 h-10 text-primary -rotate-3" />
          </div>

          <h1 className="text-7xl font-bold tracking-tight text-neutral-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-neutral-800 mb-2">Page not found</h2>
          <p className="text-neutral-500 mb-8 leading-relaxed">
            Oops! The page you're looking for doesn't exist or has been moved to another URL.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className="rounded-xl h-12 px-6 border-neutral-200 hover:bg-neutral-50"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              className="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

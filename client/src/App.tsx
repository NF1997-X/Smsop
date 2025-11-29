import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";
import LoadingIntro from "@/components/loading-intro";
import { ErrorBoundary } from "@/components/error-boundary";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Initialize dark theme immediately
    document.documentElement.classList.add('dark');
    
    // Check if user has already seen intro (stored in sessionStorage)
    const seenIntro = sessionStorage.getItem('introSeen');
    if (seenIntro === 'true') {
      setShowIntro(false);
      setIntroComplete(true);
      setHasSeenIntro(true);
    }

    // Check if we're in the middle of redirecting
    const redirecting = sessionStorage.getItem('isRedirecting');
    if (redirecting === 'true') {
      setIsRedirecting(true);
    }
  }, []);

  // Clear redirect flag when authenticated
  useEffect(() => {
    if (isAuthenticated && isRedirecting) {
      sessionStorage.removeItem('isRedirecting');
      setIsRedirecting(false);
    }
  }, [isAuthenticated, isRedirecting]);

  if (showIntro && !introComplete && !hasSeenIntro) {
    return (
      <LoadingIntro 
        onComplete={() => {
          setIntroComplete(true);
          sessionStorage.setItem('introSeen', 'true');
          setTimeout(() => setShowIntro(false), 100);
        }} 
      />
    );
  }

  // If redirecting, don't show auth page
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center space-y-8 animate-scale-in">
          <div className="relative">
            <div className="w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-200/40 dark:border-blue-800/40 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-purple-600 dark:border-t-blue-400 dark:border-r-purple-400 rounded-full animate-spin"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Loading...
          </h3>
        </div>
      </div>
    );
  }

  // Show auth page while loading or if not authenticated
  if (isLoading || !isAuthenticated) {
    return (
      <div className={`transition-all duration-700 ease-out ${introComplete ? 'opacity-100 transform-none' : 'opacity-0 scale-95'}`}>
        <AuthPage />
      </div>
    );
  }

  return (
    <div className={`transition-all duration-700 ease-out ${introComplete ? 'opacity-100 transform-none' : 'opacity-0 scale-95'}`}>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

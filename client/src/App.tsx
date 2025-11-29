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
  }, []);

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

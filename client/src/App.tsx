import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";
import LoadingIntro from "@/components/loading-intro";
import { ErrorBoundary } from "@/components/error-boundary";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Initialize dark theme immediately
    document.documentElement.classList.add('dark');
    
    // Reset body opacity for fade in
    document.body.style.opacity = '1';
    document.body.style.transition = '';
    
    // Check if user just logged in (prevent flash)
    const authenticating = sessionStorage.getItem('isAuthenticating');
    if (authenticating === 'true') {
      setIsAuthenticating(true);
      sessionStorage.removeItem('isAuthenticating');
    }
    
    // Check if user has seen intro before
    const seenIntro = sessionStorage.getItem('introSeen');
    if (seenIntro === 'true') {
      setShowIntro(false);
      setIntroComplete(true);
    }
  }, []);

  useEffect(() => {
    // Track when auth check is complete
    if (!isLoading) {
      setHasCheckedAuth(true);
    }
  }, [isLoading]);
  
  useEffect(() => {
    // Trigger fade in after intro complete
    if (introComplete) {
      setTimeout(() => setFadeIn(true), 50);
    }
  }, [introComplete]);

  // Show intro animation on first visit
  if (showIntro && !introComplete) {
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

  // If user just logged in, show nothing while loading
  if (isAuthenticating && isLoading) {
    return null;
  }

  // On refresh/initial load, show nothing while checking auth (prevent flash)
  if (isLoading && !hasCheckedAuth) {
    return null;
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={`transition-opacity duration-700 ease-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <AuthPage />
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-700 ease-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
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

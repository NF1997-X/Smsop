import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Send, MessageSquare, Smartphone, Zap, Moon, Sun, User, Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle2, Sparkles, Shield, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

type AuthMode = "signin" | "signup" | "forgot" | "reset-sent";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const { toast} = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({ title: "Welcome back!", description: "Successfully signed in." });
        // Show smooth loading transition
        setIsRedirecting(true);
        // Invalidate auth query to refresh authentication status
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
        // Quick smooth transition before redirect
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      } else {
        console.error("Sign in failed:", data);
        toast({ 
          title: "Sign in failed", 
          description: data.message || "Invalid email or password.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({ title: "Error", description: "Connection failed. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Minimum 8 characters required", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      console.log("Attempting signup with:", { email, fullName });
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          fullName 
        }),
      });
      
      const data = await response.json();
      console.log("Signup response:", data);
      
      if (response.ok) {
        toast({ 
          title: "Account created!", 
          description: "Welcome! Redirecting to dashboard..." 
        });
        // Show smooth loading transition
        setIsRedirecting(true);
        // Invalidate auth query to refresh authentication status
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
        // Quick smooth transition before redirect
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      } else {
        console.error("Signup failed:", data);
        toast({ 
          title: "Sign up failed", 
          description: data.message || "Please try again.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({ title: "Error", description: "Connection failed. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMode("reset-sent");
    } catch (error) {
      toast({ title: "Failed to send email", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSignIn = () => (
    <form onSubmit={handleSignIn} className="space-y-5" autoComplete="on">
      <div className="space-y-2">
        <Label htmlFor="signin-email" className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Email Address
        </Label>
        <Input 
          id="signin-email"
          name="email"
          type="email" 
          placeholder="name@company.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="h-12 bg-muted/30 border-2 focus:border-primary focus:bg-background transition-all" 
          autoComplete="email"
          required 
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="signin-password" className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Password
          </Label>
          <button 
            type="button" 
            onClick={() => setMode("forgot")} 
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline font-semibold transition-colors"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Input 
            id="signin-password"
            name="password"
            type={showPassword ? "text" : "password"} 
            placeholder="Enter your password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="h-12 pr-12 bg-muted/30 border-2 focus:border-primary focus:bg-background transition-all" 
            autoComplete="current-password"
            required 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 group" 
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Signing in...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span>Sign In</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted-foreground/20" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-gray-900 px-3 text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button 
          type="button" 
          variant="outline" 
          className="h-11 border-2 hover:border-primary hover:bg-primary/5 transition-all group" 
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="font-medium">Google</span>
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="h-11 border-2 hover:border-primary hover:bg-primary/5 transition-all group" 
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          <span className="font-medium">GitHub</span>
        </Button>
      </div>

      <div className="text-center text-sm pt-4">
        <span className="text-gray-700 dark:text-gray-300">Don't have an account? </span>
        <button 
          type="button" 
          onClick={() => setMode("signup")} 
          className="text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 font-bold hover:underline transition-colors"
        >
          Sign up for free
        </button>
      </div>
    </form>
  );

  const renderSignUp = () => (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name" className="flex items-center gap-2 font-semibold text-foreground">
          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Full Name
        </Label>
        <Input 
          id="signup-name" 
          type="text" 
          placeholder="John Doe" 
          value={fullName} 
          onChange={(e) => setFullName(e.target.value)} 
          className="h-12 bg-muted/30 border-2 focus:border-primary focus:bg-background" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="flex items-center gap-2 font-semibold text-foreground">
          <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Email
        </Label>
        <Input 
          id="signup-email" 
          type="email" 
          placeholder="name@company.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="h-12 bg-muted/30 border-2 focus:border-primary focus:bg-background" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-password" className="flex items-center gap-2 font-semibold text-foreground">
          <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Password
        </Label>
        <div className="relative">
          <Input 
            id="signup-password" 
            type={showPassword ? "text" : "password"} 
            placeholder="Min 8 characters" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="h-12 pr-12 bg-muted/30 border-2 focus:border-primary focus:bg-background" 
            required 
            minLength={8} 
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-confirm" className="flex items-center gap-2 font-semibold text-foreground">
          <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Confirm Password
        </Label>
        <div className="relative">
          <Input 
            id="signup-confirm" 
            type={showConfirmPassword ? "text" : "password"} 
            placeholder="Re-enter password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            className="h-12 pr-12 bg-muted/30 border-2 focus:border-primary focus:bg-background" 
            required 
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 mt-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all group" 
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Creating account...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>Create Account</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </Button>
      
      <div className="text-center text-sm pt-4">
        <span className="text-gray-700 dark:text-gray-300">Already have an account? </span>
        <button type="button" onClick={() => setMode("signin")} className="text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 font-bold hover:underline transition-colors">Sign in</button>
      </div>
    </form>
  );

  const renderForgotPassword = () => (
    <div className="space-y-6">
      <button 
        onClick={() => setMode("signin")} 
        className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group font-medium"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to sign in</span>
      </button>
      
      <div className="text-center space-y-3">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
          <KeyRound className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          Reset Your Password
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 max-w-sm mx-auto font-medium">
          Enter your email address and we'll send you a secure link to reset your password
        </p>
      </div>
      
      <form onSubmit={handleForgotPassword} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="forgot-email" className="flex items-center gap-2 font-semibold text-foreground">
            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Email Address
          </Label>
          <Input 
            id="forgot-email" 
            type="email" 
            placeholder="name@company.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="h-12 bg-muted/30 border-2 focus:border-primary focus:bg-background" 
            required 
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all group" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Sending...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Send Reset Link</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
      </form>
    </div>
  );

  const renderResetSent = () => (
    <div className="space-y-6 text-center py-6">
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-3xl flex items-center justify-center animate-scale-in shadow-lg">
        <div className="relative">
          <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          <div className="absolute inset-0 animate-ping">
            <CheckCircle2 className="w-12 h-12 text-green-600/30 dark:text-green-400/30" />
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
          Check Your Email
        </h3>
        <div className="space-y-2">
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            We've sent a password reset link to
          </p>
          <p className="font-bold text-lg text-blue-700 dark:text-blue-300 break-all px-4">
            {email}
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 space-y-3 border-2 border-primary/10">
        <p className="text-sm font-bold text-foreground">Next steps:</p>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 text-left font-medium">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">1</span>
            <p>Check your inbox (and spam folder)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">2</span>
            <p>Click the secure reset link in the email</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">3</span>
            <p>Create your new strong password</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Didn't receive the email?</p>
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            onClick={() => setMode("forgot")} 
            className="w-full h-11 border-2 hover:border-primary hover:bg-primary/5 transition-all"
          >
            <Mail className="w-4 h-4 mr-2" />
            Try another email address
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setMode("signin")} 
            className="w-full h-11 hover:bg-primary/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 w-12 h-12 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:scale-110 transition-all duration-300 group"
      >
        {theme === "dark" ? (
          <Sun className="w-6 h-6 text-yellow-500 group-hover:rotate-90 transition-transform duration-500" />
        ) : (
          <Moon className="w-6 h-6 text-blue-600 group-hover:-rotate-12 transition-transform duration-500" />
        )}
      </button>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-float opacity-20">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 blur-xl" />
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed opacity-20">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 blur-xl" />
        </div>
        <div className="absolute bottom-32 left-20 animate-float-slow opacity-20">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 blur-xl" />
        </div>
        <div className="absolute bottom-20 right-32 animate-float opacity-20">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 blur-xl" />
        </div>
        
        {/* Animated Icons */}
        <div className="absolute top-1/4 left-[15%] animate-float">
          <MessageSquare className="w-10 h-10 text-blue-400/30 dark:text-blue-600/30" />
        </div>
        <div className="absolute top-1/3 right-[10%] animate-float-delayed">
          <Send className="w-8 h-8 text-purple-400/30 dark:text-purple-600/30" />
        </div>
        <div className="absolute bottom-1/4 left-[20%] animate-float-slow">
          <Smartphone className="w-12 h-12 text-pink-400/30 dark:text-pink-600/30" />
        </div>
        <div className="absolute bottom-1/3 right-[15%] animate-float">
          <Zap className="w-10 h-10 text-blue-400/30 dark:text-blue-600/30" />
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md px-4 relative z-10" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
        <Card className="shadow-2xl border-2 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 overflow-hidden" style={{ backfaceVisibility: 'hidden', perspective: '1000px' }}>
          {/* Decorative Header Gradient */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
          
          <CardHeader className="space-y-4 text-center pb-6 pt-8">
            <div className="flex justify-center mb-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white dark:border-gray-900 animate-pulse flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-300 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
                SMS Gateway
              </CardTitle>
              <CardDescription className="text-base text-gray-700 dark:text-gray-300 font-medium">
                {mode === "signin" && "Welcome back! Sign in to continue"}
                {mode === "signup" && "Create your account to get started"}
                {mode === "forgot" && "Reset your password securely"}
                {mode === "reset-sent" && "Email sent successfully"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pb-8">
            <div key={mode} className="animate-fade-slide-in">
              {mode === "signin" && renderSignIn()}
              {mode === "signup" && renderSignUp()}
              {mode === "forgot" && renderForgotPassword()}
              {mode === "reset-sent" && renderResetSent()}
            </div>
          </CardContent>
        </Card>
        
        {/* Footer Text */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6 font-medium">
          Secured by enterprise-grade encryption 🔒
        </p>
      </div>

      <style>{`
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        body, html {
          overflow-x: hidden;
        }
        form {
          isolation: isolate;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: inherit;
          -webkit-box-shadow: 0 0 0px 1000px transparent inset;
          transition: background-color 5000s ease-in-out 0s;
          background-color: transparent !important;
        }
        input:-webkit-autofill {
          animation-name: onAutoFillStart;
        }
        input:not(:-webkit-autofill) {
          animation-name: onAutoFillCancel;
        }
        @keyframes onAutoFillStart {
          from { /**/}
          to { /**/}
        }
        @keyframes onAutoFillCancel {
          from { /**/}
          to { /**/}
        }
        @keyframes slideRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(-5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes scale-in {
          0% { 
            transform: scale(0.8);
            opacity: 0;
          }
          50% { 
            transform: scale(1.05);
          }
          100% { 
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fade-slide-in {
          0% { 
            opacity: 0;
            transform: translateY(20px);
          }
          100% { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          0% { 
            opacity: 0;
          }
          100% { 
            opacity: 1;
          }
        }
        @keyframes progress {
          0% { 
            transform: translateX(-100%);
          }
          100% { 
            transform: translateX(100%);
          }
        }
        @keyframes gradient {
          0%, 100% { 
            background-position: 0% 50%;
          }
          50% { 
            background-position: 100% 50%;
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-fade-slide-in {
          animation: fade-slide-in 0.4s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

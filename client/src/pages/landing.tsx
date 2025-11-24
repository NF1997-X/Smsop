import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Eye, EyeOff } from "lucide-react";

export default function Landing() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsTransitioning(true);
        // Simple transition before navigating
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      } else {
        setError("Incorrect password");
      }
    } catch (error) {
      setError("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-background flex flex-col items-center justify-center px-4 transition-all duration-500 ease-out ${
      isTransitioning ? 'opacity-0' : 'opacity-100 animate-in fade-in duration-700'
    }`}>
      <div className={`text-center max-w-md mx-auto bg-card border border-border p-8 rounded-lg shadow-2xl transform transition-all duration-500 ease-out ${
        isTransitioning 
          ? 'opacity-0 translate-y-4' 
          : 'opacity-100 translate-y-0 animate-in slide-in-from-bottom-4 duration-500 delay-200'
      }`}>
        {/* Logo */}
        <div className={`w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 transform transition-all duration-500 ease-out ${
          isTransitioning 
            ? 'opacity-0' 
            : 'opacity-100 animate-in zoom-in duration-500 delay-300'
        }`}>
          <MessageSquare className="h-8 w-8 text-primary-foreground" />
        </div>
        
        {/* Title */}
        <h1 className={`text-sm font-bold mb-4 transition-all duration-500 ease-out ${
          isTransitioning 
            ? 'opacity-0 text-green-400' 
            : 'opacity-100 text-foreground animate-in slide-in-from-top-2 duration-500 delay-400'
        }`}>
          {isTransitioning ? 'Success!' : 'SMS Messaging'}
        </h1>
        
        {/* Description */}
        <p className={`text-sm mb-8 transition-all duration-500 ease-out ${
          isTransitioning 
            ? 'opacity-0' 
            : 'opacity-100 text-muted-foreground animate-in slide-in-from-top-2 duration-500 delay-500'
        }`}>
          {isTransitioning ? '' : 'Enter password to access'}
        </p>
        
        {/* Password Form */}
        <form onSubmit={handleSubmit} className={`space-y-4 transition-all duration-500 ease-out ${
          isTransitioning 
            ? 'opacity-0 pointer-events-none' 
            : 'opacity-100 animate-in slide-in-from-bottom-4 duration-500 delay-600'
        }`}>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              data-testid="input-password"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-0 h-full px-2 text-gray-400 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm" data-testid="text-error">
              {error}
            </p>
          )}
          
          <Button 
            type="submit"
            size="lg" 
            disabled={isLoading || isTransitioning || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 text-sm text-white font-semibold border-2 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5),0_0_20px_rgba(59,130,246,0.3),0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_15px_rgba(59,130,246,0.7),0_0_25px_rgba(59,130,246,0.5),0_0_35px_rgba(59,130,246,0.3)] transition-all duration-300"
            data-testid="button-access"
          >
            {isTransitioning ? "Welcome!" : isLoading ? "Checking..." : "Access App"}
          </Button>
        </form>
      </div>
    </div>
  );
}
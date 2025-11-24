import { useEffect, useState } from "react";
import { Mail, Send, Smartphone } from "lucide-react";

interface LoadingIntroProps {
  onComplete: () => void;
}

export default function LoadingIntro({ onComplete }: LoadingIntroProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 300),   // Envelope appears
      setTimeout(() => setStage(2), 800),   // Envelope opens
      setTimeout(() => setStage(3), 1200),  // Message flies
      setTimeout(() => setStage(4), 1800),  // Phone receives
      setTimeout(() => setStage(5), 2400),  // Fade to app
      setTimeout(() => onComplete(), 3000), // Complete
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 flex flex-col items-center justify-center z-50 transition-all duration-700 ease-out ${
        stage >= 5 ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Network Lines Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent transition-all duration-1000 ${
                stage >= 1 ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                top: `${15 + i * 12}%`,
                left: '-100%',
                right: '-100%',
                animation: stage >= 1 ? `slideRight ${2 + i * 0.3}s ease-in-out infinite` : 'none',
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
        </div>

        {/* Main Animation Container */}
        <div className="relative z-10">
          {/* Envelope */}
          <div 
            className={`relative transition-all duration-1000 ease-out ${
              stage >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            } ${stage >= 3 ? '-translate-x-32 -translate-y-16 scale-75 opacity-0' : ''}`}
          >
            {/* Envelope Body */}
            <div className="relative w-64 h-40">
              {/* Envelope Back */}
              <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-blue-200 dark:border-blue-900" />
              
              {/* Envelope Flap */}
              <div 
                className={`absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 border-2 border-blue-200 dark:border-blue-900 origin-top transition-all duration-700 ease-out ${
                  stage >= 2 ? '-rotate-180 translate-y-2' : 'rotate-0'
                }`}
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)'
                }}
              />
              
              {/* Message Icon Inside */}
              <div 
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                  stage >= 2 ? 'translate-y-[-20px] opacity-100' : 'translate-y-0 opacity-60'
                }`}
              >
                <Mail className="w-16 h-16 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Flying Message */}
          <div 
            className={`absolute transition-all duration-1000 ease-in-out ${
              stage >= 3 
                ? 'translate-x-40 -translate-y-20 opacity-100 scale-100 rotate-12' 
                : 'translate-x-0 translate-y-0 opacity-0 scale-50 rotate-0'
            } ${stage >= 4 ? 'opacity-0 scale-75' : ''}`}
          >
            <Send className="w-12 h-12 text-primary animate-pulse" />
            {/* Message Trail */}
            {stage >= 3 && (
              <div className="absolute top-1/2 right-full w-32 h-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-primary rounded-full"
                    style={{
                      right: `${i * 25}%`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      opacity: 1 - (i * 0.2),
                      animation: 'fadeOut 0.5s ease-out forwards',
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Phone Receiving */}
          <div 
            className={`absolute transition-all duration-1000 ease-out ${
              stage >= 4 
                ? 'translate-x-40 translate-y-10 opacity-100 scale-100' 
                : 'translate-x-32 translate-y-10 opacity-0 scale-75'
            }`}
          >
            <div className="relative">
              <div className="w-32 h-56 bg-gradient-to-b from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 rounded-[2rem] shadow-2xl border-4 border-gray-700 dark:border-gray-600 p-3">
                <div className="w-full h-full bg-blue-500 dark:bg-blue-600 rounded-[1.2rem] flex items-center justify-center overflow-hidden">
                  <Smartphone className="w-16 h-16 text-white animate-bounce" />
                </div>
              </div>
              {/* Notification Ping */}
              {stage >= 4 && (
                <div className="absolute -top-2 -right-2">
                  <div className="relative">
                    <div className="w-6 h-6 bg-green-500 rounded-full animate-ping" />
                    <div className="absolute top-0 left-0 w-6 h-6 bg-green-500 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* App Name */}
        <div 
          className={`absolute bottom-32 transition-all duration-700 ease-out ${
            stage >= 4 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2 text-center">
            SMS Gateway
          </h1>
          <p className="text-muted-foreground text-sm text-center">
            Professional SMS Management Platform
          </p>
        </div>

        {/* Loading Indicator */}
        <div 
          className={`absolute bottom-16 transition-all duration-500 ${
            stage >= 1 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                style={{
                  animation: 'bounce 1s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeOut {
          to { opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
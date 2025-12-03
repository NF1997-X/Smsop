import { MessageSquare, History, Users, Settings, RefreshCw, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAccountBalance } from "@/hooks/useAccountBalance";

type Tab = "compose" | "history" | "contacts" | "settings";

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { id: "compose" as const, label: "Compose", icon: MessageSquare },
  { id: "history" as const, label: "History", icon: History },
  { id: "contacts" as const, label: "Contacts", icon: Users },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  const { balance, isLoading: balanceLoading, error: balanceError, refetch: refetchBalance } = useAccountBalance();

  return (
    <>
      <aside
        className={cn(
          "w-72 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex-shrink-0",
          "fixed inset-y-0 left-0 z-50 overflow-y-auto transition-transform duration-300 ease-in-out",
          "md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8 rounded-lg flex items-center justify-center md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur opacity-50"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <MessageSquare className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SMS Gateway</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Professional</span>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      onClose();
                    }}
                    className={cn(
                      "w-full flex items-center h-12 px-4 rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 text-blue-600 dark:text-blue-400" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-r-full"></div>
                    )}
                    
                    <div className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-lg mr-3 transition-all",
                      isActive 
                        ? "bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg" 
                        : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4 transition-transform group-hover:scale-110",
                        isActive ? "text-white" : "text-gray-600 dark:text-gray-400"
                      )} strokeWidth={2.5} />
                    </div>
                    
                    <span className="flex-1 text-left font-semibold text-sm">{item.label}</span>
                    
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-all",
                      isActive 
                        ? "opacity-100 translate-x-0" 
                        : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    )} />
                  </button>
                );
              })}
            </div>
          </nav>
          
          {/* Balance Card */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="relative p-5 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </div>
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Balance</p>
                  </div>
                  {!balanceLoading && (
                    <button
                      onClick={() => refetchBalance()}
                      className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 hover:rotate-180 transition-transform duration-500" />
                    </button>
                  )}
                </div>
                
                <div className="flex items-baseline space-x-1">
                  {balanceLoading ? (
                    <span className="text-xl font-bold text-gray-400 animate-pulse">Loading...</span>
                  ) : balanceError ? (
                    <span className="text-sm font-semibold text-orange-500">⚠️ Config Required</span>
                  ) : balance ? (
                    <>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{balance}</span>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">credits</span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-gray-400">--</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

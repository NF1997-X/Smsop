import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Contact } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import ComposeForm from "@/components/compose/compose-form";
import QuickContacts from "@/components/compose/quick-contacts";
import MessageHistory from "@/components/history/message-history";
import ContactGrid from "@/components/contacts/contact-grid";
import SettingsForm from "@/components/settings/settings-form";
import ContactModal from "@/components/contacts/contact-modal";
import { useMobileSidebar } from "@/hooks/use-mobile-sidebar";
import { Bell, Menu, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "compose" | "history" | "contacts" | "settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("compose");
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isDark, setIsDark] = useState(true);
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useMobileSidebar();
  const { isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isLoading]);

  // Listen for tab switch events
  useEffect(() => {
    const handleSwitchTab = (event: CustomEvent) => {
      const tabName = event.detail as Tab;
      setActiveTab(tabName);
      closeSidebar(); // Close mobile sidebar when switching tabs
    };

    window.addEventListener('switchTab', handleSwitchTab as EventListener);
    
    return () => {
      window.removeEventListener('switchTab', handleSwitchTab as EventListener);
    };
  }, [closeSidebar]);

  // Listen for edit contact events
  useEffect(() => {
    const handleEditContact = (event: CustomEvent) => {
      const contact = event.detail as Contact;
      setEditingContact(contact);
      setShowContactModal(true);
    };

    window.addEventListener('editContact', handleEditContact as EventListener);
    
    return () => {
      window.removeEventListener('editContact', handleEditContact as EventListener);
    };
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Initialize dark theme by default
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, []);

  const getPageTitle = (tab: Tab) => {
    const titles = {
      compose: "Compose Message",
      history: "Message History", 
      contacts: "Contact Management",
      settings: "Settings"
    };
    return titles[tab];
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              data-testid="button-sidebar-toggle"
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-sm font-semibold text-foreground" data-testid="text-page-title">
              {getPageTitle(activeTab)}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-notifications">
              <div className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-sm"></span>
              </div>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={async () => {
                try {
                  await fetch("/api/logout", { method: "POST" });
                  window.location.href = "/";
                } catch (error) {
                  console.error("Logout error:", error);
                  window.location.href = "/";
                }
              }}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 pb-20 md:pb-6 transition-all duration-300 ease-out">
          {activeTab === "compose" && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ComposeForm onShowContacts={() => setShowContactModal(true)} />
                </div>
                <div className="lg:col-span-1">
                  <QuickContacts onSelectContact={(phone) => {
                    // This will be handled by the ComposeForm component
                  }} />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "history" && <MessageHistory />}
          
          {activeTab === "contacts" && (
            <ContactGrid onAddContact={() => setShowContactModal(true)} />
          )}
          
          {activeTab === "settings" && <SettingsForm />}
        </div>
      </main>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <ContactModal 
        isOpen={showContactModal} 
        onClose={() => {
          setShowContactModal(false);
          setEditingContact(null);
        }}
        editingContact={editingContact}
      />
    </div>
  );
}

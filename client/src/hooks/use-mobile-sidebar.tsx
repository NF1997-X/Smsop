import { useState, useEffect } from "react";
import { useIsMobile } from "./use-mobile";

export function useMobileSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    console.log('Toggle called, current:', isSidebarOpen);
    setIsSidebarOpen(prev => {
      console.log('Setting to:', !prev);
      return !prev;
    });
  };

  const closeSidebar = () => {
    console.log('Close called');
    setIsSidebarOpen(false);
  };

  const openSidebar = () => {
    console.log('Open called');
    setIsSidebarOpen(true);
  };

  // Auto close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isMobile, isSidebarOpen]);

  return {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar
  };
}

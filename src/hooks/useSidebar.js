import { useCallback, useEffect, useState } from 'react';

export function useSidebar() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return {
    isSidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  };
}

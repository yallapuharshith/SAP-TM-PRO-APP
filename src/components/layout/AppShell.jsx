import Navbar from './Navbar';
import Sidebar from './Sidebar';
import PageContainer from './PageContainer';
import { useTheme } from '../../hooks/useTheme';
import { useSidebar } from '../../hooks/useSidebar';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function AppShell({ pageTitle, children }) {
  const { isDark, toggleTheme } = useTheme();
  const { isSidebarOpen, closeSidebar, openSidebar } = useSidebar();
  const location = useLocation();

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, location.search, closeSidebar]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-app)]">
      <div className="pointer-events-none absolute inset-0 bg-mesh-gradient opacity-90" />
      <div className="relative flex min-h-screen">
        <div className="hidden lg:block">
          <Sidebar isOpen onClose={closeSidebar} />
        </div>

        <div className="lg:hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        </div>

        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar
            pageTitle={pageTitle}
            isDark={isDark}
            onThemeToggle={toggleTheme}
            onMenuClick={openSidebar}
          />
          <PageContainer>{children}</PageContainer>
        </div>
      </div>
    </div>
  );
}

export default AppShell;

import { useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { config } from '@/lib/config';
import DashboardSidebar from './DashboardSidebar';
import { Outlet } from 'react-router-dom';
import NotificationManager from '../notifications/NotificationManager';
import NotificationBell from '../notifications/NotificationBell';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { activeStore } = useStore();
  const { signOut } = useAuth();
  const storeBaseUrl = config.store.baseUrl;

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      window.location.href = `${storeBaseUrl}/login`;
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-background selection:bg-primary/10">
      {/* Background Workers */}
      <NotificationManager />

      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Header */}
        <header className="flex items-center justify-between p-4 px-6 md:p-6 md:px-8 border-b bg-background/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden h-10 w-10 text-muted-foreground hover:bg-primary/5 rounded-xl"
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Store Breadcrumb/Info */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center text-primary shadow-sm overflow-hidden">
                {activeStore?.logo_url ? <img src={activeStore.logo_url} alt={activeStore.store_name} className="w-6 h-6 object-contain" /> : <div className="font-bold text-sm tracking-tighter">🛒</div>}
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-foreground text-sm md:text-base truncate max-w-[150px] md:max-w-[300px] leading-tight">
                  {activeStore?.store_name || 'My Dashboard'}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50 hidden md:block">
                  Live Control Panel
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <NotificationBell />

            <div className="h-8 w-[1px] bg-border mx-1" />

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#fafafa]">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

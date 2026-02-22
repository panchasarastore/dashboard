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
import { PlusCircle, Share2, Eye, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ShareStoreModal from '../dashboard/ShareStoreModal';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { activeStore } = useStore();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const storeBaseUrl = config.store.baseUrl;
  const fullStoreUrl = `${storeBaseUrl}/${activeStore?.store_url_slug || ''}`;

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      window.location.href = `${storeBaseUrl}/login`;
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    }
  };

  const handleViewStore = () => {
    if (activeStore?.store_url_slug) {
      window.open(fullStoreUrl, '_blank');
    } else {
      toast.error('Store link not available');
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
        <header className="flex items-center justify-between h-20 px-4 md:px-8 border-b bg-background/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4 min-w-0">
            {/* Mobile Menu Trigger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden h-10 w-10 text-muted-foreground hover:bg-primary/5 rounded-xl shrink-0"
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Store Branding */}
            <div className="flex flex-col min-w-0">
              <h2 className="font-display font-black text-foreground text-lg md:text-2xl tracking-tight truncate leading-none mb-1">
                {activeStore?.store_name || 'My Dashboard'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] md:text-[11px] text-primary font-black uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]">
                  Live Control Panel
                </span>
                <div className="relative flex h-2 w-2">
                  <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></div>
                  <div className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
            </div>

            {/* Mobile Actions (Condensed) */}
            <div className="md:hidden flex items-center gap-1">
            </div>

            <div className="h-8 w-[1px] bg-border mx-1" />

            <ThemeToggle />

            <NotificationBell />

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

        <ShareStoreModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          storeUrl={fullStoreUrl}
        />

        <main className="flex-1 overflow-auto bg-background">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

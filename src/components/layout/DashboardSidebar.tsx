import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Edit3,
  Eye,
  Share2,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import ShareStoreModal from '../dashboard/ShareStoreModal';
import { config } from '@/lib/config';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const DashboardSidebar = ({ isOpen, onClose }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeStore } = useStore();
  const { signOut } = useAuth();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync collapsed state with local storage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) setIsCollapsed(saved === 'true');
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  const storeBaseUrl = config.store.baseUrl;
  const fullStoreUrl = `${storeBaseUrl}/${activeStore?.store_url_slug || ''}`;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingBag, label: 'Manage Orders', path: '/dashboard/orders' },
    { icon: Edit3, label: 'Manage Products', path: '/dashboard/products' },
    { icon: PlusCircle, label: 'Add Product', path: '/dashboard/add-product' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const handleShareLink = () => {
    setIsShareModalOpen(true);
  };

  const handleViewStore = () => {
    if (activeStore?.store_url_slug) {
      window.open(fullStoreUrl, '_blank');
    } else {
      toast.error('Store link not available');
    }
  };

  const quickActions = [
    { icon: Eye, label: 'View Store', onClick: handleViewStore },
    { icon: Edit3, label: 'Edit Store', onClick: () => window.open(`${storeBaseUrl}/edit-store`, '_blank') },
    { icon: Share2, label: 'Share Store', onClick: handleShareLink },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      // Redirect to the store login page as requested
      window.location.href = `${storeBaseUrl}/login`;
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 glass-effect flex flex-col transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
        isCollapsed ? "w-20" : "w-64",
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo & Toggle Button */}
        <div className={cn(
          "h-20 border-b border-sidebar-border flex items-center transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "justify-between px-6"
        )}>
          {!isCollapsed ? (
            <Link to="/" className="flex items-center gap-3 overflow-hidden group/logo">
              <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center shadow-inner border border-primary/10 backdrop-blur-xl transition-all duration-500 group-hover/logo:scale-105 group-hover/logo:border-primary/20 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-muted shadow-2xl flex items-center justify-center overflow-hidden border border-white dark:border-white/10 p-1">
                  {activeStore?.logo_url ? (
                    <img src={activeStore.logo_url} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <img src="https://pnsara.store/logo_pnsara.png" alt="Panchasara" className="w-full h-full object-contain" />
                  )}
                </div>
              </div>
            </Link>
          ) : (
            <Link to="/" className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center shadow-inner border border-primary/10 backdrop-blur-xl shrink-0 transition-all duration-300">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-muted shadow-lg flex items-center justify-center overflow-hidden border border-white dark:border-white/10 p-0.5">
                {activeStore?.logo_url ? (
                  <img src={activeStore.logo_url} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <img src="https://pnsara.store/logo_pnsara.png" alt="Panchasara" className="w-full h-full object-contain p-1" />
                )}
              </div>
            </Link>
          )}

          <div className="flex items-center gap-1">
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden h-8 w-8 text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden lg:flex h-8 w-8 text-muted-foreground hover:bg-primary/5 rounded-lg transition-transform active:scale-95"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          <TooltipProvider delayDuration={0}>
            {menuItems.map((item) => {
              const isActive = item.path === '/dashboard'
                ? location.pathname === '/dashboard' || location.pathname === '/dashboard/'
                : location.pathname.startsWith(item.path);

              const icon = <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground")} />;

              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                        isActive
                          ? "premium-gradient text-primary-foreground font-bold shadow-lg shadow-primary/20 border-none"
                          : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
                        isCollapsed && "justify-center px-0"
                      )}
                    >
                      {icon}
                      {!isCollapsed && <span className="text-sm tracking-tight">{item.label}</span>}
                      {isActive && isCollapsed && (
                        <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="font-bold text-xs uppercase tracking-widest bg-foreground text-background border-none">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}

            <div className="my-4 border-t border-sidebar-border/50" />

            {!isCollapsed && (
              <div className="px-3 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                  Quick Actions
                </span>
              </div>
            )}

            {quickActions.map((action) => (
              <Tooltip key={action.label}>
                <TooltipTrigger asChild>
                  <button
                    onClick={action.onClick}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative text-muted-foreground hover:bg-primary/5 hover:text-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <action.icon className="w-5 h-5 shrink-0 transition-colors group-hover:text-primary" />
                    {!isCollapsed && <span className="text-sm tracking-tight">{action.label}</span>}
                  </button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="font-bold text-xs uppercase tracking-widest bg-foreground text-background border-none">
                    {action.label}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>

      </aside>

      <ShareStoreModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        storeUrl={fullStoreUrl}
      />
    </>
  );
};

export default DashboardSidebar;

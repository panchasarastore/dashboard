import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Edit3,
  Eye,
  Share2,
  Package,
  ShoppingBag,
  LogOut,
  X
} from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import StoreSwitcher from './StoreSwitcher';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import ShareStoreModal from '../dashboard/ShareStoreModal';

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const DashboardSidebar = ({ isOpen, onClose }: DashboardSidebarProps) => {
  const location = useLocation();
  const { activeStore } = useStore();
  const { signOut } = useAuth();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const storeBaseUrl = import.meta.env.VITE_STORE_BASE_URL || 'http://localhost:4321';
  const fullStoreUrl = `${storeBaseUrl}/${activeStore?.store_url_slug || ''}`;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: PlusCircle, label: 'Add Product', path: '/add-product' },
    { icon: Edit3, label: 'Manage Products', path: '/products' },
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

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & Close Button */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-xl shadow-lg shadow-primary/20">
              {activeStore?.logo_url ? <img src={activeStore.logo_url} className="w-6 h-6 object-contain" /> : '🏪'}
            </div>
            <div>
              <h1 className="font-serif font-semibold text-foreground text-lg leading-tight truncate w-32">
                {activeStore?.store_name || 'Loading...'}
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium opacity-70">
                Dashboard
              </p>
            </div>
          </Link>

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
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-4">
              Quick Actions
            </p>
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={handleViewStore}
                className="w-full justify-start gap-3 text-muted-foreground hover:text-accent-foreground hover:bg-accent"
              >
                <Eye className="w-5 h-5" />
                <span>View Store</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleShareLink}
                className="w-full justify-start gap-3 text-muted-foreground hover:text-accent-foreground hover:bg-accent"
              >
                <Share2 className="w-5 h-5" />
                <span>Share Store Link</span>
              </Button>
            </div>
          </div>
        </nav>

        {/* Footer - Logout Button */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full group flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-muted group-hover:bg-destructive/20 flex items-center justify-center transition-colors">
              <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Logout</p>
              <p className="text-[10px] opacity-70">End your session</p>
            </div>
          </Button>
        </div>
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

import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Edit3,
  Eye,
  Share2,
  Package,
  ShoppingBag
} from 'lucide-react';
import { storeInfo } from '@/lib/mockData';
import { useStore } from '@/contexts/StoreContext';
import StoreSwitcher from './StoreSwitcher';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const DashboardSidebar = ({ isOpen, onClose }: DashboardSidebarProps) => {
  const location = useLocation();
  const { activeStore } = useStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: PlusCircle, label: 'Add Product', path: '/add-product' },
    { icon: Edit3, label: 'Manage Products', path: '/products' },
  ];

  const handleShareLink = () => {
    const storeUrl = `https://store.example.com/${storeInfo.url}`;
    navigator.clipboard.writeText(storeUrl);
    toast.success('Store link copied to clipboard!');
  };

  const handleViewStore = () => {
    toast.info('Store preview would open in a new tab');
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

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Free tier</p>
              <p className="text-sm font-medium text-foreground">0% platform fee</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;

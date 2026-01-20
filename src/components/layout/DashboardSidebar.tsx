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
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const DashboardSidebar = () => {
  const location = useLocation();

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
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-xl">
            {storeInfo.logo}
          </div>
          <div>
            <h1 className="font-serif font-semibold text-foreground text-lg leading-tight">
              {storeInfo.name}
            </h1>
            <p className="text-xs text-muted-foreground">Store Dashboard</p>
          </div>
        </Link>
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
  );
};

export default DashboardSidebar;

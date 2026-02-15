import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/contexts/StoreContext';
import DashboardSidebar from './DashboardSidebar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Outlet, useNavigate } from 'react-router-dom';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { activeStore } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeStore?.id) return;

    const channel = supabase
      .channel(`new-orders-${activeStore.id.slice(0, 8)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${activeStore.id}`,
        },
        (payload) => {
          const newOrder = payload.new as any;
          toast.success(`🎉 New Order!`, {
            description: `Order ${newOrder.order_number} received from ${newOrder.customer_name}`,
            action: {
              label: 'View',
              onClick: () => navigate(`/orders/${newOrder.id}`)
            },
            duration: 8000,
          });

          // Play a subtle notification sound (optional but good for UX)
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.4;
            audio.play();
          } catch (e) {
            console.log('Audio playback blocked');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeStore?.id, navigate]);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b bg-sidebar/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-sm">
              {activeStore?.logo_url ? <img src={activeStore.logo_url} className="w-5 h-5 object-contain" /> : '🏪'}
            </div>
            <span className="font-serif font-semibold text-foreground truncate max-w-[150px]">
              {activeStore?.store_name || 'Dashboard'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="text-muted-foreground"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

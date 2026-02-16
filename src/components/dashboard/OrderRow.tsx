import { format } from 'date-fns';
import { ChevronRight, Clock, CheckCircle, Package, Truck, Check, ExternalLink, CreditCard, Wallet, MapPin, Store, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';

interface OrderRowProps {
  order: Order & {
    productName: string;
    productImage: string;
    totalQuantity: number;
    payment_status: string;
    payment_method: string;
    delivery_method: string;
  };
  onClick: () => void;
}

const OrderRow = ({ order, onClick }: OrderRowProps) => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const statusConfig = {
    pending: {
      label: 'New',
      icon: Clock,
      className: 'bg-amber-100/80 text-amber-700 border-amber-200/50',
      next: 'confirmed'
    },
    confirmed: {
      label: 'Confirmed',
      icon: CheckCircle,
      className: 'bg-blue-100/80 text-blue-700 border-blue-200/50',
      next: 'preparing'
    },
    preparing: {
      label: 'Preparing',
      icon: Package,
      className: 'bg-primary/10 text-primary border-primary/20',
      next: 'ready'
    },
    ready: {
      label: 'Ready',
      icon: Truck,
      className: 'bg-green-100/80 text-green-700 border-green-200/50',
      next: 'delivered'
    },
    delivered: {
      label: 'Delivered',
      icon: Check,
      className: 'bg-slate-100/80 text-slate-500 border-slate-200/50',
      next: null
    },
  };

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isPaid = order.payment_status?.toLowerCase() === 'paid' || order.payment_status === 'COMPLETED';

  const handleQuickAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!status.next) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: status.next } as any)
        .eq('id', order.id);

      if (error) throw error;
      toast.success(`Order #${order.order_number.slice(-4)} marked as ${statusConfig[status.next].label}`);
      queryClient.invalidateQueries({ queryKey: ['orders'] } as any);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="order-row group relative flex items-center gap-4 p-4 mb-2 border bg-card transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 animate-slide-up rounded-[1.25rem] cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Visual Accent */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", status.className.split(' ')[0])}></div>

      {/* Product Image */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1rem] overflow-hidden border border-border/50 shadow-inner bg-muted/30">
          <img
            src={order.productImage}
            alt={order.productName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        <div className={cn("absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-card flex items-center justify-center shadow-sm transition-transform group-hover:scale-110", status.className.split(' ')[0])}>
          <StatusIcon className="w-3 h-3" />
        </div>
      </div>

      {/* Order Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40 font-mono">{order.order_number.slice(0, 8)}</span>
          <Badge variant="outline" className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border-0 uppercase tracking-tight", status.className)}>
            {status.label}
          </Badge>
          <div className="flex items-center gap-1.5 ml-auto md:ml-0">
            {order.payment_method === 'ONLINE' ? <CreditCard className="w-3 h-3 text-muted-foreground/50" /> : <Wallet className="w-3 h-3 text-muted-foreground/50" />}
            {order.delivery_method === 'delivery' ? <MapPin className="w-3 h-3 text-muted-foreground/50" /> : <Store className="w-3 h-3 text-muted-foreground/50" />}
          </div>
        </div>

        <h3 className="text-sm md:text-base font-bold text-foreground truncate group-hover:text-primary transition-colors pr-2">
          {order.productName}
        </h3>

        <div className="flex items-center gap-2 mt-1">
          <p className="text-[11px] text-muted-foreground font-bold flex items-center gap-1.5 truncate">
            {order.customer_name}
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span className="text-primary/60">Qty: {order.totalQuantity}</span>
          </p>
          {isPaid && (
            <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[8px] font-black px-1.5 py-0 h-4 rounded-md uppercase tracking-widest">Paid</Badge>
          )}
        </div>
      </div>

      {/* Date & Price */}
      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5 ml-auto">
        <p className="text-base md:text-lg font-black text-foreground tracking-tight">₹{order.total_amount.toLocaleString()}</p>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold bg-muted/40 px-2 py-1 rounded-full border border-border/30">
          <Clock className="w-3 h-3" />
          {format(new Date(order.order_date), 'MMM dd, p')}
        </div>
      </div>

      {/* Quick Actions (Hover) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 hidden lg:flex">
        {status.next && (
          <Button
            onClick={handleQuickAction}
            disabled={isUpdating}
            size="sm"
            className="h-9 px-4 rounded-xl font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Mark as {statusConfig[status.next].label}</span>}
          </Button>
        )}
        <div className="w-9 h-9 rounded-xl bg-card border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0 md:hidden" />
    </div>
  );
};

export default OrderRow;

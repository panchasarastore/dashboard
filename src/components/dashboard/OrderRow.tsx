import { format } from 'date-fns';
import { ChevronRight, Clock, CheckCircle, Package, Truck, Check, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OrderRowProps {
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    productName: string;
    productImage: string;
    totalPrice: number;
    deliveryDate: Date;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  };
  onClick: () => void;
}

const OrderRow = ({ order, onClick }: OrderRowProps) => {
  const statusConfig = {
    pending: {
      label: 'New',
      icon: Clock,
      className: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    confirmed: {
      label: 'Confirmed',
      icon: CheckCircle,
      className: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    preparing: {
      label: 'Preparing',
      icon: Package,
      className: 'bg-primary/10 text-primary border-primary/20'
    },
    ready: {
      label: 'Ready',
      icon: Truck,
      className: 'bg-green-100 text-green-700 border-green-200'
    },
    delivered: {
      label: 'Delivered',
      icon: Check,
      className: 'bg-slate-100 text-slate-500 border-slate-200'
    },
  };

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div
      className="order-row group relative flex items-center gap-4 p-4 mb-3 border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-slide-up rounded-xl"
      onClick={onClick}
    >
      {/* Product Image with status indicator */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border border-border shadow-inner">
          <img
            src={order.productImage}
            alt={order.productName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card flex items-center justify-center ${status.className.split(' ')[0]}`}>
          <StatusIcon className="w-2.5 h-2.5" />
        </div>
      </div>

      {/* Order Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">{order.order_number}</span>
          <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${status.className}`}>
            {status.label}
          </Badge>
        </div>
        <h3 className="text-sm md:text-base font-display font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {order.productName}
        </h3>
        <p className="text-[11px] md:text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
          <span className="truncate">{order.customer_name}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-1"></span>
          <span>Qty: 1</span>
        </p>
      </div>

      {/* Delivery Date & Price */}
      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
        <p className="text-sm md:text-base font-bold text-foreground">₹{order.totalPrice.toLocaleString()}</p>
        <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" />
          {format(order.deliveryDate, 'MMM dd, p')}
        </div>
      </div>

      {/* Action hover icon */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 md:hidden" />
    </div>
  );
};

export default OrderRow;

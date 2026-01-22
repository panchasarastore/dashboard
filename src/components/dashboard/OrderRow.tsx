import { format } from 'date-fns';
import { ChevronRight, Clock, CheckCircle, Package, Truck, Check } from 'lucide-react';
import { Order } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';

interface OrderRowProps {
  order: Order;
  onClick: () => void;
}

const OrderRow = ({ order, onClick }: OrderRowProps) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-warning/10 text-warning border-warning/20'
    },
    confirmed: {
      label: 'Confirmed',
      icon: CheckCircle,
      className: 'bg-info/10 text-info border-info/20'
    },
    preparing: {
      label: 'Preparing',
      icon: Package,
      className: 'bg-primary/10 text-primary border-primary/20'
    },
    ready: {
      label: 'Ready',
      icon: Truck,
      className: 'bg-success/10 text-success border-success/20'
    },
    delivered: {
      label: 'Delivered',
      icon: Check,
      className: 'bg-muted text-muted-foreground border-muted'
    },
  };

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <div
      className="order-row flex items-center gap-4 animate-slide-up"
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={order.productImage}
          alt={order.productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Order Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 md:mb-1">
          <span className="text-[10px] md:text-xs font-medium text-muted-foreground">{order.id}</span>
          <Badge variant="outline" className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0 md:py-0.5 ${status.className}`}>
            <StatusIcon className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
            {status.label}
          </Badge>
        </div>
        <p className="text-sm md:text-base font-medium text-foreground truncate">{order.productName}</p>
        <p className="text-xs md:text-sm text-muted-foreground truncate">
          {order.customerName} • Qty: {order.quantity}
        </p>
      </div>

      {/* Delivery Date & Price */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm md:text-base font-semibold text-foreground">₹{order.totalPrice.toLocaleString()}</p>
        <p className="text-[10px] md:text-xs text-muted-foreground">
          {format(order.deliveryDate, 'MMM dd')}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </div>
  );
};

export default OrderRow;

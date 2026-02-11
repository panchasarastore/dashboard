import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Package,
  MessageSquare,
  User,
  Clock,
  CheckCircle,
  Truck,
  Check,
  Loader2
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrder } from '@/hooks/useOrders';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: order, isLoading, error } = useOrder(orderId);
  const [isUpdating, setIsUpdating] = useState(false);

  if (isLoading && !order) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground italic">Fetching order details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">{error ? (error as any).message : 'Order not found'}</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-warning/10 text-warning border-warning/20',
      next: 'confirmed' as const
    },
    confirmed: {
      label: 'Confirmed',
      icon: CheckCircle,
      className: 'bg-info/10 text-info border-info/20',
      next: 'preparing' as const
    },
    preparing: {
      label: 'Preparing',
      icon: Package,
      className: 'bg-primary/10 text-primary border-primary/20',
      next: 'ready' as const
    },
    ready: {
      label: 'Ready for Delivery',
      icon: Truck,
      className: 'bg-success/10 text-success border-success/20',
      next: 'delivered' as const
    },
    delivered: {
      label: 'Delivered',
      icon: Check,
      className: 'bg-muted text-muted-foreground border-muted',
      next: null
    },
  };

  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  const handleUpdateStatus = async () => {
    if (status.next) {
      setIsUpdating(true);
      try {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: status.next })
          .eq('id', order.id);

        if (updateError) throw updateError;

        toast.success(`Order marked as ${statusConfig[status.next].label}`);
        queryClient.invalidateQueries({ queryKey: ['order', order.id] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      } catch (err: any) {
        toast.error(err.message || 'Failed to update status');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                  {order.order_number}
                </h1>
                <Badge variant="outline" className={`${status.className}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Placed on {format(new Date(order.order_date), 'MMMM dd, yyyy')}
              </p>
            </div>
            {status.next && (
              <Button onClick={handleUpdateStatus} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Mark as {statusConfig[status.next].label}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <div className="dashboard-card">
              <h2 className="text-lg font-serif font-semibold text-foreground mb-4">
                Order Overview
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <span className="font-medium text-foreground capitalize">{order.status}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Payment Method</span>
                  <span className="font-medium text-foreground uppercase">{order.payment_method}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Payment Status</span>
                  <span className="font-medium text-foreground capitalize">{order.payment_status}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Delivery Method</span>
                  <span className="font-medium text-foreground capitalize">{order.delivery_method}</span>
                </div>
              </div>
            </div>

            {/* Custom Instructions */}
            {(order.customer_notes || order.delivery_notes) && (
              <div className="dashboard-card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-serif font-semibold text-foreground mb-2">
                      Notes
                    </h2>
                    {order.customer_notes && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Customer Note</p>
                        <p className="text-muted-foreground">{order.customer_notes}</p>
                      </div>
                    )}
                    {order.delivery_notes && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Delivery Instructions</p>
                        <p className="text-muted-foreground">{order.delivery_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Address with Map */}
            {order.delivery_method === 'delivery' && (
              <div className="dashboard-card">
                <h2 className="text-lg font-serif font-semibold text-foreground mb-4">
                  Delivery Location
                </h2>
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-foreground">{order.delivery_address}</p>
                    {order.delivery_landmark && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Landmark: {order.delivery_landmark}
                      </p>
                    )}
                    {order.delivery_pincode && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Pincode: {order.delivery_pincode}
                      </p>
                    )}
                  </div>
                </div>
                {/* Map Placeholder */}
                {order.delivery_lat && order.delivery_lng && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}&output=embed`}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="dashboard-card">
              <h2 className="text-lg font-serif font-semibold text-foreground mb-4">
                Customer Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">Customer</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${order.customer_phone}`} className="text-foreground hover:text-primary">
                    {order.customer_phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${order.customer_email}`} className="text-foreground hover:text-primary">
                    {order.customer_email}
                  </a>
                </div>
              </div>
            </div>

            {/* Delivery Schedule */}
            <div className="dashboard-card">
              <h2 className="text-lg font-serif font-semibold text-foreground mb-4">
                Schedule
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {format(new Date(order.order_date), 'EEEE')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.order_date), 'MMMM dd, yyyy')}
                  </p>
                  {order.time_slot && (
                    <p className="text-xs text-primary font-medium mt-1">
                      Slot: {order.time_slot}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="dashboard-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <h2 className="text-lg font-serif font-semibold text-foreground mb-4">
                Order Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₹{(order.subtotal || order.total_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="text-foreground">₹{(order.total_amount - (order.subtotal || order.total_amount)).toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="font-bold text-primary text-lg">
                      ₹{order.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderDetails;

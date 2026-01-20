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
  Check
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockOrders } from '@/lib/mockData';
import { toast } from 'sonner';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const order = mockOrders.find(o => o.id === orderId);

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">Order not found</p>
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

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const handleUpdateStatus = () => {
    if (status.next) {
      toast.success(`Order marked as ${statusConfig[status.next].label}`);
    }
  };

  // Google Maps embed URL
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(order.address)}`;

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
                <h1 className="text-3xl font-serif font-bold text-foreground">
                  {order.id}
                </h1>
                <Badge variant="outline" className={`${status.className}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Placed on {format(order.createdAt, 'MMMM dd, yyyy')}
              </p>
            </div>
            {status.next && (
              <Button onClick={handleUpdateStatus}>
                Mark as {statusConfig[status.next].label}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Details */}
            <div className="dashboard-card">
              <h2 className="text-lg font-serif font-semibold text-foreground mb-4">
                Order Items
              </h2>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={order.productImage} 
                    alt={order.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{order.productName}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Quantity: {order.quantity}
                  </p>
                  <p className="text-lg font-semibold text-primary mt-2">
                    ₹{order.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Instructions */}
            {order.customInstructions && (
              <div className="dashboard-card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-semibold text-foreground mb-2">
                      Custom Instructions
                    </h2>
                    <p className="text-muted-foreground">
                      {order.customInstructions}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Address with Map */}
            <div className="dashboard-card">
              <h2 className="text-lg font-serif font-semibold text-foreground mb-4">
                Delivery Location
              </h2>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <p className="text-foreground">{order.address}</p>
              </div>
              {/* Map Placeholder */}
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${order.coordinates.lat},${order.coordinates.lng}&output=embed`}
                />
              </div>
            </div>
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
                    <p className="font-medium text-foreground">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">Customer</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${order.customerPhone}`} className="text-foreground hover:text-primary">
                    {order.customerPhone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${order.customerEmail}`} className="text-foreground hover:text-primary">
                    {order.customerEmail}
                  </a>
                </div>
              </div>
            </div>

            {/* Delivery Schedule */}
            <div className="dashboard-card">
              <h2 className="text-lg font-serif font-semibold text-foreground mb-4">
                Delivery Schedule
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {format(order.deliveryDate, 'EEEE')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(order.deliveryDate, 'MMMM dd, yyyy')}
                  </p>
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
                  <span className="text-foreground">₹{order.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform fee</span>
                  <span className="text-foreground">₹0</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="font-bold text-primary text-lg">
                      ₹{order.totalPrice.toLocaleString()}
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

import { useNavigate } from 'react-router-dom';
import { IndianRupee, Package, Clock, ShoppingBag, Loader2, ArrowRight, Activity } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import OrderRow from '@/components/dashboard/OrderRow';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  // Only show the full-page loader if we have NO data at all (first load)
  if ((productsLoading && !products) || (ordersLoading && !orders)) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="absolute inset-0 w-12 h-12 bg-primary/20 blur-xl animate-pulse rounded-full" />
          </div>
          <p className="text-muted-foreground font-medium mt-6 tracking-wide">Initializing Dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate stats
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const fulfilledOrders = orders?.filter(order => order.status === 'delivered').length || 0;
  const pendingOrders = orders?.filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status)).length || 0;
  const totalProducts = products?.length || 0;

  // Get upcoming orders
  const upcomingOrders = (orders || [])
    .filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status))
    .sort((a, b) => new Date(a.order_date).getTime() - new Date(b.order_date).getTime());

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="animate-slide-up">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-green-500" />
                Live Dashboard
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black text-foreground mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium max-w-lg">
              Everything looks good today. You have <span className="text-primary font-bold">{pendingOrders}</span> orders requiring your attention.
            </p>
          </div>

          <div className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-dashed hover:border-primary hover:text-primary transition-all font-semibold"
              onClick={() => navigate('/products')}
            >
              Add Product
            </Button>
            <Button
              size="sm"
              className="rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all px-6"
              onClick={() => navigate('/orders')}
            >
              View All Orders
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            subtitle="Lifetime earnings"
            icon={IndianRupee}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Pending Attention"
            value={pendingOrders}
            subtitle="Needs processing"
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Fulfilled"
            value={fulfilledOrders}
            subtitle="Ready to ship / Delivered"
            icon={Package}
            variant="success"
          />
          <StatCard
            title="Total Products"
            value={totalProducts}
            subtitle="Live in store"
            icon={ShoppingBag}
            variant="default"
          />
        </div>

        {/* Upcoming Orders Section */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-card rounded-[2rem] border border-border p-6 md:p-8 shadow-sm overflow-hidden relative group">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all duration-500 group-hover:bg-primary/10" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
              <div>
                <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">
                  Upcoming Orders
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
                  Recent orders waiting to be processed
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-primary hover:text-primary hover:bg-primary/5 font-bold flex items-center gap-2 group/btn"
                onClick={() => navigate('/orders')}
              >
                View all <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>

            {upcomingOrders.length > 0 ? (
              <div className="space-y-1 relative z-10">
                {upcomingOrders.slice(0, 5).map((order) => (
                  <OrderRow
                    key={order.id}
                    order={{
                      id: order.id,
                      order_number: order.order_number,
                      customer_name: order.customer_name,
                      productName: (order as any).productName,
                      productImage: (order as any).productImage,
                      totalPrice: order.total_amount,
                      deliveryDate: new Date(order.order_date),
                      status: order.status,
                    } as any}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  />
                ))}

                {upcomingOrders.length > 5 && (
                  <div className="pt-4 text-center">
                    <p className="text-sm text-muted-foreground font-medium">
                      + {upcomingOrders.length - 5} more pending orders
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-card border border-border flex items-center justify-center mx-auto mb-6 shadow-sm rotate-3">
                  <Package className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground">All caught up!</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                  When new orders arrive, they'll appear here automatically in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

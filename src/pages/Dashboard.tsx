import { useNavigate } from 'react-router-dom';
import { IndianRupee, Package, Clock, ShoppingBag, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import OrderRow from '@/components/dashboard/OrderRow';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: products, isLoading: productsLoading, isFetching: productsFetching } = useProducts();
  const { data: orders, isLoading: ordersLoading, isFetching: ordersFetching } = useOrders();

  // Only show the full-page loader if we have NO data at all (first load)
  const isInitialLoading = (productsLoading && !products) || (ordersLoading && !orders);

  if (isInitialLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground italic">Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate stats
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const fulfilledOrders = orders?.filter(order => order.status === 'delivered').length || 0;
  const pendingOrders = orders?.filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status)).length || 0;
  const totalProducts = products?.length || 0;

  // Get upcoming orders (pending, confirmed, or preparing)
  const upcomingOrders = (orders || [])
    .filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status))
    .sort((a, b) => new Date(a.order_date).getTime() - new Date(b.order_date).getTime());

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-1 md:mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Here's what's happening with your store today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            subtitle="All time"
            icon={IndianRupee}
            variant="primary"
          />
          <StatCard
            title="Fulfilled Orders"
            value={fulfilledOrders}
            subtitle="Completed deliveries"
            icon={Package}
            variant="success"
          />
          <StatCard
            title="Pending Orders"
            value={pendingOrders}
            subtitle="Requires attention"
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Total Products"
            value={totalProducts}
            subtitle="Active listings"
            icon={ShoppingBag}
            variant="default"
          />
        </div>

        {/* Upcoming Orders */}
        <div className="dashboard-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-serif font-semibold text-foreground">
                Upcoming Orders
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Orders that need your attention
              </p>
            </div>
            <span className="text-xs md:text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full self-start sm:self-auto">
              {upcomingOrders.length} orders
            </span>
          </div>

          {upcomingOrders.length > 0 ? (
            <div className="space-y-3">
              {upcomingOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={{
                    ...order,
                    productName: order.order_number, // Fallback since we don't have product details joined here yet
                    productImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', // Temporary placeholder
                    totalPrice: order.total_amount,
                    deliveryDate: new Date(order.order_date),
                  } as any}
                  onClick={() => navigate(`/orders/${order.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No upcoming orders</p>
              <p className="text-sm text-muted-foreground mt-1">
                New orders will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

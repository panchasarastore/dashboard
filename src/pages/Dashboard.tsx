import { useNavigate } from 'react-router-dom';
import { IndianRupee, Package, Clock, ShoppingBag } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import OrderRow from '@/components/dashboard/OrderRow';
import { mockOrders, mockStats } from '@/lib/mockData';

const Dashboard = () => {
  const navigate = useNavigate();

  // Get upcoming orders (pending or confirmed)
  const upcomingOrders = mockOrders
    .filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status))
    .sort((a, b) => a.deliveryDate.getTime() - b.deliveryDate.getTime());

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
            value={`₹${mockStats.totalRevenue.toLocaleString()}`}
            subtitle="This month"
            icon={IndianRupee}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Fulfilled Orders"
            value={mockStats.fulfilledOrders}
            subtitle="All time"
            icon={Package}
            variant="success"
          />
          <StatCard
            title="Pending Orders"
            value={mockStats.pendingOrders}
            subtitle="Requires attention"
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Total Products"
            value={mockStats.totalProducts}
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
                  order={order}
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

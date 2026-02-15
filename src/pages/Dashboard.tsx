import { useNavigate } from 'react-router-dom';
import { IndianRupee, Package, Clock, ShoppingBag, Loader2, ArrowRight, Activity, Share2, ExternalLink, Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import OrderRow from '@/components/dashboard/OrderRow';
import { useOrders } from '@/hooks/useOrders';
import { useStats } from '@/hooks/useStats';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useStore } from '@/contexts/StoreContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { activeStore } = useStore();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: infiniteOrders, isLoading: ordersLoading } = useOrders();

  // Flatten orders for display
  const orders = useMemo(() => {
    return infiniteOrders?.pages.flatMap(page => page.data) || [];
  }, [infiniteOrders]);

  const storeBaseUrl = import.meta.env.VITE_STORE_BASE_URL || 'http://localhost:4321';

  // Aggregate revenue data for the chart (last 7 days of activity)
  const chartData = useMemo(() => {
    if (!orders.length) return [];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const dailyRevenue = orders.reduce((acc: any, order) => {
      const date = new Date(order.order_date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + (order.total_amount || 0);
      return acc;
    }, {});

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: dailyRevenue[date] || 0
    }));
  }, [orders]);

  const handleShare = () => {
    if (!activeStore?.store_url_slug) {
      toast.error('Store link not available yet');
      return;
    }
    const storeUrl = `${storeBaseUrl}/${activeStore.store_url_slug}`;
    navigator.clipboard.writeText(storeUrl);
    toast.success('Store link copied to clipboard!');
  };

  const handleViewStore = () => {
    if (!activeStore?.store_url_slug) {
      toast.error('Store storefront not available yet');
      return;
    }
    const storeUrl = `${storeBaseUrl}/${activeStore.store_url_slug}`;
    window.open(storeUrl, '_blank');
  };

  // Only show the full-page loader if we have NO data at all (first load)
  if (statsLoading || (ordersLoading && orders.length === 0)) {
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

  const { totalRevenue, fulfilledOrders, pendingOrders, totalProducts } = stats || {
    totalRevenue: 0,
    fulfilledOrders: 0,
    pendingOrders: 0,
    totalProducts: 0
  };

  // Get upcoming orders from the already fetched recent orders
  const upcomingOrders = orders
    .filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status))
    .sort((a, b) => new Date(a.order_date).getTime() - new Date(b.order_date).getTime());

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-dashed hover:border-primary hover:text-primary transition-all font-semibold flex items-center gap-2"
              onClick={() => navigate('/add-product')}
            >
              <Plus className="w-4 h-4" /> Add Product
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl font-semibold flex items-center gap-2"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" /> Share Store
            </Button>
            <Button
              size="sm"
              className="rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all px-6 flex items-center gap-2"
              onClick={handleViewStore}
            >
              <ExternalLink className="w-4 h-4" /> View Live Store
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {/* Revenue Chart */}
          <div className="lg:col-span-2 dashboard-card p-6 min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">Revenue Trend</h2>
                <p className="text-sm text-muted-foreground font-medium">Daily earnings over the last 7 days</p>
              </div>
              <Activity className="w-5 h-5 text-primary/40" />
            </div>

            <div className="flex-1 w-full min-h-[250px] mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats sidebar/Upcoming preview */}
          <div className="dashboard-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-foreground">Recent Orders</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-primary group/all"
                onClick={() => navigate('/orders')}
              >
                View All <ArrowRight className="w-3 h-3 ml-1 group-hover/all:translate-x-1 transition-transform" />
              </Button>
            </div>

            {upcomingOrders.length > 0 ? (
              <div className="space-y-4 flex-1 overflow-auto max-h-[400px] pr-2 scrollbar-thin">
                {upcomingOrders.slice(0, 4).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-border flex-shrink-0">
                      <img
                        src={(order as any).productImage}
                        alt=""
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{(order as any).productName}</p>
                      <p className="text-xs text-muted-foreground font-medium">Order #{order.order_number.slice(-4)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">₹{order.total_amount}</p>
                      <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block uppercase bg-warning/10 text-warning`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <p className="text-sm font-bold">No pending orders</p>
                <p className="text-xs text-muted-foreground px-4 mt-1">New orders will show up here as they arrive.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

import { useNavigate } from 'react-router-dom';
import { IndianRupee, Package, Clock, ShoppingBag, Loader2, ArrowRight, Activity, Share2, ExternalLink, Plus, AlertTriangle, ArrowUpRight } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { useOrders } from '@/hooks/useOrders';
import { useStats } from '@/hooks/useStats';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useStore } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();
  const { activeStore } = useStore();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: infiniteOrders, isLoading: ordersLoading } = useOrders();
  const { data: infiniteProducts, isLoading: productsLoading } = useProducts();

  // Flatten orders for display
  const orders = useMemo(() => {
    return infiniteOrders?.pages.flatMap(page => page.data) || [];
  }, [infiniteOrders]);

  // Flatten and filter critical products
  const criticalProducts = useMemo(() => {
    const products = infiniteProducts?.pages.flatMap(page => page.data) || [];
    return products.filter(p => {
      const stock = (p as any).stock_quantity;
      const minStock = (p as any).min_stock_level ?? 5;

      // Logic: Only show if stock tracking seems 'active' for this item
      // If stock is 0 and they haven't explicitly set a low stock limit yet (default 5),
      // it's likely just the default value for an un-initialized item.
      // We only show items that are actually 'Running Low' (stock > 0 and <= threshold)
      // OR explicitly 'Out of Stock' (stock === 0) if the user has opted into tracking.

      const isActuallyLow = typeof stock === 'number' && stock > 0 && stock <= minStock;
      const isOutOfStock = typeof stock === 'number' && stock === 0 && (p as any).is_in_stock === true;

      // To prevent clutter for new users who have ALL products at 0:
      // We only show items if stock > 0 (Running Low)
      return isActuallyLow;
    });
  }, [infiniteProducts]);

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
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <div className="absolute inset-0 w-12 h-12 bg-primary/20 blur-xl animate-pulse rounded-full" />
        </div>
        <p className="text-muted-foreground font-medium mt-6 tracking-wide">Initializing Dashboard...</p>
      </div>
    );
  }

  const { totalRevenue, fulfilledOrders, pendingOrders, totalProducts } = stats || {
    totalRevenue: 0,
    fulfilledOrders: 0,
    pendingOrders: 0,
    totalProducts: 0
  };

  // Get recent orders (all statuses) sorted newest first
  const recentOrders = orders
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 px-4 md:px-0">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider text-green-600">
                Live Data Link
              </span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-foreground mb-2 tracking-tight">
            Welcome back! 👋
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium max-w-lg leading-relaxed">
            Everything looks good today. You have <span className="text-primary font-bold">{pendingOrders}</span> orders requiring attention {criticalProducts.length > 0 && <>and <span className="text-amber-500 font-bold">{criticalProducts.length} items</span> low on stock.</>}
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-3 animate-slide-up p-1 -m-1 [animation-delay:0.1s]">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-dashed hover:border-primary hover:text-primary transition-all font-semibold flex items-center gap-2 h-10 px-4"
            onClick={() => navigate('/dashboard/add-product')}
          >
            <Plus className="w-4 h-4" /> Add Product
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl font-semibold flex items-center gap-2 h-10 px-4"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" /> Share Store
          </Button>
          <Button
            size="sm"
            className="rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all px-6 h-10 flex items-center gap-2 bg-primary text-primary-foreground"
            onClick={handleViewStore}
          >
            <ExternalLink className="w-4 h-4" /> View Store
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-slide-up [animation-delay:0.2s]">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up [animation-delay:0.3s]">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 dashboard-card p-6 min-h-[380px] lg:h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">Revenue Trend</h2>
              <p className="text-sm text-muted-foreground font-medium">Daily earnings (Last 7 days)</p>
            </div>
            <Activity className="w-5 h-5 text-primary/30" />
          </div>

          <div className="flex-1 w-full min-h-[220px] mt-auto relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>

                  {/* Glow filter for the line */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="hsl(var(--muted-foreground))"
                  opacity={0.1}
                />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                  dy={10}
                  padding={{ left: 10, right: 10 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                  tickFormatter={(value) => `₹${value}`}
                  width={45}
                  domain={[0, (dataMax: number) => Math.max(500, Math.ceil(dataMax / 100) * 100)]}
                  ticks={[0, 100, 200, 300, 400, 500]}
                />

                <Tooltip
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card/80 backdrop-blur-xl border border-primary/20 p-3 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                          <p className="text-sm font-display font-black text-primary">
                            ₹{Number(payload[0].value).toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Glow layer */}
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={6}
                  strokeOpacity={0.2}
                  fill="transparent"
                  filter="url(#glow)"
                  activeDot={false}
                  isAnimationActive={true}
                />

                {/* Main layer */}
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  activeDot={{
                    r: 6,
                    fill: 'hsl(var(--primary))',
                    stroke: 'white',
                    strokeWidth: 2,
                    className: "shadow-lg"
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Critical Stock Widget */}
          <div className="dashboard-card p-6 flex flex-col border-amber-200 bg-amber-50/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Critical Stock
              </h2>
              {criticalProducts.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {criticalProducts.length} ITEMS
                </span>
              )}
            </div>

            {criticalProducts.length > 0 ? (
              <div className="space-y-4">
                {criticalProducts.slice(0, 3).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-amber-100 hover:border-amber-300 transition-all cursor-pointer group"
                    onClick={() => navigate('/dashboard/products')}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate tracking-tight">{product.name}</p>
                      <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest mt-0.5">
                        {(product as any).stock_quantity ?? 0} Units Remaining
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-amber-500 transition-colors" />
                  </div>
                ))}
                {criticalProducts.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-100/50"
                    onClick={() => navigate('/dashboard/products')}
                  >
                    View all shortages
                  </Button>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-emerald-700 tracking-tight">Inventory Healthy</p>
                <p className="text-[10px] text-muted-foreground mt-1 px-4 leading-normal">All products are above their replenishment threshold.</p>
              </div>
            )}
          </div>

          <div className="dashboard-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-foreground">Recent Orders</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-primary group/all"
                onClick={() => navigate('/dashboard/orders')}
              >
                View All <ArrowRight className="w-3 h-3 ml-1 group-hover/all:translate-x-1 transition-transform" />
              </Button>
            </div>

            {recentOrders.length > 0 ? (
              <div className="space-y-4 flex-1">
                {recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => {
                      if (order.id) {
                        navigate(`/dashboard/orders/${order.id}`);
                      } else {
                        toast.error("Order ID missing");
                      }
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-border flex-shrink-0 bg-muted">
                      <img
                        src={order.productImage}
                        alt=""
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate tracking-tight">{order.productName}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest font-mono">#{order.order_number.slice(-6)}</p>
                        <span className="text-[10px] text-muted-foreground/30">•</span>
                        <p className="text-[10px] text-muted-foreground font-medium">{order.customer_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tracking-tighter">₹{order.total_amount}</p>
                      <div className={cn(
                        "text-[9px] font-black px-1.5 py-0.5 rounded-md inline-block uppercase tracking-tight mt-0.5",
                        order.status === 'delivered' ? 'bg-slate-100 text-slate-500' :
                          order.status === 'ready' ? 'bg-green-100 text-green-700' :
                            'bg-warning/10 text-warning'
                      )}>
                        {order.status === 'pending' ? 'NEW' : order.status}
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
                <p className="text-sm font-bold tracking-tight">No orders yet</p>
                <p className="text-xs text-muted-foreground px-4 mt-1 leading-normal">Your recent sales activity will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { useNavigate, Link } from 'react-router-dom';
import { IndianRupee, Package, Clock, ShoppingBag, Loader2, ArrowRight, Activity, Share2, ExternalLink, Plus, AlertTriangle, ArrowUpRight } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { useOrders } from '@/hooks/useOrders';
import { useStats } from '@/hooks/useStats';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useStore } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';
import { Product } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { config } from '@/lib/config';


interface Order {
  id: string;
  order_date: string;
  total_amount: number;
  productName: string;
  productImage: string;
  order_number: string;
  customer_name: string;
  status: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { activeStore } = useStore();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Store Owner';
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: infiniteOrders, isLoading: ordersLoading } = useOrders();
  const { data: infiniteProducts, isLoading: productsLoading } = useProducts();

  // Flatten orders for display
  const orders = useMemo(() => {
    return (infiniteOrders?.pages.flatMap(page => page.data) || []) as Order[];
  }, [infiniteOrders]);

  // Flatten and filter critical products
  const criticalProducts = useMemo(() => {
    const products = infiniteProducts?.pages.flatMap(page => page.data) || [];
    return (products as Product[]).filter(p => {
      const stock = p.stock_quantity;
      const minStock = p.min_stock_level ?? 5;

      // Logic: Only show if stock tracking seems 'active' for this item
      // If stock is 0 and they haven't explicitly set a low stock limit yet (default 5),
      // it's likely just the default value for an un-initialized item.
      // We only show items that are actually 'Running Low' (stock > 0 and <= threshold)
      // OR explicitly 'Out of Stock' (stock === 0) if the user has opted into tracking.

      const isActuallyLow = typeof stock === 'number' && stock > 0 && stock <= minStock;
      const isOutOfStock = typeof stock === 'number' && stock === 0 && p.is_in_stock === true;

      // To prevent clutter for new users who have ALL products at 0:
      // We only show items if stock > 0 (Running Low)
      return isActuallyLow;
    }) as Product[];
  }, [infiniteProducts]);

  const storeBaseUrl = config.store.baseUrl;

  // Aggregate revenue data for the chart (last 7 days of activity)
  const { chartData, revenueTrend } = useMemo(() => {
    if (!orders.length) return { chartData: [], revenueTrend: null };

    const todayStr = new Date().toISOString().split('T')[0];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const prev7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (i + 7));
      return d.toISOString().split('T')[0];
    });

    const dailyRevenue = orders.reduce((acc: any, order) => {
      const date = new Date(order.order_date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + (order.total_amount || 0);
      return acc;
    }, {});

    const currentRevenue = last7Days.reduce((sum, date) => sum + (dailyRevenue[date] || 0), 0);
    const previousRevenue = prev7Days.reduce((sum, date) => sum + (dailyRevenue[date] || 0), 0);

    let trend = null;
    if (previousRevenue > 0) {
      trend = Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100);
    } else if (currentRevenue > 0) {
      trend = 100;
    }

    const data = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      revenue: dailyRevenue[date] || 0,
      isToday: date === todayStr
    }));

    return { chartData: data, revenueTrend: trend };
  }, [orders]);

  // Compute Top Selling Products
  const topSellingProducts = useMemo(() => {
    const productsMap = new Map();
    orders.forEach(order => {
      const name = order.productName;
      if (!name) return;
      const current = productsMap.get(name) || {
        name,
        image: order.productImage,
        count: 0,
        revenue: 0
      };
      current.count += 1;
      current.revenue += order.total_amount || 0;
      productsMap.set(name, current);
    });
    return Array.from(productsMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [orders]);

  // Compute Average Order Value
  const avgOrderValue = useMemo(() => {
    if (orders.length === 0) return 0;
    const total = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    return Math.round(total / orders.length);
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
          <h1 className="text-3xl md:text-5xl font-display font-black text-foreground mb-2 tracking-tight">
            <span className="text-gradient">{getGreeting()}, {displayName}</span> 👋
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium max-w-lg leading-relaxed">
            Everything looks good today. You have <span className="text-primary font-bold">{pendingOrders}</span> orders requiring attention {criticalProducts.length > 0 && <>and <span className="text-amber-500 font-bold">{criticalProducts.length} items</span> low on stock.</>}
          </p>
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

      {/* Recent Orders Section (Moved above chart) */}
      <div className="animate-slide-up [animation-delay:0.3s]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-black text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Recent Orders
          </h2>
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
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:-mx-0 md:px-0">
            {recentOrders.slice(0, 6).map((order) => (
              <div
                key={order.id}
                className="flex-shrink-0 w-[320px] md:w-[400px] snap-start dashboard-card p-6 hover:border-primary/30 transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-2 duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]"
                onClick={() => order.id && navigate(`/dashboard/orders/${order.id}`)}
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border border-border/50 flex-shrink-0 bg-muted shadow-inner relative group-hover:border-primary/20 transition-colors">
                    <img
                      src={order.productImage}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] font-mono truncate mr-2 opacity-60">
                        #{order.order_number.slice(-8)}
                      </p>
                      <div className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                        order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' :
                          order.status === 'ready' ? 'bg-primary/10 text-primary border border-primary/10' :
                            'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                      )}>
                        {order.status === 'pending' ? 'NEW' : order.status}
                      </div>
                    </div>
                    <p className="text-base font-display font-black truncate tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {order.productName}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground font-bold truncate max-w-[150px]">{order.customer_name}</p>
                      <p className="text-lg font-display font-black tracking-tighter text-foreground">
                        ₹{order.total_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* View All Card */}
            {recentOrders.length > 6 && (
              <div
                className="flex-shrink-0 w-[200px] snap-start dashboard-card p-6 flex flex-col items-center justify-center gap-4 border-dashed hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => navigate('/dashboard/orders')}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-primary">View All Orders</p>
              </div>
            )}
          </div>
        ) : (
          <div className="dashboard-card py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-bold tracking-tight">No orders yet</p>
            <p className="text-xs text-muted-foreground px-4 mt-1 leading-normal">Your recent sales activity will appear here.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up [animation-delay:0.4s]">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 dashboard-card p-6 min-h-[420px] flex flex-col group/chart">
          <div className="flex items-center justify-between mb-8">
            <div>
              {revenueTrend !== null && (
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2",
                  revenueTrend >= 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                )}>
                  {revenueTrend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowRight className="w-3 h-3 rotate-45" />}
                  {Math.abs(revenueTrend)}% vs last 7 days
                </div>
              )}
              <h2 className="text-xl font-display font-black text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Revenue Trend
              </h2>
              <p className="text-sm text-muted-foreground font-medium">Daily earnings (Last 7 days)</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Sales Revenue
            </div>
          </div>

          <div className="flex-1 w-full min-h-[250px] mt-auto relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>

                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.08} />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={(props: { x: number; y: number; payload: { value: string }; index: number }) => {
                    const { x, y, payload } = props;
                    const item = chartData[props.index];
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={16}
                          textAnchor="middle"
                          fill="hsl(var(--muted-foreground))"
                          fontSize={10}
                          fontWeight={600}
                        >
                          {payload.value}
                        </text>
                        {item?.isToday && (
                          <text
                            x={0}
                            y={0}
                            dy={30}
                            textAnchor="middle"
                            fill="hsl(var(--primary))"
                            fontSize={9}
                            fontWeight={900}
                            className="uppercase tracking-widest"
                          >
                            • Today
                          </text>
                        )}
                      </g>
                    );
                  }}
                  height={45}
                  padding={{ left: 15, right: 15 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                  tickFormatter={(value) => `₹${value}`}
                  width={45}
                  domain={[0, (dataMax: number) => Math.max(500, Math.ceil(dataMax * 1.2 / 100) * 100)]}
                />

                <Tooltip
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '6 6', opacity: 0.3 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background/95 backdrop-blur-md border border-primary/10 p-4 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {data.fullDate}
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                            <div>
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter leading-none">Net Revenue</p>
                              <p className="text-xl font-display font-black text-foreground">
                                ₹{Number(payload[0].value).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Visual Line */}
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  filter="url(#glow)"
                  dot={{ r: 3, fill: 'hsl(var(--primary))', fillOpacity: 0.2, strokeWidth: 0 }}
                  activeDot={{
                    r: 8,
                    fill: 'hsl(var(--primary))',
                    stroke: 'white',
                    strokeWidth: 3,
                    className: "shadow-2xl brightness-125"
                  }}
                  isAnimationActive={true}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Critical Stock Widget (Top Priority) */}
          <div className="dashboard-card p-6 flex flex-col border-amber-200/50 bg-amber-50/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-black text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Low Stock
              </h2>
              {criticalProducts.length > 0 && (
                <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  {criticalProducts.length}
                </span>
              )}
            </div>
            {criticalProducts.length > 0 ? (
              <div className="space-y-3">
                {criticalProducts.slice(0, 2).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl bg-card border border-amber-500/10 group hover:border-amber-500/30 transition-all cursor-pointer" onClick={() => navigate('/dashboard/products')}>
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold truncate">{p.name}</p>
                      <p className="text-[9px] text-amber-600 font-black uppercase tracking-widest">
                        {p.stock_quantity} Left
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground font-medium italic">Everything in stock!</p>
            )}
          </div>

          {/* Top Selling Products Widget */}
          <div className="dashboard-card p-6 flex flex-col bg-primary/[0.02]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display font-black text-foreground flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-primary" />
                Top Selling
              </h2>
            </div>

            {topSellingProducts.length > 0 ? (
              <div className="space-y-4">
                {topSellingProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted border border-border/50 shrink-0">
                      <img src={p.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                        {p.count} Sales • ₹{p.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-primary/5 flex items-center justify-center text-[10px] font-black text-primary">
                      #{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-4">Not enough data yet</p>
            )}
          </div>

          {/* Quick Insights Widget */}
          <div className="dashboard-card p-6 flex flex-col">
            <h2 className="text-lg font-display font-black text-foreground mb-5 uppercase tracking-tighter">Insights</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">Avg. Order Value</span>
                </div>
                <span className="text-sm font-black text-foreground">₹{avgOrderValue.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">Order Velocity</span>
                </div>
                <span className="text-sm font-black text-foreground">{(orders.length / 7).toFixed(1)}/day</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

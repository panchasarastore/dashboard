import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag,
    Search,
    Loader2,
    ArrowLeft,
    Filter,
    SlidersHorizontal,
    Download,
    CheckCircle2,
    TrendingUp,
    Clock,
    Package,
    Calendar as CalendarIcon,
    X
} from 'lucide-react';
import OrderRow from '@/components/dashboard/OrderRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOrders } from '@/hooks/useOrders';
import { useStats } from '@/hooks/useStats';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

const STATUS_TABS = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'New' },
    { id: 'active', label: 'Active', statuses: ['confirmed', 'preparing', 'ready'] },
    { id: 'completed', label: 'Completed' },
];

const ManageOrders = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [isExporting, setIsExporting] = useState(false);

    const {
        data: infiniteData,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useOrders(debouncedSearch, activeTab);

    const { data: stats } = useStats();

    const orders = useMemo(() => {
        let allOrders = infiniteData?.pages.flatMap(page => page.data) || [];

        // Frontend filtering for search and date range
        let filtered = allOrders.filter(order => {
            const matchesQuery = order.customer_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                order.order_number.toLowerCase().includes(debouncedSearch.toLowerCase());

            const dateMatch = !dateRange || (
                (!dateRange.start || new Date(order.order_date) >= new Date(dateRange.start)) &&
                (!dateRange.end || new Date(order.order_date) <= new Date(dateRange.end + 'T23:59:59'))
            );

            return matchesQuery && dateMatch;
        });

        // Filter by tab
        if (activeTab === 'active') {
            return filtered.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status as string));
        }
        if (activeTab !== 'all') {
            return filtered.filter(o => o.status === activeTab);
        }

        return filtered;
    }, [infiniteData, activeTab, debouncedSearch, dateRange]);

    const totalCount = infiniteData?.pages[0]?.totalCount || 0;

    const handleExport = () => {
        setIsExporting(true);
        try {
            const headers = ['Order #', 'Customer', 'Product', 'Qty', 'Amount', 'Status', 'Date', 'Payment', 'Delivery'];
            const csvContent = [
                headers.join(','),
                ...orders.map(o => [
                    o.order_number,
                    `"${o.customer_name}"`,
                    `"${(o as any).productName}"`,
                    (o as any).totalQuantity,
                    o.total_amount,
                    o.status,
                    o.order_date,
                    o.payment_method,
                    o.delivery_method
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `orders_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-8 px-4 md:px-0">
            {/* Header & Stats Strip */}
            <div className="animate-slide-up">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/dashboard')}
                            className="mb-4 -ml-2 text-muted-foreground hover:text-primary transition-colors h-8 px-2 font-bold"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Dashboard
                        </Button>
                        <h1 className="text-3xl md:text-5xl font-display font-black text-foreground mb-1 tracking-tight">
                            Manage Orders
                        </h1>
                        <p className="text-muted-foreground font-medium flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            {totalCount} total orders recorded • Real-time tracking
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-card/50 backdrop-blur-sm border rounded-2xl overflow-x-auto no-scrollbar max-w-full">
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black transition-all duration-300 uppercase tracking-tighter whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-card border rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ShoppingBag className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">Revenue</span>
                        </div>
                        <p className="text-2xl font-black text-foreground">₹{stats?.totalRevenue.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-card border rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Clock className="w-5 h-5 text-orange-500" />
                            </div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">Pending</span>
                        </div>
                        <p className="text-2xl font-black text-foreground">{stats?.pendingOrders || '0'}</p>
                    </div>
                    <div className="bg-card border rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">Fulfilled</span>
                        </div>
                        <p className="text-2xl font-black text-foreground">{stats?.fulfilledOrders || '0'}</p>
                    </div>
                    <div className="bg-card border rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Package className="w-5 h-5 text-blue-500" />
                            </div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">Items</span>
                        </div>
                        <p className="text-2xl font-black text-foreground">{stats?.totalProducts || '0'}</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-card/30 backdrop-blur-md p-4 rounded-[1.5rem] border animate-fade-in delay-100">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                    <Input
                        placeholder="Search by customer name, order #..."
                        className="pl-11 rounded-2xl h-12 border-muted-foreground/10 focus-visible:ring-primary/20 transition-all font-medium text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Date Range Picker */}
                    <div className="hidden lg:flex items-center bg-card border rounded-2xl h-12 px-4 gap-3 text-sm">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <input
                            type="date"
                            title="Start Date"
                            aria-label="Start Date"
                            className="bg-transparent font-bold outline-none cursor-pointer text-xs"
                            onChange={(e) => setDateRange(prev => ({ start: e.target.value, end: prev?.end || '' }))}
                        />
                        <span className="text-muted-foreground font-black text-[10px] uppercase">to</span>
                        <input
                            type="date"
                            title="End Date"
                            aria-label="End Date"
                            className="bg-transparent font-bold outline-none cursor-pointer text-xs"
                            onChange={(e) => setDateRange(prev => ({ start: prev?.start || '', end: e.target.value }))}
                        />
                        {dateRange && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDateRange(null)}
                                className="h-6 w-6 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        )}
                    </div>

                    <Button variant="outline" className="rounded-2xl h-12 flex-1 md:flex-none font-bold gap-2 px-6 hover:bg-primary/5 hover:text-primary transition-all">
                        <Filter className="w-4 h-4" />
                        Status
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={isExporting}
                        className="rounded-2xl h-12 flex-1 md:flex-none font-black gap-2 px-6 bg-foreground text-background hover:bg-foreground/90 hover:scale-105 active:scale-95 transition-all"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Export
                    </Button>
                </div>
            </div>

            {/* Mobile Date Filter Summary */}
            {dateRange && (
                <div className="lg:hidden flex items-center justify-between bg-primary/5 border border-primary/10 p-4 rounded-2xl animate-fade-in">
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-primary italic">
                            {dateRange.start || 'Start'} — {dateRange.end || 'End'}
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setDateRange(null)} className="h-8 px-3 text-[10px] font-black uppercase text-primary">Clear Filter</Button>
                </div>
            )}

            {/* Order List */}
            <div className="space-y-4 animate-fade-in delay-200">
                {isLoading && !infiniteData ? (
                    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
                        <div className="relative">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full"></div>
                        </div>
                        <p className="text-muted-foreground font-medium italic">Scanning for orders...</p>
                    </div>
                ) : error ? (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-[2rem] p-12 text-center max-w-2xl mx-auto shadow-sm">
                        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Filter className="w-8 h-8 text-destructive" />
                        </div>
                        <p className="text-destructive font-bold text-lg mb-1">Error loading orders</p>
                        <p className="text-sm text-muted-foreground font-medium italic">{(error as any).message || 'Something went wrong while fetching data'}</p>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {orders.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-1">
                                    {orders.map((order) => (
                                        <OrderRow
                                            key={order.id}
                                            order={order as any}
                                            onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                                        />
                                    ))}
                                </div>

                                {hasNextPage && (
                                    <div className="mt-12 flex justify-center">
                                        <Button
                                            onClick={() => fetchNextPage()}
                                            disabled={isFetchingNextPage}
                                            variant="outline"
                                            className="rounded-2xl h-12 px-12 border-2 hover:bg-primary/5 hover:text-primary transition-all font-bold"
                                        >
                                            {isFetchingNextPage ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <ShoppingBag className="w-4 h-4 mr-2" />
                                            )}
                                            {isFetchingNextPage ? 'Loading...' : 'Load More Orders'}
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-card rounded-[3rem] border border-dashed border-border p-24 text-center shadow-sm">
                                <div className="w-24 h-24 rounded-[2rem] bg-muted/40 flex items-center justify-center mx-auto mb-8 animate-pulse">
                                    <ShoppingBag className="w-12 h-12 text-muted-foreground/40" />
                                </div>
                                <h3 className="text-2xl font-display font-black text-foreground mb-3">
                                    {searchQuery ? 'No matching orders found' : 'No orders in this category'}
                                </h3>
                                <p className="text-muted-foreground max-w-md mx-auto font-medium text-lg leading-relaxed">
                                    {searchQuery
                                        ? `We couldn't find any orders matching "${searchQuery}". Try a different spelling or order number.`
                                        : 'When customers start placing orders, they will appear here filtered by status.'}
                                </p>
                                {searchQuery && (
                                    <Button
                                        variant="link"
                                        onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                                        className="mt-6 text-primary font-bold text-lg underline-offset-8"
                                    >
                                        Clear all filters
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageOrders;

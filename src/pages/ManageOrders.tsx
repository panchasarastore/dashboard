import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Loader2, ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OrderRow from '@/components/dashboard/OrderRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOrders } from '@/hooks/useOrders';
import { useDebounce } from '@/hooks/useDebounce'; // Assuming this exists, if not I will implement it

const ManageOrders = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    const {
        data: infiniteData,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useOrders(debouncedSearch);

    const orders = useMemo(() => {
        return infiniteData?.pages.flatMap(page => page.data) || [];
    }, [infiniteData]);

    const totalCount = infiniteData?.pages[0]?.totalCount || 0;

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="mb-4 -ml-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-display font-black text-foreground mb-2">
                                Manage Orders
                            </h1>
                            <p className="text-muted-foreground font-medium">
                                {totalCount} total orders recorded
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-8 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                    <Input
                        placeholder="Search by customer or order #..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 rounded-2xl border-border bg-card shadow-sm focus:ring-primary/20"
                    />
                </div>

                {isLoading && !infiniteData ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground font-medium">Loading your orders...</p>
                    </div>
                ) : error ? (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-3xl p-12 text-center">
                        <p className="text-destructive font-bold mb-2">Error loading orders</p>
                        <p className="text-sm text-muted-foreground font-medium">{(error as any).message || 'Something went wrong'}</p>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {orders.length > 0 ? (
                            <>
                                <div className="space-y-1">
                                    {orders.map((order) => (
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
                                </div>

                                {hasNextPage && (
                                    <div className="mt-8 flex justify-center">
                                        <Button
                                            onClick={() => fetchNextPage()}
                                            disabled={isFetchingNextPage}
                                            variant="outline"
                                            className="rounded-xl px-12"
                                        >
                                            {isFetchingNextPage ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : null}
                                            Load More Orders
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-card rounded-[2.5rem] border border-dashed border-border p-20 text-center">
                                <div className="w-20 h-20 rounded-3xl bg-muted/30 flex items-center justify-center mx-auto mb-6">
                                    <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                                <h3 className="text-xl font-display font-bold text-foreground">
                                    {searchQuery ? 'No matching orders' : 'No orders yet'}
                                </h3>
                                <p className="text-muted-foreground mt-2 max-w-xs mx-auto font-medium">
                                    {searchQuery
                                        ? 'Try adjusting your search filters'
                                        : 'Customer orders will appear here as soon as they are placed.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ManageOrders;

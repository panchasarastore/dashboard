import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Loader2, ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OrderRow from '@/components/dashboard/OrderRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOrders } from '@/hooks/useOrders';

const ManageOrders = () => {
    const navigate = useNavigate();
    const { data: orders, isLoading, error } = useOrders();
    const [searchQuery, setSearchQuery] = useState('');

    const displayOrders = orders || [];

    const filteredOrders = displayOrders.filter(order =>
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                                {displayOrders.length} total orders recorded
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

                {isLoading && !orders ? (
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
                        {filteredOrders.length > 0 ? (
                            <div className="space-y-1">
                                {filteredOrders.map((order) => (
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

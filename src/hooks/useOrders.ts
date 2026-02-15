import { useEffect } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/contexts/StoreContext';

export interface Order {
    id: string;
    store_id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    delivery_method: string;
    delivery_address?: string;
    delivery_pincode?: string;
    delivery_landmark?: string;
    delivery_notes?: string;
    delivery_lat?: number;
    delivery_lng?: number;
    subtotal: number;
    total_amount: number;
    currency: string;
    payment_status: string;
    payment_method: string;
    order_date: string;
    time_slot: string;
    customer_notes?: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
    created_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    item_total: number;
    variant_snapshot?: any;
    custom_note?: string;
    products?: {
        images: string[];
    };
}

export const useOrders = (searchQuery: string = '') => {
    const { activeStore } = useStore();
    const queryClient = useQueryClient();
    const PAGE_SIZE = 20;

    // Set up real-time subscription
    useEffect(() => {
        if (!activeStore?.id) return;

        console.log(`[Realtime] 📡 Initializing subscription for store: ${activeStore.id}`);

        const channel = supabase
            .channel(`orders-live-${activeStore.id.slice(0, 8)}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `store_id=eq.${activeStore.id}`,
                },
                (payload) => {
                    console.log('[Realtime] 🔔 Change detected!', {
                        type: payload.eventType,
                        new: payload.new,
                        old: payload.old
                    });

                    // Invalidate projects and orders
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log('[Realtime] ✅ Successfully subscribed to orders');
                } else {
                    console.error(`[Realtime] ❌ Subscription status: ${status}`, err);
                }
            });

        return () => {
            console.log('[Realtime] 🔌 Cleaning up subscription');
            supabase.removeChannel(channel);
        };
    }, [activeStore?.id, queryClient]);

    return useInfiniteQuery({
        queryKey: ['orders', activeStore?.id, searchQuery],
        queryFn: async ({ pageParam = 0 }) => {
            if (!activeStore) return { data: [], nextCursor: null };

            let query = supabase
                .from('orders')
                .select('*, items:order_items(*, products(images))', { count: 'exact' })
                .eq('store_id', activeStore.id)
                .order('created_at', { ascending: false })
                .range(pageParam, pageParam + PAGE_SIZE - 1);

            if (searchQuery) {
                // Search in customer_name or order_number
                query = query.or(`customer_name.ilike.%${searchQuery}%,order_number.ilike.%${searchQuery}%`);
            }

            const { data, error, count } = await query;

            if (error) throw error;

            const mappedData = (data as any[]).map(order => {
                const items = order.items || [];
                const firstItem = items[0];
                const firstProduct = firstItem?.products;
                const images = firstProduct?.images || [];
                const firstImage = Array.isArray(images) && images.length > 0 ? images[0] : null;

                return {
                    ...order,
                    status: (order as any).order_status,
                    order_date: (order as any).created_at,
                    productName: firstItem?.product_name || `Order #${order.order_number.slice(-4)}`,
                    productImage: firstImage || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', // Fallback
                };
            });

            const nextCursor = (count && pageParam + PAGE_SIZE < count) ? pageParam + PAGE_SIZE : null;

            return {
                data: mappedData as (Order & { productName: string, productImage: string })[],
                nextCursor,
                totalCount: count
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!activeStore,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    });
};

export const useOrder = (orderId: string | undefined) => {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            if (!orderId) return null;

            const { data, error } = await supabase
                .from('orders')
                .select('*, items:order_items(*, products(images))')
                .eq('id', orderId)
                .single();

            if (error) throw error;

            return {
                ...data,
                status: data.order_status,
                order_date: data.created_at,
                order_items: (data.items || []).map((item: any) => ({
                    ...item,
                    product_image: item.products?.images?.[0] || null
                }))
            } as any;
        },
        enabled: !!orderId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    });
};

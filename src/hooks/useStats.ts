import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/contexts/StoreContext';

export interface StoreStats {
    totalRevenue: number;
    pendingOrders: number;
    fulfilledOrders: number;
    totalProducts: number;
}

export const useStats = () => {
    const { activeStore } = useStore();
    const queryClient = useQueryClient();

    // Set up real-time subscription for stats auto-refresh
    useEffect(() => {
        if (!activeStore?.id) return;

        console.log(`[Stats Realtime] 📡 Subscribing to changes for store: ${activeStore.id}`);

        // Subscribe to both orders and products for a full stats update
        const ordersChannel = supabase
            .channel(`stats-orders-${activeStore.id.slice(0, 8)}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `store_id=eq.${activeStore.id}`,
                },
                () => {
                    console.log('[Stats Realtime] 🔔 Order change detected, refreshing stats...');
                    queryClient.invalidateQueries({ queryKey: ['store-stats', activeStore.id] });
                }
            )
            .subscribe();

        const productsChannel = supabase
            .channel(`stats-products-${activeStore.id.slice(0, 8)}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'products',
                    filter: `store_id=eq.${activeStore.id}`,
                },
                () => {
                    console.log('[Stats Realtime] 🔔 Product change detected, refreshing stats...');
                    queryClient.invalidateQueries({ queryKey: ['store-stats', activeStore.id] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(productsChannel);
        };
    }, [activeStore?.id, queryClient]);

    return useQuery({
        queryKey: ['store-stats', activeStore?.id],
        queryFn: async (): Promise<StoreStats> => {
            if (!activeStore) throw new Error('No active store');

            console.log('[useStats] Fetching for store:', activeStore.id);

            // 1. Pending Orders Count (Note: using order_status column)
            // Enum values: 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
            const { count: pendingCount, error: pendingError } = await supabase
                .from('orders')
                .select('*', { count: 'exact' })
                .eq('store_id', activeStore.id)
                .in('order_status', ['pending', 'confirmed', 'preparing', 'ready']);

            if (pendingError) throw pendingError;

            // 2. Fulfilled Orders Count
            const { count: fulfilledCount, error: fulfilledError } = await supabase
                .from('orders')
                .select('*', { count: 'exact' })
                .eq('store_id', activeStore.id)
                .eq('order_status', 'completed');

            if (fulfilledError) throw fulfilledError;

            // 3. Total Products Count
            const { count: productsCount, error: productsError } = await supabase
                .from('products')
                .select('*', { count: 'exact' })
                .eq('store_id', activeStore.id);

            if (productsError) throw productsError;

            // 4. Total Revenue
            const { data: revenueData, error: revenueError } = await supabase
                .from('orders')
                .select('total_amount')
                .eq('store_id', activeStore.id);

            if (revenueError) throw revenueError;

            const totalRevenue = (revenueData || []).reduce((sum, order) => sum + (order.total_amount || 0), 0);

            console.log('[useStats] Results:', {
                totalRevenue,
                pendingOrders: pendingCount,
                fulfilledOrders: fulfilledCount,
                totalProducts: productsCount
            });

            return {
                totalRevenue,
                pendingOrders: pendingCount || 0,
                fulfilledOrders: fulfilledCount || 0,
                totalProducts: productsCount || 0,
            };
        },
        enabled: !!activeStore?.id,
    });
};

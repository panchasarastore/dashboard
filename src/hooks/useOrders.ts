import { useQuery } from '@tanstack/react-query';
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

export const useOrders = () => {
    const { activeStore } = useStore();

    return useQuery({
        queryKey: ['orders', activeStore?.id],
        queryFn: async () => {
            if (!activeStore) return [];

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('store_id', activeStore.id)
                .order('order_date', { ascending: false });

            if (error) throw error;
            return data as Order[];
        },
        enabled: !!activeStore,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        gcTime: 1000 * 60 * 30, // Keep in memory for 30 minutes
    });
};

export const useOrder = (orderId: string | undefined) => {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            if (!orderId) return null;

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (error) throw error;
            return data as Order;
        },
        enabled: !!orderId,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        gcTime: 1000 * 60 * 30, // Keep in memory for 30 minutes
    });
};

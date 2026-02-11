import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/contexts/StoreContext';

export const useProducts = () => {
    const { activeStore } = useStore();

    return useQuery({
        queryKey: ['products', activeStore?.id],
        queryFn: async () => {
            if (!activeStore) return [];

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('store_id', activeStore.id);

            if (error) throw error;
            return data;
        },
        enabled: !!activeStore,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        gcTime: 1000 * 60 * 30, // Keep in memory for 30 minutes
    });
};

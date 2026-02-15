import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/contexts/StoreContext';

export const useProducts = (searchQuery: string = '') => {
    const { activeStore } = useStore();
    const PAGE_SIZE = 12;

    return useInfiniteQuery({
        queryKey: ['products', activeStore?.id, searchQuery],
        queryFn: async ({ pageParam = 0 }) => {
            if (!activeStore) return { data: [], nextCursor: null };

            let query = supabase
                .from('products')
                .select('*', { count: 'exact' })
                .eq('store_id', activeStore.id)
                .order('created_at', { ascending: false })
                .range(pageParam, pageParam + PAGE_SIZE - 1);

            if (searchQuery) {
                query = query.ilike('name', `%${searchQuery}%`);
            }

            const { data, error, count } = await query;

            if (error) throw error;

            const nextCursor = (count && pageParam + PAGE_SIZE < count) ? pageParam + PAGE_SIZE : null;

            return {
                data: data || [],
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

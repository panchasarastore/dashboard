import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface Store {
    id: string;
    store_name: string;
    store_tagline?: string;
    store_url_slug: string;
    owner_id: string;
    status: string;
    logo_url?: string;
}

interface StoreContextType {
    stores: Store[];
    activeStore: Store | null;
    loading: boolean;
    setActiveStore: (store: Store) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [stores, setStores] = useState<Store[]>([]);
    const [activeStore, setActiveStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStores = async () => {
            if (!user) {
                setStores([]);
                setActiveStore(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from('stores')
                .select('*')
                .eq('owner_id', user.id);

            if (!error && data) {
                setStores(data);
                if (data.length > 0) {
                    // Default to the first store, or could load from localStorage
                    setActiveStore(data[0]);
                }
            }
            setLoading(false);
        };

        fetchStores();
    }, [user]);

    return (
        <StoreContext.Provider value={{ stores, activeStore, loading, setActiveStore }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};

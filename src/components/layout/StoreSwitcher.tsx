import React from 'react';
import { useStore } from '@/contexts/StoreContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Store, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const StoreSwitcher = () => {
    const { stores, activeStore, setActiveStore, loading } = useStore();

    if (loading || stores.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-between bg-card border-border hover:bg-accent/50">
                    <div className="flex items-center gap-2 truncate">
                        <Store className="w-4 h-4 text-primary" />
                        <span className="truncate">{activeStore?.store_name || 'Select Store'}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 opacity-50 ml-2" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[240px]">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">My Stores</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {stores.map((store) => (
                    <DropdownMenuItem
                        key={store.id}
                        onClick={() => setActiveStore(store)}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <div className="flex flex-col">
                            <span className="font-medium">{store.store_name}</span>
                            <span className="text-xs text-muted-foreground">/{store.store_url_slug}</span>
                        </div>
                        {activeStore?.id === store.id && <Check className="w-4 h-4 text-primary" />}
                    </DropdownMenuItem>
                ))}
                {stores.length === 0 && (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground italic">
                        No stores found
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default StoreSwitcher;

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts, Product } from '@/hooks/useProducts';
import { useStore } from '@/contexts/StoreContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ManageProducts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeStore } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    data: infiniteData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useProducts(debouncedSearch, selectedCategory === 'All' ? '' : selectedCategory);

  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const displayProducts = useMemo(() => {
    let products = infiniteData?.pages.flatMap(page => page.data) || [];
    if (showLowStockOnly) {
      products = products.filter(p => {
        const stock = (p as any).stock_quantity ?? 0;
        const minStock = (p as any).min_stock_level ?? 5;
        return p.is_in_stock && stock <= minStock;
      });
    }
    return products;
  }, [infiniteData, showLowStockOnly]);

  const categories = useMemo(() => {
    const allProducts = infiniteData?.pages.flatMap(page => page.data) || [];
    if (!allProducts.length) return ['All'];
    const unique = Array.from(new Set(allProducts.map(p => (p as any).category).filter(Boolean)));
    return ['All', ...unique as string[]];
  }, [infiniteData]);

  const totalCount = infiniteData?.pages[0]?.totalCount || 0;

  const handleEdit = (product: Product) => {
    navigate(`/dashboard/edit-product/${product.id}`);
  };

  const handleDelete = async (productId: string) => {
    if (!activeStore) return;

    setIsProcessing(productId);
    try {
      const { error } = await supabase.functions.invoke('delete-product', {
        body: {
          productId: productId,
          storeId: activeStore.id
        },
      });

      if (error) throw error;

      toast.success('Product and its images deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setIsProcessing(null);
      setDeleteProductId(null);
    }
  };

  const handleToggleStock = async (productId: string) => {
    const product = displayProducts.find(p => p.id === productId);
    if (!product) return;

    setIsProcessing(productId);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_in_stock: !product.is_in_stock } as any)
        .eq('id', productId);

      if (error) throw error;

      toast.success(`${product.name} marked as ${!product.is_in_stock ? 'in stock' : 'out of stock'}`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update stock status');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUpdateStock = async (productId: string, newQuantity: number) => {
    // Optimistic Update
    queryClient.setQueriesData({ queryKey: ['products'] }, (old: any) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          data: page.data.map((p: any) =>
            p.id === productId ? { ...p, stock_quantity: newQuantity } : p
          )
        }))
      };
    });

    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newQuantity } as any)
        .eq('id', productId);

      if (error) throw error;
      // No toast for quick updates to avoid noise, unless it fails
    } catch (err: any) {
      toast.error(err.message || 'Failed to update inventory');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground mb-2 flex items-center gap-3">
            Inventory Registry
            {showLowStockOnly && <Badge className="bg-amber-500 text-white border-0">Filtered: Low Stock</Badge>}
          </h1>
          <p className="text-muted-foreground font-medium">
            {totalCount} products tracked in <span className="text-primary font-bold">{activeStore?.name}</span>
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/add-product')} className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Register Product
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-6 mb-10">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 rounded-2xl border-2 focus:ring-0 focus:border-primary transition-all bg-card"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={showLowStockOnly ? 'default' : 'outline'}
            size="lg"
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={cn(
              "rounded-2xl h-14 px-6 font-black text-xs uppercase tracking-widest border-2 transition-all",
              showLowStockOnly ? "bg-amber-500 hover:bg-amber-600 border-amber-600 shadow-lg shadow-amber-200" : "hover:border-amber-500/50"
            )}
          >
            <AlertTriangle className={cn("w-4 h-4 mr-2", showLowStockOnly ? "text-white" : "text-amber-500")} />
            Low Stock Only
          </Button>

          <div className="h-10 w-[2px] bg-muted/50 mx-2 hidden lg:block" />

          {categories.slice(0, 5).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="lg"
              onClick={() => {
                setSelectedCategory(category);
                setShowLowStockOnly(false);
              }}
              className={cn(
                "rounded-2xl h-14 px-6 font-black text-xs uppercase tracking-widest border-2 transition-all",
                selectedCategory === category ? "shadow-lg shadow-primary/20" : ""
              )}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && !infiniteData ? (
        <div className="flex flex-col items-center justify-center py-40 animate-pulse">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
          <p className="text-muted-foreground font-medium italic">Scanning inventory database...</p>
        </div>
      ) : error ? (
        <div className="bg-destructive/5 border-2 border-destructive/20 rounded-[2rem] text-center py-16">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-black text-xl mb-2">Sync Interrupted</p>
          <p className="text-muted-foreground">{(error as any).message || 'Connection lost to store registry'}</p>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          {displayProducts.length > 0 ? (
            <div className="space-y-12 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteProductId(id)}
                    onToggleStock={handleToggleStock}
                    onUpdateStock={handleUpdateStock}
                  />
                ))}
              </div>

              {hasNextPage && !showLowStockOnly && (
                <div className="flex justify-center pb-20">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    variant="outline"
                    className="rounded-2xl h-14 px-12 font-black text-xs uppercase tracking-widest border-2 hover:bg-primary hover:text-white hover:border-primary transition-all"
                  >
                    {isFetchingNextPage ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-3" />
                    ) : null}
                    Load more inventory
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border-2 border-dashed rounded-[3rem] text-center py-32 animate-fade-in group">
              <div className="w-24 h-24 rounded-[2rem] bg-muted/30 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-primary/5 transition-all duration-700">
                <Search className="w-10 h-10 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-2xl font-black text-foreground mb-3 tracking-tight">
                {searchQuery || showLowStockOnly ? 'No matching products' : 'Archive empty'}
              </p>
              <p className="text-muted-foreground font-medium max-w-xs mx-auto mb-10 leading-relaxed">
                {searchQuery || showLowStockOnly
                  ? 'Your current search or filter returned no inventory items.'
                  : 'Start building your store by adding your first product position today.'}
              </p>
              {(searchQuery || showLowStockOnly) ? (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setShowLowStockOnly(false);
                    setSelectedCategory('All');
                  }}
                  variant="outline"
                  className="rounded-2xl h-12 px-8 font-bold border-2"
                >
                  Clear all filters
                </Button>
              ) : (
                <Button onClick={() => navigate('/dashboard/add-product')} className="rounded-2xl h-14 px-10 font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20">
                  <Plus className="w-5 h-5 mr-3" />
                  Add Product
                </Button>
              )}
            </div>
          )}
        </>
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && handleDelete(deleteProductId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageProducts;

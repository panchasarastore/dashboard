import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockProducts, Product } from '@/lib/mockData';
import { useProducts } from '@/hooks/useProducts';
import { useStore } from '@/contexts/StoreContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
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
  const { data: realProducts, isLoading, error } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null); // To show loading on specific cards if needed

  // Since react-query handles fetching, we should sync local state when data changes
  // or just use filteredProducts directly from realProducts
  const displayProducts = (realProducts || []) as Product[];

  const filteredProducts = displayProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    // In a real app, this would navigate to edit page with product data
    navigate(`/edit-product/${product.id}`);
  };

  const handleDelete = async (productId: string) => {
    const product = displayProducts.find(p => p.id === productId);
    if (!product || !activeStore) return;

    setIsProcessing(productId);
    try {
      // Call the Unified Deletion Edge Function
      const { data, error } = await supabase.functions.invoke('delete-product', {
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
        .update({ is_in_stock: !product.is_in_stock })
        .eq('id', productId);

      if (error) throw error;

      toast.success(`${product.name} marked as ${!product.is_in_stock ? 'in stock' : 'out of stock'}`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update stock');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Manage Products
            </h1>
            <p className="text-muted-foreground">
              {displayProducts.length} products in your store
            </p>
          </div>
          <Button onClick={() => navigate('/add-product')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {isLoading && !realProducts ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground italic">Fetching your products...</p>
          </div>
        ) : error ? (
          <div className="dashboard-card border-destructive/20 bg-destructive/5 text-center py-12">
            <p className="text-destructive font-medium mb-2">Error loading products</p>
            <p className="text-sm text-muted-foreground">{(error as any).message || 'Something went wrong'}</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteProductId(id)}
                    onToggleStock={handleToggleStock}
                  />
                ))}
              </div>
            ) : (
              <div className="dashboard-card text-center py-16 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground mb-2">
                  {searchQuery ? 'No products found' : 'No products yet'}
                </p>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Add your first product to get started'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/add-product')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Product
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
    </DashboardLayout>
  );
};

export default ManageProducts;

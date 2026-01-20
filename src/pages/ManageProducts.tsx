import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockProducts, Product } from '@/lib/mockData';
import { toast } from 'sonner';
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
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    // In a real app, this would navigate to edit page with product data
    navigate(`/edit-product/${product.id}`);
  };

  const handleDelete = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setDeleteProductId(null);
    toast.success('Product deleted successfully');
  };

  const handleToggleStock = (productId: string) => {
    setProducts(prev => 
      prev.map(p => 
        p.id === productId ? { ...p, inStock: !p.inStock } : p
      )
    );
    const product = products.find(p => p.id === productId);
    toast.success(`${product?.name} marked as ${product?.inStock ? 'out of stock' : 'in stock'}`);
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
              {products.length} products in your store
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

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="dashboard-card text-center py-16">
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

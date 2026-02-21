import { MoreVertical, Edit2, Trash2, Eye, EyeOff, Plus, Minus, AlertTriangle } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleVisibility: (productId: string) => void;
  onToggleStock: (productId: string) => void;
  onUpdateStock: (productId: string, newQuantity: number) => void;
}

const ProductCard = ({ product, onEdit, onDelete, onToggleVisibility, onToggleStock, onUpdateStock }: ProductCardProps) => {
  const stock = (product as any).stock_quantity;
  const minStock = (product as any).min_stock_level ?? 5;
  const isLowStock = product.is_in_stock && stock !== null && Number(stock) <= minStock;
  const isHidden = product.status === 'hidden';

  return (
    <div className={cn(
      "product-card animate-slide-up bg-card border rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group",
      isHidden && "opacity-75 grayscale-[0.5]"
    )}>
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Status Overlays */}
        {isHidden && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <Badge className="bg-white text-black font-black uppercase tracking-widest px-4 py-2 rounded-xl scale-110 shadow-2xl">
              Hidden
            </Badge>
          </div>
        )}

        {!isHidden && !product.is_in_stock && (
          <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] flex items-center justify-center">
            <Badge className="bg-primary text-white font-black uppercase tracking-widest px-4 py-2 rounded-xl scale-100 shadow-2xl">
              Sold Out
            </Badge>
          </div>
        )}

        {isLowStock && !isHidden && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            Refill Needed
          </div>
        )}

        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl bg-white/90 backdrop-blur shadow-xl hover:bg-white text-black active:scale-90 transition-all border-none">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[200px]">
              <DropdownMenuItem onClick={() => onEdit(product)} className="rounded-xl font-bold py-3 hover:bg-primary/5">
                <Edit2 className="mr-3 h-4 w-4" />
                Edit Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleVisibility(product.id)} className="rounded-xl font-bold py-3">
                {product.status === 'active' ? (
                  <>
                    <EyeOff className="mr-3 h-4 w-4" />
                    Hide from Store
                  </>
                ) : (
                  <>
                    <Eye className="mr-3 h-4 w-4" />
                    Publish to Store
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStock(product.id)} className="rounded-xl font-bold py-3">
                {product.is_in_stock ? (
                  <>
                    <AlertTriangle className="mr-3 h-4 w-4 text-amber-500" />
                    Mark Out of Stock
                  </>
                ) : (
                  <>
                    <Plus className="mr-3 h-4 w-4 text-green-500" />
                    Mark In Stock
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(product.id)}
                className="rounded-xl font-bold py-3 text-red-600 focus:text-red-700 focus:bg-red-50"
              >
                <Trash2 className="mr-3 h-4 w-4" />
                Remove Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>


      {/* Content Section */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-black text-xl text-foreground leading-tight tracking-tight mb-1 truncate">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground/60 font-medium uppercase tracking-widest">
            {(product as any).category || 'No Category'}
          </p>
        </div>

        {/* Stock Management UI */}
        <div className="bg-muted/30 rounded-2xl p-4 mb-6 border border-muted/50 flex items-center justify-between group/stock">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 block">Inventory</span>
            <span className={cn(
              "text-lg font-black",
              stock === null ? "text-primary" : (Number(stock) === 0 ? "text-red-500" : Number(stock) <= minStock ? "text-amber-500" : "text-foreground")
            )}>
              {stock === null ? 'UNLIMITED' : stock}
              {stock !== null && <span className="text-xs text-muted-foreground/40 font-bold ml-1">UNITS</span>}
            </span>
          </div>

          {stock !== null && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-2 hover:bg-white active:scale-90 transition-all shadow-sm"
                onClick={() => onUpdateStock(product.id, Math.max(0, Number(stock) - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-2 hover:bg-white active:scale-90 transition-all shadow-sm"
                onClick={() => onUpdateStock(product.id, Number(stock) + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 block">Retail Price</span>
            <p className="text-2xl font-black text-primary tracking-tighter">
              ₹{product.price.toLocaleString()}
            </p>
          </div>
          {product.accepts_custom_note && (
            <div className="flex flex-col items-end">
              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest rounded-lg border-primary/20 bg-primary/5 text-primary">
                Customizable
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

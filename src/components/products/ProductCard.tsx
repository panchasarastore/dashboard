import { MoreVertical, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { Product } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleStock: (productId: string) => void;
}

const ProductCard = ({ product, onEdit, onDelete, onToggleStock }: ProductCardProps) => {
  return (
    <div className="product-card animate-slide-up">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={Array.isArray(product.images) ? product.images[0] : product.images}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {!product.is_in_stock && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm font-medium">
              Out of Stock
            </Badge>
          </div>
        )}
        {product.product_notice && product.is_in_stock && (
          <Badge
            className="absolute top-3 left-3 bg-warning text-warning-foreground text-xs"
          >
            {product.product_notice}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif font-semibold text-lg text-foreground leading-tight">
            {product.name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStock(product.id)}>
                {product.is_in_stock ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Mark Out of Stock
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Mark In Stock
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(product.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-primary">
            ₹{product.price.toLocaleString()}
          </p>
          {product.accepts_custom_note && (
            <Badge variant="outline" className="text-xs">
              Custom orders
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

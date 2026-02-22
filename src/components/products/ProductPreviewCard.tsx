import { Badge } from '@/components/ui/badge';
import { ImageIcon } from 'lucide-react';

interface ProductPreviewCardProps {
  name: string;
  description: string;
  price: number;
  image?: string;
  notice?: string;
  acceptCustomDescription: boolean;
}

const ProductPreviewCard = ({
  name,
  description,
  price,
  image,
  notice,
  acceptCustomDescription
}: ProductPreviewCardProps) => {
  return (
    <div className="product-card max-w-sm">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={name || 'Product preview'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="w-12 h-12 mb-2" />
            <p className="text-sm">No image uploaded</p>
          </div>
        )}
        {notice && (
          <Badge
            className="absolute top-3 left-3 bg-warning text-warning-foreground text-xs"
          >
            {notice}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg text-foreground leading-tight mb-2">
          {name || 'Product Name'}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {description || 'Product description will appear here...'}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-primary">
            ₹{price > 0 ? price.toLocaleString() : '0'}
          </p>
          {acceptCustomDescription && (
            <Badge variant="outline" className="text-xs">
              Custom orders
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewCard;

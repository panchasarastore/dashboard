import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/lib/supabase';
import ProductPreviewCard from '@/components/products/ProductPreviewCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormValues } from '@/lib/schemas/productSchema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ImageCropper from '@/components/products/ImageCropper';

const AddProduct = () => {
  const navigate = useNavigate();
  const { activeStore } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      image: '',
      accepts_custom_note: false,
      product_notice: '',
    },
  });

  const watchAll = watch();

  const onSubmit = async (data: ProductFormValues) => {
    if (!activeStore) {
      toast.error('No active store found. Please create a store first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const productId = crypto.randomUUID();
      let imageUrl = data.image;

      // 1. Upload image if exists
      if (imageFile && activeStore) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `image-1.${fileExt}`;
        const filePath = `stores/${activeStore.id}/products/${productId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('store-assets')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('store-assets')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // 2. Insert product
      const { error } = await supabase
        .from('products')
        .insert({
          id: productId,
          store_id: activeStore.id,
          name: data.name,
          description: data.description,
          price: Number(data.price),
          images: imageUrl ? [imageUrl] : [],
          accepts_custom_note: data.accepts_custom_note,
          product_notice: data.product_notice,
          is_in_stock: true,
        } as any);

      if (error) throw error;

      toast.success('Product added successfully!');
      navigate('/dashboard/products');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const url = URL.createObjectURL(file);
      setTempImageSrc(url);
      setIsCropModalOpen(true);
      // Reset input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Create a new File object from the blob to maintain compatibility with the upload logic
    const croppedFile = new File([croppedBlob], 'cropped-product-image.jpg', { type: 'image/jpeg' });
    setImageFile(croppedFile);

    const url = URL.createObjectURL(croppedBlob);
    setValue('image', url);

    setIsCropModalOpen(false);
    setTempImageSrc(null);
    toast.success('Image cropped successfully!');
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
          Add New Product
        </h1>
        <p className="text-muted-foreground">
          Fill in the details below to add a new product to your store.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="dashboard-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Chocolate Truffle Cake"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Click to upload image
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your product..."
                rows={3}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="0"
                min="0"
                {...register('price')}
              />
              {errors.price && (
                <p className="text-xs text-destructive font-medium">{errors.price.message}</p>
              )}
            </div>

            {/* Accept Custom Description */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="custom">Accept Custom Orders</Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Allow buyers to add custom instructions
                </p>
              </div>
              <Controller
                name="accepts_custom_note"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="custom"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Notice */}
            <div className="space-y-2">
              <Label htmlFor="notice">Product Notice (Optional)</Label>
              <Input
                id="notice"
                placeholder="e.g., Order 2 days in advance"
                {...register('product_notice')}
              />
              {errors.product_notice && (
                <p className="text-xs text-destructive font-medium">{errors.product_notice.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This will be displayed as a badge on your product
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Product'
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-8 h-fit">
          <div className="mb-4">
            <h2 className="text-lg font-serif font-semibold text-foreground">
              Live Preview
            </h2>
            <p className="text-sm text-muted-foreground">
              This is how your product will appear
            </p>
          </div>
          <ProductPreviewCard
            name={watchAll.name}
            description={watchAll.description || ''}
            price={Number(watchAll.price) || 0}
            image={watchAll.image || ''}
            notice={watchAll.product_notice || ''}
            acceptCustomDescription={watchAll.accepts_custom_note}
          />
        </div>
      </div>

      {/* Image Crop Modal */}
      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2rem]">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold">Crop Product Image</DialogTitle>
              <DialogDescription>
                Drag and zoom to frame your product perfectly.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6">
            {tempImageSrc && (
              <ImageCropper
                imageSrc={tempImageSrc}
                aspect={4 / 3}
                onCropComplete={handleCropComplete}
                onCancel={() => {
                  setIsCropModalOpen(false);
                  setTempImageSrc(null);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddProduct;

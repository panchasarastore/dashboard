import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, X, ImageIcon, Download, CheckCircle2, Clock, Package, Plus, Minus } from 'lucide-react';
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

interface StockStepperProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const StockStepper = ({ value, onChange, label }: StockStepperProps) => {
  const numValue = parseInt(value) || 0;

  const handleDecrement = () => {
    onChange(Math.max(0, numValue - 1).toString());
  };

  const handleIncrement = () => {
    onChange((numValue + 1).toString());
  };

  return (
    <div className="flex items-center gap-3 bg-card/50 backdrop-blur-md border border-primary/10 rounded-2xl p-1.5 shadow-sm group hover:border-primary/20 transition-all">
      <button
        type="button"
        title="Decrease stock"
        aria-label="Decrease stock"
        onClick={handleDecrement}
        className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary active:scale-90 transition-all"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="flex-1 text-center px-2">
        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40 mb-0.5">{label}</p>
        <input
          type="number"
          value={value}
          title={label}
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent border-0 p-0 w-full text-center font-black text-lg focus:ring-0 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <button
        type="button"
        title="Increase stock"
        aria-label="Increase stock"
        onClick={handleIncrement}
        className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary active:scale-90 transition-all"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

const AddProduct = () => {
  const navigate = useNavigate();
  const { activeStore } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
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
      category: '',
      description: '',
      price: '',
      images: [],
      accepts_custom_note: false,
      product_notice: '',
      track_inventory: false,
      stock_quantity: '0',
      min_stock_level: '5',
      status: 'active',
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
      const imageUrls: string[] = [];

      // 1. Upload images
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (file && activeStore) {
          const fileExt = file.name.split('.').pop();
          const fileName = `image-${i + 1}.${fileExt}`;
          const filePath = `stores/${activeStore.id}/products/${productId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('store-assets')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('store-assets')
            .getPublicUrl(filePath);

          imageUrls.push(publicUrl);
        }
      }

      // 2. Insert product
      const { error } = await supabase
        .from('products')
        .insert({
          id: productId,
          store_id: activeStore.id,
          name: data.name,
          category: data.category,
          description: data.description,
          price: Number(data.price),
          images: imageUrls,
          accepts_custom_note: data.accepts_custom_note,
          product_notice: data.product_notice,
          track_inventory: data.track_inventory,
          stock_quantity: data.track_inventory ? Number(data.stock_quantity) : null,
          min_stock_level: data.track_inventory ? Number(data.min_stock_level) : 5,
          is_in_stock: true,
          status: data.status,
        });

      if (error) throw error;

      toast.success('Product added successfully!');
      navigate('/dashboard/products');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const url = URL.createObjectURL(file);
      setTempImageSrc(url);
      setActiveSlot(slotIndex);
      setIsCropModalOpen(true);
      // Reset input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);

    // Update form state
    const currentImages = watchAll.images || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    setValue('images', newImages);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    if (activeSlot === null) return;

    // Create a new File object from the blob to maintain compatibility with the upload logic
    const croppedFile = new File([croppedBlob], `product-image-${activeSlot + 1}.jpg`, { type: 'image/jpeg' });

    const newFiles = [...imageFiles];
    newFiles[activeSlot] = croppedFile;
    setImageFiles(newFiles);

    const url = URL.createObjectURL(croppedBlob);
    const currentImages = watchAll.images || [];
    const newImages = [...currentImages];
    newImages[activeSlot] = url;
    setValue('images', newImages);

    setIsCropModalOpen(false);
    setTempImageSrc(null);
    setActiveSlot(null);
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
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
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

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Cakes, Pastries, Drinks"
                {...register('category')}
              />
              {errors.category && (
                <p className="text-xs text-destructive font-medium">{errors.category.message}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <Label>Product Images (Up to 4)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((index) => {
                  const previewUrl = watchAll.images?.[index];
                  return (
                    <div key={index} className="relative group aspect-square">
                      {previewUrl ? (
                        <div className="relative w-full h-full rounded-xl overflow-hidden border border-border">
                          <img
                            src={previewUrl}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            title="Remove image"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-full">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, index)}
                            className="hidden"
                            id={`image-upload-${index}`}
                          />
                          <label
                            htmlFor={`image-upload-${index}`}
                            className="w-full h-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                          >
                            <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-[10px] font-bold uppercase mt-2 text-muted-foreground group-hover:text-primary tracking-tighter transition-colors">Slot {index + 1}</span>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground leading-none">
                First slot is the primary image. PNG, JPG up to 5MB.
              </p>
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

            {/* Inventory Section */}
            <div className="space-y-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="track_inventory" className="text-primary font-bold">Track Inventory</Label>
                  <p className="text-[10px] text-muted-foreground leading-none">Enable stock tracking for this product</p>
                </div>
                <Controller
                  name="track_inventory"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="track_inventory"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              {watchAll.track_inventory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-primary/10 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Controller
                      name="stock_quantity"
                      control={control}
                      render={({ field }) => (
                        <StockStepper
                          label="Initial Stock"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <p className="text-[9px] text-muted-foreground/60 font-medium px-2">
                      Quantity currently in your warehouse
                    </p>
                    {errors.stock_quantity && (
                      <p className="text-xs text-destructive font-medium">{errors.stock_quantity.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Controller
                      name="min_stock_level"
                      control={control}
                      render={({ field }) => (
                        <StockStepper
                          label="Low Limit"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <p className="text-[9px] text-muted-foreground/60 font-medium px-2">
                      Alert sent when stock falls below this
                    </p>
                    {errors.min_stock_level && (
                      <p className="text-xs text-destructive font-medium">{errors.min_stock_level.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div>
                <Label htmlFor="status" className="text-primary font-bold">Publish to Store</Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Make this product visible to customers
                </p>
              </div>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="status"
                    checked={field.value === 'active'}
                    onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'hidden')}
                  />
                )}
              />
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
            <h2 className="text-lg font-display font-semibold text-foreground">
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
            image={watchAll.images?.[0] || ''}
            notice={watchAll.product_notice || ''}
            acceptCustomDescription={watchAll.accepts_custom_note}
          />
        </div>
      </div>

      {/* Image Crop Modal */}
      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden rounded-[2.5rem] max-h-[90vh] flex flex-col border-none shadow-2xl">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold">Crop Product Image</DialogTitle>
              <DialogDescription>
                Drag and zoom to frame your product perfectly.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 pt-2 overflow-y-auto">
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

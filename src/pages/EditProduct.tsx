import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Loader2, X, Plus, ImageIcon } from 'lucide-react';
import ProductPreviewCard from '@/components/products/ProductPreviewCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/contexts/StoreContext';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormValues } from '@/lib/schemas/productSchema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ImageCropper from '@/components/products/ImageCropper';

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { activeStore } = useStore();

  const [isLoading, setIsLoading] = useState(true);
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
    reset,
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
    },
  });

  const watchAll = watch();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        const { data: rawData, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;

        const data = rawData as any;
        if (data) {
          reset({
            name: data.name,
            category: data.category || '',
            description: data.description || '',
            price: data.price.toString(),
            images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
            accepts_custom_note: data.accepts_custom_note,
            product_notice: data.product_notice || '',
          });
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load product');
        navigate('/dashboard/products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    if (!activeStore || !productId) {
      toast.error('Missing required context');
      return;
    }

    setIsSubmitting(true);
    try {
      const folderPath = `stores/${activeStore.id}/products/${productId}`;
      const finalImageUrls: string[] = [...(data.images || [])];

      // 1. Upload new images and update slots
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (file) {
          const fileExt = file.name.split('.').pop();
          const fileName = `image-${i + 1}-${Date.now()}.${fileExt}`;
          const filePath = `${folderPath}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('store-assets')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('store-assets')
            .getPublicUrl(filePath);

          finalImageUrls[i] = publicUrl;
        }
      }

      const cleanedImages = finalImageUrls.filter(url => url && typeof url === 'string' && url.length > 0);

      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          category: data.category,
          description: data.description,
          price: Number(data.price),
          images: cleanedImages,
          accepts_custom_note: data.accepts_custom_note,
          product_notice: data.product_notice,
        } as any)
        .eq('id', productId);

      if (error) throw error;

      toast.success('Product updated successfully!');
      navigate('/dashboard/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product');
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
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);

    const currentImages = [...(watchAll.images || [])];
    currentImages[index] = '';
    setValue('images', currentImages);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    if (activeSlot === null) return;

    const croppedFile = new File([croppedBlob], `product-image-${activeSlot + 1}.jpg`, { type: 'image/jpeg' });
    const newFiles = [...imageFiles];
    newFiles[activeSlot] = croppedFile;
    setImageFiles(newFiles);

    const url = URL.createObjectURL(croppedBlob);
    const currentImages = [...(watchAll.images || [])];
    currentImages[activeSlot] = url;
    setValue('images', currentImages);

    setIsCropModalOpen(false);
    setTempImageSrc(null);
    setActiveSlot(null);
    toast.success('Image cropped successfully!');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground italic">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Edit Product</h1>
        <p className="text-muted-foreground">Update the details of your product.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="dashboard-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" placeholder="e.g., Chocolate Truffle Cake" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="e.g., Cakes, Pastries, Drinks" {...register('category')} />
              {errors.category && <p className="text-xs text-destructive font-medium">{errors.category.message}</p>}
            </div>

            <div className="space-y-3">
              <Label>Product Images (Up to 4)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((index) => {
                  const previewUrl = watchAll.images?.[index];
                  return (
                    <div key={index} className="relative group aspect-square">
                      {previewUrl ? (
                        <div className="relative w-full h-full rounded-xl overflow-hidden border border-border">
                          <img src={previewUrl} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
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
              <p className="text-[10px] text-muted-foreground leading-none">First slot is the primary image. PNG, JPG up to 5MB.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe your product..." rows={3} {...register('description')} />
              {errors.description && <p className="text-xs text-destructive font-medium">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input id="price" type="number" placeholder="0" min="0" {...register('price')} />
              {errors.price && <p className="text-xs text-destructive font-medium">{errors.price.message}</p>}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="custom">Accept Custom Orders</Label>
                <p className="text-sm text-muted-foreground mt-0.5">Allow buyers to add custom instructions</p>
              </div>
              <Controller
                name="accepts_custom_note"
                control={control}
                render={({ field }) => <Switch id="custom" checked={field.value} onCheckedChange={field.onChange} />}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notice">Product Notice (Optional)</Label>
              <Input id="notice" placeholder="e.g., Order 2 days in advance" {...register('product_notice')} />
              {errors.product_notice && <p className="text-xs text-destructive font-medium">{errors.product_notice.message}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>

        <div className="lg:sticky lg:top-8 h-fit">
          <div className="mb-4">
            <h2 className="text-lg font-serif font-semibold text-foreground">Live Preview</h2>
            <p className="text-sm text-muted-foreground">This is how your product will appear</p>
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

      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2rem]">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold">Crop Product Image</DialogTitle>
              <DialogDescription>Drag and zoom to frame your product perfectly.</DialogDescription>
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

export default EditProduct;

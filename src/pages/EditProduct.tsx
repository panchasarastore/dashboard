import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProductPreviewCard from '@/components/products/ProductPreviewCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/contexts/StoreContext';
import { toast } from 'sonner';

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { activeStore } = useStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    acceptCustomDescription: false,
    notice: '',
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            name: data.name,
            description: data.description || '',
            price: data.price.toString(),
            image: Array.isArray(data.images) ? data.images[0] : (data.images || ''),
            acceptCustomDescription: data.accepts_custom_note,
            notice: data.product_notice || '',
          });
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load product');
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground italic">Loading product details...</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !activeStore || !productId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = formData.image;

      // 1. If a new image is selected, handle storage replacement
      if (imageFile) {
        const folderPath = `stores/${activeStore.id}/products/${productId}`;

        // List existing files to delete them first
        const { data: existingFiles } = await supabase.storage
          .from('store-assets')
          .list(folderPath);

        if (existingFiles && existingFiles.length > 0) {
          const filesToRemove = existingFiles.map((f) => `${folderPath}/${f.name}`);
          await supabase.storage.from('store-assets').remove(filesToRemove);
        }

        // Upload new image
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `image-1.${fileExt}`;
        const filePath = `${folderPath}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('store-assets')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('store-assets')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // 2. Update the database record
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          images: imageUrl ? [imageUrl] : [],
          accepts_custom_note: formData.acceptCustomDescription,
          product_notice: formData.notice,
        })
        .eq('id', productId);

      if (error) throw error;

      toast.success('Product updated successfully!');
      navigate('/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product');
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
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: url }));
      toast.success('New image selected!');
    }
  };

  return (
    <DashboardLayout>
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
            Edit Product
          </h1>
          <p className="text-muted-foreground">
            Update the details of your product.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="dashboard-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Chocolate Truffle Cake"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Product Image</Label>
                {formData.image && (
                  <div className="w-full h-40 rounded-lg overflow-hidden mb-3">
                    <img
                      src={formData.image}
                      alt="Current product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
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
                      Click to change image
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
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
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
                <Switch
                  id="custom"
                  checked={formData.acceptCustomDescription}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, acceptCustomDescription: checked }))
                  }
                />
              </div>

              {/* Notice */}
              <div className="space-y-2">
                <Label htmlFor="notice">Product Notice (Optional)</Label>
                <Input
                  id="notice"
                  placeholder="e.g., Order 2 days in advance"
                  value={formData.notice}
                  onChange={(e) => setFormData(prev => ({ ...prev, notice: e.target.value }))}
                />
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
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
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
              name={formData.name}
              description={formData.description}
              price={Number(formData.price) || 0}
              image={formData.image}
              notice={formData.notice}
              acceptCustomDescription={formData.acceptCustomDescription}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditProduct;

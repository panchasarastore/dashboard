import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProductPreviewCard from '@/components/products/ProductPreviewCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    acceptCustomDescription: false,
    notice: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    // In a real app, this would save to a database
    toast.success('Product added successfully!');
    navigate('/products');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to storage
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: url }));
      toast.success('Image uploaded!');
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
            Add New Product
          </h1>
          <p className="text-muted-foreground">
            Fill in the details below to add a new product to your store.
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
                <Button type="submit" className="flex-1">
                  Add Product
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

export default AddProduct;

import * as z from 'zod';

export const productSchema = z.object({
    name: z.string().min(1, 'Product name is required').max(100, 'Name is too long'),
    description: z.string().max(1000, 'Description is too long').optional().or(z.literal('')),
    price: z.string().min(1, 'Price is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'Price must be a positive number',
    }),
    category: z.string().max(50, 'Category is too long').optional().or(z.literal('')),
    images: z.array(z.string()).max(4, 'Maximum 4 images allowed').default([]),
    accepts_custom_note: z.boolean().default(false),
    product_notice: z.string().max(200, 'Notice is too long').optional().or(z.literal('')),
    stock_quantity: z.string().default('0').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'Stock must be a positive number',
    }),
    min_stock_level: z.string().default('5').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'Low stock limit must be a positive number',
    }),
});

export type ProductFormValues = z.infer<typeof productSchema>;

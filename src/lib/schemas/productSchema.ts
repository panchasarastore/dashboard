import * as z from 'zod';

export const productSchema = z.object({
    name: z.string().min(1, 'Product name is required').max(100, 'Name is too long'),
    description: z.string().max(1000, 'Description is too long').optional().or(z.literal('')),
    price: z.string().min(1, 'Price is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'Price must be a positive number',
    }),
    image: z.string().optional().or(z.literal('')),
    accepts_custom_note: z.boolean().default(false),
    product_notice: z.string().max(200, 'Notice is too long').optional().or(z.literal('')),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            orders: {
                Row: {
                    id: string
                    store_id: string
                    order_number: string
                    customer_name: string
                    customer_phone: string
                    customer_email: string
                    delivery_method: string
                    delivery_address: string | null
                    delivery_pincode: string | null
                    delivery_landmark: string | null
                    delivery_notes: string | null
                    delivery_lat: number | null
                    delivery_lng: number | null
                    subtotal: number
                    total_amount: number
                    currency: string
                    payment_status: string
                    payment_method: string
                    time_slot: string | null
                    customer_notes: string | null
                    order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered'
                    created_at: string
                }
                Insert: {
                    id?: string
                    store_id: string
                    order_number: string
                    customer_name: string
                    customer_phone: string
                    customer_email: string
                    delivery_method: string
                    delivery_address?: string | null
                    delivery_pincode?: string | null
                    delivery_landmark?: string | null
                    delivery_notes?: string | null
                    delivery_lat?: number | null
                    delivery_lng?: number | null
                    subtotal: number
                    total_amount: number
                    currency?: string
                    payment_status?: string
                    payment_method: string
                    time_slot?: string | null
                    customer_notes?: string | null
                    order_status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered'
                    created_at?: string
                }
                Update: {
                    id?: string
                    store_id?: string
                    order_number?: string
                    customer_name?: string
                    customer_phone?: string
                    customer_email?: string
                    delivery_method?: string
                    delivery_address?: string | null
                    delivery_pincode?: string | null
                    delivery_landmark?: string | null
                    delivery_notes?: string | null
                    delivery_lat?: number | null
                    delivery_lng?: number | null
                    subtotal?: number
                    total_amount?: number
                    currency?: string
                    payment_status?: string
                    payment_method?: string
                    time_slot?: string | null
                    customer_notes?: string | null
                    order_status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered'
                    created_at?: string
                }
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string
                    product_id: string
                    product_name: string
                    product_price: number
                    quantity: number
                    item_total: number
                    variant_snapshot: Json | null
                    custom_note: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    product_id: string
                    product_name: string
                    product_price: number
                    quantity: number
                    item_total: number
                    variant_snapshot?: Json | null
                    custom_note?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    product_id?: string
                    product_name?: string
                    product_price?: number
                    quantity?: number
                    item_total?: number
                    variant_snapshot?: Json | null
                    custom_note?: string | null
                    created_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    store_id: string
                    name: string
                    description: string | null
                    price: number
                    images: string[]
                    accepts_custom_note: boolean
                    product_notice: string | null
                    is_in_stock: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    store_id: string
                    name: string
                    description?: string | null
                    price: number
                    images?: string[]
                    accepts_custom_note?: boolean
                    product_notice?: string | null
                    is_in_stock?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    store_id?: string
                    name?: string
                    description?: string | null
                    price?: number
                    images?: string[]
                    accepts_custom_note?: boolean
                    product_notice?: string | null
                    is_in_stock?: boolean
                    created_at?: string
                }
            }
            stores: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    slug: string
                    theme_data: Json | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    slug: string
                    theme_data?: Json | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    slug?: string
                    theme_data?: Json | null
                    is_active?: boolean
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

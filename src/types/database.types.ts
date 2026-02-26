export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
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
                    order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed'
                    is_stock_decremented: boolean
                    created_at: string
                    updated_at: string
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
                    order_status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed'
                    is_stock_decremented?: boolean
                    created_at?: string
                    updated_at?: string
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
                    order_status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed'
                    is_stock_decremented?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
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
                Relationships: []
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
                    stock_quantity: number | null
                    min_stock_level: number | null
                    track_inventory: boolean
                    status: 'active' | 'hidden'
                    category: string | null
                    created_at: string
                    updated_at: string
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
                    stock_quantity?: number | null
                    min_stock_level?: number | null
                    track_inventory?: boolean
                    status?: 'active' | 'hidden'
                    category?: string | null
                    created_at?: string
                    updated_at?: string
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
                    stock_quantity?: number | null
                    min_stock_level?: number | null
                    track_inventory?: boolean
                    status?: 'active' | 'hidden'
                    category?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
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
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            decrement_stock: {
                Args: {
                    p_product_id: string
                    p_quantity: number
                }
                Returns: undefined
            }
            create_order_with_items: {
                Args: {
                    p_order: Json
                    p_items: Json
                }
                Returns: Json
            }
            get_order_by_number: {
                Args: {
                    p_order_number: string
                    p_identifier: string
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

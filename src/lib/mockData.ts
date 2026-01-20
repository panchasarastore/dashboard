export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  acceptCustomDescription: boolean;
  notice?: string;
  inStock: boolean;
  createdAt: Date;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  coordinates: { lat: number; lng: number };
  deliveryDate: Date;
  customInstructions?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  createdAt: Date;
}

export interface StoreStats {
  totalRevenue: number;
  fulfilledOrders: number;
  pendingOrders: number;
  totalProducts: number;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Chocolate Truffle Cake',
    description: 'Rich, decadent chocolate truffle cake with Belgian chocolate ganache. Perfect for celebrations.',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    acceptCustomDescription: true,
    notice: 'Order 2 days in advance',
    inStock: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Red Velvet Cupcakes (6 pcs)',
    description: 'Classic red velvet cupcakes with cream cheese frosting. Box of 6.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&h=300&fit=crop',
    acceptCustomDescription: false,
    inStock: true,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'Artisan Sourdough Bread',
    description: 'Freshly baked sourdough with a crispy crust and soft interior. Made with 24-hour fermented dough.',
    price: 180,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    acceptCustomDescription: false,
    inStock: true,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: 'Cinnamon Rolls (4 pcs)',
    description: 'Soft, fluffy cinnamon rolls with cream cheese glaze. Best served warm.',
    price: 320,
    image: 'https://images.unsplash.com/photo-1609127102567-8a9a21dc27d8?w=400&h=300&fit=crop',
    acceptCustomDescription: true,
    notice: 'Contains nuts',
    inStock: false,
    createdAt: new Date('2024-02-10'),
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    productId: '1',
    productName: 'Chocolate Truffle Cake',
    productImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    quantity: 1,
    totalPrice: 1200,
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43210',
    customerEmail: 'priya.sharma@email.com',
    address: '42, MG Road, Indiranagar, Bangalore, Karnataka 560038',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    deliveryDate: new Date('2024-03-25'),
    customInstructions: 'Please write "Happy Birthday Ria" on the cake with pink icing.',
    status: 'pending',
    createdAt: new Date('2024-03-20'),
  },
  {
    id: 'ORD-002',
    productId: '2',
    productName: 'Red Velvet Cupcakes (6 pcs)',
    productImage: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&h=300&fit=crop',
    quantity: 2,
    totalPrice: 900,
    customerName: 'Rahul Menon',
    customerPhone: '+91 87654 32109',
    customerEmail: 'rahul.m@email.com',
    address: '15, Church Street, Ashok Nagar, Chennai, Tamil Nadu 600083',
    coordinates: { lat: 13.0827, lng: 80.2707 },
    deliveryDate: new Date('2024-03-26'),
    status: 'confirmed',
    createdAt: new Date('2024-03-21'),
  },
  {
    id: 'ORD-003',
    productId: '3',
    productName: 'Artisan Sourdough Bread',
    productImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    quantity: 3,
    totalPrice: 540,
    customerName: 'Anita Desai',
    customerPhone: '+91 76543 21098',
    customerEmail: 'anita.d@email.com',
    address: '78, Linking Road, Bandra West, Mumbai, Maharashtra 400050',
    coordinates: { lat: 19.0596, lng: 72.8295 },
    deliveryDate: new Date('2024-03-24'),
    status: 'preparing',
    createdAt: new Date('2024-03-19'),
  },
  {
    id: 'ORD-004',
    productId: '1',
    productName: 'Chocolate Truffle Cake',
    productImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    quantity: 1,
    totalPrice: 1200,
    customerName: 'Vikram Singh',
    customerPhone: '+91 65432 10987',
    customerEmail: 'vikram.s@email.com',
    address: '23, Connaught Place, New Delhi, Delhi 110001',
    coordinates: { lat: 28.6315, lng: 77.2167 },
    deliveryDate: new Date('2024-03-27'),
    customInstructions: 'Extra chocolate shavings on top please.',
    status: 'pending',
    createdAt: new Date('2024-03-22'),
  },
];

export const mockStats: StoreStats = {
  totalRevenue: 28450,
  fulfilledOrders: 42,
  pendingOrders: 4,
  totalProducts: 4,
};

export const storeInfo = {
  name: 'Sweet Delights Bakery',
  logo: '🧁',
  url: 'sweet-delights',
};

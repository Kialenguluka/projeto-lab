export interface PropertyListing {
  id: string;
  name: string;
  location: string;
  image: string;
  rating?: number;
  reviews?: number;
  price?: number;
  isGenius?: boolean;
  category?: string;
}

export interface CartItem {
  id: string;
  name: string;
  location: string;
  image: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  pricePerNight: number;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  propertyName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  image: string;
}

export const CATEGORIES: { id: string; label: string }[] = [
  { id: 'eletronicos', label: 'Eletronicos' },
  { id: 'moda', label: 'Moda' },
  { id: 'casa', label: 'Casa' },
  { id: 'beleza', label: 'Beleza' },
  { id: 'acessorios', label: 'Acessorios' },
  { id: 'desporto', label: 'Desporto' },
];

export const CATALOG_PROPERTIES: PropertyListing[] = [
  {
    id: '1',
    name: 'Smartphone Pro Max',
    location: 'Eletronicos',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
    rating: 4.7,
    reviews: 234,
    price: 420000,
    category: 'eletronicos',
  },
  {
    id: '2',
    name: 'Notebook Ultra 14',
    location: 'Eletronicos',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
    rating: 4.8,
    reviews: 567,
    price: 850000,
    category: 'eletronicos',
  },
];

export const WEEKEND_PROPERTIES: PropertyListing[] = CATALOG_PROPERTIES;
export const GUEST_FAVORITES: PropertyListing[] = CATALOG_PROPERTIES;

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    propertyName: 'Smartphone Pro Max',
    location: 'Luanda, Angola',
    checkIn: '15 Mai 2026',
    checkOut: '18 Mai 2026',
    guests: 2,
    total: 840000,
    status: 'confirmed',
    createdAt: '10 Mai 2026',
  },
  {
    id: 'ORD-002',
    propertyName: 'Notebook Ultra 14',
    location: 'Luanda, Angola',
    checkIn: '20 Mai 2026',
    checkOut: '25 Mai 2026',
    guests: 1,
    total: 850000,
    status: 'pending',
    createdAt: '12 Mai 2026',
  },
  {
    id: 'ORD-003',
    propertyName: 'Kit Casa Inteligente',
    location: 'Benguela, Angola',
    checkIn: '01 Abr 2026',
    checkOut: '05 Abr 2026',
    guests: 3,
    total: 216000,
    status: 'delivered',
    createdAt: '25 Mar 2026',
  },
];

export const INITIAL_CART: CartItem[] = [];

export const TRENDING_DESTINATIONS: {
  name: string;
  flag: string;
  image: string;
  size: 'large' | 'small';
}[] = [];

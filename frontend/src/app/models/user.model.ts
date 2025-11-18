import { Address } from './cart.model';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  preferences: NotificationPreferences;
  readerLevel: ReaderLevel;
  orderCount: number;
  totalSpent: number;
  joinedAt: Date;
  emailVerified: boolean;
  lastLoginAt: Date;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: User;
  message?: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  subscribe?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  shippingNotifications: boolean;
  newProducts: boolean;
  marketing: boolean;
  memberOffers: boolean;
}

export enum ReaderLevel {
  INITIATE = 'initiate',      // 0-2 orders
  SCHOLAR = 'scholar',         // 3-9 orders
  SAGE = 'sage'                // 10+ orders
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export enum ActivityType {
  ORDER_PLACED = 'order_placed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  WISHLIST_ADDED = 'wishlist_added',
  ADDRESS_ADDED = 'address_added',
  PASSWORD_CHANGED = 'password_changed'
}

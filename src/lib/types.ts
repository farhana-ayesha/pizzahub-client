export type Role = "customer" | "vendor" | "admin";
export type MenuStatus = "pending" | "approved" | "rejected" | "inactive";
export type OrderStatus = "pending" | "accepted" | "rejected" | "cancelled";
export type TransactionStatus = "succeeded" | "failed" | "refunded";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  image: string;
  role: Role;
  isBlocked: boolean;
  businessName?: string;
  subscriptionPlan?: "free" | "premium";
  subscriptionExpiresAt?: string;
  phone?: string;
  location?: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  vendorId: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: MenuStatus;
  active: boolean;
  rating: number;
  reviewsCount: number;
  prepTime: string;
  tags: string[];
  createdAt: string;
}

export interface Order {
  id: string;
  itemId: string;
  vendorId: string;
  customerId: string;
  deliveryDate: string;
  deliveryAddress: string;
  message: string;
  status: OrderStatus;
  quantity: number;
  total: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  vendorId: string;
  plan: "premium";
  amount: number;
  currency: string;
  stripeSessionId: string;
  stripeSubscriptionId: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface DemoState {
  users: User[];
  menuItems: MenuItem[];
  orders: Order[];
  transactions: Transaction[];
}

export interface Review {
  id: string;
  author: string;
  image: string;
  rating: number;
  date: string;
  text: string;
}

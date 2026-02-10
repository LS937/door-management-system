import { Order, PickupRequest } from './types';

// Storage keys
const ORDERS_KEY = 'door-management-orders';
const PICKUP_REQUESTS_KEY = 'door-management-pickup-requests';
const USER_ROLES_KEY = 'door-management-user-roles';

// Helper to check if we're on the client side
const isClient = typeof window !== 'undefined';

// Order management functions
export const getOrders = (): Order[] => {
  if (!isClient) return [];
  const stored = localStorage.getItem(ORDERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveOrders = (orders: Order[]): void => {
  if (!isClient) return;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const addOrder = (order: Order): void => {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
};

export const updateOrder = (orderId: string, updates: Partial<Order>): void => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
    saveOrders(orders);
  }
};

export const getOrderById = (orderId: string): Order | undefined => {
  const orders = getOrders();
  return orders.find(o => o.id === orderId);
};

export const getOrdersByCustomer = (customerId: string): Order[] => {
  const orders = getOrders();
  return orders.filter(o => o.customerId === customerId);
};

export const getOrdersByStatus = (status: Order['status']): Order[] => {
  const orders = getOrders();
  return orders.filter(o => o.status === status);
};

// Pickup request management
export const getPickupRequests = (): PickupRequest[] => {
  if (!isClient) return [];
  const stored = localStorage.getItem(PICKUP_REQUESTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const savePickupRequests = (requests: PickupRequest[]): void => {
  if (!isClient) return;
  localStorage.setItem(PICKUP_REQUESTS_KEY, JSON.stringify(requests));
};

export const addPickupRequest = (request: PickupRequest): void => {
  const requests = getPickupRequests();
  requests.push(request);
  savePickupRequests(requests);
};

// User role management
export const getUserRole = (userId: string): 'customer' | 'admin' => {
  if (!isClient) return 'customer';
  const stored = localStorage.getItem(USER_ROLES_KEY);
  const roles = stored ? JSON.parse(stored) : {};
  return roles[userId] || 'customer';
};

export const setUserRole = (userId: string, role: 'customer' | 'admin'): void => {
  if (!isClient) return;
  const stored = localStorage.getItem(USER_ROLES_KEY);
  const roles = stored ? JSON.parse(stored) : {};
  roles[userId] = role;
  localStorage.setItem(USER_ROLES_KEY, JSON.stringify(roles));
};

// Clean up delivered orders older than 3 months
export const cleanupOldOrders = (): void => {
  const orders = getOrders();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const filteredOrders = orders.filter(order => {
    if (order.status === 'delivered' && order.deliveredAt) {
      const deliveredDate = new Date(order.deliveredAt);
      return deliveredDate > threeMonthsAgo;
    }
    return true;
  });
  
  saveOrders(filteredOrders);
};

// Generate unique order number
export const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

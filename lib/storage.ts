import { Order, PickupRequest } from './types';
import { supabase, isSupabaseConfigured, DbOrder } from './supabase';

// Storage keys for localStorage fallback
const ORDERS_KEY = 'door-management-orders';
const PICKUP_REQUESTS_KEY = 'door-management-pickup-requests';
const USER_ROLES_KEY = 'door-management-user-roles';

// Supabase error codes
const SUPABASE_NOT_FOUND_CODE = 'PGRST116';

// Helper to check if we're on the client side
const isClient = typeof window !== 'undefined';

// Helper to convert DB order to app order
const dbOrderToOrder = (dbOrder: DbOrder): Order => ({
  id: dbOrder.id,
  orderNumber: dbOrder.order_number,
  orderMessage: dbOrder.order_message,
  contactPerson: dbOrder.contact_person,
  customerInfo: {
    name: dbOrder.customer_name,
    email: dbOrder.customer_email,
    phone: dbOrder.customer_phone,
    address: dbOrder.customer_address,
  },
  status: dbOrder.status as Order['status'],
  createdAt: dbOrder.created_at,
  updatedAt: dbOrder.updated_at,
  expectedDeliveryDate: dbOrder.expected_delivery_date || undefined,
  rejectionReason: dbOrder.rejection_reason || undefined,
  customerId: dbOrder.customer_id,
  deliveredAt: dbOrder.delivered_at || undefined,
  photoUrl: dbOrder.photo_url || undefined,
});

// Helper to convert app order to DB order
const orderToDbOrder = (order: Order): Partial<DbOrder> => ({
  id: order.id,
  order_number: order.orderNumber,
  order_message: order.orderMessage,
  contact_person: order.contactPerson,
  customer_name: order.customerInfo.name,
  customer_email: order.customerInfo.email,
  customer_phone: order.customerInfo.phone,
  customer_address: order.customerInfo.address,
  status: order.status,
  created_at: order.createdAt,
  updated_at: order.updatedAt,
  expected_delivery_date: order.expectedDeliveryDate,
  rejection_reason: order.rejectionReason,
  customer_id: order.customerId,
  delivered_at: order.deliveredAt,
  photo_url: order.photoUrl,
});

// Order management functions
export const getOrders = async (): Promise<Order[]> => {
  if (!isClient) return [];
  
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data ? data.map(dbOrderToOrder) : [];
    } catch (error) {
      console.error('Error fetching orders from Supabase:', error);
      // Fall back to localStorage
    }
  }
  
  // Fallback to localStorage
  const stored = localStorage.getItem(ORDERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveOrders = async (orders: Order[]): Promise<void> => {
  if (!isClient) return;
  
  // Save to localStorage as fallback
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const addOrder = async (order: Order): Promise<void> => {
  if (!isClient) return;
  
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const dbOrder = orderToDbOrder(order);
      const { error } = await supabase
        .from('orders')
        .insert([dbOrder]);
      
      if (error) throw error;
      return;
    } catch (error) {
      console.error('Error adding order to Supabase:', error);
      // Fall back to localStorage
    }
  }
  
  // Fallback to localStorage
  const orders = await getOrders();
  orders.push(order);
  await saveOrders(orders);
};

export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<void> => {
  if (!isClient) return;
  
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const dbUpdates: Partial<DbOrder> = {};
      if (updates.orderNumber) dbUpdates.order_number = updates.orderNumber;
      if (updates.orderMessage) dbUpdates.order_message = updates.orderMessage;
      if (updates.contactPerson) dbUpdates.contact_person = updates.contactPerson;
      if (updates.customerInfo) {
        if (updates.customerInfo.name) dbUpdates.customer_name = updates.customerInfo.name;
        if (updates.customerInfo.email) dbUpdates.customer_email = updates.customerInfo.email;
        if (updates.customerInfo.phone) dbUpdates.customer_phone = updates.customerInfo.phone;
        if (updates.customerInfo.address) dbUpdates.customer_address = updates.customerInfo.address;
      }
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.expectedDeliveryDate) dbUpdates.expected_delivery_date = updates.expectedDeliveryDate;
      if (updates.rejectionReason) dbUpdates.rejection_reason = updates.rejectionReason;
      if (updates.deliveredAt) dbUpdates.delivered_at = updates.deliveredAt;
      if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl;
      
      dbUpdates.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('orders')
        .update(dbUpdates)
        .eq('id', orderId);
      
      if (error) throw error;
      return;
    } catch (error) {
      console.error('Error updating order in Supabase:', error);
      // Fall back to localStorage
    }
  }
  
  // Fallback to localStorage
  const orders = await getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
    await saveOrders(orders);
  }
};

export const getOrderById = async (orderId: string): Promise<Order | undefined> => {
  if (!isClient) return undefined;
  
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data ? dbOrderToOrder(data) : undefined;
    } catch (error) {
      console.error('Error fetching order from Supabase:', error);
      // Fall back to localStorage
    }
  }
  
  // Fallback to localStorage
  const orders = await getOrders();
  return orders.find(o => o.id === orderId);
};

export const getOrdersByCustomer = async (customerId: string): Promise<Order[]> => {
  if (!isClient) return [];
  
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data ? data.map(dbOrderToOrder) : [];
    } catch (error) {
      console.error('Error fetching customer orders from Supabase:', error);
      // Fall back to localStorage
    }
  }
  
  // Fallback to localStorage
  const orders = await getOrders();
  return orders.filter(o => o.customerId === customerId);
};

export const getOrdersByStatus = async (status: Order['status']): Promise<Order[]> => {
  if (!isClient) return [];
  
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data ? data.map(dbOrderToOrder) : [];
    } catch (error) {
      console.error('Error fetching orders by status from Supabase:', error);
      // Fall back to localStorage
    }
  }
  
  // Fallback to localStorage
  const orders = await getOrders();
  return orders.filter(o => o.status === status);
};

// Pickup request management
export const getPickupRequests = async (): Promise<PickupRequest[]> => {
  if (!isClient) return [];
  
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('pickup_requests')
        .select('*')
        .order('requested_at', { ascending: false });
      
      if (error) throw error;
      return data ? data.map(pr => ({
        id: pr.id,
        customerId: pr.customer_id,
        orderIds: pr.order_ids,
        requestedAt: pr.requested_at,
        status: pr.status as 'pending' | 'completed',
      })) : [];
    } catch (error) {
      console.error('Error fetching pickup requests from Supabase:', error);
      // Fall back to localStorage
    }
  }
  
  // Fallback to localStorage
  const stored = localStorage.getItem(PICKUP_REQUESTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const savePickupRequests = async (requests: PickupRequest[]): Promise<void> => {
  if (!isClient) return;
  
  // Save to localStorage as fallback
  localStorage.setItem(PICKUP_REQUESTS_KEY, JSON.stringify(requests));
};

export const addPickupRequest = async (request: PickupRequest): Promise<void> => {
  if (!isClient) return;
  
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('pickup_requests')
        .insert([{
          id: request.id,
          customer_id: request.customerId,
          order_ids: request.orderIds,
          requested_at: request.requestedAt,
          status: request.status,
        }]);
      
      if (error) throw error;
      return;
    } catch (error) {
      console.error('Error adding pickup request to Supabase:', error);
      // Fall back to localStorage
    }
  }
  
  // Fallback to localStorage
  const requests = await getPickupRequests();
  requests.push(request);
  await savePickupRequests(requests);
};

// User role management
export const getUserRole = async (userId: string): Promise<'customer' | 'admin'> => {
  if (!isClient) return 'customer';
  
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== SUPABASE_NOT_FOUND_CODE) throw error;
      return data ? data.role as 'customer' | 'admin' : 'customer';
    } catch (error) {
      console.error('Error fetching user role from Supabase:', error);
      // Fall back to localStorage
    }
  }
  
  // Fallback to localStorage
  const stored = localStorage.getItem(USER_ROLES_KEY);
  const roles = stored ? JSON.parse(stored) : {};
  return roles[userId] || 'customer';
};

export const setUserRole = async (userId: string, role: 'customer' | 'admin'): Promise<void> => {
  if (!isClient) return;
  
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error setting user role in Supabase:', error);
      // Fall back to localStorage
    }
  }
  
  // Also update localStorage as fallback
  const stored = localStorage.getItem(USER_ROLES_KEY);
  const roles = stored ? JSON.parse(stored) : {};
  roles[userId] = role;
  localStorage.setItem(USER_ROLES_KEY, JSON.stringify(roles));
};

// Clean up delivered orders older than 3 months
export const cleanupOldOrders = async (): Promise<void> => {
  if (!isClient) return;
  
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('status', 'delivered')
        .lt('delivered_at', threeMonthsAgo.toISOString());
      
      if (error) throw error;
      return;
    } catch (error) {
      console.error('Error cleaning up old orders in Supabase:', error);
      // Fall back to localStorage
    }
  }
  
  // Fallback to localStorage
  const orders = await getOrders();
  const filteredOrders = orders.filter(order => {
    if (order.status === 'delivered' && order.deliveredAt) {
      const deliveredDate = new Date(order.deliveredAt);
      return deliveredDate > threeMonthsAgo;
    }
    return true;
  });
  
  await saveOrders(filteredOrders);
};

// Generate unique order number
export const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

// Photo upload to Supabase storage
export const uploadOrderPhoto = async (file: File, orderId: string): Promise<string | null> => {
  if (!isClient) return null;
  
  // Only upload to Supabase if configured
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables to enable photo uploads.');
    return null;
  }
  
  try {
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('order-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data } = supabase.storage
      .from('order-photos')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading photo to Supabase:', error);
    return null;
  }
};

// Delete photo from Supabase storage
export const deleteOrderPhoto = async (photoUrl: string): Promise<boolean> => {
  if (!isClient) return false;
  
  // Only delete from Supabase if configured
  if (!isSupabaseConfigured()) {
    return false;
  }
  
  try {
    // Extract file path from URL
    const urlParts = photoUrl.split('/order-photos/');
    if (urlParts.length < 2) return false;
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from('order-photos')
      .remove([filePath]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting photo from Supabase:', error);
    return false;
  }
};

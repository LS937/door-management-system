// Order status types
export type OrderStatus = 
  | 'pending'       // New order, waiting for admin action
  | 'accepted'      // Admin accepted, under processing
  | 'prepared'      // Order is ready for pickup
  | 'pickup_requested' // Customer requested pickup
  | 'delivered'     // Order has been delivered
  | 'rejected';     // Admin rejected the order

// Order interface
export interface Order {
  id: string;
  orderNumber: string;
  orderMessage: string;
  contactPerson: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  
  // Admin actions
  expectedDeliveryDate?: string;
  rejectionReason?: string;
  
  // Customer ID (from Clerk)
  customerId: string;
  
  // Delivery tracking
  deliveredAt?: string;
  
  // Photo upload
  photoUrl?: string;
}

// User role type
export type UserRole = 'customer' | 'admin';

// Pickup request interface
export interface PickupRequest {
  id: string;
  customerId: string;
  orderIds: string[];
  requestedAt: string;
  status: 'pending' | 'completed';
}

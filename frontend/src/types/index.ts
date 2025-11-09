// User Types
export type UserRole = 'owner' | 'provider';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyOwner extends User {
  role: 'owner';
  properties: string[]; // Property IDs
  phoneNumber?: string;
}

export interface ServiceProvider extends User {
  role: 'provider';
  skills: string[];
  hourlyRate: number;
  serviceRadius: number; // in miles
  availability: AvailabilitySchedule;
  rating: number;
  completedJobs: number;
  bio?: string;
  phoneNumber?: string;
}

export interface AvailabilitySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;
}

// Property Types
export interface Property {
  id: string;
  ownerId: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  photos: PropertyPhoto[];
  description: string;
  checkInTime: string;
  checkOutTime: string;
  cleaningFee: number;
  status: 'active' | 'inactive' | 'maintenance';
  connectedPlatforms: ConnectedPlatform[];
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'condo'
  | 'townhouse'
  | 'villa'
  | 'cabin'
  | 'other';

export interface PropertyPhoto {
  id: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
}

export interface ConnectedPlatform {
  platform: 'airbnb' | 'vrbo' | 'booking';
  listingId: string;
  isActive: boolean;
  lastSyncedAt?: Date;
}

// Booking Types
export interface Booking {
  id: string;
  propertyId: string;
  ownerId: string; // Property owner ID for easier querying and security
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  numberOfGuests: number;
  checkInDate: Date;
  checkOutDate: Date;
  bookingSource: BookingSource;
  externalBookingId?: string;
  totalPrice: number;
  status: BookingStatus;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingSource = 'airbnb' | 'vrbo' | 'booking' | 'direct';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

// Task Types
export interface Task {
  id: string;
  propertyId: string;
  bookingId?: string;
  title: string;
  description: string;
  taskType: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  isPublic: boolean; // true = job for providers, false = private note for owner
  assignedTo?: string; // Service Provider ID
  createdBy: string; // Property Owner ID
  scheduledFor: Date;
  estimatedDuration?: number; // in minutes (for public jobs)
  payRate?: number; // for public jobs
  location?: string; // Address or location details
  completedAt?: Date;
  photos?: TaskPhoto[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskType =
  | 'cleaning'
  | 'maintenance'
  | 'inspection'
  | 'check_in'
  | 'check_out'
  | 'laundry'
  | 'restocking'
  | 'other';

export type TaskStatus =
  | 'posted'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskPhoto {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: Date;
}

// Message Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  lastMessage?: Message;
  updatedAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export type NotificationType =
  | 'new_booking'
  | 'booking_cancelled'
  | 'booking_updated'
  | 'task_assigned'
  | 'task_completed'
  | 'new_message'
  | 'payment_received';

// Analytics Types
export interface EarningsSummary {
  providerId: string;
  totalEarnings: number;
  completedJobs: number;
  averageRating: number;
  earnings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    allTime: number;
  };
}

export interface PropertyAnalytics {
  propertyId: string;
  occupancyRate: number;
  totalBookings: number;
  totalRevenue: number;
  averageNightlyRate: number;
  upcomingBookings: number;
}

// API Integration Types
export interface PlatformSyncStatus {
  platform: 'airbnb' | 'vrbo' | 'booking';
  isConnected: boolean;
  lastSyncedAt?: Date;
  syncStatus: 'idle' | 'syncing' | 'error';
  errorMessage?: string;
}

export interface BookingSyncResult {
  newBookings: number;
  updatedBookings: number;
  cancelledBookings: number;
  errors: string[];
}

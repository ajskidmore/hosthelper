import {
  Property,
  Booking,
  Task,
  PropertyOwner,
  ServiceProvider,
  BookingStatus,
  TaskStatus,
  TaskType,
  PropertyType,
} from '../types';

// Helper to generate random dates
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Mock Property Owners
export const mockPropertyOwners: PropertyOwner[] = [
  {
    id: 'owner-1',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    role: 'owner',
    properties: ['prop-1', 'prop-2'],
    phoneNumber: '+1-555-0101',
    photoURL: 'https://i.pravatar.cc/150?img=12',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'owner-2',
    email: 'sarah.johnson@example.com',
    displayName: 'Sarah Johnson',
    role: 'owner',
    properties: ['prop-3'],
    phoneNumber: '+1-555-0102',
    photoURL: 'https://i.pravatar.cc/150?img=47',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20'),
  },
];

// Mock Service Providers
export const mockServiceProviders: ServiceProvider[] = [
  {
    id: 'provider-1',
    email: 'mike.cleaner@example.com',
    displayName: 'Mike Wilson',
    role: 'provider',
    skills: ['cleaning', 'laundry', 'restocking'],
    hourlyRate: 35,
    serviceRadius: 15,
    availability: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [{ start: '10:00', end: '14:00' }],
      sunday: [],
    },
    rating: 4.8,
    completedJobs: 127,
    bio: 'Professional cleaner with 5+ years of experience in short-term rental turnovers.',
    phoneNumber: '+1-555-0201',
    photoURL: 'https://i.pravatar.cc/150?img=33',
    createdAt: new Date('2023-11-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'provider-2',
    email: 'lisa.maintenance@example.com',
    displayName: 'Lisa Martinez',
    role: 'provider',
    skills: ['maintenance', 'inspection', 'cleaning'],
    hourlyRate: 45,
    serviceRadius: 20,
    availability: {
      monday: [{ start: '08:00', end: '16:00' }],
      tuesday: [{ start: '08:00', end: '16:00' }],
      wednesday: [{ start: '08:00', end: '16:00' }],
      thursday: [{ start: '08:00', end: '16:00' }],
      friday: [{ start: '08:00', end: '16:00' }],
      saturday: [],
      sunday: [],
    },
    rating: 4.9,
    completedJobs: 89,
    bio: 'Experienced handywoman specializing in rental property maintenance and quick repairs.',
    phoneNumber: '+1-555-0202',
    photoURL: 'https://i.pravatar.cc/150?img=44',
    createdAt: new Date('2023-12-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'provider-3',
    email: 'david.host@example.com',
    displayName: 'David Chen',
    role: 'provider',
    skills: ['check_in', 'check_out', 'inspection'],
    hourlyRate: 30,
    serviceRadius: 10,
    availability: {
      monday: [{ start: '14:00', end: '22:00' }],
      tuesday: [{ start: '14:00', end: '22:00' }],
      wednesday: [{ start: '14:00', end: '22:00' }],
      thursday: [{ start: '14:00', end: '22:00' }],
      friday: [{ start: '14:00', end: '22:00' }],
      saturday: [{ start: '09:00', end: '22:00' }],
      sunday: [{ start: '09:00', end: '22:00' }],
    },
    rating: 4.7,
    completedJobs: 203,
    bio: 'Friendly and reliable host assistant. Available for guest check-ins and property inspections.',
    phoneNumber: '+1-555-0203',
    photoURL: 'https://i.pravatar.cc/150?img=15',
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

// Mock Properties
export const mockProperties: Property[] = [
  {
    id: 'prop-1',
    ownerId: 'owner-1',
    name: 'Downtown Luxury Apartment',
    address: {
      street: '123 Main Street, Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
    },
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    amenities: [
      'WiFi',
      'Kitchen',
      'Washer',
      'Dryer',
      'Air Conditioning',
      'Heating',
      'TV',
      'Parking',
      'Gym',
    ],
    photos: [
      {
        id: 'photo-1',
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        isPrimary: true,
        order: 1,
      },
      {
        id: 'photo-2',
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        isPrimary: false,
        order: 2,
      },
    ],
    description:
      'Beautiful 2-bedroom apartment in the heart of downtown San Francisco. Modern amenities, stunning city views, and walking distance to restaurants and attractions.',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    cleaningFee: 100,
    status: 'active',
    connectedPlatforms: [
      {
        platform: 'airbnb',
        listingId: 'airbnb-123456',
        isActive: true,
        lastSyncedAt: new Date(),
      },
      {
        platform: 'vrbo',
        listingId: 'vrbo-789012',
        isActive: true,
        lastSyncedAt: new Date(),
      },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'prop-2',
    ownerId: 'owner-1',
    name: 'Cozy Beach House',
    address: {
      street: '456 Ocean View Drive',
      city: 'Santa Monica',
      state: 'CA',
      zipCode: '90401',
      country: 'USA',
      coordinates: {
        lat: 34.0195,
        lng: -118.4912,
      },
    },
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 2.5,
    maxGuests: 6,
    amenities: [
      'WiFi',
      'Kitchen',
      'Washer',
      'Dryer',
      'Air Conditioning',
      'Heating',
      'TV',
      'Free Parking',
      'Beach Access',
      'BBQ Grill',
      'Patio',
    ],
    photos: [
      {
        id: 'photo-3',
        url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
        isPrimary: true,
        order: 1,
      },
      {
        id: 'photo-4',
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        isPrimary: false,
        order: 2,
      },
    ],
    description:
      'Charming beach house with direct beach access. Perfect for families, featuring a spacious patio and BBQ area. Enjoy stunning ocean views from the master bedroom.',
    checkInTime: '16:00',
    checkOutTime: '10:00',
    cleaningFee: 150,
    status: 'active',
    connectedPlatforms: [
      {
        platform: 'airbnb',
        listingId: 'airbnb-654321',
        isActive: true,
        lastSyncedAt: new Date(),
      },
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'prop-3',
    ownerId: 'owner-2',
    name: 'Mountain View Cabin',
    address: {
      street: '789 Pine Tree Lane',
      city: 'Lake Tahoe',
      state: 'CA',
      zipCode: '96150',
      country: 'USA',
      coordinates: {
        lat: 39.0968,
        lng: -120.0324,
      },
    },
    propertyType: 'cabin',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    amenities: [
      'WiFi',
      'Kitchen',
      'Heating',
      'Fireplace',
      'TV',
      'Free Parking',
      'Hot Tub',
      'Ski Storage',
    ],
    photos: [
      {
        id: 'photo-5',
        url: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800',
        isPrimary: true,
        order: 1,
      },
    ],
    description:
      'Rustic mountain cabin with modern amenities. Perfect for ski trips or summer getaways. Features a private hot tub and stunning mountain views.',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    cleaningFee: 120,
    status: 'active',
    connectedPlatforms: [
      {
        platform: 'vrbo',
        listingId: 'vrbo-111222',
        isActive: true,
        lastSyncedAt: new Date(),
      },
    ],
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20'),
  },
];

// Generate mock bookings
const generateBookings = (): Booking[] => {
  const bookings: Booking[] = [];
  const now = new Date();
  const statuses: BookingStatus[] = ['confirmed', 'checked_in', 'checked_out', 'pending'];
  const sources = ['airbnb', 'vrbo', 'direct'] as const;
  const guestNames = [
    'Robert Smith',
    'Emily Davis',
    'Michael Brown',
    'Jessica Wilson',
    'Daniel Taylor',
    'Ashley Anderson',
  ];

  mockProperties.forEach((property, propIndex) => {
    // Generate 3 past bookings
    for (let i = 0; i < 3; i++) {
      const checkIn = addDays(now, -60 + i * 15);
      const checkOut = addDays(checkIn, 3 + Math.floor(Math.random() * 4));
      bookings.push({
        id: `booking-past-${propIndex}-${i}`,
        propertyId: property.id,
        guestName: guestNames[Math.floor(Math.random() * guestNames.length)],
        guestEmail: `guest${propIndex}${i}@example.com`,
        guestPhone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        numberOfGuests: Math.floor(Math.random() * property.maxGuests) + 1,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        bookingSource: sources[Math.floor(Math.random() * sources.length)],
        externalBookingId: `ext-${Math.random().toString(36).substring(7)}`,
        totalPrice: 150 + Math.floor(Math.random() * 500),
        status: 'checked_out',
        createdAt: addDays(checkIn, -7),
        updatedAt: checkOut,
      });
    }

    // Generate 2 upcoming bookings
    for (let i = 0; i < 2; i++) {
      const checkIn = addDays(now, 5 + i * 10);
      const checkOut = addDays(checkIn, 3 + Math.floor(Math.random() * 4));
      bookings.push({
        id: `booking-future-${propIndex}-${i}`,
        propertyId: property.id,
        guestName: guestNames[Math.floor(Math.random() * guestNames.length)],
        guestEmail: `guest${propIndex}future${i}@example.com`,
        guestPhone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        numberOfGuests: Math.floor(Math.random() * property.maxGuests) + 1,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        bookingSource: sources[Math.floor(Math.random() * sources.length)],
        externalBookingId: `ext-${Math.random().toString(36).substring(7)}`,
        totalPrice: 150 + Math.floor(Math.random() * 500),
        status: 'confirmed',
        createdAt: addDays(checkIn, -14),
        updatedAt: addDays(checkIn, -14),
      });
    }
  });

  return bookings;
};

export const mockBookings = generateBookings();

// Generate mock tasks
const generateTasks = (): Task[] => {
  const tasks: Task[] = [];
  const now = new Date();
  const taskTypes: TaskType[] = ['cleaning', 'maintenance', 'inspection', 'check_in', 'check_out'];
  const priorities = ['low', 'medium', 'high', 'urgent'] as const;

  mockBookings.forEach((booking, index) => {
    // Pre-checkin cleaning task
    const cleaningTask: Task = {
      id: `task-cleaning-${index}`,
      propertyId: booking.propertyId,
      bookingId: booking.id,
      title: 'Pre-arrival Cleaning',
      description: `Deep cleaning and preparation for guest arrival. ${booking.numberOfGuests} guests expected.`,
      taskType: 'cleaning',
      status: booking.checkInDate < now ? 'completed' : 'assigned',
      priority: 'high',
      assignedTo: 'provider-1',
      createdBy: mockProperties.find((p) => p.id === booking.propertyId)?.ownerId || 'owner-1',
      scheduledFor: addDays(booking.checkInDate, -1),
      estimatedDuration: 120,
      payRate: 70,
      completedAt: booking.checkInDate < now ? addDays(booking.checkInDate, -1) : undefined,
      createdAt: addDays(booking.checkInDate, -7),
      updatedAt: addDays(booking.checkInDate, -7),
    };
    tasks.push(cleaningTask);

    // Check-in task if upcoming
    if (booking.checkInDate > now && booking.checkInDate < addDays(now, 7)) {
      tasks.push({
        id: `task-checkin-${index}`,
        propertyId: booking.propertyId,
        bookingId: booking.id,
        title: 'Guest Check-in Assistance',
        description: `Meet guest at property for check-in. Provide tour and answer questions.`,
        taskType: 'check_in',
        status: 'posted',
        priority: 'medium',
        createdBy: mockProperties.find((p) => p.id === booking.propertyId)?.ownerId || 'owner-1',
        scheduledFor: booking.checkInDate,
        estimatedDuration: 30,
        payRate: 25,
        createdAt: addDays(booking.checkInDate, -5),
        updatedAt: addDays(booking.checkInDate, -5),
      });
    }
  });

  // Add some standalone maintenance tasks
  mockProperties.forEach((property, index) => {
    tasks.push({
      id: `task-maint-${index}`,
      propertyId: property.id,
      title: 'Monthly Inspection',
      description: 'Routine monthly property inspection. Check all systems and report any issues.',
      taskType: 'inspection',
      status: 'posted',
      priority: 'low',
      createdBy: property.ownerId,
      scheduledFor: addDays(now, 7),
      estimatedDuration: 60,
      payRate: 45,
      createdAt: now,
      updatedAt: now,
    });
  });

  return tasks;
};

export const mockTasks = generateTasks();

// Export all mock data
export const mockData = {
  propertyOwners: mockPropertyOwners,
  serviceProviders: mockServiceProviders,
  properties: mockProperties,
  bookings: mockBookings,
  tasks: mockTasks,
};

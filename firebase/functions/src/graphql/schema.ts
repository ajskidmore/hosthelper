import gql from 'graphql-tag';

export const typeDefs = gql`
  scalar Date

  type Query {
    # User queries
    user(id: ID!): User
    currentUser: User

    # Property queries
    property(id: ID!): Property
    properties(ownerId: ID): [Property!]!

    # Booking queries
    booking(id: ID!): Booking
    bookings(propertyId: ID, status: BookingStatus): [Booking!]!
    upcomingBookings(propertyId: ID): [Booking!]!

    # Task queries
    task(id: ID!): Task
    tasks(propertyId: ID, status: TaskStatus, assignedTo: ID): [Task!]!
    availableTasks: [Task!]!

    # Message queries
    conversation(id: ID!): Conversation
    conversations(userId: ID!): [Conversation!]!
    messages(conversationId: ID!): [Message!]!

    # Notification queries
    notifications(userId: ID!): [Notification!]!
    unreadNotifications(userId: ID!): [Notification!]!

    # Analytics queries
    propertyAnalytics(propertyId: ID!): PropertyAnalytics
    providerEarnings(providerId: ID!): EarningsSummary
  }

  type Mutation {
    # Property mutations
    createProperty(input: CreatePropertyInput!): Property!
    updateProperty(id: ID!, input: UpdatePropertyInput!): Property!
    deleteProperty(id: ID!): Boolean!

    # Booking mutations
    createBooking(input: CreateBookingInput!): Booking!
    updateBooking(id: ID!, input: UpdateBookingInput!): Booking!
    cancelBooking(id: ID!): Booking!

    # Task mutations
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    assignTask(taskId: ID!, providerId: ID!): Task!
    acceptTask(taskId: ID!): Task!
    completeTask(taskId: ID!, notes: String, photos: [String!]): Task!

    # Message mutations
    sendMessage(input: SendMessageInput!): Message!
    markMessageAsRead(messageId: ID!): Message!

    # Notification mutations
    markNotificationAsRead(notificationId: ID!): Notification!
    markAllNotificationsAsRead(userId: ID!): Boolean!

    # User mutations
    updateUserProfile(input: UpdateUserProfileInput!): User!

    # Platform sync mutations
    syncPlatformBookings(propertyId: ID!, platform: Platform!): BookingSyncResult!
  }

  type Subscription {
    bookingCreated(propertyId: ID!): Booking!
    bookingUpdated(propertyId: ID!): Booking!
    taskCreated(propertyId: ID): Task!
    taskUpdated(taskId: ID!): Task!
    messageReceived(userId: ID!): Message!
    notificationReceived(userId: ID!): Notification!
  }

  # Types
  type User {
    id: ID!
    email: String!
    displayName: String!
    role: UserRole!
    photoURL: String
    phoneNumber: String
    createdAt: Date!
    updatedAt: Date!

    # Owner-specific fields
    properties: [Property!]

    # Provider-specific fields
    skills: [String!]
    hourlyRate: Float
    serviceRadius: Float
    rating: Float
    completedJobs: Int
    bio: String
  }

  type Property {
    id: ID!
    ownerId: ID!
    owner: User!
    name: String!
    address: Address!
    propertyType: PropertyType!
    bedrooms: Int!
    bathrooms: Float!
    maxGuests: Int!
    amenities: [String!]!
    photos: [PropertyPhoto!]!
    description: String!
    checkInTime: String!
    checkOutTime: String!
    cleaningFee: Float!
    status: PropertyStatus!
    connectedPlatforms: [ConnectedPlatform!]!
    createdAt: Date!
    updatedAt: Date!

    # Related data
    bookings: [Booking!]!
    tasks: [Task!]!
  }

  type Address {
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
    coordinates: Coordinates
  }

  type Coordinates {
    lat: Float!
    lng: Float!
  }

  type PropertyPhoto {
    id: ID!
    url: String!
    caption: String
    isPrimary: Boolean!
    order: Int!
  }

  type ConnectedPlatform {
    platform: Platform!
    listingId: String!
    isActive: Boolean!
    lastSyncedAt: Date
  }

  type Booking {
    id: ID!
    propertyId: ID!
    property: Property!
    guestName: String!
    guestEmail: String!
    guestPhone: String
    numberOfGuests: Int!
    checkInDate: Date!
    checkOutDate: Date!
    bookingSource: Platform!
    externalBookingId: String
    totalPrice: Float!
    status: BookingStatus!
    specialRequests: String
    createdAt: Date!
    updatedAt: Date!

    # Related tasks
    tasks: [Task!]!
  }

  type Task {
    id: ID!
    propertyId: ID!
    property: Property!
    bookingId: ID
    booking: Booking
    title: String!
    description: String!
    taskType: TaskType!
    status: TaskStatus!
    priority: TaskPriority!
    assignedTo: ID
    assignedProvider: User
    createdBy: ID!
    creator: User!
    scheduledFor: Date!
    estimatedDuration: Int!
    payRate: Float!
    completedAt: Date
    photos: [TaskPhoto!]
    notes: String
    createdAt: Date!
    updatedAt: Date!
  }

  type TaskPhoto {
    id: ID!
    url: String!
    caption: String
    uploadedAt: Date!
  }

  type Message {
    id: ID!
    conversationId: ID!
    senderId: ID!
    sender: User!
    recipientId: ID!
    recipient: User!
    content: String!
    isRead: Boolean!
    createdAt: Date!
  }

  type Conversation {
    id: ID!
    participants: [User!]!
    lastMessage: Message
    updatedAt: Date!
  }

  type Notification {
    id: ID!
    userId: ID!
    type: NotificationType!
    title: String!
    message: String!
    isRead: Boolean!
    createdAt: Date!
  }

  type PropertyAnalytics {
    propertyId: ID!
    occupancyRate: Float!
    totalBookings: Int!
    totalRevenue: Float!
    averageNightlyRate: Float!
    upcomingBookings: Int!
  }

  type EarningsSummary {
    providerId: ID!
    totalEarnings: Float!
    completedJobs: Int!
    averageRating: Float!
    earnings: Earnings!
  }

  type Earnings {
    today: Float!
    thisWeek: Float!
    thisMonth: Float!
    allTime: Float!
  }

  type BookingSyncResult {
    newBookings: Int!
    updatedBookings: Int!
    cancelledBookings: Int!
    errors: [String!]!
  }

  # Inputs
  input CreatePropertyInput {
    name: String!
    address: AddressInput!
    propertyType: PropertyType!
    bedrooms: Int!
    bathrooms: Float!
    maxGuests: Int!
    amenities: [String!]!
    description: String!
    checkInTime: String!
    checkOutTime: String!
    cleaningFee: Float!
  }

  input UpdatePropertyInput {
    name: String
    address: AddressInput
    propertyType: PropertyType
    bedrooms: Int
    bathrooms: Float
    maxGuests: Int
    amenities: [String!]
    description: String
    checkInTime: String
    checkOutTime: String
    cleaningFee: Float
    status: PropertyStatus
  }

  input AddressInput {
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
  }

  input CreateBookingInput {
    propertyId: ID!
    guestName: String!
    guestEmail: String!
    guestPhone: String
    numberOfGuests: Int!
    checkInDate: Date!
    checkOutDate: Date!
    bookingSource: Platform!
    totalPrice: Float!
    specialRequests: String
  }

  input UpdateBookingInput {
    guestName: String
    guestEmail: String
    guestPhone: String
    numberOfGuests: Int
    checkInDate: Date
    checkOutDate: Date
    status: BookingStatus
    specialRequests: String
  }

  input CreateTaskInput {
    propertyId: ID!
    bookingId: ID
    title: String!
    description: String!
    taskType: TaskType!
    priority: TaskPriority!
    scheduledFor: Date!
    estimatedDuration: Int!
    payRate: Float!
  }

  input UpdateTaskInput {
    title: String
    description: String
    status: TaskStatus
    priority: TaskPriority
    scheduledFor: Date
    estimatedDuration: Int
    payRate: Float
    notes: String
  }

  input SendMessageInput {
    recipientId: ID!
    content: String!
  }

  input UpdateUserProfileInput {
    displayName: String
    phoneNumber: String
    photoURL: String
    bio: String
    skills: [String!]
    hourlyRate: Float
    serviceRadius: Float
  }

  # Enums
  enum UserRole {
    owner
    provider
  }

  enum PropertyType {
    apartment
    house
    condo
    townhouse
    villa
    cabin
    other
  }

  enum PropertyStatus {
    active
    inactive
    maintenance
  }

  enum Platform {
    airbnb
    vrbo
    booking
    direct
  }

  enum BookingStatus {
    pending
    confirmed
    checked_in
    checked_out
    cancelled
  }

  enum TaskType {
    cleaning
    maintenance
    inspection
    check_in
    check_out
    laundry
    restocking
    other
  }

  enum TaskStatus {
    posted
    assigned
    in_progress
    completed
    cancelled
  }

  enum TaskPriority {
    low
    medium
    high
    urgent
  }

  enum NotificationType {
    new_booking
    booking_cancelled
    booking_updated
    task_assigned
    task_completed
    new_message
    payment_received
  }
`;

# HostHelper - Architecture & Tech Stack Documentation

## Executive Summary

HostHelper is a property management platform built with **React + TypeScript + Firebase**. Despite having GraphQL/Apollo and Python dependencies installed, **these are NOT used** in the application. The app uses Firebase SDK directly for all backend operations.

---

## Tech Stack (What's Actually Used)

### Frontend ✅
- **React 18.2** - UI library
- **TypeScript 5.3** - Type safety
- **Vite 5.1** - Build tool (fast dev server, optimized builds)
- **Material-UI 5.15** - Component library
- **React Router 6.22** - Client-side routing
- **Recharts 2.12** - Data visualization

### Backend ✅
- **Firebase Auth** - User authentication (Email/Password + Google OAuth)
- **Firebase Firestore** - NoSQL database (real-time data sync)
- **Firebase Storage** - File storage (images, documents)
- **Firestore Security Rules** - Server-side data access control

### State Management ✅
- **React Context** - Global auth state (AuthContext)
- **useState/useEffect** - Component state
- **Custom Hooks** - Data fetching & business logic

---

## Tech Stack (Installed But NOT Used)

### ❌ GraphQL & Apollo Client
**Status**: Completely unused - 300KB+ wasted in bundle

**Evidence**:
```json
// package.json
"@apollo/client": "^3.9.5",  // NEVER IMPORTED
"graphql": "^16.8.1",         // NEVER IMPORTED
```

**Found 1 file**: `frontend/src/graphql/client.ts` - Apollo client configuration, but NEVER imported anywhere

**Recommendation**:
```bash
cd frontend
npm uninstall @apollo/client graphql
```
This will save ~300KB in production bundle.

### ❌ Zustand
**Status**: Installed but never used

**Evidence**:
```json
"zustand": "^4.5.0"  // NEVER IMPORTED
```

**Recommendation**:
```bash
npm uninstall zustand
```

### ❌ Python FastAPI Service
**Status**: Built but never integrated

**Location**: `/python-services/booking-processor/main.py`

**What it does** (theoretically):
- Mock booking syncs from Airbnb/Vrbo/Booking.com
- Occupancy calculations
- Analytics processing

**Why it's not used**:
- Frontend makes zero API calls to Python service
- No endpoints referenced in React code
- Service would need to be deployed separately (Cloud Run, etc.)

**Recommendation**: Either integrate it or remove it

---

## Actual Data Flow

```
User Action (React Component)
    ↓
Custom Hook (useBookings, useTasks, useProperties)
    ↓
Firebase SDK (collection(), doc(), query())
    ↓
Firestore Security Rules (validate access)
    ↓
Firestore Database
    ↓
Real-time Listener (onSnapshot)
    ↓
Hook updates state
    ↓
React re-renders UI
```

**No GraphQL layer** - This is actually a good architectural choice for this use case because:
1. Firebase SDK is lightweight and optimized
2. Real-time updates work seamlessly
3. Security rules handle authorization
4. No need for separate GraphQL server

---

## Authentication Architecture

### Flow:
1. User signs in (Email/Password or Google)
2. Firebase Auth creates session
3. `AuthContext` listens to auth state (`onAuthStateChanged`)
4. Fetch user document from Firestore (`/users/{uid}`)
5. Store user data in React Context
6. All components access via `useAuth()` hook

### Multi-Role System:
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  roles: ('owner' | 'provider')[];    // User can have multiple roles
  currentRole: 'owner' | 'provider';  // Currently active role
}
```

**Users can**:
- Sign up as owner OR provider
- Add additional role later
- Switch between roles instantly

---

## Database Schema (Firestore)

### Collections:

#### `/users/{userId}`
```typescript
{
  email: string;
  displayName: string;
  roles: ['owner'] | ['provider'] | ['owner', 'provider'];
  currentRole: 'owner' | 'provider';
  properties: string[];  // Property IDs (for owners)
  skills: string[];      // Skills list (for providers)
  createdAt: Timestamp;
}
```

#### `/properties/{propertyId}`
```typescript
{
  ownerId: string;       // User ID of owner
  name: string;
  address: {...};
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  status: 'active' | 'inactive';
  createdAt: Timestamp;
}
```

#### `/bookings/{bookingId}` ⚠️ RECENTLY UPDATED
```typescript
{
  propertyId: string;
  ownerId: string;       // ✅ NEW FIELD - for efficient querying
  guestName: string;
  guestEmail: string;
  checkInDate: Timestamp;
  checkOutDate: Timestamp;
  numberOfGuests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  bookingSource: 'airbnb' | 'vrbo' | 'booking' | 'direct';
  createdAt: Timestamp;
}
```

**Why `ownerId` was added**:
- Previously used `get()` in security rules to look up property owner
- This caused query failures and bookings disappearing
- Now ownerId is stored directly for O(1) access control

#### `/tasks/{taskId}`
```typescript
{
  propertyId: string;
  createdBy: string;     // Owner ID
  assignedTo?: string;   // Provider ID (if assigned)
  title: string;
  description: string;
  taskType: 'cleaning' | 'maintenance' | 'inspection' | ...;
  status: 'posted' | 'assigned' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isPublic: boolean;     // true = job for providers, false = internal note
  payRate?: number;      // Required for public jobs
  scheduledFor: Timestamp;
  createdAt: Timestamp;
}
```

#### `/messages/{messageId}`
```typescript
{
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: Timestamp;
}
```

#### `/conversations/{conversationId}`
```typescript
{
  participants: [userId1, userId2];
  lastMessage?: Message;
  updatedAt: Timestamp;
}
```

---

## Security Rules Strategy

### Before (Problematic):
```javascript
// ❌ BAD - Caused bookings to disappear
allow read: if get(/databases/.../properties/$(resource.data.propertyId)).data.ownerId == request.auth.uid;
```

**Problem**: `get()` calls don't work well with queries/listeners

### After (Fixed):
```javascript
// ✅ GOOD - Direct field check
allow read: if resource.data.ownerId == request.auth.uid;
```

**Benefit**: Instant access control, works with all query types

---

## Custom Hooks Architecture

### Data Fetching Hooks:
- `useAuth()` - Current user & auth methods
- `useProperties()` - User's properties
- `useBookings(propertyId?)` - Bookings with optional property filter
- `useTasks()` - Tasks/jobs for current user
- `useAvailableJobs()` - Public jobs (provider view)
- `useMessages()` - Messages for conversations
- `useConversations()` - User's conversations

### Base Hooks:
- `useFirestore<T>()` - Generic CRUD operations
- `useFirestoreQuery<T>()` - Real-time query subscriptions

**Pattern**:
```typescript
// Example: useBookings
export function useBookings(propertyId?: string) {
  const { user } = useAuth();

  // Build query
  const constraints = [
    where('ownerId', '==', user.id),
    propertyId ? where('propertyId', '==', propertyId) : null,
    orderBy('checkInDate', 'desc')
  ].filter(Boolean);

  // Subscribe to real-time updates
  const { documents, loading, error } = useFirestoreQuery('bookings', constraints);

  return { bookings: documents, loading, error, ... };
}
```

---

## Key Features Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| **Authentication** | ✅ Complete | Email + Google OAuth |
| **Multi-role support** | ✅ Complete | Owner + Provider roles |
| **Property Management** | ✅ Complete | CRUD + photos + amenities |
| **Booking System** | ✅ Complete | Calendar + table view |
| **Task/Job Management** | ✅ Complete | Public jobs + private notes |
| **Job Marketplace** | ✅ Complete | Providers can browse/accept |
| **Messaging System** | ✅ Complete | Owner ↔ Provider chat |
| **Earnings Tracking** | ✅ Complete | Provider job history |
| **Role Switching** | ✅ Complete | Instant switch between roles |
| **Platform Integration** | ❌ Not Started | Airbnb/Vrbo API (Python service exists but not connected) |
| **Notifications** | ❌ Not Started | Real-time in-app notifications |
| **Payment Processing** | ❌ Not Started | Stripe integration |

---

## Recent Bug Fixes

### Bug #1: Bookings Disappearing After Creation
**Cause**: Security rules using `get()` calls incompatible with queries

**Fix**: Added `ownerId` field to bookings, updated security rules

**Files Changed**:
- `types/index.ts` - Added `ownerId` to Booking interface
- `BookingDialog.tsx` - Include `ownerId` when creating bookings
- `useBookings.ts` - Query by `ownerId` instead of property lookup
- `firestore.rules` - Direct field check instead of `get()`

### Bug #2: Add Booking Button Disabled (CURRENT)
**Cause**: Race condition between:
1. Properties loading
2. Auto-select useEffect
3. Button disabled logic checking `selectedPropertyId === 'all'`

**Status**: Currently being fixed

---

## Performance Optimizations Needed

### 1. Remove Unused Dependencies
```bash
# Save ~310KB
npm uninstall @apollo/client graphql zustand
```

### 2. Add Firestore Composite Index
For bookings query: `(ownerId ASC, checkInDate DESC)`

Firebase will prompt you to create this when you first run the query.

### 3. Implement Code Splitting
```typescript
// Lazy load routes
const OwnerDashboard = lazy(() => import('./pages/owner/Dashboard'));
const ProviderDashboard = lazy(() => import('./pages/provider/Dashboard'));
```

### 4. Optimize Bundle
- Use production build for Firebase SDK
- Enable gzip/brotli compression
- Consider using Firebase Hosting CDN

---

## Deployment Architecture

```
Frontend (React + Vite)
  ↓
Firebase Hosting (CDN)
  ↓
Firebase Services:
  - Auth
  - Firestore
  - Storage
  - (Functions - not currently used)

Python Service (optional):
  - Cloud Run or App Engine
  - Would need separate deployment
```

**Current Deployment**: Only Firebase is needed

**Future**: If Python service is integrated, deploy to Google Cloud Run

---

## Environment Variables

Required in `frontend/.env`:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## GraphQL & Python - Final Verdict

### GraphQL/Apollo:
**Verdict**: **REMOVE** - Not used, wasting 300KB

**Why it's not needed**:
- Firebase SDK handles all data fetching
- Real-time updates work out of the box
- Security rules provide authorization
- No complex nested queries needed
- Simpler architecture is better for this use case

### Python Service:
**Verdict**: **INTEGRATE OR REMOVE**

**If keeping it**:
1. Deploy to Cloud Run
2. Add API endpoints in React
3. Use for platform integrations (Airbnb/Vrbo)
4. Analytics calculations

**If removing it**:
- Can do basic analytics in Firebase Functions (Node.js)
- Platform integrations can wait until needed
- Reduces deployment complexity

---

## Summary

**Actual Tech Stack**: React + TypeScript + Firebase (that's it!)

**Unused Dependencies**: GraphQL, Apollo, Zustand, Python service

**Architecture**: Clean, simple, effective - Firebase SDK directly from React hooks

**Recommendation**: Remove unused dependencies to reduce bundle size and complexity

---

## Next Steps

1. ✅ Fix Add Booking button issue
2. ✅ Add Firestore composite index when prompted
3. ⏳ Remove unused dependencies
4. ⏳ Decide on Python service fate
5. ⏳ Add code splitting for routes
6. ⏳ Implement push notifications (Firebase Cloud Messaging)
7. ⏳ Add payment processing (Stripe)

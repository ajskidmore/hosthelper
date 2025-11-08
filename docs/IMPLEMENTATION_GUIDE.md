# HostHelper Implementation Guide

This document outlines the next steps to complete the full implementation of HostHelper.

## ✅ Completed

- [x] Project structure and configuration
- [x] Firebase setup (Firestore, Auth, Functions)
- [x] GraphQL schema definition
- [x] React application with routing
- [x] Material-UI theme and branding
- [x] Authentication system (login, register, OAuth)
- [x] Main layout and navigation
- [x] Owner dashboard (with mock data)
- [x] Provider dashboard (with mock data)
- [x] Python booking processor service
- [x] Mock data generators
- [x] TypeScript types
- [x] Documentation

## 🚧 Next Steps to Complete

### Priority 1: Core Functionality

#### 1. Properties Management (Owner)
**File**: `frontend/src/pages/owner/Properties.tsx`

**Features to implement:**
- Display list of properties with cards
- Add new property form with image upload
- Edit existing properties
- Delete properties with confirmation
- Connect to GraphQL mutations

**Code outline:**
```typescript
// Use GraphQL queries and mutations
const { data } = useQuery(GET_PROPERTIES);
const [createProperty] = useMutation(CREATE_PROPERTY);
const [updateProperty] = useMutation(UPDATE_PROPERTY);

// Components needed:
// - PropertyCard component
// - PropertyForm dialog (create/edit)
// - Image upload with Firebase Storage
```

#### 2. Bookings & Calendar (Owner)
**File**: `frontend/src/pages/owner/Bookings.tsx`

**Features to implement:**
- Calendar view with bookings
- List view with filters (upcoming, past, status)
- Booking details dialog
- Manual booking creation
- Integration with Python service for platform sync

**Libraries to add:**
```json
"@fullcalendar/react": "^6.1.10",
"@fullcalendar/daygrid": "^6.1.10"
```

**Code outline:**
```typescript
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

// Map bookings to calendar events
const events = bookings.map(b => ({
  title: b.guestName,
  start: b.checkInDate,
  end: b.checkOutDate,
  color: getStatusColor(b.status)
}));
```

#### 3. Task Management (Owner)
**File**: `frontend/src/pages/owner/Tasks.tsx`

**Features to implement:**
- Create task form (linked to property/booking)
- Task list with filters (status, property, date)
- Assign tasks to providers
- View task applications
- Task status updates

**Components:**
```typescript
// - TaskForm dialog
// - TaskCard component
// - TaskFilters component
// - AssignProviderDialog
```

#### 4. Job Marketplace (Provider)
**File**: `frontend/src/pages/provider/Jobs.tsx`

**Features to implement:**
- Browse available tasks (posted, unassigned)
- Filter by location, type, pay rate
- Apply/accept tasks
- View task details with property info
- Map view of nearby jobs

**Optional: Add Google Maps**
```json
"@react-google-maps/api": "^2.19.3"
```

#### 5. Earnings Dashboard (Provider)
**File**: `frontend/src/pages/provider/Earnings.tsx`

**Features to implement:**
- Earnings summary (today, week, month, all-time)
- Completed jobs list
- Payment history
- Charts showing earnings over time
- Downloadable reports (CSV export)

### Priority 2: Communication Features

#### 6. Messaging System
**File**: `frontend/src/pages/Messages.tsx`

**Features to implement:**
- Conversation list
- Real-time chat interface
- Message notifications
- Start new conversation
- Firestore real-time listeners

**Code outline:**
```typescript
// Use Firestore onSnapshot for real-time updates
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'messages'),
    (snapshot) => {
      // Update messages state
    }
  );
  return unsubscribe;
}, []);
```

#### 7. Notifications System
**Component**: Create `frontend/src/components/NotificationCenter.tsx`

**Features:**
- Bell icon with badge count
- Notification dropdown
- Mark as read
- Navigate to related items
- Real-time updates

### Priority 3: GraphQL Implementation

#### 8. Implement Resolvers
**File**: `firebase/functions/src/graphql/resolvers.ts`

Create resolvers for all queries and mutations:

```typescript
import { db } from '../config/firebase';

export const resolvers = {
  Query: {
    properties: async (_, { ownerId }, context) => {
      const snapshot = await db
        .collection('properties')
        .where('ownerId', '==', ownerId)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    // ... more resolvers
  },
  Mutation: {
    createProperty: async (_, { input }, context) => {
      const propertyRef = await db.collection('properties').add({
        ...input,
        ownerId: context.user.uid,
        createdAt: new Date(),
      });
      return { id: propertyRef.id, ...input };
    },
    // ... more mutations
  },
};
```

#### 9. Set up Apollo Server in Cloud Functions
**File**: `firebase/functions/src/index.ts`

```typescript
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import * as functions from 'firebase-functions';
import express from 'express';

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // Verify Firebase token
    const token = req.headers.authorization;
    const user = await verifyToken(token);
    return { user };
  },
});

await server.start();

app.use('/graphql', expressMiddleware(server));

export const graphql = functions.https.onRequest(app);
```

### Priority 4: Real-time Features

#### 10. Firestore Real-time Listeners

Replace GraphQL queries with Firestore listeners for real-time data:

**Example**: `frontend/src/hooks/useBookings.ts`

```typescript
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

export const useBookings = (propertyId?: string) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'bookings'));

    if (propertyId) {
      q = query(q, where('propertyId', '==', propertyId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [propertyId]);

  return { bookings, loading };
};
```

### Priority 5: Python Service Integration

#### 11. Connect Frontend to Python Service

**Service file**: `frontend/src/services/platformSync.ts`

```typescript
const PYTHON_API = import.meta.env.VITE_PYTHON_SERVICE_URL;

export const syncPlatformBookings = async (
  propertyId: string,
  platform: string
) => {
  const response = await fetch(`${PYTHON_API}/sync/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ property_id: propertyId, platform }),
  });

  return response.json();
};
```

**Usage in component:**
```typescript
const handleSync = async () => {
  setLoading(true);
  const result = await syncPlatformBookings(propertyId, 'airbnb');
  console.log(`Synced ${result.new_bookings} new bookings`);
  setLoading(false);
};
```

### Priority 6: Enhanced Features

#### 12. File Upload (Property Photos)

**Service**: `frontend/src/services/storage.ts`

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const uploadPropertyPhoto = async (
  file: File,
  propertyId: string
): Promise<string> => {
  const storageRef = ref(storage, `properties/${propertyId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
};
```

#### 13. Profile Management
**File**: `frontend/src/pages/Profile.tsx`

**Features:**
- Edit user information
- Upload profile photo
- Update provider settings (skills, rate, radius)
- Change password
- Account settings

#### 14. Advanced Filtering & Search

Create reusable filter components:
- Date range picker
- Property selector
- Status filters
- Search by guest name

### Testing & Polish

#### 15. Add Loading States

Create a reusable loading component:
```typescript
// frontend/src/components/common/LoadingSpinner.tsx
import { CircularProgress, Box } from '@mui/material';

export const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" p={4}>
    <CircularProgress />
  </Box>
);
```

#### 16. Error Handling

Create error boundary and toast notifications:
```typescript
// Use MUI Snackbar for notifications
import { Snackbar, Alert } from '@mui/material';

const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

<Snackbar
  open={toast.open}
  autoHideDuration={6000}
  onClose={() => setToast({ ...toast, open: false })}
>
  <Alert severity={toast.severity}>{toast.message}</Alert>
</Snackbar>
```

#### 17. Mobile Optimization

Test and optimize for mobile:
- Touch-friendly buttons
- Responsive tables
- Mobile navigation
- Swipe gestures for lists

## 📦 Additional Dependencies Needed

Add these to `frontend/package.json` as you implement features:

```json
{
  "@fullcalendar/react": "^6.1.10",
  "@fullcalendar/daygrid": "^6.1.10",
  "@fullcalendar/timegrid": "^6.1.10",
  "@fullcalendar/interaction": "^6.1.10",
  "@react-google-maps/api": "^2.19.3",
  "react-dropzone": "^14.2.3",
  "react-hook-form": "^7.50.1",
  "yup": "^1.3.3"
}
```

## 🎯 Development Workflow

1. **Start with one feature at a time**
2. **Test with mock data first**
3. **Add Firestore integration**
4. **Add real-time listeners**
5. **Polish UI/UX**
6. **Add error handling**

## 🔄 Recommended Implementation Order

1. Properties Management (Owner) - **2-3 hours**
2. Task Management (Owner) - **2-3 hours**
3. Job Marketplace (Provider) - **2-3 hours**
4. Bookings Calendar - **3-4 hours**
5. Messaging System - **3-4 hours**
6. Earnings Dashboard (Provider) - **2 hours**
7. Notifications - **2 hours**
8. Profile Management - **2 hours**
9. Python Service Integration - **2 hours**
10. Polish & Mobile Optimization - **2-3 hours**

**Total estimated time**: 22-30 hours of focused development

## 🚀 Quick Wins for Demo

If you need a working demo quickly, focus on:

1. ✅ Login/Register (already done)
2. ✅ Dashboards with mock data (already done)
3. **Properties list with create/edit** (3 hours)
4. **Task creation and list** (2 hours)
5. **Job browsing** (2 hours)
6. **Basic messaging** (3 hours)

This gives you a **10-hour MVP** that demonstrates all core concepts.

## 📝 Notes

- The foundation is solid and production-ready
- GraphQL can be optional - Firestore direct access works great
- Mock data is already set up for quick demos
- Focus on UX polish for portfolio impact
- Add animations with Framer Motion if time permits

Good luck with the implementation!

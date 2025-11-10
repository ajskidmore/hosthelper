# GraphQL & Python Integration Guide for HostHelper

## Executive Summary

Currently, HostHelper uses **Firebase SDK directly** from React. This guide explains:
1. **Should you add GraphQL?** (Probably not, but here's how if you want)
2. **Should you use the Python service?** (Yes, for specific use cases)
3. **Recommended architecture** if you want both

---

## Current Architecture (Simple & Effective)

```
React Components
    ↓
Custom Hooks (useBookings, useTasks, etc.)
    ↓
Firebase SDK (direct calls)
    ↓
Firestore Database
```

**Pros:**
✅ Simple, easy to understand
✅ Real-time updates out of the box
✅ Type-safe with TypeScript
✅ Low latency (direct connection)
✅ Automatic offline support
✅ Built-in security rules

**Cons:**
❌ Limited to Firebase's query capabilities
❌ No server-side business logic (except Cloud Functions)
❌ Can't easily integrate external APIs
❌ No centralized API layer

---

## Option 1: Add GraphQL (Advanced Use Case Only)

### When GraphQL Makes Sense:
- ✅ You need complex, nested data queries
- ✅ You want to aggregate data from multiple sources (Firebase + Python + External APIs)
- ✅ You have mobile apps that need optimized queries
- ✅ You want a single API gateway for all data
- ✅ You're building a platform with 3rd party integrations

### When GraphQL is Overkill:
- ❌ You only use Firebase (current state)
- ❌ Your queries are simple (current state)
- ❌ You don't need to aggregate multiple data sources
- ❌ Real-time updates are critical (Firebase does this better)

### Recommended GraphQL Architecture

If you decide to add GraphQL:

```
┌─────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND                          │
│                                                             │
│  Apollo Client (GraphQL)                                    │
│  - Queries: fetch data                                      │
│  - Mutations: create/update/delete                          │
│  - Subscriptions: real-time updates                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
                      GraphQL over HTTP
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  GRAPHQL API SERVER                         │
│                   (Node.js + Apollo Server)                 │
│                                                             │
│  Resolvers:                                                 │
│  ├─ queries.ts (read operations)                           │
│  ├─ mutations.ts (write operations)                        │
│  └─ subscriptions.ts (real-time)                           │
│                                                             │
│  Data Sources:                                              │
│  ├─ Firebase Admin SDK (Firestore, Auth)                   │
│  ├─ Python Service (HTTP calls)                            │
│  ├─ External APIs (Airbnb, Vrbo, Stripe)                   │
│  └─ Redis (caching)                                         │
└─────────────────────────────────────────────────────────────┘
           ↓              ↓              ↓
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Firebase │   │  Python  │   │ External │
    │ Firestore│   │  FastAPI │   │   APIs   │
    └──────────┘   └──────────┘   └──────────┘
```

### Implementation Steps

#### Step 1: Create GraphQL Server

**Option A: Cloud Functions (Recommended for Firebase)**
```bash
cd functions
npm install apollo-server-cloud-functions graphql firebase-admin
```

**functions/src/graphql/schema.ts:**
```typescript
import { gql } from 'apollo-server-cloud-functions';

export const typeDefs = gql`
  type Property {
    id: ID!
    ownerId: String!
    name: String!
    address: Address!
    bedrooms: Int!
    bathrooms: Int!
    bookings: [Booking!]!  # Nested query
  }

  type Booking {
    id: ID!
    propertyId: String!
    ownerId: String!
    guestName: String!
    checkInDate: String!
    checkOutDate: String!
    status: BookingStatus!
    property: Property!  # Reverse lookup
  }

  enum BookingStatus {
    PENDING
    CONFIRMED
    CHECKED_IN
    CHECKED_OUT
    CANCELLED
  }

  type Query {
    # Get all properties for current user
    myProperties: [Property!]!

    # Get property with bookings
    property(id: ID!): Property

    # Get bookings with filtering
    bookings(
      propertyId: ID
      status: BookingStatus
      startDate: String
      endDate: String
    ): [Booking!]!

    # Analytics from Python service
    propertyAnalytics(propertyId: ID!, days: Int): Analytics!
  }

  type Mutation {
    createBooking(input: CreateBookingInput!): Booking!
    updateBooking(id: ID!, input: UpdateBookingInput!): Booking!
    deleteBooking(id: ID!): Boolean!

    # Sync bookings from external platform
    syncPlatformBookings(propertyId: ID!, platform: Platform!): SyncResult!
  }

  type Subscription {
    # Real-time booking updates
    bookingUpdated(propertyId: ID!): Booking!
  }

  input CreateBookingInput {
    propertyId: ID!
    guestName: String!
    guestEmail: String!
    checkInDate: String!
    checkOutDate: String!
    numberOfGuests: Int!
    totalPrice: Float!
  }

  type Analytics {
    occupancyRate: Float!
    totalRevenue: Float!
    bookingCount: Int!
  }

  type SyncResult {
    newBookings: Int!
    updatedBookings: Int!
    errors: [String!]!
  }

  enum Platform {
    AIRBNB
    VRBO
    BOOKING_COM
  }
`;
```

**functions/src/graphql/resolvers.ts:**
```typescript
import { db } from '../firebase';
import axios from 'axios';

export const resolvers = {
  Query: {
    myProperties: async (_, __, context) => {
      // context.user comes from auth middleware
      const snapshot = await db.collection('properties')
        .where('ownerId', '==', context.user.uid)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },

    property: async (_, { id }, context) => {
      const doc = await db.collection('properties').doc(id).get();

      if (!doc.exists) {
        throw new Error('Property not found');
      }

      const data = doc.data();

      // Authorization check
      if (data.ownerId !== context.user.uid) {
        throw new Error('Unauthorized');
      }

      return { id: doc.id, ...data };
    },

    bookings: async (_, { propertyId, status, startDate, endDate }, context) => {
      let query = db.collection('bookings')
        .where('ownerId', '==', context.user.uid);

      if (propertyId) {
        query = query.where('propertyId', '==', propertyId);
      }

      if (status) {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.get();
      let bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Date filtering (can't do in Firestore easily)
      if (startDate || endDate) {
        bookings = bookings.filter(booking => {
          const checkIn = new Date(booking.checkInDate);
          if (startDate && checkIn < new Date(startDate)) return false;
          if (endDate && checkIn > new Date(endDate)) return false;
          return true;
        });
      }

      return bookings;
    },

    // Call Python service for analytics
    propertyAnalytics: async (_, { propertyId, days = 30 }) => {
      const response = await axios.get(
        `http://python-service-url/analytics/occupancy/${propertyId}?days=${days}`
      );
      return response.data;
    },
  },

  Mutation: {
    createBooking: async (_, { input }, context) => {
      const bookingData = {
        ...input,
        ownerId: context.user.uid,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await db.collection('bookings').add(bookingData);

      return { id: docRef.id, ...bookingData };
    },

    // Call Python service to sync from Airbnb/Vrbo
    syncPlatformBookings: async (_, { propertyId, platform }) => {
      const response = await axios.post(
        'http://python-service-url/sync/bookings',
        {
          property_id: propertyId,
          platform: platform.toLowerCase(),
        }
      );

      // Process results and save to Firestore
      const { new_bookings } = response.data;

      for (const booking of new_bookings) {
        await db.collection('bookings').add({
          propertyId,
          externalBookingId: booking.external_id,
          guestName: booking.guest_name,
          // ... map fields
        });
      }

      return response.data;
    },
  },

  // Nested resolvers
  Property: {
    bookings: async (property) => {
      const snapshot = await db.collection('bookings')
        .where('propertyId', '==', property.id)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
  },

  Booking: {
    property: async (booking) => {
      const doc = await db.collection('properties')
        .doc(booking.propertyId)
        .get();

      return { id: doc.id, ...doc.data() };
    },
  },
};
```

**functions/src/index.ts:**
```typescript
import { https } from 'firebase-functions';
import { ApolloServer } from 'apollo-server-cloud-functions';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { auth } from './firebase';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // Verify Firebase Auth token
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No auth token');
    }

    const user = await auth.verifyIdToken(token);

    return { user };
  },
});

export const graphql = https.onRequest(server.createHandler());
```

#### Step 2: Update Frontend to Use Apollo Client

**frontend/src/graphql/client.ts:**
```typescript
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import { setContext } from '@apollo/client/link/context';
import { auth } from '../services/firebase';

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: 'https://your-region-your-project.cloudfunctions.net/graphql',
});

// WebSocket link for subscriptions
const wsLink = new WebSocketLink({
  uri: 'wss://your-region-your-project.cloudfunctions.net/graphql',
  options: {
    reconnect: true,
  },
});

// Auth middleware
const authLink = setContext(async (_, { headers }) => {
  const token = await auth.currentUser?.getIdToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Split based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

**frontend/src/App.tsx:**
```typescript
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './graphql/client';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        {/* rest of app */}
      </AuthProvider>
    </ApolloProvider>
  );
}
```

**frontend/src/hooks/useBookingsGraphQL.ts:**
```typescript
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_BOOKINGS = gql`
  query GetBookings($propertyId: ID) {
    bookings(propertyId: $propertyId) {
      id
      guestName
      checkInDate
      checkOutDate
      status
      property {
        id
        name
      }
    }
  }
`;

const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      guestName
      status
    }
  }
`;

export function useBookingsGraphQL(propertyId?: string) {
  const { data, loading, error } = useQuery(GET_BOOKINGS, {
    variables: { propertyId },
  });

  const [createBooking] = useMutation(CREATE_BOOKING, {
    refetchQueries: [{ query: GET_BOOKINGS, variables: { propertyId } }],
  });

  return {
    bookings: data?.bookings || [],
    loading,
    error,
    createBooking,
  };
}
```

---

## Option 2: Use Python Service (Recommended)

### What Python Service Should Handle

✅ **External API Integrations:**
- Airbnb API sync
- Vrbo API sync
- Booking.com API sync
- Stripe payment processing

✅ **Heavy Computations:**
- Occupancy analytics
- Revenue forecasting
- Price optimization
- Market analysis

✅ **Background Jobs:**
- Scheduled booking syncs (cron jobs)
- Email notifications
- PDF generation (invoices, reports)
- Image processing

✅ **Machine Learning:**
- Dynamic pricing recommendations
- Demand forecasting
- Guest review sentiment analysis

### Recommended Python Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND                          │
│                                                             │
│  Firebase SDK (for regular CRUD)                           │
│  +                                                          │
│  HTTP Client (for Python service)                          │
└─────────────────────────────────────────────────────────────┘
           ↓                           ↓
    ┌──────────┐                ┌──────────┐
    │ Firebase │                │  Python  │
    │ Firestore│                │  FastAPI │
    └──────────┘                └──────────┘
                                      ↓
                              ┌───────────────┐
                              │ External APIs │
                              │ - Airbnb      │
                              │ - Vrbo        │
                              │ - Stripe      │
                              └───────────────┘
```

### Implementation Steps

#### Step 1: Deploy Python Service

**Update `python-services/booking-processor/main.py`:**
```python
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore, auth
from typing import List, Optional
import httpx

# Initialize Firebase Admin
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI(title="HostHelper API", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.web.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth middleware
async def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No auth token")

    try:
        token = authorization.replace("Bearer ", "")
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

# Airbnb integration
@app.post("/sync/airbnb/{property_id}")
async def sync_airbnb_bookings(
    property_id: str,
    user: dict = Depends(verify_token)
):
    """Sync bookings from Airbnb"""

    # Verify property ownership
    property_ref = db.collection('properties').document(property_id)
    property_doc = property_ref.get()

    if not property_doc.exists or property_doc.to_dict()['ownerId'] != user['uid']:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Call Airbnb API (you'll need API credentials)
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.airbnb.com/v2/listings/{property_id}/reservations",
            headers={"Authorization": f"Bearer {AIRBNB_TOKEN}"}
        )
        airbnb_bookings = response.json()

    # Save to Firestore
    new_count = 0
    for booking in airbnb_bookings['reservations']:
        # Check if already exists
        existing = db.collection('bookings')\
            .where('externalBookingId', '==', booking['id'])\
            .where('bookingSource', '==', 'airbnb')\
            .get()

        if not existing:
            db.collection('bookings').add({
                'propertyId': property_id,
                'ownerId': user['uid'],
                'externalBookingId': booking['id'],
                'guestName': booking['guest']['name'],
                'guestEmail': booking['guest']['email'],
                'checkInDate': booking['start_date'],
                'checkOutDate': booking['end_date'],
                'numberOfGuests': booking['number_of_guests'],
                'totalPrice': booking['total_price'],
                'status': 'confirmed',
                'bookingSource': 'airbnb',
                'createdAt': firestore.SERVER_TIMESTAMP,
            })
            new_count += 1

    return {"new_bookings": new_count, "total_checked": len(airbnb_bookings['reservations'])}

# Analytics
@app.get("/analytics/occupancy/{property_id}")
async def calculate_occupancy(
    property_id: str,
    days: int = 30,
    user: dict = Depends(verify_token)
):
    """Calculate occupancy rate"""

    from datetime import datetime, timedelta

    # Get bookings for property
    start_date = datetime.now()
    end_date = start_date + timedelta(days=days)

    bookings_ref = db.collection('bookings')\
        .where('propertyId', '==', property_id)\
        .where('ownerId', '==', user['uid'])\
        .where('status', 'in', ['confirmed', 'checked_in'])

    bookings = [b.to_dict() for b in bookings_ref.get()]

    # Calculate occupied days
    occupied_days = set()
    for booking in bookings:
        check_in = booking['checkInDate'].date() if hasattr(booking['checkInDate'], 'date') else datetime.fromisoformat(booking['checkInDate']).date()
        check_out = booking['checkOutDate'].date() if hasattr(booking['checkOutDate'], 'date') else datetime.fromisoformat(booking['checkOutDate']).date()

        current_date = check_in
        while current_date < check_out:
            if start_date.date() <= current_date <= end_date.date():
                occupied_days.add(current_date)
            current_date += timedelta(days=1)

    occupancy_rate = (len(occupied_days) / days) * 100
    total_revenue = sum(b['totalPrice'] for b in bookings)

    return {
        "property_id": property_id,
        "period_days": days,
        "booked_days": len(occupied_days),
        "occupancy_rate": round(occupancy_rate, 1),
        "total_revenue": round(total_revenue, 2),
        "booking_count": len(bookings)
    }

# Stripe payment
@app.post("/payments/create-checkout-session")
async def create_checkout_session(
    booking_id: str,
    user: dict = Depends(verify_token)
):
    """Create Stripe checkout session for booking"""

    import stripe
    stripe.api_key = STRIPE_SECRET_KEY

    # Get booking
    booking_doc = db.collection('bookings').document(booking_id).get()
    booking = booking_doc.to_dict()

    if booking['ownerId'] != user['uid']:
        raise HTTPException(status_code=403, detail="Unauthorized")

    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': f"Booking - {booking['guestName']}",
                },
                'unit_amount': int(booking['totalPrice'] * 100),
            },
            'quantity': 1,
        }],
        mode='payment',
        success_url=f"https://your-app.web.app/bookings?success=true&booking_id={booking_id}",
        cancel_url=f"https://your-app.web.app/bookings?canceled=true",
    )

    return {"checkout_url": session.url}
```

**Deploy to Google Cloud Run:**
```bash
cd python-services/booking-processor

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD exec uvicorn main:app --host 0.0.0.0 --port $PORT
EOF

# Create requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.109.0
uvicorn[standard]==0.27.0
firebase-admin==6.4.0
httpx==0.26.0
stripe==8.0.0
python-multipart==0.0.6
EOF

# Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/hosthelper-api
gcloud run deploy hosthelper-api \
  --image gcr.io/YOUR_PROJECT_ID/hosthelper-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Step 2: Call Python Service from React

**frontend/src/services/pythonApi.ts:**
```typescript
import { auth } from './firebase';

const PYTHON_API_URL = 'https://hosthelper-api-xxxxx-uc.a.run.app';

class PythonAPIClient {
  private async getAuthHeader() {
    const token = await auth.currentUser?.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async syncAirbnbBookings(propertyId: string) {
    const response = await fetch(
      `${PYTHON_API_URL}/sync/airbnb/${propertyId}`,
      {
        method: 'POST',
        headers: await this.getAuthHeader(),
      }
    );

    if (!response.ok) throw new Error('Sync failed');
    return response.json();
  }

  async getOccupancyAnalytics(propertyId: string, days: number = 30) {
    const response = await fetch(
      `${PYTHON_API_URL}/analytics/occupancy/${propertyId}?days=${days}`,
      {
        headers: await this.getAuthHeader(),
      }
    );

    if (!response.ok) throw new Error('Analytics failed');
    return response.json();
  }

  async createPaymentSession(bookingId: string) {
    const response = await fetch(
      `${PYTHON_API_URL}/payments/create-checkout-session`,
      {
        method: 'POST',
        headers: await this.getAuthHeader(),
        body: JSON.stringify({ booking_id: bookingId }),
      }
    );

    if (!response.ok) throw new Error('Payment failed');
    return response.json();
  }
}

export const pythonApi = new PythonAPIClient();
```

**Use in components:**
```typescript
import { pythonApi } from '../../services/pythonApi';

function PropertyAnalytics({ propertyId }: { propertyId: string }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await pythonApi.getOccupancyAnalytics(propertyId, 30);
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Button onClick={loadAnalytics}>Load Analytics</Button>
      {analytics && (
        <div>
          <p>Occupancy: {analytics.occupancy_rate}%</p>
          <p>Revenue: ${analytics.total_revenue}</p>
        </div>
      )}
    </Card>
  );
}
```

---

## Recommended Hybrid Architecture

**Best of both worlds:**

```
React Frontend
    ├─ Firebase SDK (real-time CRUD)
    │   └─ Properties, Bookings (basic), Tasks, Messages
    │
    └─ Python API (heavy lifting)
        ├─ Platform sync (Airbnb, Vrbo)
        ├─ Analytics & ML
        ├─ Payment processing
        └─ Background jobs
```

**DON'T add GraphQL** unless you need:
- Complex nested queries
- Multiple data source aggregation
- 3rd party API exposure

**DO use Python service** for:
- External API integrations
- Analytics computation
- Payment processing
- Background jobs

---

## Cost Comparison

### Current (Firebase only):
- **Free tier**: 50K reads, 20K writes/day
- **Cost at 1000 users**: ~$25/month

### With GraphQL (Cloud Functions):
- **Extra cost**: ~$50-100/month (invocations + compute)
- **Benefit**: Centralized API, better caching

### With Python (Cloud Run):
- **Extra cost**: ~$10-30/month (pay per request)
- **Benefit**: External integrations, analytics

---

## Conclusion

### For HostHelper, I recommend:

1. ✅ **Keep Firebase SDK for CRUD** (simple, fast, real-time)
2. ✅ **Deploy Python service for integrations** (Airbnb, analytics, payments)
3. ❌ **Skip GraphQL for now** (adds complexity without clear benefit)

This gives you the best balance of simplicity and power.

# HostHelper - Short-Term Rental Management Platform

![HostHelper Logo](https://via.placeholder.com/150x50/2563EB/FFFFFF?text=HostHelper)

A full-stack portfolio demo showcasing modern web development with React, Firebase, GraphQL, and Python. HostHelper is a comprehensive property management platform designed for short-term rental hosts and service providers.

## 🎯 Project Overview

HostHelper demonstrates:
- **Frontend**: React with TypeScript, Material-UI, React Router
- **Backend**: Firebase (Firestore, Auth, Cloud Functions)
- **API Layer**: GraphQL with Apollo
- **Microservices**: Python FastAPI for data processing
- **Real-time**: WebSocket subscriptions for live updates
- **Authentication**: Firebase Auth with Google OAuth

## ✨ Features

### For Property Owners
- 📊 **Dashboard**: Overview of properties, bookings, and tasks
- 🏠 **Property Management**: Add, edit, and manage rental properties
- 📅 **Booking Calendar**: Visual calendar with sync from Airbnb/Vrbo (mock)
- ✅ **Task Management**: Create and assign cleaning, maintenance, check-in tasks
- 💬 **Messaging**: Communicate with service providers
- 📈 **Analytics**: Occupancy rates, revenue tracking

### For Service Providers
- 💼 **Job Marketplace**: Browse available tasks in your area
- 📋 **Task Dashboard**: View and manage assigned jobs
- 💰 **Earnings Tracker**: Monitor income and completed jobs
- ⭐ **Rating System**: Build reputation through quality work
- 🗓️ **Availability Management**: Set working hours and service radius

## 🏗️ Project Structure

```
hosthelper/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components (Owner/Provider views)
│   │   ├── services/        # Firebase configuration
│   │   ├── graphql/         # Apollo client setup
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── hooks/           # Custom hooks
│   │   ├── theme/           # Material-UI theme
│   │   └── types/           # TypeScript types
│   └── package.json
│
├── firebase/
│   ├── functions/           # Cloud Functions (GraphQL server)
│   │   └── src/
│   │       └── graphql/     # GraphQL schema and resolvers
│   └── package.json
│
├── python-services/
│   └── booking-processor/   # Python FastAPI service
│       ├── main.py          # API endpoints
│       └── requirements.txt
│
├── shared/
│   ├── types/               # Shared TypeScript types
│   ├── mock-data/           # Mock data generators
│   └── utils/               # Shared utilities
│
├── firebase.json            # Firebase configuration
├── firestore.rules          # Firestore security rules
├── firestore.indexes.json   # Database indexes
└── .env.example             # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project (free tier works)

### 1. Clone and Install

```bash
cd hosthelper
npm run setup  # Installs all dependencies
```

### 2. Firebase Setup

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable the following:
   - **Authentication** → Enable Email/Password and Google providers
   - **Firestore Database** → Create database in test mode
   - **Storage** → Set up default bucket

#### Get Firebase Config

1. Project Settings → General → Your apps → Web app
2. Copy the Firebase configuration
3. Create `.env` file in the root:

```bash
cp .env.example .env
```

4. Fill in your Firebase credentials in `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Initialize Firebase

```bash
firebase login
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting
# - Emulators (optional for local development)
```

### 3. Start Development Servers

You'll need **3 terminal windows**:

#### Terminal 1: Frontend (React)
```bash
cd frontend
npm run dev
```
Frontend runs at: [http://localhost:3000](http://localhost:3000)

#### Terminal 2: Python Service (Optional)
```bash
cd python-services/booking-processor
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
Python API runs at: [http://localhost:8000](http://localhost:8000)
API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Terminal 3: Firebase Emulators (Optional - for local development)
```bash
firebase emulators:start
```

### 4. Seed Mock Data (Optional)

The app uses mock data by default. To populate Firestore with test data:

```bash
# This feature will be added - for now, data is generated client-side
```

## 🔐 Authentication

### Demo Accounts

For testing, you can create accounts through the register page, or use these demo credentials:

**Property Owner:**
- Email: `owner@demo.com`
- Password: `password`

**Service Provider:**
- Email: `provider@demo.com`
- Password: `password`

### Creating New Accounts

1. Navigate to [http://localhost:3000/register](http://localhost:3000/register)
2. Select your role (Owner or Provider)
3. Fill in your details
4. Sign up with email or Google

## 📡 GraphQL API

The GraphQL API is served via Firebase Cloud Functions. The schema includes:

### Queries
- `properties`, `property(id)`
- `bookings`, `upcomingBookings`
- `tasks`, `availableTasks`
- `conversations`, `messages`
- `propertyAnalytics`, `providerEarnings`

### Mutations
- `createProperty`, `updateProperty`, `deleteProperty`
- `createTask`, `assignTask`, `completeTask`
- `sendMessage`, `markMessageAsRead`
- `syncPlatformBookings`

### Subscriptions (Planned)
- `bookingCreated`, `taskUpdated`
- `messageReceived`, `notificationReceived`

GraphQL Playground: [http://localhost:5001](http://localhost:5001) (when emulators running)

## 🐍 Python Service

The Python FastAPI service handles:

1. **Booking Sync**: Mock integration with Airbnb/Vrbo APIs
2. **Data Processing**: Transform and validate booking data
3. **Analytics**: Calculate occupancy rates and revenue

### API Endpoints

```bash
GET  /health                           # Health check
POST /sync/bookings                    # Sync platform bookings
GET  /mock/bookings/{platform}         # Get mock booking data
GET  /analytics/occupancy/{property_id} # Calculate occupancy
```

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## 🎨 Branding

**HostHelper** brand identity:

- **Primary Color**: #2563EB (Vibrant Blue) - Trust, professionalism
- **Secondary Color**: #10B981 (Green) - Success, reliability
- **Accent**: #F59E0B (Orange) - Highlights, warmth

**Logo Concept**: Modern wordmark with gradient effect combining primary and secondary colors.

## 📱 Mobile Responsive

The application is fully responsive and works on:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

Material-UI's responsive breakpoints ensure optimal UX across devices.

## 🔒 Security

### Firestore Rules

Security rules are defined in `firestore.rules`:
- Users can only read/write their own data
- Property owners can manage their properties
- Service providers can update assigned tasks
- Messages are private between participants

### Authentication

- Firebase Authentication handles all auth flows
- JWT tokens are automatically managed
- Protected routes require authentication
- Role-based access control (Owner vs Provider)

## 🚀 Deployment

### Frontend (Firebase Hosting)

```bash
npm run build
firebase deploy --only hosting
```

### Cloud Functions (GraphQL)

```bash
cd firebase/functions
npm run build
firebase deploy --only functions
```

### Python Service (Cloud Run / Heroku / AWS)

Example for Google Cloud Run:

```bash
cd python-services/booking-processor
gcloud run deploy hosthelper-booking-processor \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Python tests
cd python-services/booking-processor
pytest
```

## 📚 API Integration (Future)

This demo uses mock data. To integrate real APIs:

### Airbnb API
1. Apply for [Airbnb API access](https://www.airbnb.com/partner)
2. Add credentials to `.env`:
   ```env
   AIRBNB_CLIENT_ID=your_client_id
   AIRBNB_CLIENT_SECRET=your_secret
   ```
3. Update `python-services/booking-processor/main.py` with real API calls

### Vrbo API
1. Register at [Vrbo Partner Central](https://www.vrbo.com/partners)
2. Similar process to Airbnb

## 🛠️ Tech Stack Details

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + TypeScript | UI framework |
| Styling | Material-UI (MUI) v5 | Component library |
| State | React Context + Zustand | State management |
| Routing | React Router v6 | Client-side routing |
| Backend | Firebase Firestore | NoSQL database |
| Auth | Firebase Auth | Authentication |
| API | GraphQL + Apollo | API layer |
| Functions | Firebase Cloud Functions | Serverless backend |
| Python | FastAPI | Microservice |
| Charts | Recharts | Data visualization |
| Date | date-fns | Date manipulation |

## 📝 License

This is a portfolio demo project. Feel free to use it as reference for your own projects.

## 🤝 Contributing

This is a portfolio project, but suggestions are welcome! Open an issue or submit a PR.

## 📧 Contact

For questions about this project, please open an issue on GitHub.

---

**Built with ❤️ as a portfolio demonstration of full-stack development skills**

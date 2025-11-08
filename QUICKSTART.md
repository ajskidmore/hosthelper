# HostHelper - Quick Start Guide

Get HostHelper running in **10 minutes** with this streamlined setup guide.

## Prerequisites Check

```bash
node --version  # Should be 18+
python --version  # Should be 3.9+
firebase --version  # If not installed: npm i -g firebase-tools
```

## 🚀 Fast Setup (Development Mode)

### 1. Install Dependencies (2 min)

```bash
cd hosthelper
npm install
cd frontend && npm install
cd ../python-services/booking-processor
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

### 2. Firebase Setup (3 min)

#### Option A: Use Firebase Emulators (No Cloud Setup Needed)

```bash
firebase login
firebase init emulators
# Select: Authentication, Firestore
# Accept default ports

# Start emulators
firebase emulators:start
```

#### Option B: Use Real Firebase (Recommended for Production)

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password + Google
3. Enable **Firestore** → Start in test mode
4. Get web config from Project Settings

### 3. Environment Setup (2 min)

```bash
cp .env.example .env
# Edit .env with your Firebase credentials (or use emulator defaults)
```

**For Firebase Emulators**, use these values:
```env
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=localhost
VITE_FIREBASE_PROJECT_ID=demo-project
VITE_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=demo-app-id
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
PYTHON_SERVICE_URL=http://localhost:8000
```

### 4. Start Development Servers (1 min)

**Terminal 1** - Frontend:
```bash
cd frontend
npm run dev
```
→ Opens at [http://localhost:3000](http://localhost:3000)

**Terminal 2** - Python Service (Optional):
```bash
cd python-services/booking-processor
source venv/bin/activate
python main.py
```
→ API at [http://localhost:8000](http://localhost:8000)

**Terminal 3** - Firebase Emulators (if using emulators):
```bash
firebase emulators:start
```
→ Emulator UI at [http://localhost:4000](http://localhost:4000)

## ✅ Verify Installation

1. **Open** [http://localhost:3000](http://localhost:3000)
2. **Click** "Sign up"
3. **Create** an account (Owner or Provider)
4. **See** the dashboard

## 🎮 Demo Features

### As Property Owner

1. **Dashboard** - See overview of properties and bookings
2. **Properties** - (To be implemented) Add your rental properties
3. **Bookings** - (To be implemented) View booking calendar
4. **Tasks** - (To be implemented) Create cleaning/maintenance tasks

### As Service Provider

1. **Dashboard** - See earnings and job stats
2. **Jobs** - (To be implemented) Browse available tasks
3. **Earnings** - (To be implemented) Track income

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in frontend/vite.config.ts
server: { port: 3001 }
```

### Firebase Connection Issues

If using emulators, make sure to configure the app to use them:

```typescript
// frontend/src/services/firebase.ts
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

// Add after initializing auth and db
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

### Module Not Found Errors

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. **Read** [README.md](README.md) for full documentation
2. **Check** [docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md) for feature development
3. **Explore** the codebase structure
4. **Implement** your first feature (Properties page recommended)

## 🎯 Development Tips

### Mock Data

The app uses client-side mock data in `shared/mock-data/generator.ts`. Modify this file to customize demo data.

### Hot Reload

Vite provides instant hot module replacement. Save any file to see changes immediately.

### GraphQL Development

For now, the app uses direct Firestore access. GraphQL integration is optional and outlined in the implementation guide.

### Styling

- Theme configuration: `frontend/src/theme/theme.ts`
- Material-UI components used throughout
- Customize colors, fonts, and spacing in the theme

## 🚢 Deploying for Demo

### Quick Deploy to Firebase Hosting

```bash
# Build frontend
cd frontend
npm run build

# Deploy
cd ..
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

### Deploy Python Service (Optional)

Use Heroku, Railway, or Google Cloud Run for the Python backend.

## 💡 Pro Tips

- **Use Firebase Emulators** for fastest local development
- **Mock data is your friend** - modify `shared/mock-data/generator.ts`
- **Material-UI Documentation** - [mui.com](https://mui.com) is excellent
- **Keep it simple** - Focus on one feature at a time
- **Git commits** - Commit often as you build features

## 📞 Need Help?

- Check [README.md](README.md) for detailed docs
- Review code comments for guidance
- Firebase docs: [firebase.google.com/docs](https://firebase.google.com/docs)
- Material-UI: [mui.com](https://mui.com)

---

**You're all set! Happy coding! 🚀**

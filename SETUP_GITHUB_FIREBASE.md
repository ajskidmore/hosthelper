# GitHub & Firebase Setup Guide

Complete step-by-step guide to connect your HostHelper project to GitHub and Firebase.

---

## Part 1: GitHub Setup (5 minutes)

### Step 1: Initialize Git Repository

```bash
# Navigate to project directory
cd /Users/a.j.skidmore/Downloads/Portfolio\ Stuff/Portfolio/hosthelper

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: HostHelper - Full-stack rental management platform"
```

### Step 2: Create GitHub Repository

**Option A: Using GitHub CLI (if installed)**
```bash
# Login to GitHub
gh auth login

# Create repository
gh repo create hosthelper --public --source=. --remote=origin --push

# This creates the repo and pushes automatically!
```

**Option B: Using GitHub Website (Recommended if no CLI)**

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `hosthelper`
3. Description: `Full-stack short-term rental management platform - React, Firebase, GraphQL, Python`
4. **Public** repository
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create Repository**

### Step 3: Connect Local Repo to GitHub

```bash
# Add GitHub as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/hosthelper.git

# Verify remote was added
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Verify on GitHub

Open your repository: `https://github.com/YOUR_USERNAME/hosthelper`

You should see all your files!

---

## Part 2: Firebase Setup (10 minutes)

### Step 1: Install Firebase CLI (if not already installed)

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

### Step 2: Login to Firebase

```bash
# Login to your Google account
firebase login

# This will open a browser window for authentication
# Sign in with your Google account
```

### Step 3: Create Firebase Project

**Option A: Using Firebase Console (Recommended for first time)**

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add Project**
3. Project name: `hosthelper` (or `hosthelper-demo`)
4. Click **Continue**
5. Disable Google Analytics (or enable if you want)
6. Click **Create Project**
7. Wait for project creation (~30 seconds)
8. Click **Continue**

**Option B: Using Firebase CLI**
```bash
firebase projects:create hosthelper
```

### Step 4: Initialize Firebase in Your Project

```bash
# Make sure you're in the project directory
cd /Users/a.j.skidmore/Downloads/Portfolio\ Stuff/Portfolio/hosthelper

# Initialize Firebase
firebase init
```

**When prompted, select these options:**

```
? Which Firebase features do you want to set up?
❯ ◉ Firestore: Configure security rules and indexes files
  ◉ Functions: Configure a Cloud Functions directory and its files
  ◉ Hosting: Configure files for Firebase Hosting
  ◉ Storage: Configure a Cloud Storage security rules file
  ◯ Emulators: Set up local emulators for Firebase products
(Use Space to select, Enter to confirm)

? Please select an option:
❯ Use an existing project
  (Select your hosthelper project)

? What file should be used for Firestore Rules?
  firestore.rules (press Enter - already exists)

? What file should be used for Firestore indexes?
  firestore.indexes.json (press Enter - already exists)

? What language would you like to use to write Cloud Functions?
❯ TypeScript

? Do you want to use ESLint to catch probable bugs and enforce style?
  Yes

? File functions/package.json already exists. Overwrite?
  No

? File functions/tsconfig.json already exists. Overwrite?
  No

? File functions/src/index.ts already exists. Overwrite?
  No

? Do you want to install dependencies with npm now?
  Yes

? What do you want to use as your public directory?
  frontend/dist

? Configure as a single-page app (rewrite all urls to /index.html)?
  Yes

? Set up automatic builds and deploys with GitHub?
  No (we'll do this manually)

? File frontend/dist/index.html already exists. Overwrite?
  No

? What file should be used for Storage Rules?
  storage.rules (press Enter)
```

### Step 5: Enable Firebase Services

#### A. Enable Authentication

**In Firebase Console:**
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Select your `hosthelper` project
3. Click **Authentication** in left sidebar
4. Click **Get Started**
5. Click **Sign-in method** tab
6. Enable **Email/Password**:
   - Click on it
   - Toggle **Enable**
   - Click **Save**
7. Enable **Google**:
   - Click on it
   - Toggle **Enable**
   - Select your project support email
   - Click **Save**

**Using CLI (Alternative):**
```bash
# This will open the Firebase Console for you
firebase open auth
```

#### B. Enable Firestore Database

**In Firebase Console:**
1. Click **Firestore Database** in left sidebar
2. Click **Create Database**
3. Select **Start in test mode** (we'll deploy rules later)
4. Choose location: `us-central` (or closest to you)
5. Click **Enable**

**Using CLI:**
```bash
firebase open firestore
```

#### C. Enable Cloud Storage

**In Firebase Console:**
1. Click **Storage** in left sidebar
2. Click **Get Started**
3. Click **Next** (use default rules)
4. Choose location: `us-central` (same as Firestore)
5. Click **Done**

### Step 6: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** (⚙️) next to Project Overview
2. Click **Project settings**
3. Scroll down to **Your apps**
4. Click **Web** icon (`</>`) to add a web app
5. App nickname: `HostHelper Web`
6. **Check** "Also set up Firebase Hosting"
7. Click **Register app**
8. **Copy the config object** (you'll need this!)

It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "hosthelper-xxxxx.firebaseapp.com",
  projectId: "hosthelper-xxxxx",
  storageBucket: "hosthelper-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

### Step 7: Configure Environment Variables

```bash
# Open .env file
nano .env
# or use your preferred editor:
# code .env
# vim .env
```

**Update with your Firebase config:**

```env
# Firebase Configuration (from step 6)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=hosthelper-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hosthelper-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=hosthelper-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx

# GraphQL Configuration
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
VITE_GRAPHQL_WS_ENDPOINT=ws://localhost:4000/graphql

# Python Service Configuration
PYTHON_SERVICE_URL=http://localhost:8000

# Application Settings
VITE_APP_NAME=HostHelper
VITE_APP_ENV=development
```

**Save the file** (Ctrl+O, Enter, Ctrl+X for nano)

### Step 8: Deploy Security Rules

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage
```

### Step 9: Test the Setup

```bash
# Install dependencies (if not done already)
cd frontend
npm install

# Start development server
npm run dev
```

**Open** [http://localhost:3000](http://localhost:3000)

Try to:
1. Click **Sign up**
2. Create an account (this tests Firebase Auth and Firestore)
3. If successful, you'll see the dashboard!

---

## Part 3: Initial Deployment (Optional - 5 minutes)

### Deploy to Firebase Hosting

```bash
# Build the frontend
cd frontend
npm run build
cd ..

# Deploy everything
firebase deploy

# This deploys:
# - Hosting (your React app)
# - Firestore rules
# - Cloud Functions
# - Storage rules
```

**Your app will be live at:**
`https://hosthelper-xxxxx.web.app`

---

## Part 4: Commit Everything to GitHub

```bash
# Add environment file to .gitignore (it's already there, but verify)
cat .gitignore | grep .env

# Add and commit Firebase files
git add .
git commit -m "Add Firebase configuration and deployment setup"
git push origin main
```

---

## Quick Reference Commands

### GitHub Commands
```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Your message"

# Push to GitHub
git push origin main

# Pull latest
git pull origin main

# Create new branch
git checkout -b feature-name
```

### Firebase Commands
```bash
# Login
firebase login

# List projects
firebase projects:list

# Switch project
firebase use hosthelper

# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules

# Open Firebase console
firebase open

# View logs
firebase functions:log

# Start emulators (for local development)
firebase emulators:start
```

### Development Commands
```bash
# Start frontend
cd frontend && npm run dev

# Start Python service
cd python-services/booking-processor
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py

# Install dependencies
npm run setup
```

---

## Troubleshooting

### Error: "Firebase project not found"
```bash
# List your projects
firebase projects:list

# Use the correct project
firebase use YOUR_PROJECT_ID
```

### Error: "Permission denied" on deployment
```bash
# Re-login to Firebase
firebase login --reauth
```

### Error: "Module not found" in frontend
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: Git push rejected
```bash
# Pull latest changes first
git pull origin main --rebase
git push origin main
```

---

## Next Steps After Setup

1. ✅ **Test Authentication** - Create accounts, test login
2. ✅ **Test Firestore** - Data should save to Firebase
3. ✅ **Check Firebase Console** - See users and data
4. 📝 **Start Implementing Features** - Follow IMPLEMENTATION_GUIDE.md
5. 🚀 **Deploy Updates** - `firebase deploy` after each feature

---

## Useful Links

- **Your Firebase Console**: https://console.firebase.google.com/project/YOUR_PROJECT_ID
- **Your GitHub Repo**: https://github.com/YOUR_USERNAME/hosthelper
- **Your Live App** (after deploy): https://YOUR_PROJECT_ID.web.app
- **Firebase Docs**: https://firebase.google.com/docs
- **GitHub Docs**: https://docs.github.com

---

## Pro Tips

1. **Use GitHub Desktop** - Easier than command line for beginners
2. **Enable GitHub Actions** - Auto-deploy on push to main
3. **Use Firebase Emulators** - Test locally without affecting production
4. **Commit Often** - Small, frequent commits are better
5. **Test Before Deploy** - Always test locally first

---

Need help? Just ask! I'm here to guide you through each step. 🚀

# HostHelper Setup Checklist

Use this checklist to track your setup progress. Check off items as you complete them.

---

## 📋 GitHub Setup

### Step 1: Git Initialization
- [ ] Navigate to project directory
  ```bash
  cd /Users/a.j.skidmore/Downloads/Portfolio\ Stuff/Portfolio/hosthelper
  ```
- [ ] Initialize git: `git init`
- [ ] Add files: `git add .`
- [ ] Initial commit: `git commit -m "Initial commit: HostHelper platform"`

### Step 2: Create GitHub Repository
- [ ] Go to [github.com/new](https://github.com/new)
- [ ] Name: `hosthelper`
- [ ] Description: `Full-stack rental management platform - React, Firebase, GraphQL, Python`
- [ ] Set as **Public**
- [ ] **DO NOT** check any initialization options
- [ ] Click **Create Repository**

### Step 3: Connect to GitHub
- [ ] Add remote (replace YOUR_USERNAME):
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/hosthelper.git
  ```
- [ ] Verify: `git remote -v`
- [ ] Set main branch: `git branch -M main`
- [ ] Push: `git push -u origin main`
- [ ] Verify on GitHub - check your repo online

**✅ GitHub URL**: `https://github.com/YOUR_USERNAME/hosthelper`

---

## 🔥 Firebase Setup

### Step 1: Install Firebase CLI
- [ ] Install: `npm install -g firebase-tools`
- [ ] Verify: `firebase --version`
- [ ] Should show version 12.0.0 or higher

### Step 2: Login to Firebase
- [ ] Run: `firebase login`
- [ ] Sign in with Google account in browser
- [ ] Verify success message in terminal

### Step 3: Create Firebase Project
- [ ] Go to [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Click **Add Project**
- [ ] Project name: `hosthelper` or `hosthelper-demo`
- [ ] Click **Continue**
- [ ] Google Analytics: Your choice (can disable)
- [ ] Click **Create Project**
- [ ] Wait for creation (~30 seconds)
- [ ] Click **Continue**

**✅ Firebase Project**: `_________________________`

### Step 4: Initialize Firebase in Project
- [ ] Run: `firebase init`
- [ ] Select: Firestore, Functions, Hosting, Storage (use Space bar, then Enter)
- [ ] Choose: **Use an existing project**
- [ ] Select your `hosthelper` project
- [ ] Accept all defaults (press Enter for each prompt)
- [ ] Say **No** to overwriting existing files
- [ ] Say **Yes** to install dependencies

### Step 5: Enable Authentication
- [ ] In Firebase Console → **Authentication**
- [ ] Click **Get Started**
- [ ] Go to **Sign-in method** tab
- [ ] Enable **Email/Password** provider
- [ ] Enable **Google** provider (select support email)
- [ ] Click **Save**

### Step 6: Enable Firestore Database
- [ ] In Firebase Console → **Firestore Database**
- [ ] Click **Create Database**
- [ ] Select **Start in test mode**
- [ ] Choose location: `us-central1` (or nearest)
- [ ] Click **Enable**
- [ ] Wait for database creation

### Step 7: Enable Cloud Storage
- [ ] In Firebase Console → **Storage**
- [ ] Click **Get Started**
- [ ] Click **Next** (default rules)
- [ ] Choose same location as Firestore
- [ ] Click **Done**

### Step 8: Get Firebase Config
- [ ] In Firebase Console → **Project Settings** (gear icon ⚙️)
- [ ] Scroll to **Your apps**
- [ ] Click **Web** icon (`</>`)
- [ ] App nickname: `HostHelper Web`
- [ ] Check **Also set up Firebase Hosting**
- [ ] Click **Register app**
- [ ] **COPY the config object** (keep this handy!)

**Paste your config here for reference:**
```javascript
apiKey: ___________________________________
authDomain: ________________________________
projectId: _________________________________
storageBucket: _____________________________
messagingSenderId: _________________________
appId: _____________________________________
```

### Step 9: Configure Environment Variables
- [ ] Open `.env` file in project root
- [ ] Fill in Firebase values from Step 8:
  ```env
  VITE_FIREBASE_API_KEY=your_api_key
  VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=your_project_id
  VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  VITE_FIREBASE_APP_ID=your_app_id
  ```
- [ ] Save the file

### Step 10: Deploy Security Rules
- [ ] Deploy Firestore rules:
  ```bash
  firebase deploy --only firestore:rules
  firebase deploy --only firestore:indexes
  ```
- [ ] Deploy Storage rules:
  ```bash
  firebase deploy --only storage
  ```
- [ ] Verify success messages

---

## 🧪 Testing Your Setup

### Test 1: Install Dependencies
- [ ] Run setup script: `./setup.sh`
  OR manually:
  ```bash
  npm install
  cd frontend && npm install
  cd ../firebase/functions && npm install
  ```

### Test 2: Start Development Server
- [ ] Navigate to frontend: `cd frontend`
- [ ] Start dev server: `npm run dev`
- [ ] Opens at: http://localhost:3000
- [ ] **Don't close this terminal**

### Test 3: Test Authentication
- [ ] Open http://localhost:3000
- [ ] Click **Sign up**
- [ ] Select role: **Property Owner**
- [ ] Enter name, email, password
- [ ] Click **Create Account**
- [ ] Should redirect to dashboard

**✅ If you see the dashboard, setup is successful!**

### Test 4: Verify in Firebase Console
- [ ] Open Firebase Console
- [ ] Go to **Authentication** → **Users**
- [ ] See your test user listed
- [ ] Go to **Firestore Database** → **Data**
- [ ] See `users` collection with your data

---

## 🚀 Optional: Deploy to Firebase Hosting

### Build and Deploy
- [ ] Stop dev server (Ctrl+C)
- [ ] Build frontend:
  ```bash
  cd frontend
  npm run build
  ```
- [ ] Deploy:
  ```bash
  cd ..
  firebase deploy
  ```
- [ ] Wait for deployment (~2 minutes)
- [ ] Get your live URL from output

**✅ Live App URL**: `https://_________________________.web.app`

### Test Live App
- [ ] Open your live URL
- [ ] Test login with your account
- [ ] Verify dashboard loads

---

## 🎉 Final Steps

### Commit Everything
- [ ] Add files: `git add .`
- [ ] Commit: `git commit -m "Add Firebase configuration"`
- [ ] Push: `git push origin main`

### Update README with URLs
- [ ] Edit README.md
- [ ] Add your GitHub repo URL
- [ ] Add your Firebase app URL
- [ ] Commit and push

---

## ✅ Setup Complete!

When all items are checked, you have:
- ✅ Code on GitHub
- ✅ Firebase project configured
- ✅ Authentication working
- ✅ Database ready
- ✅ App running locally
- ✅ (Optional) App deployed live

---

## 📞 Need Help?

**Stuck on a step?** Common solutions:

1. **Firebase login fails**
   - Try: `firebase login --reauth`

2. **npm install errors**
   - Try: `rm -rf node_modules && npm install`

3. **Can't connect to Firebase**
   - Check `.env` file has correct values
   - Verify Firebase project is active

4. **Git push rejected**
   - Try: `git pull origin main --rebase`
   - Then: `git push origin main`

5. **Port 3000 in use**
   - Kill process: `lsof -ti:3000 | xargs kill -9`

---

## 🎯 What's Next?

After setup is complete:
1. Read [IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md)
2. Start with Properties page
3. Build remaining features
4. Deploy updates regularly

**Estimated time to complete MVP**: 16-20 hours

---

**Setup started**: ___/___/___
**Setup completed**: ___/___/___
**Time taken**: _____ hours

Good luck! 🚀

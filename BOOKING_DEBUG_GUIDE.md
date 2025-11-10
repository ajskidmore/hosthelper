# Booking Debug Guide

## Issue: Bookings not appearing after creation

### What I've Fixed:

1. ✅ **Added Firestore Indexes** - Deployed new indexes for `ownerId + checkInDate` queries
2. ✅ **Added Debug Logging** - Console logs to track booking creation and queries
3. ✅ **Fixed BookingDialog rendering** - Dialog now always mounted

### How to Debug:

#### Step 1: Open Browser Console
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Filter for "[BOOKINGS]" or "[useBookings]"

#### Step 2: Create a Booking
1. Click "Add Booking" button
2. Fill out the form
3. Click "Add Booking" in the dialog

#### Step 3: Check Console Logs

You should see:
```
[BOOKINGS] Saving booking: {propertyId: "...", ownerId: "...", ...}
[BOOKINGS] Booking created with ID: abc123
[useBookings] Query result: 1 bookings
```

### Common Issues & Solutions:

#### Issue 1: Index Still Building
**Symptoms**: Error in console about missing index

**Solution**: Wait 2-5 minutes for Firestore to build the index. Check status:
https://console.firebase.google.com/project/hosthelper2025/firestore/indexes

**How to check**: Look for index status - should be "Enabled" (green)

#### Issue 2: Security Rules Blocking Read
**Symptoms**:
- Booking saves successfully
- But query returns 0 bookings
- Console shows permission denied

**Solution**: Check that `ownerId` matches current user:
```javascript
// In console:
console.log('Current user ID:', user.id);
console.log('Booking ownerId:', booking.ownerId);
// These must match!
```

#### Issue 3: Real-time Listener Not Updating
**Symptoms**:
- Booking exists in Firestore
- Page refresh shows booking
- But doesn't appear immediately

**Solution**: Check if `useFirestoreQuery` is receiving updates:
```javascript
// Should see this in console after creating booking:
[useBookings] Query result: 1 bookings  // ← Should increment
```

#### Issue 4: Wrong Property Selected
**Symptoms**: Booking created but filtered out

**Solution**: Check if `selectedPropertyId` filter is excluding it:
```javascript
// In Bookings.tsx, temporarily log:
console.log('Selected property:', selectedPropertyId);
console.log('Booking property:', booking.propertyId);
```

### Testing Checklist:

- [ ] Browser console open
- [ ] Create new booking
- [ ] Check console for "[BOOKINGS] Booking created with ID: ..."
- [ ] Check console for "[useBookings] Query result: X bookings"
- [ ] Verify booking appears in calendar
- [ ] Verify booking appears in table view
- [ ] Refresh page - booking should still be there

### Manual Firestore Check:

1. Go to Firebase Console: https://console.firebase.google.com/project/hosthelper2025/firestore
2. Navigate to `bookings` collection
3. Find the booking you just created
4. Verify fields:
   - ✅ `ownerId` exists and matches your user ID
   - ✅ `propertyId` exists
   - ✅ `checkInDate` and `checkOutDate` exist
   - ✅ All other required fields present

### Index Status Check:

Required indexes (should all be "Enabled"):
1. `bookings`: `ownerId (ASC) + checkInDate (DESC)`
2. `bookings`: `ownerId (ASC) + propertyId (ASC) + checkInDate (DESC)`

Check at: https://console.firebase.google.com/project/hosthelper2025/firestore/indexes

### Next Steps:

1. Wait 2-5 minutes for indexes to build (if just deployed)
2. Try creating a booking
3. Check console logs
4. If still not working, share console output

### Expected Console Output:

```
[BOOKINGS] Auto-selecting first property: abc123
[useBookings] Building query for user: xyz789
[useBookings] Filtering by propertyId: abc123
[useBookings] Query result: 0 bookings
[BOOKINGS] Saving booking: {propertyId: "abc123", ownerId: "xyz789", guestName: "John Doe", ...}
[BOOKINGS] Booking created with ID: def456
[useBookings] Query result: 1 bookings
[useBookings] Sample booking: {id: "def456", guestName: "John Doe", ...}
```

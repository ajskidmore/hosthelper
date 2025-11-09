import { where, orderBy } from 'firebase/firestore';
import { useFirestore, useFirestoreQuery } from './useFirestore';
import { Booking } from '../types';
import { useAuth } from './useAuth';

export function useBookings(propertyId?: string) {
  const { user } = useAuth();
  const firestoreHook = useFirestore<Booking>('bookings');

  // Build query constraints - only create query when user exists
  const constraints = user ? (() => {
    const c = [];
    // Always filter by ownerId to only get current user's bookings
    c.push(where('ownerId', '==', user.id));
    // Optionally filter by specific property
    if (propertyId) {
      c.push(where('propertyId', '==', propertyId));
    }
    c.push(orderBy('checkInDate', 'desc'));
    return c;
  })() : [];

  const { documents: bookings, loading, error } = useFirestoreQuery<Booking>(
    'bookings',
    constraints
  );

  return {
    bookings: user ? bookings : [],
    loading: user ? loading : false,
    error,
    addBooking: firestoreHook.addDocument,
    updateBooking: firestoreHook.updateDocument,
    deleteBooking: firestoreHook.deleteDocument,
    getBooking: firestoreHook.getDocument,
  };
}

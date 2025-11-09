import { where } from 'firebase/firestore';
import { useFirestore, useFirestoreQuery } from './useFirestore';
import { Property } from '../types';
import { useAuth } from './useAuth';

export function useProperties() {
  const { user } = useAuth();
  const firestoreHook = useFirestore<Property>('properties');

  // Get properties for current user (owner role)
  // Temporarily simplified query - will add orderBy once indexes are built
  const { documents: properties, loading, error } = useFirestoreQuery<Property>(
    'properties',
    user?.currentRole === 'owner' && user?.id
      ? [where('ownerId', '==', user.id)]
      : []
  );

  return {
    properties,
    loading,
    error,
    addProperty: firestoreHook.addDocument,
    updateProperty: firestoreHook.updateDocument,
    deleteProperty: firestoreHook.deleteDocument,
    getProperty: firestoreHook.getDocument,
  };
}

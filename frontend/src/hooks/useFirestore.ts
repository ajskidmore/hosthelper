import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  onSnapshot,
  Timestamp,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../services/firebase';

// Generic Firestore hook for CRUD operations
export function useFirestore<T extends DocumentData>(collectionName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add a document
  const addDocument = useCallback(
    async (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      setError(null);
      try {
        const docRef = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        return docRef.id;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  // Update a document
  const updateDocument = useCallback(
    async (id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>) => {
      setLoading(true);
      setError(null);
      try {
        await updateDoc(doc(db, collectionName, id), {
          ...data,
          updatedAt: Timestamp.now(),
        });
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  // Delete a document
  const deleteDocument = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await deleteDoc(doc(db, collectionName, id));
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  // Get a single document
  const getDocument = useCallback(
    async (id: string): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as unknown as T;
        }
        return null;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  return {
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
  };
}

// Hook for real-time subscriptions
export function useFirestoreQuery<T extends DocumentData>(
  collectionName: string,
  queryConstraints: QueryConstraint[] = []
) {
  const [documents, setDocuments] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, collectionName), ...queryConstraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as unknown as T[];
        setDocuments(docs);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { documents, loading, error };
}

// Helper to convert Firestore Timestamp to Date
export function timestampToDate(timestamp: any): Date {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
}

import { where, orderBy, or } from 'firebase/firestore';
import { useFirestore, useFirestoreQuery } from './useFirestore';
import { Task } from '../types';
import { useAuth } from './useAuth';

export function useTasks(propertyId?: string) {
  const { user } = useAuth();
  const firestoreHook = useFirestore<Task>('tasks');

  // Build query constraints based on user role
  const constraints = [];

  if (user?.currentRole === 'owner') {
    // Owners see tasks they created
    constraints.push(where('createdBy', '==', user.id));
    if (propertyId) {
      constraints.push(where('propertyId', '==', propertyId));
    }
  } else if (user?.currentRole === 'provider') {
    // Providers see tasks assigned to them or available (posted) tasks
    constraints.push(
      or(
        where('assignedTo', '==', user.id),
        where('status', '==', 'posted')
      )
    );
  }

  constraints.push(orderBy('scheduledFor', 'desc'));

  const { documents: tasks, loading, error } = useFirestoreQuery<Task>(
    'tasks',
    user ? constraints : []
  );

  return {
    tasks,
    loading,
    error,
    addTask: firestoreHook.addDocument,
    updateTask: firestoreHook.updateDocument,
    deleteTask: firestoreHook.deleteDocument,
    getTask: firestoreHook.getDocument,
  };
}

// Hook for available jobs (providers)
export function useAvailableJobs() {
  const { user } = useAuth();

  const { documents: jobs, loading, error } = useFirestoreQuery<Task>(
    'tasks',
    user?.currentRole === 'provider'
      ? [
          where('isPublic', '==', true),
          where('status', '==', 'posted'),
          orderBy('scheduledFor', 'asc'),
        ]
      : []
  );

  return { jobs, loading, error };
}

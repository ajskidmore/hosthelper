import { where, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useFirestoreQuery } from './useFirestore';
import { Notification } from '../types';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { user } = useAuth();
  const firestoreHook = useFirestore<Notification>('notifications');

  const { documents: notifications, loading, error } = useFirestoreQuery<Notification>(
    'notifications',
    user
      ? [where('userId', '==', user.id), orderBy('createdAt', 'desc'), limit(50)]
      : []
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (notificationId: string) => {
    await firestoreHook.updateDocument(notificationId, { isRead: true });
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    await Promise.all(
      unreadNotifications.map((n) => firestoreHook.updateDocument(n.id, { isRead: true }))
    );
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  };
}

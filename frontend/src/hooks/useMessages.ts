import { where, orderBy } from 'firebase/firestore';
import { useFirestore, useFirestoreQuery } from './useFirestore';
import { Message, Conversation } from '../types';
import { useAuth } from './useAuth';

export function useConversations() {
  const { user } = useAuth();
  const conversationsHook = useFirestore<Conversation>('conversations');

  const { documents: conversations, loading, error } = useFirestoreQuery<Conversation>(
    'conversations',
    user ? [where('participants', 'array-contains', user.id), orderBy('updatedAt', 'desc')] : []
  );

  return {
    conversations,
    loading,
    error,
    addConversation: conversationsHook.addDocument,
    updateConversation: conversationsHook.updateDocument,
  };
}

export function useMessages(conversationId?: string) {
  const firestoreHook = useFirestore<Message>('messages');

  const { documents: messages, loading, error } = useFirestoreQuery<Message>(
    'messages',
    conversationId
      ? [where('conversationId', '==', conversationId), orderBy('createdAt', 'asc')]
      : []
  );

  return {
    messages,
    loading,
    error,
    sendMessage: firestoreHook.addDocument,
    updateMessage: firestoreHook.updateDocument,
    deleteMessage: firestoreHook.deleteDocument,
  };
}

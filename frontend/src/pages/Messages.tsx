import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  ListItemButton,
} from '@mui/material';
import {
  Send,
  Add,
  Message as MessageIcon,
} from '@mui/icons-material';
import { useConversations, useMessages } from '../hooks/useMessages';
import { useAuth } from '../hooks/useAuth';
import { Conversation } from '../types';
import { timestampToDate } from '../hooks/useFirestore';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

const Messages = () => {
  const { user } = useAuth();
  const { conversations, addConversation, updateConversation } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { messages, sendMessage } = useMessages(selectedConversation?.id);
  const [newMessage, setNewMessage] = useState('');
  const [newConvoOpen, setNewConvoOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (!selectedConversation || !user) return;

    const markMessagesAsRead = async () => {
      try {
        const unreadMessages = messages.filter(
          (msg) => msg.recipientId === user.id && !msg.isRead
        );

        for (const msg of unreadMessages) {
          await updateDoc(doc(db, 'messages', msg.id), { isRead: true });
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error marking messages as read:', error);
        }
      }
    };

    markMessagesAsRead();
  }, [selectedConversation, messages, user]);

  useEffect(() => {
    // Load users based on role
    const loadUsers = async () => {
      if (!user) return;

      try {
        const usersRef = collection(db, 'users');

        // Owners can message providers, providers can message owners
        const q = user.currentRole === 'owner'
          ? query(usersRef, where('roles', 'array-contains', 'provider'))
          : query(usersRef, where('roles', 'array-contains', 'owner'));

        const snapshot = await getDocs(q);
        const users = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as any))
          .filter((u: any) => u.id !== user.id);
        setAvailableUsers(users);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading users:', error);
        }
      }
    };

    loadUsers();
  }, [user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const otherParticipantId = selectedConversation.participants.find(
      (p) => p !== user.id
    );

    if (!otherParticipantId) return;

    try {
      const messageData = {
        conversationId: selectedConversation.id,
        senderId: user.id,
        recipientId: otherParticipantId,
        content: newMessage.trim(),
        isRead: false,
      };

      const messageId = await sendMessage(messageData as any);

      // Update conversation with last message and timestamp
      await updateConversation(selectedConversation.id, {
        lastMessage: {
          ...messageData,
          id: messageId || '',
          createdAt: Timestamp.now(),
        },
      } as any);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleStartConversation = async () => {
    if (!selectedUserId || !user) return;

    try {
      // Check if conversation already exists
      const existing = conversations.find((c) =>
        c.participants.includes(selectedUserId) && c.participants.includes(user.id)
      );

      if (existing) {
        setSelectedConversation(existing);
        setNewConvoOpen(false);
        setSelectedUserId('');
        return;
      }

      // Create new conversation
      await addConversation({
        participants: [user.id, selectedUserId],
        updatedAt: new Date(),
      } as any);

      setNewConvoOpen(false);
      setSelectedUserId('');

      // Wait a bit for the conversation to be created and loaded
      setTimeout(() => {
        const created = conversations.find((c) =>
          c.participants.includes(selectedUserId) && c.participants.includes(user.id)
        );
        if (created) {
          setSelectedConversation(created);
        }
      }, 500);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating conversation:', error);
      }
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const otherUserId = conversation.participants.find((p) => p !== user?.id);
    const otherUser = availableUsers.find((u) => u.id === otherUserId);
    return otherUser || { displayName: 'Unknown User', email: '' };
  };

  const formatTime = (date: any) => {
    const messageDate = timestampToDate(date);
    const now = new Date();
    const diff = now.getTime() - messageDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Messages
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Communicate with {user?.currentRole === 'owner' ? 'service providers' : 'property owners'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setNewConvoOpen(true)}
        >
          New Message
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ height: 'calc(100vh - 280px)' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            {conversations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No conversations yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start a new conversation to get started
                </Typography>
              </Box>
            ) : (
              <List>
                {conversations.map((conversation) => {
                  const otherUser = getOtherParticipant(conversation);
                  return (
                    <ListItemButton
                      key={conversation.id}
                      selected={selectedConversation?.id === conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <ListItemAvatar>
                        <Avatar>{otherUser.displayName?.charAt(0) || 'U'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={otherUser.displayName || 'Unknown User'}
                        secondary={conversation.lastMessage?.content || 'No messages yet'}
                        secondaryTypographyProps={{
                          noWrap: true,
                          sx: { maxWidth: '200px' },
                        }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Message Thread */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">
                    {getOtherParticipant(selectedConversation).displayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getOtherParticipant(selectedConversation).email}
                  </Typography>
                </Box>

                {/* Messages */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  {messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No messages yet. Start the conversation!
                      </Typography>
                    </Box>
                  ) : (
                    messages.map((message) => (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent:
                            message.senderId === user?.id ? 'flex-end' : 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Paper
                          sx={{
                            p: 1.5,
                            maxWidth: '70%',
                            bgcolor:
                              message.senderId === user?.id
                                ? 'primary.main'
                                : 'grey.100',
                            color:
                              message.senderId === user?.id
                                ? 'primary.contrastText'
                                : 'text.primary',
                          }}
                        >
                          <Typography variant="body1">{message.content}</Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              opacity: 0.7,
                            }}
                          >
                            {formatTime(message.createdAt)}
                          </Typography>
                        </Paper>
                      </Box>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Input */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      multiline
                      maxRows={4}
                    />
                    <IconButton
                      color="primary"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Select a conversation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose a conversation from the list to start messaging
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* New Conversation Dialog */}
      <Dialog open={newConvoOpen} onClose={() => setNewConvoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start New Conversation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a {user?.currentRole === 'owner' ? 'service provider' : 'property owner'} to message
          </Typography>
          <List>
            {availableUsers.map((availableUser) => (
              <ListItemButton
                key={availableUser.id}
                selected={selectedUserId === availableUser.id}
                onClick={() => setSelectedUserId(availableUser.id)}
              >
                <ListItemAvatar>
                  <Avatar>{availableUser.displayName?.charAt(0) || 'U'}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={availableUser.displayName}
                  secondary={availableUser.email}
                />
              </ListItemButton>
            ))}
          </List>
          {availableUsers.length === 0 && (
            <Alert severity="info">
              No {user?.currentRole === 'owner' ? 'service providers' : 'property owners'} available to message yet.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewConvoOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleStartConversation}
            disabled={!selectedUserId}
          >
            Start Conversation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages;

/**
 * HostHelper Firebase Cloud Functions
 *
 * This file will contain:
 * - GraphQL API server (Apollo Server)
 * - Firestore triggers for notifications
 * - Scheduled functions for booking sync
 * - HTTP endpoints for webhooks
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export Firestore and Auth for use in other modules
export const db = admin.firestore();
export const auth = admin.auth();

/**
 * Example: GraphQL API Endpoint
 *
 * To implement, uncomment and install dependencies:
 * npm install @apollo/server graphql express
 *
 * Then create the Apollo Server setup
 */

// import { ApolloServer } from '@apollo/server';
// import { expressMiddleware } from '@apollo/server/express4';
// import express from 'express';
// import { typeDefs } from './graphql/schema';
// import { resolvers } from './graphql/resolvers';

// const app = express();

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
// });

// server.start().then(() => {
//   app.use('/graphql', expressMiddleware(server));
// });

// export const graphql = functions.https.onRequest(app);

/**
 * Firestore Trigger: Create Notification on New Booking
 */
export const onBookingCreated = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snap, context) => {
    const booking = snap.data();
    const bookingId = context.params.bookingId;

    try {
      // Get property to find owner
      const propertyDoc = await db.doc(`properties/${booking.propertyId}`).get();
      const property = propertyDoc.data();

      if (!property) {
        console.error('Property not found for booking:', bookingId);
        return;
      }

      // Create notification for property owner
      await db.collection('notifications').add({
        userId: property.ownerId,
        type: 'new_booking',
        title: 'New Booking Received',
        message: `You have a new booking from ${booking.guestName} for ${property.name}`,
        data: {
          bookingId,
          propertyId: booking.propertyId,
        },
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('Notification created for new booking:', bookingId);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  });

/**
 * Firestore Trigger: Notify Provider When Task is Assigned
 */
export const onTaskAssigned = functions.firestore
  .document('tasks/{taskId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const taskId = context.params.taskId;

    // Check if task was just assigned
    if (!before.assignedTo && after.assignedTo) {
      try {
        // Create notification for service provider
        await db.collection('notifications').add({
          userId: after.assignedTo,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You've been assigned: ${after.title}`,
          data: {
            taskId,
            propertyId: after.propertyId,
          },
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log('Notification created for task assignment:', taskId);
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }
  });

/**
 * HTTP Function: Webhook for Platform Booking Sync
 *
 * This would receive webhooks from Airbnb/Vrbo when bookings change
 */
export const platformWebhook = functions.https.onRequest(async (req, res) => {
  // Verify webhook signature here
  // const signature = req.headers['x-webhook-signature'];

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { platform, eventType, data } = req.body;

    console.log(`Received ${platform} webhook:`, eventType);

    // Process based on event type
    switch (eventType) {
      case 'booking.created':
        // Create booking in Firestore
        await db.collection('bookings').add({
          ...data,
          bookingSource: platform,
          externalBookingId: data.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;

      case 'booking.updated':
        // Update existing booking
        const bookingQuery = await db
          .collection('bookings')
          .where('externalBookingId', '==', data.id)
          .limit(1)
          .get();

        if (!bookingQuery.empty) {
          await bookingQuery.docs[0].ref.update({
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;

      case 'booking.cancelled':
        // Update booking status
        const cancelQuery = await db
          .collection('bookings')
          .where('externalBookingId', '==', data.id)
          .limit(1)
          .get();

        if (!cancelQuery.empty) {
          await cancelQuery.docs[0].ref.update({
            status: 'cancelled',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Scheduled Function: Daily Sync of Platform Bookings
 *
 * Runs daily at 3 AM to sync bookings from connected platforms
 */
export const scheduledBookingSync = functions.pubsub
  .schedule('0 3 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Starting scheduled booking sync');

    try {
      // Get all properties with connected platforms
      const propertiesSnapshot = await db.collection('properties').get();

      for (const propertyDoc of propertiesSnapshot.docs) {
        const property = propertyDoc.data();

        if (!property.connectedPlatforms || property.connectedPlatforms.length === 0) {
          continue;
        }

        // Sync each connected platform
        for (const platform of property.connectedPlatforms) {
          if (platform.isActive) {
            console.log(`Syncing ${platform.platform} for property ${propertyDoc.id}`);

            // Call Python service to sync bookings
            // const syncResult = await callPythonSyncService(propertyDoc.id, platform.platform);

            // Update last synced timestamp
            await propertyDoc.ref.update({
              [`connectedPlatforms.${platform.platform}.lastSyncedAt`]: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }
      }

      console.log('Scheduled booking sync completed');
    } catch (error) {
      console.error('Scheduled sync error:', error);
    }
  });

/**
 * Callable Function: Send Message
 *
 * Allows authenticated users to send messages
 */
export const sendMessage = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { recipientId, content, conversationId } = data;
  const senderId = context.auth.uid;

  try {
    // Create or update conversation
    let convId = conversationId;

    if (!convId) {
      // Create new conversation
      const convRef = await db.collection('conversations').add({
        participants: [senderId, recipientId],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      convId = convRef.id;
    }

    // Add message
    const messageRef = await db.collection('messages').add({
      conversationId: convId,
      senderId,
      recipientId,
      content,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update conversation
    await db.doc(`conversations/${convId}`).update({
      lastMessageId: messageRef.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create notification for recipient
    await db.collection('notifications').add({
      userId: recipientId,
      type: 'new_message',
      title: 'New Message',
      message: `You have a new message`,
      data: {
        conversationId: convId,
        messageId: messageRef.id,
      },
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { messageId: messageRef.id, conversationId: convId };
  } catch (error) {
    console.error('Error sending message:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send message');
  }
});

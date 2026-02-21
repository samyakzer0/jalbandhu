import { initializeApp } from 'firebase/app';
   import { 
     getMessaging, 
     getToken, 
     onMessage,
     isSupported 
   } from 'firebase/messaging';
   import { createNotification } from './EnhancedNotificationService';

   // Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4MVpInfv-6N-7JxpATe8KdpgsyRW5ZLY",
  authDomain: "civicgo-3f964.firebaseapp.com",
  projectId: "civicgo-3f964",
  storageBucket: "civicgo-3f964.firebasestorage.app",
  messagingSenderId: "600054915545",
  appId: "1:600054915545:web:c5f2333ff323e9eb1339c8",
  measurementId: "G-BLET4QTXDP"
};


   // Initialize Firebase - only if browser supports it
   let messaging: any = null;
   let firebaseApp: any = null;

   export const initializeFirebaseMessaging = async () => {
     try {
       // Check if browser supports Firebase Messaging
       const isFirebaseSupported = await isSupported();
       
       if (!isFirebaseSupported) {
         console.log('Firebase messaging is not supported in this browser');
         return false;
       }
       
       // Initialize Firebase app if not already initialized
       if (!firebaseApp) {
         firebaseApp = initializeApp(firebaseConfig);
         messaging = getMessaging(firebaseApp);
         console.log('Firebase initialized successfully');
       }
       
       return true;
     } catch (error) {
       console.error('Error initializing Firebase:', error);
       return false;
     }
   };

   // Request notification permission and get FCM token (only if already granted)
   export const requestNotificationPermission = async (): Promise<string | null> => {
     try {
       const isInitialized = await initializeFirebaseMessaging();
       
       if (!isInitialized || !messaging) {
         console.log('Firebase messaging not initialized or not supported');
         return null;
       }
       
       // Check if permission is already granted
       if (Notification.permission === 'granted') {
         // Get FCM token
         const token = await getToken(messaging, {
           vapidKey: '7wOFq1ywBbi0sBBKS6uP8SMt--iZoeOqKoYjfaKoUaQ'
         });
         
         console.log('FCM Token:', token);
         return token;
       } else {
         console.log('Notification permission not granted');
         return null;
       }
     } catch (error) {
       console.error('Error requesting notification permission:', error);
       return null;
     }
   };

   // Request notification permission on user gesture
   export const requestNotificationPermissionOnGesture = async (): Promise<string | null> => {
     try {
       const isInitialized = await initializeFirebaseMessaging();
       
       if (!isInitialized || !messaging) {
         console.log('Firebase messaging not initialized or not supported');
         return null;
       }
       
       // Request permission (this should be called from a user gesture)
       const permission = await Notification.requestPermission();
       
       if (permission === 'granted') {
         // Get FCM token
         const token = await getToken(messaging, {
           vapidKey: '7wOFq1ywBbi0sBBKS6uP8SMt--iZoeOqKoYjfaKoUaQ'
         });
         
         console.log('FCM Token:', token);
         return token;
       } else {
         console.log('Notification permission denied');
         return null;
       }
     } catch (error) {
       console.error('Error requesting notification permission:', error);
       return null;
     }
   };

   // Handle foreground messages
   export const onForegroundMessage = (userId: string) => {
     if (!messaging) return;
     
     onMessage(messaging, (payload) => {
       console.log('Received foreground message:', payload);
       
       // Extract notification data
       const title = payload.notification?.title || 'New Notification';
       const message = payload.notification?.body || '';
       const type = (payload.data?.type as any) || 'info';
       
       // Create notification in our system using EnhancedNotificationService
       createNotification({
         user_id: userId,
         title,
         message,
         type,
         read: false,
         related_report_id: payload.data?.reportId,
         fcm_token: payload.data?.fcmToken,
       });
       
       // Show browser notification if needed (fallback)
       if (!document.hasFocus()) {
         showBrowserNotification(title, message);
       }
     });
   };

   // Helper function to show browser notification
   const showBrowserNotification = (title: string, body: string) => {
     if (Notification.permission === 'granted') {
       const options = {
         body,
         icon: '/favicon.ico',
       };
       
       const notification = new Notification(title, options);
       
       // Handle notification click
       notification.onclick = () => {
         window.focus();
         notification.close();
       };
     }
   };

   export default {
     initializeFirebaseMessaging,
     requestNotificationPermission,
     requestNotificationPermissionOnGesture,
     onForegroundMessage
   };
// This file must be in the public folder at the root level
   
// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyC4MVpInfv-6N-7JxpATe8KdpgsyRW5ZLY",
  authDomain: "civicgo-3f964.firebaseapp.com",
  projectId: "civicgo-3f964",
  storageBucket: "civicgo-3f964.firebasestorage.app",
  messagingSenderId: "600054915545",
  appId: "1:600054915545:web:c5f2333ff323e9eb1339c8",
  measurementId: "G-BLET4QTXDP"
});


// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

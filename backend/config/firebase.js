const admin = require('firebase-admin');

let firebaseApp = null;

function initializeFirebase() {
  if (firebaseApp) return firebaseApp;

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization skipped:', error.message);
  }

  return firebaseApp;
}

async function sendPushNotification(token, title, body, data = {}) {
  if (!firebaseApp) {
    console.warn('Firebase not initialized, skipping push notification');
    return null;
  }

  const message = {
    notification: { title, body },
    data,
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error('Push notification failed:', error.message);
    return null;
  }
}

module.exports = { initializeFirebase, sendPushNotification };

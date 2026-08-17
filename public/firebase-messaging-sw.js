importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBL_Rww3GKGXxXIJw0AI9xYaKxzRQtXuwY",
  authDomain: "grooming-centre-5a694.firebaseapp.com",
  projectId: "grooming-centre-5a694",
  storageBucket: "grooming-centre-5a694.firebasestorage.app",
  messagingSenderId: "1000698209312",
  appId: "1:1000698209312:web:bc9b586d60e57ac4024845",
});

const messaging = firebase.messaging();

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const contentUrl =
    event.notification.data?.contentUrl ||
    event.notification.data?.content_url ||
    "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((client) => "focus" in client);
        if (existing) {
          existing.focus();
          existing.navigate(contentUrl);
          return;
        }
        return self.clients.openWindow(contentUrl);
      })
  );
});
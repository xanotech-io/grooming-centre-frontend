importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "grooming-centre-5a694.firebaseapp.com",
  projectId: "grooming-centre-5a694",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const contentUrl = event.notification.data?.contentUrl || "/";

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
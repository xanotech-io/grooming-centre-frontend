import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";
import { http } from "./http/http";

const VAPID_KEY =
  "BJPaBOkl1EOSTaAvrK1plMA39pMrA5jwvWL97NZC-ZwVxzzu2J5kVWbG1REp0QOpjLisxykz42IFb87S9dfskFs";
const DEVICE_ID_STORAGE_KEY = "fcmDeviceId";

/**
 * Requests notification permission, retrieves the FCM device token,
 * and registers it with the backend. Safe to call on every authenticated
 * app load (login, or a page refresh with a valid session) — the backend
 * dedupes by deviceId, and the web SDK has no separate refresh event, so
 * this is also how a rotated token gets re-registered.
 * @returns {Promise<string|undefined>} the device token, if obtained
 */
export const registerPushToken = async () => {
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  );

  const deviceId = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
  if (!deviceId) return;

  await http.post("/v1/device/create", { deviceId });
  localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);

  return deviceId;
};

/**
 * Unregisters this device's token from the backend. Call on logout so
 * stale tokens stop receiving the logged-out user's notifications.
 */
export const unregisterPushToken = async () => {
  const deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (!deviceId) return;

  localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
  await http.delete("/v1/device/delete", { data: { deviceId } });
};

/**
 * Subscribes to foreground push messages (tab open and focused).
 * @param {(payload: object) => void} onReceive
 * @returns {import('firebase/messaging').Unsubscribe}
 */
export const listenForForegroundMessages = (onReceive) =>
  onMessage(messaging, onReceive);

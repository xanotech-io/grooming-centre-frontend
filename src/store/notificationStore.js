import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_NOTIFICATIONS = 50;

const useNotificationStore = create(
  persist(
    (set) => ({
      notifications: [],

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            { ...notification, read: false },
            ...state.notifications,
          ].slice(0, MAX_NOTIFICATIONS),
        })),

      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          ),
        })),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        })),

      clearAll: () => set({ notifications: [] }),
    }),
    { name: "push-notifications-storage" }
  )
);

export default useNotificationStore;

import { useEffect, useRef } from "react";
import { useToast } from "@chakra-ui/toast";
import { registerPushToken, listenForForegroundMessages } from "../services/pushNotifications";

// Registers this device for compliance push notifications on login and
// surfaces foreground pushes as toasts. Reuses the shared Firebase app/
// messaging instance from services/firebase.js rather than initializing a
// second one.
const useCompliancePush = ({ enabled = true, onNotification } = {}) => {
  const toast = useToast();
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;

  useEffect(() => {
    if (!enabled) return undefined;

    registerPushToken().catch((err) =>
      console.error("[useCompliancePush] device registration failed", err)
    );

    const unsubscribe = listenForForegroundMessages((payload) => {
      toast({
        title: payload.notification?.title ?? "Compliance Notification",
        description: payload.notification?.body,
        status: "info",
        duration: 6000,
        isClosable: true,
      });
      onNotificationRef.current?.(payload);
    });

    return unsubscribe;
  }, [enabled, toast]);
};

export default useCompliancePush;

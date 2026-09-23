import { useState, useEffect } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [simulatedOffline, setSimulatedOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const effectiveOnline = isOnline && !simulatedOffline;

  const toggleSimulateOffline = () => {
    setSimulatedOffline((prev) => !prev);
  };

  return {
    isOnline: effectiveOnline,
    rawNavigatorOnline: isOnline,
    simulatedOffline,
    toggleSimulateOffline,
  };
}

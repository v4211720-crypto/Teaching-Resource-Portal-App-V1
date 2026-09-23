import React from "react";
import { WifiOff, AlertTriangle, CheckCircle2 } from "lucide-react";

interface OfflineIndicatorProps {
  isOnline: boolean;
  onRestoreOnline?: () => void;
  isSimulated?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  onRestoreOnline,
  isSimulated,
}) => {
  if (isOnline) return null;

  return (
    <div
      id="offline-banner"
      className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 animate-pulse shrink-0" />
        <span>
          <strong>Offline Mode</strong> &mdash; Internet connection is lost or unstable. Already-loaded files, videos, and documents remain accessible via Workbox offline caching.
          {isSimulated && " (Simulated Offline Test Mode Active)"}
        </span>
      </div>

      {isSimulated && onRestoreOnline && (
        <button
          onClick={onRestoreOnline}
          className="shrink-0 rounded-lg bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/30 transition"
        >
          End Simulation
        </button>
      )}
    </div>
  );
};

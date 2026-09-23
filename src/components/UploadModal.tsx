import React, { useState, useRef } from "react";
import { Folder, UploadProgressItem, SharingVisibility } from "../types";
import { api, getSavedDevice } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { getFileIconConfig } from "../services/fileIconService";
import {
  X,
  UploadCloud,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  FileText,
  Film,
  Music,
  Image as ImageIcon,
  Share2,
  StopCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  initialFolderId?: string | null;
  onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  folders,
  initialFolderId = null,
  onUploadSuccess,
}) => {
  const { currentDevice } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(initialFolderId);
  const [sharingVisibility, setSharingVisibility] = useState<SharingVisibility>("all_teachers");
  const [description, setDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<UploadProgressItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFilesAdded = (files: FileList | File[]) => {
    const newItems: UploadProgressItem[] = Array.from(files).map((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      let category: UploadProgressItem["type"] = "other";
      if (f.type.startsWith("video/") || ["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) {
        category = "video";
      } else if (f.type.startsWith("audio/") || ["mp3", "wav", "m4a", "aac", "ogg"].includes(ext)) {
        category = "audio";
      } else if (f.type.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
        category = "image";
      } else if (
        f.type.includes("pdf") ||
        f.type.includes("document") ||
        ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"].includes(ext)
      ) {
        category = "document";
      }

      return {
        id: "upload_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        file: f,
        name: f.name,
        size: f.size,
        type: category,
        progress: 0,
        loaded: 0,
        speed: "0 MB/s",
        timeRemaining: "Calculating...",
        status: "pending",
        folderId: selectedFolderId,
      };
    });

    setQueue((prev) => [...prev, ...newItems]);
  };

  const startUploadQueue = async () => {
    setIsUploading(true);

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === "completed" || item.status === "cancelled") continue;

      // Update item to uploading
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "uploading", progress: 5 } : q))
      );

      try {
        const { promise, cancel } = api.uploadFileWithProgress(
          item.file,
          selectedFolderId,
          (loaded, total, speed, timeRemaining) => {
            const pct = Math.round((loaded / total) * 100);
            setQueue((prev) =>
              prev.map((q) =>
                q.id === item.id
                  ? {
                      ...q,
                      progress: pct,
                      loaded,
                      speed,
                      timeRemaining,
                    }
                  : q
              )
            );
          },
          currentDevice,
          description,
          sharingVisibility
        );

        // Store cancel function
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, cancelFn: cancel } : q))
        );

        await promise;

        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: "completed", progress: 100 } : q))
        );
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: err.message?.includes("cancelled") ? "cancelled" : "error",
                  errorMessage: err.message || "Upload failed",
                }
              : q
          )
        );
      }
    }

    setIsUploading(false);
    onUploadSuccess();
  };

  const cancelItem = (item: UploadProgressItem) => {
    if ((item as any).cancelFn) {
      (item as any).cancelFn();
    }
    setQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: "cancelled", errorMessage: "Cancelled" } : q))
    );
  };

  const retryItem = async (item: UploadProgressItem) => {
    setQueue((prev) =>
      prev.map((q) =>
        q.id === item.id ? { ...q, status: "uploading", progress: 0, errorMessage: undefined } : q
      )
    );

    try {
      const { promise } = api.uploadFileWithProgress(
        item.file,
        selectedFolderId,
        (loaded, total, speed, timeRemaining) => {
          const pct = Math.round((loaded / total) * 100);
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? {
                    ...q,
                    progress: pct,
                    loaded,
                    speed,
                    timeRemaining,
                  }
                : q
            )
          );
        },
        currentDevice,
        description,
        sharingVisibility
      );

      await promise;

      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "completed", progress: 100 } : q))
      );
      onUploadSuccess();
    } catch (err: any) {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: "error", errorMessage: err.message || "Failed" } : q
        )
      );
    }
  };

  const removeItem = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Upload Educational Resources</h2>
              <p className="text-[11px] text-slate-500">
                Centrally stored in cloud for instant access on both Computer & Mobile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form & Upload Options */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Target Folder & Device Tagging */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FolderTree className="h-3.5 w-3.5 text-blue-600" />
                <span>Select Target Folder</span>
              </label>
              <select
                value={selectedFolderId || ""}
                onChange={(e) => setSelectedFolderId(e.target.value || null)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Root / General Resources</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.folder_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Sharing Visibility</span>
              </label>
              <select
                value={sharingVisibility}
                onChange={(e) => setSharingVisibility(e.target.value as SharingVisibility)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              >
                <option value="all_teachers">Shared with All Teachers</option>
                <option value="private">Private (Only Me)</option>
                <option value="admin_only">Admin Only</option>
              </select>
            </div>
          </div>

          {/* Current Device indicator */}
          <div className="flex items-center justify-between rounded-xl bg-blue-50/70 border border-blue-100 px-3.5 py-2.5">
            <div className="flex items-center gap-2 text-xs text-blue-900 font-medium">
              {currentDevice.includes("Mobile") ? (
                <Smartphone className="h-4 w-4 text-indigo-600 shrink-0" />
              ) : (
                <Laptop className="h-4 w-4 text-blue-600 shrink-0" />
              )}
              <span>
                Uploading from: <strong className="font-bold">{currentDevice}</strong>
              </span>
            </div>
            <span className="text-[11px] text-blue-700">
              Synced across all devices
            </span>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) {
                handleFilesAdded(e.dataTransfer.files);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFilesAdded(e.target.files);
                }
              }}
            />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-xs mb-3">
              <UploadCloud className="h-7 w-7" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              Click to browse files or drag and drop here
            </p>
            <p className="mt-1 text-[11px] text-slate-500 max-w-md mx-auto">
              Select files from your <strong>Desktop, Documents, Downloads, External Drives</strong> or mobile phone gallery.
            </p>
            <p className="mt-2 text-[10px] font-mono text-slate-400">
              EXE, ZIP, RAR, MP4, WebM, MOV, MP3, WAV, PDF, DOCX, XLSX, PPTX, Images & Educational Software (up to 500 MB)
            </p>
          </div>

          {/* Upload Queue Progress List (Section 9) */}
          {queue.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Upload Queue ({queue.length} file{queue.length !== 1 ? "s" : ""})</span>
                {queue.some((q) => q.status === "completed") && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Uploaded to Cloud
                  </span>
                )}
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {queue.map((item) => {
                  const isDone = item.status === "completed";
                  const isErr = item.status === "error";
                  const isCanc = item.status === "cancelled";
                  const isProg = item.status === "uploading";
                  const iconCfg = getFileIconConfig(item.name, item.type);
                  const IconComp = iconCfg.icon;

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconCfg.colors.bg} ${iconCfg.colors.text} border ${iconCfg.colors.border} shadow-2xs shrink-0 relative`}>
                            <IconComp className="h-4 w-4" />
                            <span className={`absolute -bottom-1 -right-1 text-[8px] font-bold px-1 rounded ${iconCfg.colors.badgeBg} ${iconCfg.colors.badgeText} leading-tight`}>
                              {iconCfg.badgeText}
                            </span>
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-400">
                              {formatBytes(item.size)} • {iconCfg.label}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isProg && (
                            <button
                              onClick={() => cancelItem(item)}
                              className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                              title="Cancel Upload"
                            >
                              <StopCircle className="h-3.5 w-3.5" />
                              <span>Cancel</span>
                            </button>
                          )}
                          {(isErr || isCanc) && (
                            <button
                              onClick={() => retryItem(item)}
                              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                              title="Retry Upload"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Retry</span>
                            </button>
                          )}
                          {!isProg && (
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 text-slate-400 hover:text-slate-600"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar (Displaying exact Section 9 spec) */}
                      {/* e.g. 156 MB / 200 MB, 78%, upload speed, time remaining */}
                      {(isProg || isDone) && (
                        <div className="space-y-1">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full transition-all duration-300 rounded-full ${
                                isDone ? "bg-emerald-500" : "bg-blue-600"
                              }`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>
                              {formatBytes(item.loaded || (item.size * item.progress) / 100)} / {formatBytes(item.size)}
                            </span>
                            <span className="font-bold text-slate-700">{item.progress}%</span>
                            {isProg && (
                              <span>
                                {item.speed} • {item.timeRemaining} left
                              </span>
                            )}
                            {isDone && <span className="text-emerald-600 font-semibold">Done</span>}
                          </div>
                        </div>
                      )}

                      {isErr && (
                        <p className="text-[11px] text-rose-600 font-medium">
                          {item.errorMessage || "Upload failed. Check your network or file size."}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition"
          >
            {queue.every((q) => q.status === "completed") && queue.length > 0 ? "Done" : "Cancel"}
          </button>

          {queue.length > 0 && !queue.every((q) => q.status === "completed") && (
            <button
              onClick={startUploadQueue}
              disabled={isUploading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <UploadCloud className="h-4 w-4" />
              <span>{isUploading ? "Uploading to Cloud..." : `Upload ${queue.length} File${queue.length > 1 ? "s" : ""}`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

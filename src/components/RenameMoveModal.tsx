import React, { useState } from "react";
import { FileItem, Folder } from "../types";
import { X, Edit2, FolderInput, Check } from "lucide-react";

interface RenameMoveModalProps {
  file: FileItem | null;
  folders: Folder[];
  mode: "rename" | "move";
  onClose: () => void;
  onRename: (fileId: string, newName: string) => Promise<void>;
  onMove: (fileId: string, newFolderId: string | null) => Promise<void>;
}

export const RenameMoveModal: React.FC<RenameMoveModalProps> = ({
  file,
  folders,
  mode,
  onClose,
  onRename,
  onMove,
}) => {
  const [fileName, setFileName] = useState(file?.file_name || "");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(file?.folder_id || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!file) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "rename") {
        if (!fileName.trim()) throw new Error("Filename cannot be empty");
        await onRename(file.id, fileName.trim());
      } else {
        await onMove(file.id, selectedFolderId);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            {mode === "rename" ? (
              <>
                <Edit2 className="h-4 w-4 text-blue-600" />
                <span>Rename File</span>
              </>
            ) : (
              <>
                <FolderInput className="h-4 w-4 text-blue-600" />
                <span>Move File to Folder</span>
              </>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-600 font-medium">{error}</div>}

          {mode === "rename" ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Filename</label>
              <input
                type="text"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Destination Folder</label>
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
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : mode === "rename" ? "Rename" : "Move File"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { Folder } from "../types";
import { X, FolderPlus, FolderTree, Palette } from "lucide-react";

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, parentFolderId: string | null, color: string) => Promise<void>;
  folders: Folder[];
  currentParentId?: string | null;
  editingFolder?: Folder | null;
}

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  folders,
  currentParentId = null,
  editingFolder = null,
}) => {
  const [folderName, setFolderName] = useState(editingFolder ? editingFolder.folder_name : "");
  const [parentId, setParentId] = useState<string | null>(
    editingFolder ? editingFolder.parent_folder_id : currentParentId
  );
  const [color, setColor] = useState(editingFolder?.color || "blue");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const colorOptions = [
    { id: "blue", class: "bg-blue-500 text-white" },
    { id: "indigo", class: "bg-indigo-500 text-white" },
    { id: "purple", class: "bg-purple-500 text-white" },
    { id: "emerald", class: "bg-emerald-500 text-white" },
    { id: "amber", class: "bg-amber-500 text-white" },
    { id: "rose", class: "bg-rose-500 text-white" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      setError("Please provide a folder name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(folderName.trim(), parentId, color);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save folder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <FolderPlus className="h-4 w-4 text-blue-600" />
            <span>{editingFolder ? "Rename / Edit Folder" : "Create New Teaching Folder"}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-600 font-medium">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Folder Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Class 12 - Computer Science"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Parent Location</label>
            <select
              value={parentId || ""}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Root / Teaching Resources</option>
              {folders
                .filter((f) => !editingFolder || f.id !== editingFolder.id)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.folder_name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-slate-500" />
              <span>Folder Color Tag</span>
            </label>
            <div className="flex items-center gap-2">
              {colorOptions.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={`h-7 w-7 rounded-full transition ${c.class} ${
                    color === c.id ? "ring-2 ring-offset-2 ring-slate-800 scale-110" : "opacity-80 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

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
              {loading ? "Saving..." : editingFolder ? "Update Folder" : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

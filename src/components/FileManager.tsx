import React, { useState, useMemo } from "react";
import { FileItem, Folder } from "../types";
import {
  LayoutGrid,
  List,
  Search,
  FolderTree,
  FolderPlus,
  UploadCloud,
  FileText,
  Film,
  Music,
  Image as ImageIcon,
  Files,
  Smartphone,
  Laptop,
  MoreVertical,
  Download,
  Eye,
  Play,
  Copy,
  Edit2,
  FolderInput,
  Trash2,
  Info,
  Star,
  ChevronRight,
  Home,
  CheckCircle2,
  Share2,
  CheckSquare,
  Square,
  X,
  RotateCcw,
  AlertCircle,
  GripVertical,
  Tag,
  Hash,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  DynamicFileIcon,
  FileExtensionBadge,
  getFileIconConfig,
} from "../services/fileIconService";

interface FileManagerProps {
  files: FileItem[];
  folders: Folder[];
  currentFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onOpenUpload: (folderId?: string | null) => void;
  onOpenNewFolder: (parentFolderId?: string | null) => void;
  onPreviewFile: (file: FileItem) => void;
  onDownloadFile: (file: FileItem) => void;
  onRenameFile: (file: FileItem) => void;
  onMoveFile: (file: FileItem) => void;
  onCopyFile: (file: FileItem) => void;
  onDeleteFile: (file: FileItem) => void;
  onShowFileInfo: (file: FileItem) => void;
  onToggleFavorite: (file: FileItem) => void;
  onShareFile: (file: FileItem) => void;
  onRenameFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  activeFilterType?: string;
  onFilterChange?: (type: string) => void;
  viewTitle?: string;
  isTrashView?: boolean;
  onRestoreFile?: (file: FileItem) => void;
  onPermanentDeleteFile?: (file: FileItem) => void;
  // Bulk operations
  onBulkDelete?: (fileIds: string[]) => void;
  onBulkMove?: (fileIds: string[], targetFolderId: string | null) => void;
  onBulkRestore?: (fileIds: string[]) => void;
  onBulkPermanentDelete?: (fileIds: string[]) => void;
  onBulkDownload?: (files: FileItem[]) => void;
  isLoading?: boolean;
}

export const FileManager: React.FC<FileManagerProps> = ({
  files,
  folders,
  currentFolderId,
  onSelectFolder,
  onOpenUpload,
  onOpenNewFolder,
  onPreviewFile,
  onDownloadFile,
  onRenameFile,
  onMoveFile,
  onCopyFile,
  onDeleteFile,
  onShowFileInfo,
  onToggleFavorite,
  onShareFile,
  onRenameFolder,
  onDeleteFolder,
  activeFilterType = "all",
  onFilterChange,
  viewTitle = "Resource Repository",
  isTrashView = false,
  onRestoreFile,
  onPermanentDeleteFile,
  onBulkDelete,
  onBulkMove,
  onBulkRestore,
  onBulkPermanentDelete,
  onBulkDownload,
  isLoading = false,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileMenu, setSelectedFileMenu] = useState<string | null>(null);
  const [selectedFolderMenu, setSelectedFolderMenu] = useState<string | null>(null);

  // Multi-select state
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);
  const [bulkTargetFolderId, setBulkTargetFolderId] = useState<string | null>(null);

  // Custom educational tag filter state
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Authentication & Notifications context
  const { addNotification } = useAuth();

  // HTML5 Drag-and-drop state
  const [draggedFileIds, setDraggedFileIds] = useState<string[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragTargetCrumbId, setDragTargetCrumbId] = useState<string | null | undefined>(undefined);

  // Derive current folder hierarchy for breadcrumbs
  const getBreadcrumbs = () => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: "All Resources" }];
    if (!currentFolderId) return crumbs;

    const trail: Folder[] = [];
    let curr: Folder | undefined = folders.find((f) => f.id === currentFolderId);
    while (curr) {
      trail.unshift(curr);
      curr = curr.parent_folder_id ? folders.find((f) => f.id === curr!.parent_folder_id) : undefined;
    }
    trail.forEach((f) => crumbs.push({ id: f.id, name: f.folder_name }));
    return crumbs;
  };

  // Folders in current level
  const currentFolders = folders.filter((f) => f.parent_folder_id === currentFolderId);

  // Collect all unique educational tags across current files
  const allAvailableTags = useMemo(() => {
    const set = new Set<string>();
    files.forEach((f) => {
      f.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [files]);

  // Filter files by search query and active custom tag
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      if (selectedTagFilter && (!file.tags || !file.tags.includes(selectedTagFilter))) {
        return false;
      }
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        file.file_name.toLowerCase().includes(q) ||
        file.device.toLowerCase().includes(q) ||
        (file.owner_name && file.owner_name.toLowerCase().includes(q)) ||
        (file.tags && file.tags.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }, [files, searchQuery, selectedTagFilter]);

  // Checkbox handlers
  const allFilteredSelected =
    filteredFiles.length > 0 && filteredFiles.every((f) => selectedFileIds.has(f.id));
  const someFilteredSelected =
    filteredFiles.some((f) => selectedFileIds.has(f.id)) && !allFilteredSelected;

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedFileIds(new Set());
    } else {
      const next = new Set(selectedFileIds);
      filteredFiles.forEach((f) => next.add(f.id));
      setSelectedFileIds(next);
    }
  };

  const handleToggleSelectRow = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedFileIds);
    if (next.has(fileId)) {
      next.delete(fileId);
    } else {
      next.add(fileId);
    }
    setSelectedFileIds(next);
  };

  const handleClearSelection = () => {
    setSelectedFileIds(new Set());
  };

  // Bulk action handlers
  const selectedFilesList = useMemo(() => {
    return files.filter((f) => selectedFileIds.has(f.id));
  }, [files, selectedFileIds]);

  const handleExecuteBulkDelete = () => {
    if (selectedFileIds.size === 0) return;
    onBulkDelete?.(Array.from(selectedFileIds));
    setSelectedFileIds(new Set());
  };

  const handleExecuteBulkPermanentDelete = () => {
    if (selectedFileIds.size === 0) return;
    onBulkPermanentDelete?.(Array.from(selectedFileIds));
    setSelectedFileIds(new Set());
  };

  const handleExecuteBulkRestore = () => {
    if (selectedFileIds.size === 0) return;
    onBulkRestore?.(Array.from(selectedFileIds));
    setSelectedFileIds(new Set());
  };

  const handleExecuteBulkMove = () => {
    if (selectedFileIds.size === 0) return;
    onBulkMove?.(Array.from(selectedFileIds), bulkTargetFolderId);
    setIsBulkMoveModalOpen(false);
    setSelectedFileIds(new Set());
  };

  const handleExecuteBulkDownload = () => {
    if (selectedFilesList.length === 0) return;
    if (onBulkDownload) {
      onBulkDownload(selectedFilesList);
    } else {
      selectedFilesList.forEach((file) => onDownloadFile(file));
    }
  };

  const getFileIcon = (type: string, fileName: string = "") => {
    return (
      <DynamicFileIcon
        fileName={fileName}
        fileType={type}
        size="sm"
        showBadge={true}
      />
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${bytes} B`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // HTML5 Drag-and-Drop Event Handlers for Files and Folders
  const handleDragStart = (e: React.DragEvent, file: FileItem) => {
    if (isTrashView) return;

    // If the dragged file is part of an active multi-selection, drag all selected files together!
    const filesToMove = selectedFileIds.has(file.id) && selectedFileIds.size > 1
      ? Array.from(selectedFileIds)
      : [file.id];

    setDraggedFileIds(filesToMove);
    setIsDraggingFiles(true);

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "school-file-move",
        fileIds: filesToMove,
      })
    );
    e.dataTransfer.setData("text/plain", file.file_name);
  };

  const handleDragEnd = () => {
    setIsDraggingFiles(false);
    setDraggedFileIds([]);
    setDragOverFolderId(null);
    setDragTargetCrumbId(undefined);
  };

  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragOverFolderId !== folderId) {
      setDragOverFolderId(folderId);
    }
  };

  const handleFolderDragLeave = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverFolderId === folderId) {
      setDragOverFolderId(null);
    }
  };

  const handleCrumbDragOver = (e: React.DragEvent, crumbId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragTargetCrumbId !== crumbId) {
      setDragTargetCrumbId(crumbId);
    }
  };

  const handleCrumbDragLeave = (e: React.DragEvent, crumbId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragTargetCrumbId === crumbId) {
      setDragTargetCrumbId(undefined);
    }
  };

  const handleDropOnTarget = (
    e: React.DragEvent,
    targetFolderId: string | null,
    targetLabel: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
    setDragTargetCrumbId(undefined);
    setIsDraggingFiles(false);

    let fileIds = draggedFileIds;
    if (!fileIds || fileIds.length === 0) {
      try {
        const payload = JSON.parse(e.dataTransfer.getData("application/json"));
        if (payload && Array.isArray(payload.fileIds)) {
          fileIds = payload.fileIds;
        }
      } catch {
        // fallback to empty
      }
    }

    if (!fileIds || fileIds.length === 0) return;

    // Filter out files that already reside in the target folder
    const eligibleFileIds = fileIds.filter((id) => {
      const f = files.find((item) => item.id === id);
      return f && f.folder_id !== targetFolderId;
    });

    if (eligibleFileIds.length === 0) {
      addNotification(
        "Already in Folder",
        `Selected file(s) are already inside "${targetLabel}".`,
        "info"
      );
      setDraggedFileIds([]);
      return;
    }

    // Execute move via onBulkMove
    if (onBulkMove) {
      onBulkMove(eligibleFileIds, targetFolderId);
    } else {
      eligibleFileIds.forEach((id) => {
        const f = files.find((item) => item.id === id);
        if (f) onMoveFile(f);
      });
    }

    // Deselect moved files
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      eligibleFileIds.forEach((id) => next.delete(id));
      return next;
    });

    addNotification(
      "Files Moved",
      `Moved ${eligibleFileIds.length} ${eligibleFileIds.length === 1 ? "file" : "files"} into "${targetLabel}".`,
      "success"
    );

    setDraggedFileIds([]);
  };

  const filterTabs = [
    { label: "All Files", type: "all" },
    { label: "Videos", type: "video" },
    { label: "Audio", type: "audio" },
    { label: "Documents", type: "document" },
    { label: "Images", type: "image" },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{viewTitle}</h2>
          {/* Breadcrumb Path */}
          <nav className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            {getBreadcrumbs().map((crumb, idx, arr) => {
              const isCurrentCrumb = idx === arr.length - 1;
              const isDragTarget = dragTargetCrumbId === crumb.id;
              return (
                <React.Fragment key={crumb.id || "root"}>
                  <button
                    onClick={() => onSelectFolder(crumb.id)}
                    onDragOver={!isCurrentCrumb ? (e) => handleCrumbDragOver(e, crumb.id) : undefined}
                    onDragLeave={!isCurrentCrumb ? (e) => handleCrumbDragLeave(e, crumb.id) : undefined}
                    onDrop={!isCurrentCrumb ? (e) => handleDropOnTarget(e, crumb.id, crumb.name) : undefined}
                    className={`transition flex items-center gap-1 rounded-lg px-2 py-1 ${
                      isDragTarget
                        ? "bg-blue-100 text-blue-800 ring-2 ring-blue-500 font-bold scale-105 shadow-xs"
                        : isDraggingFiles && !isCurrentCrumb
                        ? "border border-dashed border-blue-300 bg-blue-50/50 text-blue-700 hover:bg-blue-100"
                        : "hover:text-blue-600"
                    } ${isCurrentCrumb ? "font-bold text-slate-800" : ""}`}
                    title={!isCurrentCrumb && isDraggingFiles ? `Drop to move to "${crumb.name}"` : undefined}
                  >
                    {idx === 0 && <Home className="h-3.5 w-3.5" />}
                    <span>{crumb.name}</span>
                    {isDragTarget && (
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">
                        Drop
                      </span>
                    )}
                  </button>
                  {idx < arr.length - 1 && <ChevronRight className="h-3 w-3 text-slate-400" />}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isLoading && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 animate-pulse">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span>Syncing database...</span>
            </div>
          )}

          {!isTrashView && (
            <>
              <button
                id="btn-new-folder"
                onClick={() => onOpenNewFolder(currentFolderId)}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FolderPlus className="h-4 w-4 text-blue-600" />
                <span>New Folder</span>
              </button>

              <button
                id="btn-open-upload"
                onClick={() => onOpenUpload(currentFolderId)}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload Resources</span>
              </button>
            </>
          )}

          {/* View Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-1.5 transition ${
                viewMode === "grid" ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg p-1.5 transition ${
                viewMode === "list" ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
              title="List View (with Multi-Select)"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Category Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources, tags, device..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Filter Chips */}
        {onFilterChange && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {filterTabs.map((tab) => (
              <button
                key={tab.type}
                onClick={() => onFilterChange(tab.type)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                  activeFilterType === tab.type
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Custom Educational Tags Bar */}
      {allAvailableTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-bold shrink-0 text-[11px] uppercase tracking-wider">
            <Tag className="h-3 w-3 text-blue-600" />
            <span>Tags:</span>
          </div>
          <button
            onClick={() => setSelectedTagFilter(null)}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
              selectedTagFilter === null
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Resources
          </button>
          {allAvailableTags.map((tag) => {
            const isSelected = selectedTagFilter === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(isSelected ? null : tag)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-2xs font-bold"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50"
                }`}
              >
                <span className={isSelected ? "text-blue-200" : "text-blue-500 font-bold"}>#</span>
                <span>{tag}</span>
              </button>
            );
          })}
          {selectedTagFilter && (
            <button
              onClick={() => setSelectedTagFilter(null)}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline ml-1 shrink-0"
            >
              Clear tag filter
            </button>
          )}
        </div>
      )}

      {/* Folders Section (if in root or current folder has subfolders) */}
      {!isTrashView && currentFolders.length > 0 && (
        <div>
          <div className="mb-2.5 flex items-center justify-between text-xs font-bold text-slate-700">
            <div className="flex items-center gap-1.5">
              <FolderTree className="h-4 w-4 text-blue-600" />
              <span>Folders ({currentFolders.length})</span>
            </div>
            {isDraggingFiles && (
              <span className="text-blue-600 animate-pulse font-semibold flex items-center gap-1">
                <FolderInput className="h-3.5 w-3.5" /> Drop files here
              </span>
            )}
          </div>

          {isDraggingFiles && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-800 animate-in fade-in">
              <FolderInput className="h-4 w-4 text-blue-600 shrink-0" />
              <span>
                Drag &amp; Drop Active: Drop {draggedFileIds.length} {draggedFileIds.length === 1 ? "file" : "files"} onto any folder card below or a breadcrumb above to move.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {currentFolders.map((folder) => {
              const isDragOver = dragOverFolderId === folder.id;
              return (
                <div
                  key={folder.id}
                  onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                  onDragLeave={(e) => handleFolderDragLeave(e, folder.id)}
                  onDrop={(e) => handleDropOnTarget(e, folder.id, folder.folder_name)}
                  className={`group relative flex items-center justify-between rounded-xl border p-3 transition duration-150 ${
                    isDragOver
                      ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50/90 scale-[1.03] shadow-md z-10"
                      : isDraggingFiles
                      ? "border-dashed border-blue-300 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50/60"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs"
                  }`}
                >
                  {isDragOver && (
                    <div className="absolute -top-2.5 -right-1 z-20 rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                      Drop to Move
                    </div>
                  )}
                <div
                  onClick={() => onSelectFolder(folder.id)}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor:
                        folder.color === "purple"
                          ? "#f3e8ff"
                          : folder.color === "emerald"
                          ? "#d1fae5"
                          : folder.color === "amber"
                          ? "#fef3c7"
                          : folder.color === "rose"
                          ? "#ffe4e6"
                          : "#dbeafe",
                    }}
                  >
                    <FolderTree
                      className="h-5 w-5"
                      style={{
                        color:
                          folder.color === "purple"
                            ? "#9333ea"
                            : folder.color === "emerald"
                            ? "#059669"
                            : folder.color === "amber"
                            ? "#d97706"
                            : folder.color === "rose"
                            ? "#e11d48"
                            : "#2563eb",
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{folder.folder_name}</p>
                    <p className="text-[10px] text-slate-400">Open Folder</p>
                  </div>
                </div>

                {/* Folder actions */}
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folder);
                    }}
                    className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete Folder"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFolderMenu(selectedFolderMenu === folder.id ? null : folder.id);
                      }}
                      className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                      title="Folder Options"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>

                    {selectedFolderMenu === folder.id && (
                      <div className="absolute right-0 mt-1 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-lg z-20 animate-in fade-in">
                        <button
                          onClick={() => {
                            setSelectedFolderMenu(null);
                            onRenameFolder(folder);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Rename</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFolderMenu(null);
                            onDeleteFolder(folder);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* Files Section */}
      <div>
        <div className="mb-2.5 flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <Files className="h-4 w-4 text-blue-600" />
            <span>Files ({filteredFiles.length})</span>
            {selectedFileIds.size > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                {selectedFileIds.size} selected
              </span>
            )}
          </div>
          {isTrashView && (
            <span className="text-[11px] font-normal text-slate-400">
              Files here can be restored or permanently removed
            </span>
          )}
        </div>

        {filteredFiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            {isLoading ? (
              <>
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent mb-3" />
                <h3 className="text-sm font-semibold text-slate-800">Synchronizing with Cloud Database...</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Retrieving teaching files and folder metadata from central storage.
                </p>
              </>
            ) : (
              <>
                <Files className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-2 text-sm font-semibold text-slate-800">No files found</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {isTrashView
                    ? "Trash is empty."
                    : "No files matching your search or filter. Upload files to this location."}
                </p>
                {!isTrashView && (
                  <button
                    onClick={() => onOpenUpload(currentFolderId)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span>Upload File</span>
                  </button>
                )}
              </>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file) => {
              const isMedia = file.file_type === "video" || file.file_type === "audio";
              const isMobile =
                file.device.includes("Mobile") ||
                file.device.includes("iPhone") ||
                file.device.includes("Android");
              const isSelected = selectedFileIds.has(file.id);

              const isBeingDragged = draggedFileIds.includes(file.id);

              return (
                <div
                  key={file.id}
                  draggable={!isTrashView}
                  onDragStart={(e) => handleDragStart(e, file)}
                  onDragEnd={handleDragEnd}
                  className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-4 shadow-xs transition ${
                    !isTrashView ? "cursor-grab active:cursor-grabbing" : ""
                  } ${
                    isBeingDragged
                      ? "opacity-40 border-dashed border-blue-500 scale-95 bg-blue-50/40"
                      : isSelected
                      ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 shadow-md"
                      : "border-slate-200 hover:border-blue-400 hover:shadow-md"
                  }`}
                  title={!isTrashView ? "Drag file to drop into a folder or breadcrumb" : undefined}
                >
                  <div>
                    {/* Top Row: Grip handle, Multi-select checkbox, Icon, Device Tag, Star, Menu */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {!isTrashView && (
                          <div
                            className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0"
                            title="Drag to move into folder"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                        )}
                        {/* Checkbox for Grid View */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleSelectRow(file.id, e)}
                          title={isSelected ? "Deselect resource" : "Select resource"}
                          className={`flex h-6 w-6 items-center justify-center rounded-lg border transition shrink-0 ${
                            isSelected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 bg-white text-transparent group-hover:border-slate-400"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>

                        <DynamicFileIcon
                          fileName={file.file_name}
                          fileType={file.file_type}
                          size="md"
                          showBadge={true}
                          className="group-hover:scale-105 transition"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        {!isTrashView ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(file);
                              }}
                              className={`p-1.5 rounded-lg transition ${
                                file.is_favorite ? "text-amber-500" : "text-slate-300 hover:text-amber-400"
                              }`}
                              title="Favorite"
                            >
                              <Star className="h-4 w-4 fill-current" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteFile(file);
                              }}
                              className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition"
                              title="Move to Trash"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRestoreFile?.(file);
                              }}
                              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition"
                              title="Restore File"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPermanentDeleteFile?.(file);
                              }}
                              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                              title="Delete Forever"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setSelectedFileMenu(selectedFileMenu === file.id ? null : file.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                            title="More Actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {selectedFileMenu === file.id && (
                            <div className="absolute right-0 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-30 animate-in fade-in">
                              {isTrashView ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedFileMenu(null);
                                      onRestoreFile?.(file);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Restore File</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedFileMenu(null);
                                      onPermanentDeleteFile?.(file);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete Forever</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedFileMenu(null);
                                      onPreviewFile(file);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    {isMedia ? <Play className="h-4 w-4 text-blue-600" /> : <Eye className="h-4 w-4 text-blue-600" />}
                                    <span>{isMedia ? "Play" : "Preview"}</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedFileMenu(null);
                                      onDownloadFile(file);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    <Download className="h-4 w-4 text-blue-600" />
                                    <span>Download</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedFileMenu(null);
                                      onRenameFile(file);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                    <span>Rename</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedFileMenu(null);
                                      onMoveFile(file);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    <FolderInput className="h-4 w-4" />
                                    <span>Move to Folder</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedFileMenu(null);
                                      onCopyFile(file);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    <Copy className="h-4 w-4" />
                                    <span>Make a Copy</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedFileMenu(null);
                                      onShareFile(file);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    <Share2 className="h-4 w-4" />
                                    <span>Sharing & Access</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedFileMenu(null);
                                      onShowFileInfo(file);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    <Info className="h-4 w-4" />
                                    <span>File Information</span>
                                  </button>
                                  <div className="my-1 border-t border-slate-100" />
                                  <button
                                    onClick={() => {
                                      setSelectedFileMenu(null);
                                      onDeleteFile(file);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Move to Trash</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="mt-3">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          onClick={() => onPreviewFile(file)}
                          className="text-xs font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer flex-1"
                          title={file.file_name}
                        >
                          {file.file_name}
                        </p>
                        <FileExtensionBadge fileName={file.file_name} fileType={file.file_type} />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{formatBytes(file.file_size)}</span>
                        <span>{formatDate(file.uploaded_at)}</span>
                      </div>

                      {/* Custom Tags on Grid Card */}
                      {file.tags && file.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 items-center">
                          {file.tags.slice(0, 3).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTagFilter(selectedTagFilter === t ? null : t);
                              }}
                              className="inline-flex items-center rounded-md bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-100 transition shadow-2xs"
                              title={`Filter by #${t}`}
                            >
                              <span className="text-blue-500 font-bold mr-0.5">#</span>
                              <span>{t}</span>
                            </button>
                          ))}
                          {file.tags.length > 3 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onShowFileInfo(file);
                              }}
                              className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-200 transition"
                              title="View all tags in details"
                            >
                              +{file.tags.length - 3}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Device Tag and Owner pill */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-600 font-medium">
                        {isMobile ? <Smartphone className="h-3 w-3 text-indigo-600" /> : <Laptop className="h-3 w-3 text-blue-600" />}
                        <span className="truncate max-w-[110px]">{file.device}</span>
                      </span>

                      <span className="text-slate-500 truncate max-w-[90px]" title={file.owner_name}>
                        {file.owner_name}
                      </span>
                    </div>

                    {/* Primary Grid Button */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => onPreviewFile(file)}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {isMedia ? <Play className="h-3.5 w-3.5 text-blue-600" /> : <Eye className="h-3.5 w-3.5 text-blue-600" />}
                        <span>{isMedia ? "Play" : "Preview"}</span>
                      </button>
                      <button
                        onClick={() => onDownloadFile(file)}
                        className="flex items-center justify-center rounded-lg bg-blue-50 p-1.5 text-blue-700 hover:bg-blue-100"
                        title="Download to device"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW WITH MULTI-SELECT */
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  {/* Select All Checkbox */}
                  <th className="py-3 px-4 w-10">
                    <button
                      type="button"
                      id="btn-select-all-files"
                      onClick={handleToggleSelectAll}
                      title={allFilteredSelected ? "Deselect all" : "Select all"}
                      className={`flex h-5 w-5 items-center justify-center rounded border transition ${
                        allFilteredSelected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : someFilteredSelected
                          ? "border-blue-600 bg-blue-100 text-blue-700"
                          : "border-slate-300 bg-white hover:border-slate-400"
                      }`}
                    >
                      {allFilteredSelected ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : someFilteredSelected ? (
                        <div className="h-2 w-2 rounded-xs bg-blue-600" />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-transparent" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Upload Date</th>
                  <th className="py-3 px-4">Uploaded Device</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFiles.map((file) => {
                  const isMedia = file.file_type === "video" || file.file_type === "audio";
                  const isMobile =
                    file.device.includes("Mobile") ||
                    file.device.includes("iPhone") ||
                    file.device.includes("Android");
                  const isSelected = selectedFileIds.has(file.id);
                  const isBeingDragged = draggedFileIds.includes(file.id);

                  return (
                    <tr
                      key={file.id}
                      draggable={!isTrashView}
                      onDragStart={(e) => handleDragStart(e, file)}
                      onDragEnd={handleDragEnd}
                      className={`transition select-none ${
                        !isTrashView ? "cursor-grab active:cursor-grabbing" : ""
                      } ${
                        isBeingDragged
                          ? "opacity-40 bg-blue-50/60 border-y-2 border-dashed border-blue-400"
                          : isSelected
                          ? "bg-blue-50/80 border-l-4 border-l-blue-600"
                          : "hover:bg-slate-50/80"
                      }`}
                      title={!isTrashView ? "Drag row to drop into a folder or breadcrumb" : undefined}
                    >
                      {/* Drag Handle & Checkbox */}
                      <td className="py-3 px-4 w-14">
                        <div className="flex items-center gap-1.5">
                          {!isTrashView && (
                            <span
                              className="text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing shrink-0"
                              title="Drag to move into folder"
                            >
                              <GripVertical className="h-4 w-4" />
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleToggleSelectRow(file.id, e)}
                            className={`flex h-5 w-5 items-center justify-center rounded border transition shrink-0 ${
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white hover:border-slate-400"
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Filename & Icon */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <DynamicFileIcon
                            fileName={file.file_name}
                            fileType={file.file_type}
                            size="sm"
                            showBadge={true}
                          />
                          <div className="min-w-0">
                            <p
                              onClick={() => onPreviewFile(file)}
                              className="font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer max-w-[200px] md:max-w-xs"
                            >
                              {file.file_name}
                            </p>
                            {file.description && (
                              <p className="text-[10px] text-slate-400 truncate max-w-xs">{file.description}</p>
                            )}
                            {file.tags && file.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {file.tags.map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTagFilter(selectedTagFilter === t ? null : t);
                                    }}
                                    className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold bg-blue-50 border border-blue-200/70 text-blue-700 hover:bg-blue-100 transition shadow-2xs"
                                    title={`Filter by #${t}`}
                                  >
                                    <span className="text-blue-400 font-bold mr-0.5">#</span>
                                    <span>{t}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <FileExtensionBadge fileName={file.file_name} fileType={file.file_type} />
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{formatBytes(file.file_size)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{formatDate(file.uploaded_at)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {isMobile ? <Smartphone className="h-3 w-3 text-indigo-600" /> : <Laptop className="h-3 w-3 text-blue-600" />}
                          {file.device}
                        </span>
                      </td>
                      <td className="py-3 px-4">{file.owner_name}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPreviewFile(file)}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                            title={isMedia ? "Play" : "Preview"}
                          >
                            {isMedia ? <Play className="h-4 w-4 text-blue-600" /> : <Eye className="h-4 w-4 text-blue-600" />}
                          </button>
                          <button
                            onClick={() => onDownloadFile(file)}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onShowFileInfo(file)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                            title="File Information"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                          {isTrashView ? (
                            <>
                              <button
                                type="button"
                                onClick={() => onRestoreFile?.(file)}
                                className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition"
                                title="Restore File"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onPermanentDeleteFile?.(file)}
                                className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                                title="Delete Forever"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onDeleteFile(file)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                              title="Move to Trash"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FLOATING ACTION BAR FOR BULK OPERATIONS */}
      {selectedFileIds.size > 0 && (
        <div
          id="floating-bulk-bar"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 sm:gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
        >
          {/* Selected count */}
          <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {selectedFileIds.size}
            </span>
            <span className="text-xs font-semibold hidden sm:inline">
              Selected
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {!isTrashView ? (
              <>
                {/* Bulk Move */}
                <button
                  id="btn-bulk-move"
                  type="button"
                  onClick={() => setIsBulkMoveModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition active:scale-95"
                >
                  <FolderInput className="h-3.5 w-3.5 text-blue-400" />
                  <span>Move</span>
                </button>

                {/* Bulk Delete (Move to Trash) */}
                <button
                  id="btn-bulk-trash"
                  type="button"
                  onClick={handleExecuteBulkDelete}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 px-3 py-1.5 text-xs font-semibold transition active:scale-95"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                  <span>To Trash</span>
                </button>
              </>
            ) : (
              <>
                {/* Bulk Restore */}
                <button
                  id="btn-bulk-restore"
                  type="button"
                  onClick={handleExecuteBulkRestore}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restore Selected</span>
                </button>

                {/* Bulk Permanent Delete */}
                <button
                  id="btn-bulk-perm-delete"
                  type="button"
                  onClick={handleExecuteBulkPermanentDelete}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Forever</span>
                </button>
              </>
            )}

            {/* Bulk Download */}
            <button
              id="btn-bulk-download"
              type="button"
              onClick={handleExecuteBulkDownload}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition active:scale-95"
              title="Download selected resources"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden md:inline">Download</span>
            </button>
          </div>

          {/* Dismiss / Clear Selection */}
          <button
            type="button"
            onClick={handleClearSelection}
            title="Deselect all"
            className="ml-1 rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* BULK MOVE TARGET FOLDER MODAL */}
      {isBulkMoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderInput className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Move {selectedFileIds.size} Selected Resources
                </h3>
              </div>
              <button
                onClick={() => setIsBulkMoveModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-600">
              Select destination folder for the {selectedFileIds.size} resources:
            </p>

            <div className="mt-4 max-h-60 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50">
              {/* Root folder option */}
              <button
                type="button"
                onClick={() => setBulkTargetFolderId(null)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition text-left ${
                  bulkTargetFolderId === null
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Root / All Resources</span>
              </button>

              {/* Subfolders */}
              {folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setBulkTargetFolderId(f.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition text-left ${
                    bulkTargetFolderId === f.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <FolderTree className="h-4 w-4" />
                  <span>{f.folder_name}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkMoveModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkMove}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
              >
                Move {selectedFileIds.size} Files
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

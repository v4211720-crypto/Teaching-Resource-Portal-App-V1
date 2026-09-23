import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Sidebar, NavView } from "./components/Sidebar";
import { FileManager } from "./components/FileManager";
import { DashboardView } from "./components/DashboardView";
import { UploadModal } from "./components/UploadModal";
import { VideoPlayerModal } from "./components/VideoPlayerModal";
import { AudioPlayerModal } from "./components/AudioPlayerModal";
import { DocumentViewerModal } from "./components/DocumentViewerModal";
import { FolderModal } from "./components/FolderModal";
import { ShareModal } from "./components/ShareModal";
import { FileDetailsModal } from "./components/FileDetailsModal";
import { RenameMoveModal } from "./components/RenameMoveModal";
import { SettingsModal } from "./components/SettingsModal";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { AdminPanel } from "./components/AdminPanel";
import { AboutView } from "./components/AboutView";
import { StorageWarningAlert } from "./components/StorageWarningAlert";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { SyncStatusType } from "./components/SyncIndicator";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { Login } from "./pages/Login";
import { api } from "./lib/api";
import { FileItem, Folder, DashboardStats, SharingVisibility, User } from "./types";

interface MainAppProps {
  initialUser?: User | null;
}

export const MainApp: React.FC<MainAppProps> = ({ initialUser }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const user = initialUser !== undefined ? initialUser : authUser;

  // Reliable redirect if user is not authenticated: Do not mount or execute any sync logic
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center space-y-3">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-300">Loading Teacher Resource Hub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <AuthenticatedMainApp user={user} />;
};

interface AuthenticatedMainAppProps {
  user: User;
}

const AuthenticatedMainApp: React.FC<AuthenticatedMainAppProps> = ({ user }) => {
  const { isOnline, simulatedOffline, toggleSimulateOffline } = useOnlineStatus();

  // Navigation State
  const [currentView, setCurrentView] = useState<NavView>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cloud Sync & Loading State Management
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>("synced");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [isInitialSyncComplete, setIsInitialSyncComplete] = useState<boolean>(false);

  // Data Repository State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [activeFilterType, setActiveFilterType] = useState<string>("all");

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<FileItem | null>(null);
  const [activeAudio, setActiveAudio] = useState<FileItem | null>(null);
  const [activeDocument, setActiveDocument] = useState<FileItem | null>(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [activeShareFile, setActiveShareFile] = useState<FileItem | null>(null);
  const [activeInfoFile, setActiveInfoFile] = useState<FileItem | null>(null);
  const [renameMoveFile, setRenameMoveFile] = useState<FileItem | null>(null);
  const [renameMoveMode, setRenameMoveMode] = useState<"rename" | "move">("rename");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Concurrency & Race Condition Guards
  const requestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Refactored robust fetchData function to prevent race conditions & loop triggers
  const fetchData = useCallback(
    async (silent: boolean = false) => {
      const activeUserId = user.id;
      if (!activeUserId) return;

      // Abort any prior in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Increment request ID counter for this fetch cycle
      const currentRequestId = ++requestIdRef.current;

      if (!silent) {
        setLoadingData(true);
      }

      if (!isOnline) {
        setSyncStatus("offline");
      } else {
        setSyncStatus("syncing");
      }

      try {
        const [statsRes, filesRes, foldersRes] = await Promise.all([
          api.getStats(controller.signal),
          api.getFiles({ include_trashed: true }, controller.signal),
          api.getFolders(controller.signal),
        ]);

        // Guard against race conditions: Ignore response if a newer fetch request was initiated
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setStats(statsRes);
        setFiles(filesRes);
        setFolders(foldersRes);
        setLastSyncedAt(new Date());
        setSyncStatus(isOnline ? "synced" : "offline");
        setIsInitialSyncComplete(true);
      } catch (err: any) {
        // Ignore deliberate abort cancellations
        if (err?.name === "AbortError" || controller.signal.aborted) {
          return;
        }
        if (currentRequestId !== requestIdRef.current) {
          return;
        }
        console.error("Error synchronizing teaching repository data:", err);
        setSyncStatus(isOnline ? "synced" : "offline");
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoadingData(false);
        }
      }
    },
    [user.id, currentFolderId, isOnline]
  );

  // Hook 1: Synchronize data on initial mount and when user navigates folders
  // Dependencies are strictly primitive values to prevent recursive execution loops
  useEffect(() => {
    fetchData(false);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user.id, currentFolderId]);

  // Hook 2: Respond to online/offline network connectivity changes cleanly
  useEffect(() => {
    if (!isOnline) {
      setSyncStatus("offline");
    } else {
      // Silently re-sync when connection is restored without resetting view layout
      fetchData(true);
    }
  }, [isOnline]);

  // Hook 3: Safety watchdog to ensure sync status indicator never remains permanently stuck in syncing
  useEffect(() => {
    if (syncStatus === "syncing") {
      const timer = setTimeout(() => {
        setSyncStatus(isOnline ? "synced" : "offline");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus, isOnline]);

  // Handle open upload dialog
  const handleOpenUpload = (folderId?: string | null) => {
    setUploadTargetFolderId(folderId !== undefined ? folderId : currentFolderId);
    setIsUploadOpen(true);
  };

  // Preview / Play handler
  const handlePreviewFile = (file: FileItem) => {
    if (file.file_type === "video") {
      setActiveVideo(file);
    } else if (file.file_type === "audio") {
      setActiveAudio(file);
    } else {
      setActiveDocument(file);
    }
  };

  // Download handler
  const handleDownloadFile = (file: FileItem) => {
    api.downloadFile(file.id, file.file_name);
  };

  // Toggle favorite with optimistic update
  const handleToggleFavorite = async (file: FileItem) => {
    try {
      await api.toggleFavorite(file.id);
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, is_favorite: !f.is_favorite } : f))
      );
      setLastSyncedAt(new Date());
      setSyncStatus("synced");
    } catch (err) {
      console.error(err);
      setSyncStatus(isOnline ? "synced" : "offline");
    }
  };

  // Trash file
  const handleDeleteFile = (file: FileItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Move Resource to Trash",
      message: `Are you sure you want to move "${file.file_name}" to the Recycle Bin? You can restore it later.`,
      confirmLabel: "Move to Trash",
      isDestructive: true,
      onConfirm: async () => {
        try {
          setSyncStatus("syncing");
          // Optimistic local update
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, is_trash: true, is_trashed: true } : f
            )
          );
          await api.trashFile(file.id);
          setLastSyncedAt(new Date());
          setSyncStatus("synced");
          fetchData(true);
        } catch (err) {
          console.error("Trash file error:", err);
          setSyncStatus(isOnline ? "synced" : "offline");
          fetchData(true);
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Restore file
  const handleRestoreFile = async (file: FileItem) => {
    try {
      setSyncStatus("syncing");
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, is_trash: false, is_trashed: false } : f
        )
      );
      await api.restoreFile(file.id);
      setLastSyncedAt(new Date());
      setSyncStatus("synced");
      fetchData(true);
    } catch (err) {
      console.error("Restore file error:", err);
      setSyncStatus(isOnline ? "synced" : "offline");
      fetchData(true);
    }
  };

  // Permanent delete
  const handlePermanentDelete = (file: FileItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Resource Forever",
      message: `Are you sure you want to permanently delete "${file.file_name}"? This file will be completely erased and cannot be recovered.`,
      confirmLabel: "Delete Forever",
      isDestructive: true,
      onConfirm: async () => {
        try {
          setSyncStatus("syncing");
          setFiles((prev) => prev.filter((f) => f.id !== file.id));
          await api.permanentDeleteFile(file.id);
          setLastSyncedAt(new Date());
          setSyncStatus("synced");
          fetchData(true);
        } catch (err) {
          console.error("Permanent delete error:", err);
          setSyncStatus(isOnline ? "synced" : "offline");
          fetchData(true);
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Folder CRUD
  const handleCreateOrEditFolder = async (name: string, parentId: string | null, color: string) => {
    try {
      setSyncStatus("syncing");
      if (editingFolder) {
        await api.renameFolder(editingFolder.id, name);
      } else {
        await api.createFolder(name, parentId, color);
      }
      setEditingFolder(null);
      setLastSyncedAt(new Date());
      setSyncStatus("synced");
      fetchData(true);
    } catch (err) {
      console.error(err);
      setSyncStatus(isOnline ? "synced" : "offline");
    }
  };

  const handleDeleteFolder = (folder: Folder) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Folder",
      message: `Are you sure you want to delete folder "${folder.folder_name}"? Any files inside will safely be moved to the root workspace.`,
      confirmLabel: "Delete Folder",
      isDestructive: true,
      onConfirm: async () => {
        try {
          setSyncStatus("syncing");
          setFolders((prev) => prev.filter((f) => f.id !== folder.id));
          await api.deleteFolder(folder.id);
          if (currentFolderId === folder.id) {
            setCurrentFolderId(null);
          }
          setLastSyncedAt(new Date());
          setSyncStatus("synced");
          fetchData(true);
        } catch (err) {
          console.error("Delete folder error:", err);
          setSyncStatus(isOnline ? "synced" : "offline");
          fetchData(true);
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Rename & Move file
  const handleRenameFileSubmit = async (fileId: string, newName: string) => {
    try {
      setSyncStatus("syncing");
      await api.renameFile(fileId, newName);
      setLastSyncedAt(new Date());
      setSyncStatus("synced");
      fetchData(true);
    } catch (err) {
      console.error(err);
      setSyncStatus(isOnline ? "synced" : "offline");
    }
  };

  const handleMoveFileSubmit = async (fileId: string, newFolderId: string | null) => {
    try {
      setSyncStatus("syncing");
      await api.moveFile(fileId, newFolderId);
      setLastSyncedAt(new Date());
      setSyncStatus("synced");
      fetchData(true);
    } catch (err) {
      console.error(err);
      setSyncStatus(isOnline ? "synced" : "offline");
    }
  };

  const handleCopyFile = async (file: FileItem) => {
    try {
      setSyncStatus("syncing");
      await api.copyFile(file.id);
      setLastSyncedAt(new Date());
      setSyncStatus("synced");
      fetchData(true);
    } catch (err) {
      console.error(err);
      setSyncStatus(isOnline ? "synced" : "offline");
    }
  };

  const handleSaveSharing = async (fileId: string, visibility: SharingVisibility) => {
    try {
      setSyncStatus("syncing");
      await api.shareFile(fileId, visibility);
      setLastSyncedAt(new Date());
      setSyncStatus("synced");
      fetchData(true);
    } catch (err) {
      console.error(err);
      setSyncStatus(isOnline ? "synced" : "offline");
    }
  };

  // BULK OPERATIONS
  const handleBulkDelete = (fileIds: string[]) => {
    if (fileIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Move Selected Resources to Trash",
      message: `Are you sure you want to move ${fileIds.length} selected resource${fileIds.length > 1 ? "s" : ""} to the Recycle Bin?`,
      confirmLabel: "Move to Trash",
      isDestructive: true,
      onConfirm: async () => {
        try {
          setSyncStatus("syncing");
          const idsSet = new Set(fileIds);
          setFiles((prev) =>
            prev.map((f) =>
              idsSet.has(f.id) ? { ...f, is_trash: true, is_trashed: true } : f
            )
          );
          await Promise.all(fileIds.map((id) => api.trashFile(id)));
          setLastSyncedAt(new Date());
          setSyncStatus("synced");
          fetchData(true);
        } catch (err) {
          console.error("Bulk delete error:", err);
          setSyncStatus(isOnline ? "synced" : "offline");
          fetchData(true);
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleBulkMove = async (fileIds: string[], targetFolderId: string | null) => {
    try {
      setSyncStatus("syncing");
      await Promise.all(fileIds.map((id) => api.moveFile(id, targetFolderId)));
      setLastSyncedAt(new Date());
      setSyncStatus("synced");
      fetchData(true);
    } catch (err) {
      console.error("Bulk move error:", err);
      setSyncStatus(isOnline ? "synced" : "offline");
    }
  };

  const handleBulkRestore = async (fileIds: string[]) => {
    try {
      setSyncStatus("syncing");
      const idsSet = new Set(fileIds);
      setFiles((prev) =>
        prev.map((f) =>
          idsSet.has(f.id) ? { ...f, is_trash: false, is_trashed: false } : f
        )
      );
      await Promise.all(fileIds.map((id) => api.restoreFile(id)));
      setLastSyncedAt(new Date());
      setSyncStatus("synced");
      fetchData(true);
    } catch (err) {
      console.error("Bulk restore error:", err);
      setSyncStatus(isOnline ? "synced" : "offline");
      fetchData(true);
    }
  };

  const handleBulkPermanentDelete = (fileIds: string[]) => {
    if (fileIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Delete Selected Resources Forever",
      message: `Are you sure you want to permanently delete ${fileIds.length} selected resource${fileIds.length > 1 ? "s" : ""}? This action cannot be undone.`,
      confirmLabel: "Delete Forever",
      isDestructive: true,
      onConfirm: async () => {
        try {
          setSyncStatus("syncing");
          const idsSet = new Set(fileIds);
          setFiles((prev) => prev.filter((f) => !idsSet.has(f.id)));
          await Promise.all(fileIds.map((id) => api.permanentDeleteFile(id)));
          setLastSyncedAt(new Date());
          setSyncStatus("synced");
          fetchData(true);
        } catch (err) {
          console.error("Bulk permanent delete error:", err);
          setSyncStatus(isOnline ? "synced" : "offline");
          fetchData(true);
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleBulkDownload = (filesToDownload: FileItem[]) => {
    filesToDownload.forEach((f) => api.downloadFile(f.id, f.file_name));
  };

  const isFileTrashed = (f: FileItem) => Boolean(f.is_trash || f.is_trashed);

  // Filter files based on current active view
  let displayedFiles: FileItem[] = [];
  let viewTitle = "Teaching Resources";

  if (currentView === "trash") {
    displayedFiles = files.filter(isFileTrashed);
    viewTitle = "Recycle Bin & Trash";
  } else {
    // For all active views, exclude trashed files
    const activeFiles = files.filter((f) => !isFileTrashed(f));

    if (currentView === "videos") {
      displayedFiles = activeFiles.filter((f) => f.file_type === "video");
      viewTitle = "Video Lectures & Media";
    } else if (currentView === "audio") {
      displayedFiles = activeFiles.filter((f) => f.file_type === "audio");
      viewTitle = "Audio Recordings & Podcasts";
    } else if (currentView === "documents") {
      displayedFiles = activeFiles.filter((f) => f.file_type === "document");
      viewTitle = "Documents & Lesson Plans";
    } else if (currentView === "images") {
      displayedFiles = activeFiles.filter((f) => f.file_type === "image");
      viewTitle = "Diagrams & Educational Images";
    } else if (currentView === "favorites") {
      displayedFiles = activeFiles.filter((f) => f.is_favorite);
      viewTitle = "Starred & Favorite Resources";
    } else if (currentView === "recent") {
      displayedFiles = [...activeFiles].sort(
        (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
      );
      viewTitle = "Recent Uploads & Access History";
    } else if (currentView === "shared") {
      displayedFiles = activeFiles.filter((f) => f.sharing_visibility === "all_teachers");
      viewTitle = "Shared Teaching Resources";
    } else if (currentView === "folders") {
      displayedFiles = activeFiles;
      viewTitle = "Folder Tree & Hierarchy";
    } else {
      displayedFiles = activeFiles;
      viewTitle = "Teaching Resources";
    }

    // If user selected a filter chip inside FileManager
    if (activeFilterType !== "all" && currentView === "resources") {
      displayedFiles = displayedFiles.filter((f) => f.file_type === activeFilterType);
    }
  }

  const trashCount = files.filter(isFileTrashed).length;
  const isSyncInProgress = loadingData || !isInitialSyncComplete;

  return (
    <div className="flex h-screen flex-col bg-slate-100 font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      {/* Offline Status Banner */}
      <OfflineIndicator
        isOnline={isOnline}
        onRestoreOnline={toggleSimulateOffline}
        isSimulated={simulatedOffline}
      />

      {/* Top Navigation Bar with Sync Indicator */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenUpload={() => handleOpenUpload(currentFolderId)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAbout={() => setCurrentView("about")}
        onRefreshData={() => fetchData(false)}
        isRefreshing={loadingData}
        storageUsedBytes={user.storage_used || 0}
        storageLimitBytes={user.storage_limit || 15 * 1024 * 1024 * 1024}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        isOnline={isOnline}
        simulatedOffline={simulatedOffline}
        onToggleSimulateOffline={toggleSimulateOffline}
        pendingCount={pendingCount}
        onOpenTrash={() => setCurrentView("trash")}
      />

      {/* Main App Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            if (view === "upload") {
              handleOpenUpload(currentFolderId);
            } else if (view === "settings") {
              setIsSettingsOpen(true);
            } else {
              setCurrentView(view);
              if (view !== "resources" && view !== "folders") {
                setCurrentFolderId(null);
              }
            }
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenUpload={() => handleOpenUpload(currentFolderId)}
          storageUsedBytes={user.storage_used || 0}
          storageLimitBytes={user.storage_limit || 15 * 1024 * 1024 * 1024}
          trashCount={trashCount}
        />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Storage Consumption Warning Notification */}
            <StorageWarningAlert
              storageUsedBytes={user.storage_used || 0}
              storageLimitBytes={user.storage_limit || 15 * 1024 * 1024 * 1024}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* Render Views */}
            {currentView === "dashboard" ? (
              <DashboardView
                stats={stats}
                recentFiles={files.filter((f) => !isFileTrashed(f))}
                folders={folders}
                onOpenUpload={() => handleOpenUpload(null)}
                onSelectFolder={(folderId) => {
                  setCurrentFolderId(folderId);
                  setCurrentView("resources");
                }}
                onPreviewFile={handlePreviewFile}
                onDownloadFile={handleDownloadFile}
                onToggleFavorite={handleToggleFavorite}
                onNavigateToView={(view) => setCurrentView(view)}
              />
            ) : currentView === "about" ? (
              <AboutView onBack={() => setCurrentView("dashboard")} />
            ) : currentView.startsWith("admin_") ? (
              <AdminPanel
                initialTab={
                  currentView === "admin_institution"
                    ? "institution"
                    : currentView === "admin_users"
                    ? "users"
                    : currentView === "admin_storage"
                    ? "storage"
                    : currentView === "admin_reports"
                    ? "reports"
                    : "security"
                }
                onPreviewFile={handlePreviewFile}
                onDownloadFile={handleDownloadFile}
              />
            ) : (
              <FileManager
                files={displayedFiles}
                folders={folders}
                currentFolderId={currentFolderId}
                isLoading={isSyncInProgress}
                onSelectFolder={(folderId) => setCurrentFolderId(folderId)}
                onOpenUpload={handleOpenUpload}
                onOpenNewFolder={(parentId) => {
                  setEditingFolder(null);
                  setCurrentFolderId(parentId !== undefined ? parentId : currentFolderId);
                  setFolderModalOpen(true);
                }}
                onPreviewFile={handlePreviewFile}
                onDownloadFile={handleDownloadFile}
                onRenameFile={(file) => {
                  setRenameMoveFile(file);
                  setRenameMoveMode("rename");
                }}
                onMoveFile={(file) => {
                  setRenameMoveFile(file);
                  setRenameMoveMode("move");
                }}
                onCopyFile={handleCopyFile}
                onDeleteFile={handleDeleteFile}
                onShowFileInfo={(file) => setActiveInfoFile(file)}
                onToggleFavorite={handleToggleFavorite}
                onShareFile={(file) => setActiveShareFile(file)}
                onRenameFolder={(folder) => {
                  setEditingFolder(folder);
                  setFolderModalOpen(true);
                }}
                onDeleteFolder={handleDeleteFolder}
                activeFilterType={activeFilterType}
                onFilterChange={setActiveFilterType}
                viewTitle={viewTitle}
                isTrashView={currentView === "trash"}
                onRestoreFile={handleRestoreFile}
                onPermanentDeleteFile={handlePermanentDelete}
                onBulkDelete={handleBulkDelete}
                onBulkMove={handleBulkMove}
                onBulkRestore={handleBulkRestore}
                onBulkPermanentDelete={handleBulkPermanentDelete}
                onBulkDownload={handleBulkDownload}
              />
            )}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        folders={folders}
        initialFolderId={uploadTargetFolderId}
        onUploadSuccess={() => {
          setLastSyncedAt(new Date());
          setSyncStatus("synced");
          fetchData(true);
        }}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
        onDownload={handleDownloadFile}
      />

      {/* Audio Player Modal */}
      <AudioPlayerModal
        audio={activeAudio}
        onClose={() => setActiveAudio(null)}
        onDownload={handleDownloadFile}
      />

      {/* Document / PDF / Image Viewer Modal */}
      <DocumentViewerModal
        file={activeDocument}
        onClose={() => setActiveDocument(null)}
        onDownload={handleDownloadFile}
        onRename={(file) => {
          setRenameMoveFile(file);
          setRenameMoveMode("rename");
        }}
        onDelete={handleDeleteFile}
      />

      {/* Folder Create/Rename Modal */}
      <FolderModal
        isOpen={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        onSubmit={handleCreateOrEditFolder}
        folders={folders}
        currentParentId={currentFolderId}
        editingFolder={editingFolder}
      />

      {/* File Share & Permissions Modal */}
      <ShareModal
        file={activeShareFile}
        onClose={() => setActiveShareFile(null)}
        onSave={handleSaveSharing}
      />

      {/* File Details / Properties Modal */}
      <FileDetailsModal
        file={activeInfoFile}
        onClose={() => setActiveInfoFile(null)}
        onDownload={handleDownloadFile}
        onOpenShare={(file) => setActiveShareFile(file)}
        onFileUpdated={(updatedFile) => {
          setFiles((prev) => prev.map((f) => (f.id === updatedFile.id ? updatedFile : f)));
          setActiveInfoFile(updatedFile);
          setLastSyncedAt(new Date());
          setSyncStatus("synced");
        }}
      />

      {/* Rename or Move Modal */}
      <RenameMoveModal
        file={renameMoveFile}
        folders={folders}
        mode={renameMoveMode}
        onClose={() => setRenameMoveFile(null)}
        onRename={handleRenameFileSubmit}
        onMove={handleMoveFileSubmit}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        cancelLabel={confirmModal.cancelLabel}
        isDestructive={confirmModal.isDestructive}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default MainApp;

export type UserRole = "admin" | "teacher";
export type FileCategory = "document" | "video" | "audio" | "image" | "other";
export type SharingVisibility = "private" | "selected" | "all_teachers" | "admin_only";

export interface School {
  id: string;
  code: string;
  name: string;
  created_at: string;
  admin_email?: string;
  address?: string;
  storage_quota_gb?: number;
  contact_phone?: string;
  brand_color?: string;
}

export interface User {
  id: string;
  schoolId: string;
  school?: School;
  username: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
  storage_limit: number;
  created_at: string;
  avatar?: string;
  name: string;
  department?: string;
  files_count?: number;
  storage_used?: number;
}

export interface Folder {
  id: string;
  schoolId: string;
  user_id: string;
  parent_folder_id: string | null;
  folder_name: string;
  created_at: string;
  color?: string;
}

export interface FileItem {
  id: string;
  schoolId: string;
  user_id: string;
  folder_id: string | null;
  file_name: string;
  file_type: FileCategory;
  file_size: number;
  mime_type: string;
  storage_path: string;
  device: string;
  uploaded_at: string;
  updated_at: string;
  is_favorite: boolean;
  is_trashed: boolean;
  is_trash?: boolean;
  sharing_visibility: SharingVisibility;
  shared_with_users: string[];
  description?: string;
  duration?: number;
  owner_name?: string;
  owner_email?: string;
  is_owner?: boolean;
  tags?: string[];
}

export interface ActivityLog {
  id: string;
  schoolId: string;
  user_id: string;
  username: string;
  action: string;
  details: string;
  timestamp: string;
  device: string;
  ip?: string;
}

export interface SchoolAnalytics {
  school: School;
  totalTeachers: number;
  activeTeachers: number;
  totalFiles: number;
  storageUsedBytes: number;
  storageQuotaBytes: number;
  storageUsedPercent: number;
  categoryBreakdown: {
    documents: { count: number; bytes: number };
    videos: { count: number; bytes: number };
    audio: { count: number; bytes: number };
    images: { count: number; bytes: number };
    other: { count: number; bytes: number };
  };
  teacherUsage: Array<{
    id: string;
    name: string;
    username: string;
    email: string;
    role: UserRole;
    status: "active" | "inactive";
    department?: string;
    filesCount: number;
    storageUsedBytes: number;
    storageLimitBytes: number;
  }>;
}

export interface DashboardStats {
  totalFolders: number;
  totalFiles: number;
  documents: number;
  videos: number;
  audio: number;
  images: number;
  otherFiles: number;
  storageUsed: number;
  storageLimit: number;
}

export interface AdminOverview {
  totalUsers: number;
  activeUsers: number;
  totalFiles: number;
  totalVideos: number;
  totalDocuments: number;
  totalAudio: number;
  totalImages: number;
  totalStorage: number;
  todaysUploads: number;
}

export interface UploadProgressItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: FileCategory;
  progress: number;
  loaded: number;
  speed: string; // e.g. "2.4 MB/s"
  timeRemaining: string; // e.g. "12s"
  status: "pending" | "uploading" | "completed" | "error" | "cancelled";
  errorMessage?: string;
  xhr?: XMLHttpRequest;
  folderId?: string | null;
}

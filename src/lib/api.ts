import { User, Folder, FileItem, DashboardStats, AdminOverview, ActivityLog, SharingVisibility, School } from "../types";

const TOKEN_KEY = "trh_auth_token";
const DEVICE_KEY = "trh_selected_device";
const REMEMBER_KEY = "trh_remember_me";

export const getAuthToken = (): string | null => {
  const remember = localStorage.getItem(REMEMBER_KEY) === "true";
  if (remember) {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  }
  return sessionStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string, remember: boolean = false) => {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REMEMBER_KEY, "true");
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

export const getSavedDevice = (): string => {
  const saved = localStorage.getItem(DEVICE_KEY);
  if (saved) return saved;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  return isMobile ? "Mobile Phone" : "Desktop Computer";
};

export const setSavedDevice = (device: string) => localStorage.setItem(DEVICE_KEY, device);

// Helper for headers
const authHeaders = (customHeaders: Record<string, string> = {}) => {
  const token = getAuthToken();
  const device = getSavedDevice();
  return {
    "x-device-type": device,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };
};

export const api = {
  // Multi-School Institutional APIs
  async getSchools() {
    const res = await fetch("/api/schools");
    if (!res.ok) throw new Error("Failed to load registered schools");
    const data = await res.json();
    return (data.schools || data.institutions || []) as School[];
  },

  async getInstitutions() {
    const res = await fetch("/api/institutions");
    if (!res.ok) throw new Error("Failed to load registered institutions");
    const data = await res.json();
    return (data.institutions || data.schools || []) as School[];
  },

  async registerSchool(data: {
    school_name?: string;
    school_code?: string;
    name?: string;
    code?: string;
    admin_username: string;
    admin_email: string;
    admin_password: string;
    admin_name?: string;
    address?: string;
    contact_phone?: string;
    storage_quota_gb?: number;
  }) {
    const schoolName = (data.school_name || data.name || "").trim();
    const schoolCode = (data.school_code || data.code || "").trim();
    const payload = {
      ...data,
      school_name: schoolName,
      name: schoolName,
      school_code: schoolCode,
      code: schoolCode,
    };
    const res = await fetch("/api/schools/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Registration failed" }));
      throw new Error(err.error || "Failed to register institution");
    }
    return res.json() as Promise<{ token: string; user: User }>;
  },

  async getCurrentSchool() {
    const res = await fetch("/api/schools/current", { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load school profile");
    const data = await res.json();
    return data.school as School;
  },

  async updateCurrentSchool(updates: Partial<School>) {
    const res = await fetch("/api/schools/current", {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to update school profile" }));
      throw new Error(err.error || "Failed to update school profile");
    }
    const data = await res.json();
    return data.school as School;
  },

  async updateSchoolTheme(brandColor: string) {
    const res = await fetch("/api/schools/current/theme", {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ brand_color: brandColor }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to update school brand color" }));
      throw new Error(err.error || "Failed to update school brand color");
    }
    const data = await res.json();
    return data.school as School;
  },

  async getSchoolAnalytics() {
    const res = await fetch("/api/schools/current/analytics", { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load school analytics");
    return res.json();
  },

  async deleteSchool(id: string) {
    const res = await fetch(`/api/schools/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to delete educational institution" }));
      throw new Error(err.error || "Failed to delete educational institution");
    }
    return res.json() as Promise<{ success: boolean; message: string; isCurrent?: boolean; deletedSchoolId?: string }>;
  },

  async deleteInstitution(id: string) {
    return this.deleteSchool(id);
  },

  // Auth
  async login(username: string, password: string, device?: string, schoolId?: string, schoolCode?: string) {
    const code = (schoolCode || schoolId || "").trim();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.trim(),
        password,
        device: device || getSavedDevice(),
        schoolId: schoolId?.trim() || undefined,
        schoolCode: code || undefined,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Login failed" }));
      throw new Error(err.error || "Login failed");
    }
    return res.json() as Promise<{ token: string; user: User }>;
  },

  async getCurrentUser() {
    const token = getAuthToken();
    if (!token) return null;
    const res = await fetch("/api/auth/me", {
      headers: authHeaders(),
    });
    if (!res.ok) {
      removeAuthToken();
      return null;
    }
    const data = await res.json();
    return data.user as User;
  },

  async forgotPassword(email: string) {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async resetPassword(email: string, newPassword?: string, schoolCode?: string) {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword, schoolCode }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Password reset failed" }));
      throw new Error(err.error || "Password reset failed");
    }
    return res.json() as Promise<{ success: boolean; message: string; username: string; email: string; schoolCode?: string }>;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to change password" }));
      throw new Error(err.error || "Failed to change password");
    }
    return res.json();
  },

  // Folders
  async getFolders(signal?: AbortSignal) {
    const res = await fetch("/api/folders", { headers: authHeaders(), signal });
    if (!res.ok) throw new Error("Failed to load folders");
    const data = await res.json();
    return data.folders as Folder[];
  },

  async createFolder(folder_name: string, parent_folder_id: string | null = null, color = "blue") {
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ folder_name, parent_folder_id, color }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to create folder" }));
      throw new Error(err.error || "Failed to create folder");
    }
    const data = await res.json();
    return data.folder as Folder;
  },

  async updateFolder(id: string, updates: Partial<Folder>) {
    const res = await fetch(`/api/folders/${id}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update folder");
    const data = await res.json();
    return data.folder as Folder;
  },

  async renameFolder(id: string, newName: string) {
    return this.updateFolder(id, { folder_name: newName });
  },

  async deleteFolder(id: string) {
    const res = await fetch(`/api/folders/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete folder");
    return res.json();
  },

  // Files
  async getFiles(
    params: {
      folder_id?: string | null;
      type?: string;
      view?: string;
      search?: string;
      is_trash?: boolean;
      is_trashed?: boolean;
      include_trashed?: boolean;
    } = {},
    signal?: AbortSignal
  ) {
    const searchParams = new URLSearchParams();
    if (params.folder_id !== undefined) searchParams.set("folder_id", params.folder_id === null ? "null" : params.folder_id);
    if (params.type) searchParams.set("type", params.type);
    if (params.view) searchParams.set("view", params.view);
    if (params.search) searchParams.set("search", params.search);
    if (params.is_trash !== undefined) searchParams.set("is_trash", String(params.is_trash));
    if (params.is_trashed !== undefined) searchParams.set("is_trashed", String(params.is_trashed));
    if (params.include_trashed) searchParams.set("include_trashed", "true");

    const res = await fetch(`/api/files?${searchParams.toString()}`, { headers: authHeaders(), signal });
    if (!res.ok) throw new Error("Failed to load files");
    const data = await res.json();
    return data.files as FileItem[];
  },

  uploadFileWithProgress(
    file: File,
    folderId: string | null,
    onProgress: (loaded: number, total: number, speed: string, timeRemaining: string) => void,
    device?: string,
    description?: string,
    sharingVisibility: string = "all_teachers"
  ): { promise: Promise<FileItem>; cancel: () => void } {
    const token = getAuthToken();
    const deviceName = device || getSavedDevice();
    let currentXhr: XMLHttpRequest | null = null;
    let isCancelled = false;

    // Threshold for chunked uploads: files > 10MB are sliced into 5MB chunks
    // This completely bypasses proxy & nginx 413 entity size limits
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per slice
    const isChunked = file.size > 10 * 1024 * 1024;

    const executeChunkedUpload = async (): Promise<FileItem> => {
      const uploadId = "upl_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const startTime = Date.now();

      let lastResult: FileItem | null = null;

      const uploadSingleChunkAttempt = (
        chunkIndex: number,
        startByte: number,
        chunkBlob: Blob
      ): Promise<any> => {
        return new Promise<any>((resolve, reject) => {
          if (isCancelled) {
            return reject(new Error("Upload cancelled by user"));
          }

          const xhr = new XMLHttpRequest();
          currentXhr = xhr;

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable && !isCancelled) {
              const currentTotalLoaded = startByte + event.loaded;
              const elapsedSec = Math.max((Date.now() - startTime) / 1000, 0.1);
              const bytesPerSec = currentTotalLoaded / elapsedSec;
              const mbPerSec = (bytesPerSec / (1024 * 1024)).toFixed(1);
              const speedStr = `${mbPerSec} MB/s`;

              const remainingBytes = file.size - currentTotalLoaded;
              const remainingSec = bytesPerSec > 0 ? Math.ceil(remainingBytes / bytesPerSec) : 0;
              const timeStr = remainingSec > 60 ? `${Math.ceil(remainingSec / 60)}m` : `${remainingSec}s`;

              onProgress(currentTotalLoaded, file.size, speedStr, timeStr);
            }
          });

          xhr.addEventListener("load", () => {
            currentXhr = null;
            const rawText = (xhr.responseText || "").trim();

            if (xhr.status >= 200 && xhr.status < 300) {
              if (!rawText) {
                // Empty successful body
                return resolve({ status: "chunk_received", chunkIndex });
              }
              if (rawText.startsWith("<")) {
                return reject(new Error(`Server returned HTML error page instead of JSON for chunk ${chunkIndex} (status ${xhr.status})`));
              }
              try {
                const res = JSON.parse(rawText);
                resolve(res);
              } catch {
                reject(new Error(`Invalid JSON in server response for chunk ${chunkIndex}`));
              }
            } else {
              try {
                const res = JSON.parse(rawText);
                reject(new Error(res.error || `Upload chunk ${chunkIndex} failed with status ${xhr.status}`));
              } catch {
                reject(new Error(`Upload chunk ${chunkIndex} failed with status ${xhr.status}`));
              }
            }
          });

          xhr.addEventListener("error", () => {
            currentXhr = null;
            reject(new Error(`Network error during chunk ${chunkIndex} upload`));
          });

          xhr.addEventListener("abort", () => {
            currentXhr = null;
            reject(new Error("Upload cancelled by user"));
          });

          // Pass parameters via query string AND custom headers so they are immediately available to Multer before body parsing
          const queryParams = new URLSearchParams({
            uploadId: uploadId,
            chunkIndex: String(chunkIndex),
            totalChunks: String(totalChunks),
            fileName: file.name,
            fileSize: String(file.size),
          });
          if (folderId) queryParams.set("folder_id", folderId);

          xhr.open("POST", `/api/files/upload/chunk?${queryParams.toString()}`);

          if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          }
          xhr.setRequestHeader("x-device-type", deviceName);
          xhr.setRequestHeader("x-upload-id", uploadId);
          xhr.setRequestHeader("x-chunk-index", String(chunkIndex));
          xhr.setRequestHeader("x-total-chunks", String(totalChunks));
          xhr.setRequestHeader("x-file-name", encodeURIComponent(file.name));
          xhr.setRequestHeader("x-file-size", String(file.size));

          // In FormData, append metadata FIRST and chunk file LAST
          const formData = new FormData();
          formData.append("uploadId", uploadId);
          formData.append("chunkIndex", String(chunkIndex));
          formData.append("totalChunks", String(totalChunks));
          formData.append("fileName", file.name);
          formData.append("fileSize", String(file.size));
          if (folderId) formData.append("folder_id", folderId);
          formData.append("device_name", deviceName);
          formData.append("sharing_visibility", sharingVisibility);
          if (description) formData.append("description", description);
          formData.append("chunk", chunkBlob, file.name);

          xhr.send(formData);
        });
      };

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        if (isCancelled) {
          throw new Error("Upload cancelled by user");
        }

        const startByte = chunkIndex * CHUNK_SIZE;
        const endByte = Math.min(startByte + CHUNK_SIZE, file.size);
        const chunkBlob = file.slice(startByte, endByte);

        // Upload chunk with up to 3 automatic retries on transient network errors
        let chunkResult: any = null;
        let lastError: any = null;

        for (let attempt = 0; attempt < 3; attempt++) {
          if (isCancelled) throw new Error("Upload cancelled by user");
          try {
            chunkResult = await uploadSingleChunkAttempt(chunkIndex, startByte, chunkBlob);
            break; // Chunk succeeded
          } catch (err: any) {
            lastError = err;
            if (isCancelled || err.message?.includes("cancelled")) {
              throw err;
            }
            console.warn(`Chunk ${chunkIndex} upload attempt ${attempt + 1} failed: ${err.message}. Retrying...`);
            // Progressive wait before retrying chunk
            await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
          }
        }

        if (!chunkResult) {
          throw lastError || new Error(`Failed to upload chunk ${chunkIndex} after retries`);
        }

        if (chunkResult && chunkResult.file) {
          lastResult = chunkResult.file;
        }
      }

      if (!lastResult) {
        throw new Error("File upload failed to finalize on server");
      }

      onProgress(file.size, file.size, "0 MB/s", "0s");
      return lastResult;
    };

    const executeDirectUpload = (): Promise<FileItem> => {
      return new Promise<FileItem>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        currentXhr = xhr;
        let startTime = Date.now();
        let lastLoaded = 0;

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable && !isCancelled) {
            const currentTime = Date.now();
            const elapsedSec = (currentTime - startTime) / 1000;
            const bytesPerSec = elapsedSec > 0 ? (event.loaded - lastLoaded) / Math.max(elapsedSec, 0.1) : 0;
            const mbPerSec = (bytesPerSec / (1024 * 1024)).toFixed(1);
            const speedStr = `${mbPerSec} MB/s`;

            const remainingBytes = event.total - event.loaded;
            const remainingSec = bytesPerSec > 0 ? Math.ceil(remainingBytes / bytesPerSec) : 0;
            const timeStr = remainingSec > 60 ? `${Math.ceil(remainingSec / 60)}m` : `${remainingSec}s`;

            onProgress(event.loaded, event.total, speedStr, timeStr);
          }
        });

        xhr.addEventListener("load", () => {
          currentXhr = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve(res.file);
            } catch (e) {
              reject(new Error("Failed to parse response"));
            }
          } else if (xhr.status === 413) {
            // If direct upload encounters 413, seamlessly fall back to chunked upload
            console.warn("Direct upload returned 413 (Payload Too Large). Falling back to reliable chunked upload...");
            executeChunkedUpload().then(resolve).catch(reject);
          } else {
            try {
              const res = JSON.parse(xhr.responseText);
              reject(new Error(res.error || "Upload failed"));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener("error", () => {
          currentXhr = null;
          reject(new Error("Network error during file upload"));
        });

        xhr.addEventListener("abort", () => {
          currentXhr = null;
          reject(new Error("Upload cancelled by user"));
        });

        xhr.open("POST", "/api/files/upload");
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
        xhr.setRequestHeader("x-device-type", deviceName);

        const formData = new FormData();
        formData.append("file", file);
        if (folderId) formData.append("folder_id", folderId);
        formData.append("device_name", deviceName);
        formData.append("sharing_visibility", sharingVisibility);
        if (description) formData.append("description", description);

        xhr.send(formData);
      });
    };

    const promise = isChunked ? executeChunkedUpload() : executeDirectUpload();

    return {
      promise,
      cancel: () => {
        isCancelled = true;
        if (currentXhr) {
          currentXhr.abort();
        }
      },
    };
  },

  async updateFile(id: string, updates: Partial<FileItem>) {
    const res = await fetch(`/api/files/${id}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to update file" }));
      throw new Error(err.error || "Failed to update file");
    }
    const data = await res.json();
    return data.file as FileItem;
  },

  async renameFile(id: string, newName: string) {
    return this.updateFile(id, { file_name: newName });
  },

  async moveFile(id: string, newFolderId: string | null) {
    return this.updateFile(id, { folder_id: newFolderId });
  },

  async shareFile(id: string, visibility: SharingVisibility) {
    return this.updateFile(id, { sharing_visibility: visibility });
  },

  async updateFileTags(id: string, tags: string[]) {
    return this.updateFile(id, { tags });
  },

  async toggleFavorite(id: string) {
    const res = await fetch(`/api/files/${id}/favorite`, {
      method: "POST",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to toggle favorite");
    const data = await res.json();
    return data.file as FileItem;
  },

  async trashFile(id: string) {
    return this.updateFile(id, { is_trash: true, is_trashed: true } as any);
  },

  async restoreFile(id: string) {
    return this.updateFile(id, { is_trash: false, is_trashed: false } as any);
  },

  async copyFile(id: string) {
    const res = await fetch(`/api/files/${id}/copy`, {
      method: "POST",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to copy file");
    const data = await res.json();
    return data.file as FileItem;
  },

  async deleteFile(id: string) {
    return this.trashFile(id);
  },

  async permanentDeleteFile(id: string) {
    const res = await fetch(`/api/files/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete file");
    }
    return res.json();
  },

  getFileDownloadUrl(id: string) {
    const token = getAuthToken();
    return `/api/files/download/${id}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  },

  getFilePreviewUrl(id: string) {
    const token = getAuthToken();
    return `/api/files/preview/${id}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  },

  downloadFile(id: string, filename: string) {
    const link = document.createElement("a");
    link.href = this.getFileDownloadUrl(id);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Stats
  async getDashboardStats(signal?: AbortSignal) {
    const res = await fetch("/api/stats", { headers: authHeaders(), signal });
    if (!res.ok) throw new Error("Failed to get dashboard stats");
    return res.json() as Promise<DashboardStats>;
  },

  async getStats(signal?: AbortSignal) {
    return this.getDashboardStats(signal);
  },

  // Admin APIs
  async getAdminOverview() {
    const res = await fetch("/api/admin/overview", { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to get admin overview");
    return res.json() as Promise<AdminOverview>;
  },

  async getAdminUsers() {
    const res = await fetch("/api/admin/users", { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to get users list");
    const data = await res.json();
    return data.users as User[];
  },

  async createAdminUser(userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    name?: string;
    department?: string;
    storage_limit_gb?: number;
  }) {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to create user" }));
      throw new Error(err.error || "Failed to create user");
    }
    const data = await res.json();
    return data.user as User;
  },

  async createTeacher(userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    name?: string;
  }) {
    return this.createAdminUser(userData);
  },

  async updateAdminUser(id: string, updates: Partial<User> & { password?: string; storage_limit_gb?: number }) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to update user" }));
      throw new Error(err.error || "Failed to update user");
    }
    const data = await res.json();
    return data.user as User;
  },

  async updateTeacher(id: string, updates: Partial<User>) {
    return this.updateAdminUser(id, updates);
  },

  async adminResetPassword(id: string, newPassword: string) {
    return this.updateAdminUser(id, { password: newPassword });
  },

  async deleteAdminUser(id: string) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to delete user" }));
      throw new Error(err.error || "Failed to delete user");
    }
    return res.json();
  },

  async deleteTeacher(id: string) {
    return this.deleteAdminUser(id);
  },

  async getAdminLogs() {
    const res = await fetch("/api/admin/logs", { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to get logs");
    const data = await res.json();
    return data.logs as ActivityLog[];
  },
};

import React from "react";
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  FileArchive,
  FileVideo,
  FileAudio,
  FileImage,
  FileCode,
  File,
  Laptop,
} from "lucide-react";

export type SupportedExtensionCategory =
  | "pdf"
  | "word"
  | "excel"
  | "data"
  | "powerpoint"
  | "archive"
  | "video"
  | "audio"
  | "image"
  | "code"
  | "text"
  | "app"
  | "other";

export interface FileIconConfig {
  extension: string;
  badgeText: string;
  label: string;
  category: SupportedExtensionCategory;
  icon: React.ComponentType<{ className?: string }>;
  colors: {
    text: string;
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    ring: string;
    hex: string;
    bgHex: string;
  };
}

/**
 * Extract clean lowercase file extension from filename or URL
 */
export function getFileExtension(fileName: string = ""): string {
  if (!fileName) return "";
  const cleanName = fileName.split("?")[0].split("#")[0];
  const parts = cleanName.split(".");
  if (parts.length <= 1) return "";
  return parts.pop()?.trim().toLowerCase() || "";
}

// Extension maps to configurations
const EXTENSION_MAP: Record<string, Partial<FileIconConfig>> = {
  // Adobe PDF
  pdf: {
    badgeText: "PDF",
    label: "PDF Document",
    category: "pdf",
    icon: FileText,
    colors: {
      text: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
      badgeBg: "bg-rose-600",
      badgeText: "text-white",
      ring: "ring-rose-400/30",
      hex: "#E11D48",
      bgHex: "#FFE4E6",
    },
  },

  // Microsoft Word / Documents
  doc: {
    badgeText: "DOC",
    label: "Word Document",
    category: "word",
    icon: FileText,
    colors: {
      text: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      badgeBg: "bg-blue-600",
      badgeText: "text-white",
      ring: "ring-blue-400/30",
      hex: "#2563EB",
      bgHex: "#EFF6FF",
    },
  },
  docx: {
    badgeText: "DOCX",
    label: "Word Document",
    category: "word",
    icon: FileText,
    colors: {
      text: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      badgeBg: "bg-blue-600",
      badgeText: "text-white",
      ring: "ring-blue-400/30",
      hex: "#2563EB",
      bgHex: "#EFF6FF",
    },
  },
  odt: {
    badgeText: "ODT",
    label: "OpenDocument Text",
    category: "word",
    icon: FileText,
    colors: {
      text: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      badgeBg: "bg-blue-600",
      badgeText: "text-white",
      ring: "ring-blue-400/30",
      hex: "#2563EB",
      bgHex: "#EFF6FF",
    },
  },
  rtf: {
    badgeText: "RTF",
    label: "Rich Text",
    category: "word",
    icon: FileText,
    colors: {
      text: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      badgeBg: "bg-blue-600",
      badgeText: "text-white",
      ring: "ring-blue-400/30",
      hex: "#2563EB",
      bgHex: "#EFF6FF",
    },
  },

  // Microsoft Excel / Spreadsheets
  xls: {
    badgeText: "XLS",
    label: "Excel Spreadsheet",
    category: "excel",
    icon: FileSpreadsheet,
    colors: {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      badgeBg: "bg-emerald-600",
      badgeText: "text-white",
      ring: "ring-emerald-400/30",
      hex: "#059669",
      bgHex: "#ECFDF5",
    },
  },
  xlsx: {
    badgeText: "XLSX",
    label: "Excel Spreadsheet",
    category: "excel",
    icon: FileSpreadsheet,
    colors: {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      badgeBg: "bg-emerald-600",
      badgeText: "text-white",
      ring: "ring-emerald-400/30",
      hex: "#059669",
      bgHex: "#ECFDF5",
    },
  },
  xlsm: {
    badgeText: "XLSM",
    label: "Excel Macro Sheet",
    category: "excel",
    icon: FileSpreadsheet,
    colors: {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      badgeBg: "bg-emerald-600",
      badgeText: "text-white",
      ring: "ring-emerald-400/30",
      hex: "#059669",
      bgHex: "#ECFDF5",
    },
  },
  ods: {
    badgeText: "ODS",
    label: "OpenDocument Calc",
    category: "excel",
    icon: FileSpreadsheet,
    colors: {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      badgeBg: "bg-emerald-600",
      badgeText: "text-white",
      ring: "ring-emerald-400/30",
      hex: "#059669",
      bgHex: "#ECFDF5",
    },
  },

  // CSV & Data sheets
  csv: {
    badgeText: "CSV",
    label: "CSV Data Table",
    category: "data",
    icon: FileSpreadsheet,
    colors: {
      text: "text-teal-600",
      bg: "bg-teal-50",
      border: "border-teal-200",
      badgeBg: "bg-teal-600",
      badgeText: "text-white",
      ring: "ring-teal-400/30",
      hex: "#0D9488",
      bgHex: "#F0FDFA",
    },
  },
  tsv: {
    badgeText: "TSV",
    label: "Tab-Separated Data",
    category: "data",
    icon: FileSpreadsheet,
    colors: {
      text: "text-teal-600",
      bg: "bg-teal-50",
      border: "border-teal-200",
      badgeBg: "bg-teal-600",
      badgeText: "text-white",
      ring: "ring-teal-400/30",
      hex: "#0D9488",
      bgHex: "#F0FDFA",
    },
  },

  // PowerPoint / Slides
  ppt: {
    badgeText: "PPT",
    label: "PowerPoint Slides",
    category: "powerpoint",
    icon: Presentation,
    colors: {
      text: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      badgeBg: "bg-amber-600",
      badgeText: "text-white",
      ring: "ring-amber-400/30",
      hex: "#D97706",
      bgHex: "#FFFBEB",
    },
  },
  pptx: {
    badgeText: "PPTX",
    label: "PowerPoint Slides",
    category: "powerpoint",
    icon: Presentation,
    colors: {
      text: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      badgeBg: "bg-amber-600",
      badgeText: "text-white",
      ring: "ring-amber-400/30",
      hex: "#D97706",
      bgHex: "#FFFBEB",
    },
  },
  key: {
    badgeText: "KEY",
    label: "Keynote Slides",
    category: "powerpoint",
    icon: Presentation,
    colors: {
      text: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      badgeBg: "bg-amber-600",
      badgeText: "text-white",
      ring: "ring-amber-400/30",
      hex: "#D97706",
      bgHex: "#FFFBEB",
    },
  },
  odp: {
    badgeText: "ODP",
    label: "OpenDocument Slides",
    category: "powerpoint",
    icon: Presentation,
    colors: {
      text: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      badgeBg: "bg-amber-600",
      badgeText: "text-white",
      ring: "ring-amber-400/30",
      hex: "#D97706",
      bgHex: "#FFFBEB",
    },
  },

  // Executables & Software Applications (e.g. HSCResultAnalysis.exe)
  exe: {
    badgeText: "EXE",
    label: "Application / Executable (.exe)",
    category: "app",
    icon: Laptop,
    colors: {
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      badgeBg: "bg-indigo-600",
      badgeText: "text-white",
      ring: "ring-indigo-400/30",
      hex: "#4F46E5",
      bgHex: "#EEF2FF",
    },
  },
  msi: {
    badgeText: "MSI",
    label: "Windows Installer (.msi)",
    category: "app",
    icon: Laptop,
    colors: {
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      badgeBg: "bg-indigo-600",
      badgeText: "text-white",
      ring: "ring-indigo-400/30",
      hex: "#4F46E5",
      bgHex: "#EEF2FF",
    },
  },
  apk: {
    badgeText: "APK",
    label: "Android Application (.apk)",
    category: "app",
    icon: Laptop,
    colors: {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      badgeBg: "bg-emerald-600",
      badgeText: "text-white",
      ring: "ring-emerald-400/30",
      hex: "#059669",
      bgHex: "#ECFDF5",
    },
  },
  dmg: {
    badgeText: "DMG",
    label: "macOS Disk Image (.dmg)",
    category: "app",
    icon: Laptop,
    colors: {
      text: "text-slate-700",
      bg: "bg-slate-100",
      border: "border-slate-300",
      badgeBg: "bg-slate-700",
      badgeText: "text-white",
      ring: "ring-slate-400/30",
      hex: "#334155",
      bgHex: "#F1F5F9",
    },
  },
  iso: {
    badgeText: "ISO",
    label: "Disc Image (.iso)",
    category: "app",
    icon: Laptop,
    colors: {
      text: "text-slate-700",
      bg: "bg-slate-100",
      border: "border-slate-300",
      badgeBg: "bg-slate-700",
      badgeText: "text-white",
      ring: "ring-slate-400/30",
      hex: "#334155",
      bgHex: "#F1F5F9",
    },
  },

  // Archive & Compressed
  zip: {
    badgeText: "ZIP",
    label: "ZIP Archive",
    category: "archive",
    icon: FileArchive,
    colors: {
      text: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      badgeBg: "bg-purple-600",
      badgeText: "text-white",
      ring: "ring-purple-400/30",
      hex: "#9333EA",
      bgHex: "#FAF5FF",
    },
  },
  rar: {
    badgeText: "RAR",
    label: "RAR Archive",
    category: "archive",
    icon: FileArchive,
    colors: {
      text: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      badgeBg: "bg-purple-600",
      badgeText: "text-white",
      ring: "ring-purple-400/30",
      hex: "#9333EA",
      bgHex: "#FAF5FF",
    },
  },
  "7z": {
    badgeText: "7Z",
    label: "7-Zip Archive",
    category: "archive",
    icon: FileArchive,
    colors: {
      text: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      badgeBg: "bg-purple-600",
      badgeText: "text-white",
      ring: "ring-purple-400/30",
      hex: "#9333EA",
      bgHex: "#FAF5FF",
    },
  },
  tar: {
    badgeText: "TAR",
    label: "TAR Archive",
    category: "archive",
    icon: FileArchive,
    colors: {
      text: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      badgeBg: "bg-purple-600",
      badgeText: "text-white",
      ring: "ring-purple-400/30",
      hex: "#9333EA",
      bgHex: "#FAF5FF",
    },
  },
  gz: {
    badgeText: "GZ",
    label: "GZip Archive",
    category: "archive",
    icon: FileArchive,
    colors: {
      text: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      badgeBg: "bg-purple-600",
      badgeText: "text-white",
      ring: "ring-purple-400/30",
      hex: "#9333EA",
      bgHex: "#FAF5FF",
    },
  },

  // Video Formats
  mp4: {
    badgeText: "MP4",
    label: "MP4 Video",
    category: "video",
    icon: FileVideo,
    colors: {
      text: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
      badgeBg: "bg-rose-600",
      badgeText: "text-white",
      ring: "ring-rose-400/30",
      hex: "#E11D48",
      bgHex: "#FFE4E6",
    },
  },
  mov: {
    badgeText: "MOV",
    label: "QuickTime Video",
    category: "video",
    icon: FileVideo,
    colors: {
      text: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
      badgeBg: "bg-rose-600",
      badgeText: "text-white",
      ring: "ring-rose-400/30",
      hex: "#E11D48",
      bgHex: "#FFE4E6",
    },
  },
  mkv: {
    badgeText: "MKV",
    label: "Matroska Video",
    category: "video",
    icon: FileVideo,
    colors: {
      text: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
      badgeBg: "bg-rose-600",
      badgeText: "text-white",
      ring: "ring-rose-400/30",
      hex: "#E11D48",
      bgHex: "#FFE4E6",
    },
  },
  avi: {
    badgeText: "AVI",
    label: "AVI Video",
    category: "video",
    icon: FileVideo,
    colors: {
      text: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
      badgeBg: "bg-rose-600",
      badgeText: "text-white",
      ring: "ring-rose-400/30",
      hex: "#E11D48",
      bgHex: "#FFE4E6",
    },
  },
  webm: {
    badgeText: "WEBM",
    label: "WebM Video",
    category: "video",
    icon: FileVideo,
    colors: {
      text: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
      badgeBg: "bg-rose-600",
      badgeText: "text-white",
      ring: "ring-rose-400/30",
      hex: "#E11D48",
      bgHex: "#FFE4E6",
    },
  },

  // Audio Formats
  mp3: {
    badgeText: "MP3",
    label: "MP3 Audio",
    category: "audio",
    icon: FileAudio,
    colors: {
      text: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      badgeBg: "bg-orange-600",
      badgeText: "text-white",
      ring: "ring-orange-400/30",
      hex: "#EA580C",
      bgHex: "#FFF7ED",
    },
  },
  wav: {
    badgeText: "WAV",
    label: "WAV Audio",
    category: "audio",
    icon: FileAudio,
    colors: {
      text: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      badgeBg: "bg-orange-600",
      badgeText: "text-white",
      ring: "ring-orange-400/30",
      hex: "#EA580C",
      bgHex: "#FFF7ED",
    },
  },
  ogg: {
    badgeText: "OGG",
    label: "OGG Audio",
    category: "audio",
    icon: FileAudio,
    colors: {
      text: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      badgeBg: "bg-orange-600",
      badgeText: "text-white",
      ring: "ring-orange-400/30",
      hex: "#EA580C",
      bgHex: "#FFF7ED",
    },
  },
  flac: {
    badgeText: "FLAC",
    label: "FLAC Audio",
    category: "audio",
    icon: FileAudio,
    colors: {
      text: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      badgeBg: "bg-orange-600",
      badgeText: "text-white",
      ring: "ring-orange-400/30",
      hex: "#EA580C",
      bgHex: "#FFF7ED",
    },
  },
  m4a: {
    badgeText: "M4A",
    label: "M4A Audio",
    category: "audio",
    icon: FileAudio,
    colors: {
      text: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      badgeBg: "bg-orange-600",
      badgeText: "text-white",
      ring: "ring-orange-400/30",
      hex: "#EA580C",
      bgHex: "#FFF7ED",
    },
  },

  // Image Formats
  png: {
    badgeText: "PNG",
    label: "PNG Image",
    category: "image",
    icon: FileImage,
    colors: {
      text: "text-cyan-600",
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      badgeBg: "bg-cyan-600",
      badgeText: "text-white",
      ring: "ring-cyan-400/30",
      hex: "#0891B2",
      bgHex: "#ECFEFF",
    },
  },
  jpg: {
    badgeText: "JPG",
    label: "JPEG Image",
    category: "image",
    icon: FileImage,
    colors: {
      text: "text-cyan-600",
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      badgeBg: "bg-cyan-600",
      badgeText: "text-white",
      ring: "ring-cyan-400/30",
      hex: "#0891B2",
      bgHex: "#ECFEFF",
    },
  },
  jpeg: {
    badgeText: "JPG",
    label: "JPEG Image",
    category: "image",
    icon: FileImage,
    colors: {
      text: "text-cyan-600",
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      badgeBg: "bg-cyan-600",
      badgeText: "text-white",
      ring: "ring-cyan-400/30",
      hex: "#0891B2",
      bgHex: "#ECFEFF",
    },
  },
  gif: {
    badgeText: "GIF",
    label: "GIF Animation",
    category: "image",
    icon: FileImage,
    colors: {
      text: "text-cyan-600",
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      badgeBg: "bg-cyan-600",
      badgeText: "text-white",
      ring: "ring-cyan-400/30",
      hex: "#0891B2",
      bgHex: "#ECFEFF",
    },
  },
  webp: {
    badgeText: "WEBP",
    label: "WebP Image",
    category: "image",
    icon: FileImage,
    colors: {
      text: "text-cyan-600",
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      badgeBg: "bg-cyan-600",
      badgeText: "text-white",
      ring: "ring-cyan-400/30",
      hex: "#0891B2",
      bgHex: "#ECFEFF",
    },
  },
  svg: {
    badgeText: "SVG",
    label: "Vector Graphic",
    category: "image",
    icon: FileImage,
    colors: {
      text: "text-cyan-600",
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      badgeBg: "bg-cyan-600",
      badgeText: "text-white",
      ring: "ring-cyan-400/30",
      hex: "#0891B2",
      bgHex: "#ECFEFF",
    },
  },

  // Code & Developer Files
  json: {
    badgeText: "JSON",
    label: "JSON File",
    category: "code",
    icon: FileCode,
    colors: {
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      badgeBg: "bg-indigo-600",
      badgeText: "text-white",
      ring: "ring-indigo-400/30",
      hex: "#4F46E5",
      bgHex: "#EEF2FF",
    },
  },
  js: {
    badgeText: "JS",
    label: "JavaScript File",
    category: "code",
    icon: FileCode,
    colors: {
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      badgeBg: "bg-indigo-600",
      badgeText: "text-white",
      ring: "ring-indigo-400/30",
      hex: "#4F46E5",
      bgHex: "#EEF2FF",
    },
  },
  ts: {
    badgeText: "TS",
    label: "TypeScript File",
    category: "code",
    icon: FileCode,
    colors: {
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      badgeBg: "bg-indigo-600",
      badgeText: "text-white",
      ring: "ring-indigo-400/30",
      hex: "#4F46E5",
      bgHex: "#EEF2FF",
    },
  },
  html: {
    badgeText: "HTML",
    label: "HTML Webpage",
    category: "code",
    icon: FileCode,
    colors: {
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      badgeBg: "bg-indigo-600",
      badgeText: "text-white",
      ring: "ring-indigo-400/30",
      hex: "#4F46E5",
      bgHex: "#EEF2FF",
    },
  },
  css: {
    badgeText: "CSS",
    label: "CSS Stylesheet",
    category: "code",
    icon: FileCode,
    colors: {
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      badgeBg: "bg-indigo-600",
      badgeText: "text-white",
      ring: "ring-indigo-400/30",
      hex: "#4F46E5",
      bgHex: "#EEF2FF",
    },
  },
  py: {
    badgeText: "PY",
    label: "Python Script",
    category: "code",
    icon: FileCode,
    colors: {
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      badgeBg: "bg-indigo-600",
      badgeText: "text-white",
      ring: "ring-indigo-400/30",
      hex: "#4F46E5",
      bgHex: "#EEF2FF",
    },
  },

  // Plain Text & Markdown
  txt: {
    badgeText: "TXT",
    label: "Plain Text Document",
    category: "text",
    icon: FileText,
    colors: {
      text: "text-slate-600",
      bg: "bg-slate-100",
      border: "border-slate-200",
      badgeBg: "bg-slate-600",
      badgeText: "text-white",
      ring: "ring-slate-400/30",
      hex: "#475569",
      bgHex: "#F1F5F9",
    },
  },
  md: {
    badgeText: "MD",
    label: "Markdown File",
    category: "text",
    icon: FileText,
    colors: {
      text: "text-slate-600",
      bg: "bg-slate-100",
      border: "border-slate-200",
      badgeBg: "bg-slate-600",
      badgeText: "text-white",
      ring: "ring-slate-400/30",
      hex: "#475569",
      bgHex: "#F1F5F9",
    },
  },
};

// Fallback configuration by generic category
const CATEGORY_FALLBACKS: Record<string, FileIconConfig> = {
  document: {
    extension: "doc",
    badgeText: "DOC",
    label: "Document",
    category: "document" as any,
    icon: FileText,
    colors: {
      text: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      badgeBg: "bg-blue-600",
      badgeText: "text-white",
      ring: "ring-blue-400/30",
      hex: "#2563EB",
      bgHex: "#EFF6FF",
    },
  },
  video: {
    extension: "video",
    badgeText: "VIDEO",
    label: "Video",
    category: "video",
    icon: FileVideo,
    colors: {
      text: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
      badgeBg: "bg-rose-600",
      badgeText: "text-white",
      ring: "ring-rose-400/30",
      hex: "#E11D48",
      bgHex: "#FFE4E6",
    },
  },
  audio: {
    extension: "audio",
    badgeText: "AUDIO",
    label: "Audio",
    category: "audio",
    icon: FileAudio,
    colors: {
      text: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      badgeBg: "bg-orange-600",
      badgeText: "text-white",
      ring: "ring-orange-400/30",
      hex: "#EA580C",
      bgHex: "#FFF7ED",
    },
  },
  image: {
    extension: "image",
    badgeText: "IMAGE",
    label: "Image",
    category: "image",
    icon: FileImage,
    colors: {
      text: "text-cyan-600",
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      badgeBg: "bg-cyan-600",
      badgeText: "text-white",
      ring: "ring-cyan-400/30",
      hex: "#0891B2",
      bgHex: "#ECFEFF",
    },
  },
  other: {
    extension: "file",
    badgeText: "FILE",
    label: "General File",
    category: "other",
    icon: File,
    colors: {
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      badgeBg: "bg-indigo-600",
      badgeText: "text-white",
      ring: "ring-indigo-400/30",
      hex: "#4F46E5",
      bgHex: "#EEF2FF",
    },
  },
};

/**
 * Resolves the full icon configuration for any file name or extension
 */
export function getFileIconConfig(
  fileNameOrExt: string = "",
  fallbackCategory?: string
): FileIconConfig {
  const ext = getFileExtension(fileNameOrExt) || fileNameOrExt.toLowerCase();

  if (ext && EXTENSION_MAP[ext]) {
    const config = EXTENSION_MAP[ext]!;
    return {
      extension: ext,
      badgeText: config.badgeText || ext.toUpperCase(),
      label: config.label || `${ext.toUpperCase()} File`,
      category: config.category || "other",
      icon: config.icon || File,
      colors: config.colors!,
    };
  }

  // If no direct extension match, try category fallback
  const catKey = fallbackCategory?.toLowerCase();
  if (catKey && CATEGORY_FALLBACKS[catKey]) {
    const fb = CATEGORY_FALLBACKS[catKey];
    return {
      ...fb,
      extension: ext || fb.extension,
      badgeText: ext ? ext.toUpperCase().slice(0, 4) : fb.badgeText,
    };
  }

  // Default generic fallback
  return {
    ...CATEGORY_FALLBACKS.other,
    extension: ext || "file",
    badgeText: ext ? ext.toUpperCase().slice(0, 4) : "FILE",
  };
}

/**
 * Size dimensions mapping
 */
const SIZE_CONFIGS = {
  xs: {
    container: "h-6 w-6 rounded-md",
    icon: "h-3.5 w-3.5",
    badge: "text-[7px] px-1 py-0",
  },
  sm: {
    container: "h-8 w-8 rounded-lg",
    icon: "h-4 w-4",
    badge: "text-[8px] px-1 py-0.2",
  },
  md: {
    container: "h-10 w-10 rounded-xl",
    icon: "h-5 w-5",
    badge: "text-[8px] px-1.5 py-0.5",
  },
  lg: {
    container: "h-12 w-12 rounded-2xl",
    icon: "h-6 w-6",
    badge: "text-[9px] px-2 py-0.5",
  },
  xl: {
    container: "h-16 w-16 rounded-2xl",
    icon: "h-8 w-8",
    badge: "text-[10px] px-2 py-0.5",
  },
};

export interface DynamicFileIconProps {
  fileName?: string;
  fileType?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  className?: string;
}

/**
 * Dynamic File Icon Component
 * Renders color-coded SVG icon paired with distinct extension badge
 */
export const DynamicFileIcon: React.FC<DynamicFileIconProps> = ({
  fileName = "",
  fileType,
  size = "md",
  showBadge = false,
  className = "",
}) => {
  const config = getFileIconConfig(fileName, fileType);
  const sizeStyle = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;
  const IconComponent = config.icon;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 border transition shadow-2xs select-none ${config.colors.bg} ${config.colors.border} ${config.colors.text} ${sizeStyle.container} ${className}`}
      title={`${config.label} (${config.badgeText})`}
    >
      <IconComponent className={`${sizeStyle.icon} transition-transform group-hover:scale-105`} />

      {showBadge && (
        <span
          className={`absolute -bottom-1 -right-1 font-black uppercase tracking-wider rounded shadow-xs leading-none font-mono ${config.colors.badgeBg} ${config.colors.badgeText} ${sizeStyle.badge}`}
        >
          {config.badgeText}
        </span>
      )}
    </div>
  );
};

/**
 * File Extension Badge Component
 */
export const FileExtensionBadge: React.FC<{
  fileName?: string;
  fileType?: string;
  className?: string;
}> = ({ fileName = "", fileType, className = "" }) => {
  const config = getFileIconConfig(fileName, fileType);
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded border shadow-2xs ${config.colors.bg} ${config.colors.border} ${config.colors.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.colors.badgeBg}`} />
      {config.badgeText}
    </span>
  );
};

/**
 * Exported service object for programmatic access
 */
export const fileIconService = {
  getExtension: getFileExtension,
  getConfig: getFileIconConfig,
  renderIcon: (props: DynamicFileIconProps) => <DynamicFileIcon {...props} />,
  renderBadge: (fileName?: string, fileType?: string) => (
    <FileExtensionBadge fileName={fileName} fileType={fileType} />
  ),
};

export default fileIconService;

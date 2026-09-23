import React, { useRef, useState, useEffect } from "react";
import { FileItem } from "../types";
import { api } from "../lib/api";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Download,
  Smartphone,
  Laptop,
  Music,
  Disc,
} from "lucide-react";

interface AudioPlayerModalProps {
  audio: FileItem | null;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({ audio, onClose, onDownload }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsPlaying(false);
    setCurrentTime(0);
  }, [audio?.id]);

  if (!audio) return null;

  const streamUrl = api.getFilePreviewUrl(audio.id);

  const togglePlay = () => {
    if (!audioRef.current || hasError) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn("Audio play interrupted:", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || audio.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const skip = (secs: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + secs));
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const sizeMB = (audio.file_size / (1024 * 1024)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 pt-5">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-full">
            Educational Audio Player
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Visual Disk & Info */}
        <div className="flex flex-col items-center px-6 py-6 text-center">
          <div className={`relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-xl shadow-rose-500/20 ${isPlaying ? "animate-pulse" : ""}`}>
            <Disc className={`h-16 w-16 ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "6s" }} />
          </div>

          <h2 className="mt-4 text-base font-bold text-slate-900 line-clamp-1">
            {audio.file_name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Teacher: {audio.owner_name} • {sizeMB} MB
          </p>

          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-600 font-medium">
            {audio.device.includes("Mobile") ? <Smartphone className="h-3 w-3 text-rose-600" /> : <Laptop className="h-3 w-3 text-blue-600" />}
            <span>Uploaded via {audio.device}</span>
          </div>
        </div>

        {/* Hidden HTML5 Audio Element */}
        <audio
          key={audio.id}
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            setHasError(true);
            setIsPlaying(false);
          }}
        >
          <source src={streamUrl} type={audio.mime_type || "audio/mpeg"} />
          <source src={streamUrl} />
        </audio>

        {hasError && (
          <div className="mx-6 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p className="text-xs text-amber-800 font-medium">
              Audio stream preview could not be decoded by browser.
            </p>
            <button
              onClick={() => onDownload(audio)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Audio to Device</span>
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="px-6 pb-6 space-y-4">
          {/* Scrubber */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={() => skip(-10)}
              className="p-2 text-slate-400 hover:text-slate-700 transition"
              title="Rewind 10s"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            <button
              onClick={togglePlay}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-700 transition active:scale-95"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current ml-1" />}
            </button>

            <button
              onClick={() => skip(10)}
              className="p-2 text-slate-400 hover:text-slate-700 transition"
              title="Forward 10s"
            >
              <RotateCw className="h-5 w-5" />
            </button>
          </div>

          {/* Bottom Download & Volume */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => onDownload(audio)}
              className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download File</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setVolume(val);
                  if (audioRef.current) audioRef.current.volume = val;
                }}
                className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

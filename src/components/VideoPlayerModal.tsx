import React, { useRef, useState, useEffect } from "react";
import { FileItem } from "../types";
import { api } from "../lib/api";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  Smartphone,
  Laptop,
  Clock,
  HardDrive,
  Film,
} from "lucide-react";

interface VideoPlayerModalProps {
  video: FileItem | null;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose, onDownload }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsPlaying(false);
    setCurrentTime(0);
  }, [video?.id]);

  if (!video) return null;

  const streamUrl = api.getFilePreviewUrl(video.id);

  const togglePlay = () => {
    if (!videoRef.current || hasError) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => {
        console.warn("Video play interrupted:", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || video.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.log(err));
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const sizeMB = (video.file_size / (1024 * 1024)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6 animate-in fade-in">
      <div
        ref={containerRef}
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 text-white z-10">
          <div className="flex items-center gap-3 truncate pr-4">
            <Film className="h-5 w-5 text-purple-400 shrink-0" />
            <div className="truncate">
              <h2 className="text-sm font-bold truncate text-white">{video.file_name}</h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>{sizeMB} MB</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  {video.device.includes("Mobile") ? <Smartphone className="h-3 w-3" /> : <Laptop className="h-3 w-3" />}
                  {video.device}
                </span>
                <span>•</span>
                <span>Teacher: {video.owner_name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onDownload(video)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Video Stage */}
        <div
          className="relative flex-1 flex items-center justify-center bg-black min-h-[300px] md:min-h-[420px]"
          onClick={!hasError ? togglePlay : undefined}
        >
          {hasError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-300 max-w-md animate-in fade-in">
              <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
                <Film className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-bold text-white">Browser Playback Notice</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                The video stream could not be played directly inside this browser view. You can download the complete video file to view it on your device.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(video);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Video ({sizeMB} MB)</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHasError(false);
                    if (videoRef.current) {
                      videoRef.current.load();
                    }
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              <video
                key={video.id}
                ref={videoRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onError={() => {
                  setHasError(true);
                  setIsPlaying(false);
                }}
                className="w-full h-full max-h-[65vh] object-contain"
                playsInline
                controls={false}
              >
                <source src={streamUrl} type={video.mime_type || "video/mp4"} />
                <source src={streamUrl} />
                Your browser does not support HTML5 video streaming.
              </video>

              {/* Big Play Overlay if paused */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl">
                    <Play className="h-8 w-8 fill-current ml-1" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Integrated Player Controls */}
        <div className="px-5 py-3 bg-slate-900/95 border-t border-slate-800 text-white space-y-2">
          {/* Progress Bar (Scrubber) */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-[11px] font-mono text-slate-400 w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-slate-400 hover:text-white">
                  {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Playback Speed selector */}
              <div className="flex items-center gap-1 rounded-lg bg-slate-800 p-1 text-[11px] font-medium text-slate-300">
                {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`rounded px-1.5 py-0.5 transition ${
                      playbackSpeed === spd ? "bg-blue-600 text-white font-bold" : "hover:text-white"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

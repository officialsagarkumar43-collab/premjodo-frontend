"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Play, Pause, Volume2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/common/utils";

export default function VoiceMessagePlayer({
  audioUrl,
  duration,
  isMe = false,
  className = "",
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(
    typeof duration === "number" ? duration : 0
  );
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef(null);

  // Generate pseudo-random, consistent waveform heights based on audioUrl
  const waveformHeights = useMemo(() => {
    const bars = 28;
    const heights = [];
    let seed = 42;
    if (audioUrl) {
      for (let i = 0; i < audioUrl.length; i++) {
        seed = (seed * 31 + audioUrl.charCodeAt(i)) % 10000;
      }
    }
    for (let i = 0; i < bars; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const rnd = seed / 233280;
      // Heights between 20% and 100%
      const h = Math.round(20 + rnd * 80);
      heights.push(h);
    }
    return heights;
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, [audioUrl]);

  const togglePlay = (e) => {
    e?.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.warn("Audio playback failed:", err);
      });
    }
  };

  const handleSeek = (index, e) => {
    e?.stopPropagation();
    const audio = audioRef.current;
    if (!audio || !audioDuration) return;
    const progress = index / waveformHeights.length;
    const targetTime = progress * audioDuration;
    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const cyclePlaybackRate = (e) => {
    e?.stopPropagation();
    const rates = [1, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progress = audioDuration > 0 ? currentTime / audioDuration : 0;
  const currentBarIndex = Math.floor(progress * waveformHeights.length);

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-1 px-1 select-none min-w-[210px] max-w-[320px]",
        className
      )}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 shadow-sm cursor-pointer",
          isMe
            ? "bg-white text-rose-600 hover:bg-white/90"
            : "bg-gradient-to-tr from-rose-500 to-pink-500 text-white hover:opacity-95 shadow-rose-500/25"
        )}
        title={isPlaying ? "Pause voice message" : "Play voice message"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform & Time Track */}
      <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
        <div
          className="flex items-center gap-[2.5px] h-6 cursor-pointer py-1"
          title="Click to seek"
        >
          {waveformHeights.map((height, idx) => {
            const isPassed = idx <= currentBarIndex;
            return (
              <div
                key={idx}
                onClick={(e) => handleSeek(idx, e)}
                className="flex-1 flex items-center justify-center h-full group"
              >
                <div
                  className={cn(
                    "w-full rounded-full transition-all duration-75 group-hover:scale-y-125",
                    isMe
                      ? isPassed
                        ? "bg-white"
                        : "bg-white/40"
                      : isPassed
                      ? "bg-rose-500 dark:bg-rose-400"
                      : "bg-zinc-300 dark:bg-zinc-600"
                  )}
                  style={{
                    height: `${height}%`,
                    minHeight: "4px",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Duration & Speed Controls */}
        <div className="flex items-center justify-between text-[11px] font-mono leading-none">
          <span
            className={cn(
              "font-medium",
              isMe ? "text-white/90" : "text-zinc-500 dark:text-zinc-400"
            )}
          >
            {isPlaying
              ? formatTime(currentTime)
              : formatTime(audioDuration || duration || 0)}
          </span>

          <button
            type="button"
            onClick={cyclePlaybackRate}
            className={cn(
              "text-[10px] poppins-semibold px-1.5 py-0.5 rounded-md transition-colors cursor-pointer",
              isMe
                ? "bg-white/20 text-white hover:bg-white/30"
                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
            )}
            title="Toggle playback speed"
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
}

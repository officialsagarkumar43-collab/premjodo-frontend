"use client";

import React, { useState, useRef, useEffect } from "react";
import { Trash2, Send, Mic, Square, Play, Pause } from "lucide-react";
import { cn } from "@/lib/common/utils";

export default function VoiceMessageRecorder({
  isRecording,
  onCancel,
  onSend,
  className = "",
}) {
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const previewAudioRef = useRef(null);

  // Start recording on mount when isRecording is true
  useEffect(() => {
    if (!isRecording) return;

    let isMounted = true;

    async function startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        audioChunksRef.current = [];
        setDuration(0);
        setRecordedAudio(null);

        // Setup Web Audio analyser for real-time waveform animation
        try {
          const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            analyserRef.current = analyser;
            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateLevel = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
              animFrameRef.current = requestAnimationFrame(updateLevel);
            };
            updateLevel();
          }
        } catch (e) {
          console.warn("Audio analyser initialization notice:", e);
        }

        // Determine supported mime type
        let mimeType = "";
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
          mimeType = "audio/ogg;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        }

        const options = mimeType ? { mimeType } : undefined;
        const recorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.start(100); // chunk every 100ms

        // Start timer
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.error("Microphone access error:", err);
        alert(
          "Microphone access was denied or is not supported in this browser. Please enable microphone permissions."
        );
        if (onCancel) onCancel();
      }
    }

    startRecording();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [isRecording]);

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch { }
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleCancel = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    cleanup();
    setRecordedAudio(null);
    if (onCancel) onCancel();
  };

  const handleSendRecording = async () => {
    cleanup();

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.onstop = () => {
        finalizeAndSend();
      };
      mediaRecorderRef.current.stop();
    } else {
      finalizeAndSend();
    }
  };

  const finalizeAndSend = () => {
    const chunks = audioChunksRef.current;
    if (!chunks || chunks.length === 0) {
      if (onCancel) onCancel();
      return;
    }

    const mime = mediaRecorderRef.current?.mimeType || "audio/webm";
    const audioBlob = new Blob(chunks, { type: mime });

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64Audio = reader.result;
      if (onSend) {
        onSend({
          audioUrl: base64Audio,
          duration: duration || 1,
          mimeType: mime,
        });
      }
    };
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!isRecording) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 w-full bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl px-4 py-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150",
        className
      )}
    >
      {/* Delete / Cancel Button */}
      <button
        type="button"
        onClick={handleCancel}
        className="p-2 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 rounded-xl hover:bg-white/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        title="Discard recording"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* Recording Indicator & Live Waveform */}
      <div className="flex-1 flex items-center justify-center gap-3">
        {/* Pulsing Recording Dot */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
          </span>
          <span className="font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
            {formatTime(duration)}
          </span>
        </div>

        {/* Live dynamic sound waves */}
        <div className="flex items-center gap-1 h-6 px-2">
          {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.3].map((factor, i) => {
            const dynamicHeight = Math.max(
              15,
              Math.min(100, audioLevel * factor + 15)
            );
            return (
              <span
                key={i}
                className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                style={{
                  height: `${dynamicHeight}%`,
                  minHeight: "4px",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Send Voice Note Button */}
      <button
        type="button"
        onClick={handleSendRecording}
        className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white transition-all shadow-md shadow-rose-500/30 active:scale-95 cursor-pointer flex items-center justify-center"
        title="Send voice message"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}

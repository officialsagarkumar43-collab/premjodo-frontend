"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, X, Check, AlertCircle, Sparkles, SwitchCamera } from "lucide-react";

export function CameraCaptureModal({ isOpen, onClose, onPhotoCaptured, onCapture, onConfirm }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState("user"); // "user" | "environment"
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let localStream = null;

    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1440 },
        },
        audio: false,
      })
      .then((stream) => {
        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        localStream = stream;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setHasCamera(true);
        setIsInitializing(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error("Camera access error:", err);
        setHasCamera(false);
        setCameraError(
          "Camera access was denied or not available. You can still upload from your device."
        );
        setIsInitializing(false);
      });

    return () => {
      isCancelled = true;
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, facingMode]);

  const handleClose = () => {
    setCapturedImage(null);
    onClose();
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsInitializing(true);
    navigator.mediaDevices
      ?.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1440 },
        },
        audio: false,
      })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setHasCamera(true);
        setIsInitializing(false);
      })
      .catch(() => {
        setIsInitializing(false);
      });
  };

  const handleConfirm = () => {
    if (capturedImage) {
      const callback = onPhotoCaptured || onCapture || onConfirm;
      if (typeof callback === "function") {
        callback(capturedImage);
      }
      handleClose();
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg poppins-bold text-zinc-900 dark:text-white">
                Take Profile Photo
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {capturedImage
                  ? "Review your snapshot"
                  : "Position your face and snap a clear photo"}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Viewport */}
        <div className="my-5">
          <div className="relative aspect-[3/4] max-w-sm mx-auto rounded-2xl overflow-hidden bg-black border-2 border-zinc-200 dark:border-zinc-800 shadow-inner flex items-center justify-center">
            {capturedImage ? (
              // Captured image preview
              <img
                src={capturedImage}
                alt="Captured Snapshot"
                className="w-full h-full object-cover"
              />
            ) : hasCamera ? (
              // Live camera stream
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                />

                {isInitializing && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-rose-500" />
                    <span className="text-xs poppins-medium">Starting camera...</span>
                  </div>
                )}

                {/* Face Frame Overlay Guidelines */}
                <div className="absolute inset-6 border-2 border-white/30 rounded-full pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] text-white/60 bg-black/40 px-2 py-0.5 rounded-full mt-36">
                    Center face
                  </span>
                </div>

                {/* Flip camera button if stream active */}
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer"
                  title="Switch Camera"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </>
            ) : (
              // Camera error / Fallback
              <div className="p-6 text-center text-zinc-300 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="text-xs poppins-medium">{cameraError}</p>
              </div>
            )}
          </div>

          {/* Hidden Canvas for capture rendering */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs poppins-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs poppins-bold bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-95 text-white shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Use This Photo</span>
              </button>
            </>
          ) : hasCamera ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-3 rounded-xl text-xs poppins-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCapture}
                disabled={isInitializing}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs sm:text-sm poppins-bold bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-95 text-white shadow-lg shadow-rose-600/25 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Snap Photo</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 rounded-xl text-xs poppins-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 transition-colors cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

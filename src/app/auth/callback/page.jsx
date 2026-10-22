"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, HeartHandshake, AlertCircle, ArrowRight } from "lucide-react";
import authService from "@/lib/services/auth.service";

export default function GoogleAuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("loading"); // 'loading' | 'error' | 'success'
  const [errorMessage, setErrorMessage] = useState("");
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    async function processAuth() {
      if (typeof window === "undefined" || hasProcessedRef.current) return;
      hasProcessedRef.current = true;

      try {
        // Parse hash params (e.g. #id_token=...&access_token=...)
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.substring(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hash);

        // Parse query params (e.g. ?code=...&error=...)
        const queryParams = new URLSearchParams(window.location.search);

        const error = hashParams.get("error") || queryParams.get("error");
        const errorDescription =
          hashParams.get("error_description") || queryParams.get("error_description");

        if (error) {
          if (error === "access_denied") {
            setStatus("error");
            setErrorMessage("Google sign-in was canceled.");
            return;
          }
          throw new Error(errorDescription || `Google OAuth Error: ${error}`);
        }

        const idToken =
          hashParams.get("id_token") ||
          queryParams.get("id_token") ||
          hashParams.get("credential") ||
          queryParams.get("credential");

        const accessToken = hashParams.get("access_token") || queryParams.get("access_token");
        const code = queryParams.get("code") || hashParams.get("code");

        if (!idToken && !code && !accessToken) {
          throw new Error("No authentication credentials found in redirect response.");
        }

        const payload = {};
        if (idToken) {
          payload.idToken = idToken;
          payload.credential = idToken;
        }
        if (accessToken) {
          payload.token = accessToken;
        }
        if (code) {
          payload.code = code;
        }

        const res = await authService.googleLogin(payload);
        setStatus("success");

        const data = res?.data || res || {};
        const userObj = data?.user || {};

        const isFaceVerified =
          data.isFaceVerification === true ||
          data.isFaceVerified === true ||
          userObj.isFaceVerification === true ||
          userObj.isFaceVerified === true ||
          (typeof window !== "undefined" && localStorage.getItem("pj_is_face_verified") === "true");

        const isOnboarded =
          data.isOnboarded === true ||
          userObj.isOnboarded === true ||
          (typeof window !== "undefined" && localStorage.getItem("pj_is_onboarded") === "true");

        let returnUrl = "/user";
        try {
          const stored = sessionStorage.getItem("pj_auth_return_url");
          if (stored && stored !== "/" && !stored.includes("auth")) {
            returnUrl = stored;
          }
          sessionStorage.removeItem("pj_auth_return_url");
        } catch {}

        setTimeout(() => {
          let targetUrl = "/user";
          if (!isFaceVerified) {
            targetUrl = "/verify-face";
          } else if (!isOnboarded) {
            targetUrl = "/onboarding";
          } else {
            targetUrl = returnUrl;
          }

          if (typeof window !== "undefined") {
            window.location.replace(targetUrl);
          } else {
            router.replace(targetUrl);
          }
        }, 300);
      } catch (err) {
        console.error("Google Auth processing error:", err);
        setStatus("error");
        setErrorMessage(
          err?.message || "Failed to complete Google authentication. Please try again."
        );
      }
    }

    processAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 text-white shadow-lg shadow-rose-500/30 mb-2">
          <HeartHandshake className="w-8 h-8 fill-white/20" />
        </div>

        {status === "loading" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Signing you in...
            </h1>
            <p className="text-sm text-zinc-400">
              Connecting with Google and preparing your Prem Jodo experience.
            </p>
            <div className="pt-4 flex justify-center">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome to Prem Jodo!
            </h1>
            <p className="text-sm text-emerald-400 font-medium">
              Successfully authenticated with Google. Redirecting...
            </p>
            <div className="pt-4 flex justify-center">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 flex items-center gap-3 text-left text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => router.push("/")}
                className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-95 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20 transition-all"
              >
                <span>Back to Home</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

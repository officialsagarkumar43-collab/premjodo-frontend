"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, Mail, HeartHandshake, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import authService from "@/lib/services/auth.service";

export function AuthModal({ isOpen, onClose }) {
  const router = useRouter();
  const { t } = useLanguage();
  const { sendOtp, verifyOtp, googleLogin } = useAuth();

  const [step, setStep] = useState("options"); // 'options' | 'email' | 'otp'
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(30);

  const otpInputsRef = useRef([]);

  const handleClose = () => {
    setStep("options");
    setEmail("");
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setInfoMessage("");
    setIsLoading(false);
    onClose();
  };

  useEffect(() => {
    let interval;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setInfoMessage("");
    setIsLoading(true);

    try {
      await sendOtp(cleanEmail);
      setIsLoading(false);
      setStep("otp");
      setResendTimer(30);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    } catch (err) {
      setIsLoading(false);
      setError(err?.message || "Failed to send OTP. Please check your connection and try again.");
    }
  };

  const handleOtpChange = (index, value) => {
    // If user inputs or pastes multiple characters in single box
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      if (digits.length > 0) {
        const newOtp = [...otp];
        digits.forEach((d, i) => {
          if (index + i < 6) newOtp[index + i] = d;
        });
        setOtp(newOtp);
        const nextIndex = Math.min(index + digits.length, 5);
        otpInputsRef.current[nextIndex]?.focus();
        return;
      }
      value = value.slice(-1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    const digits = pastedData.replace(/\D/g, "").slice(0, 6).split("");
    if (digits.length > 0) {
      const newOtp = ["", "", "", "", "", ""];
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      const focusIndex = Math.min(digits.length, 5);
      otpInputsRef.current[focusIndex]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const enteredCode = otp.join("").trim();
    if (enteredCode.length < 6) {
      setError("Please enter all 6 digits of the OTP.");
      return;
    }

    setError("");
    setInfoMessage("");
    setIsLoading(true);

    try {
      const res = await verifyOtp(email.trim().toLowerCase(), enteredCode);
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

      handleClose();

      if (!isFaceVerified) {
        router.push("/verify-face");
      } else if (!isOnboarded) {
        router.push("/onboarding");
      } else {
        router.push("/user");
      }
    } catch (err) {
      setIsLoading(false);
      setError(err?.message || "Invalid or expired OTP. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending) return;
    setError("");
    setInfoMessage("");
    setResending(true);

    try {
      await sendOtp(email.trim().toLowerCase());
      setResendTimer(30);
      setInfoMessage("A fresh verification code has been sent to your email.");
      setResending(false);
    } catch (err) {
      setResending(false);
      setError(err?.message || "Failed to resend OTP. Please try again later.");
    }
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setError("");

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "1028712613149-pqun6l7f87g1h3v00a4i71b3e8k7g5t4.apps.googleusercontent.com";

    const redirectUri =
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
      `${window.location.origin}/auth/callback`;
    const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);

    try {
      sessionStorage.setItem("pj_auth_return_url", window.location.pathname);
    } catch { }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token%20id_token&scope=openid%20email%20profile&nonce=${encodeURIComponent(
      nonce
    )}&prompt=select_account`;

    // Full screen redirect to Google
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          {step !== "options" ? (
            <button
              onClick={() => {
                if (step === "otp") setStep("email");
                else if (step === "email") setStep("options");
                setError("");
                setInfoMessage("");
              }}
              className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-8" />
          )}

          <div className="p-2 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 text-white shadow-lg shadow-rose-500/30">
            <HeartHandshake className="w-6 h-6 fill-white/20" />
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "options" && (
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl poppins-black tracking-tight text-zinc-900 dark:text-white mb-2">
                {t("auth.getStarted")}
              </h2>
              <p className="text-xs poppins-regular text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
                {t("auth.termsNotice")}
              </p>
            </div>

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-500 poppins-medium animate-in fade-in bg-rose-500/10 p-2.5 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setError("");
                  setStep("email");
                }}
                className="w-full py-3.5 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm poppins-bold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
              >
                <Mail className="w-4 h-4 text-rose-500 dark:text-zinc-300" />
                <span className="poppins-semibold">{t("auth.loginEmail")}</span>
              </button>

              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                type="button"
                className="w-full py-3.5 px-4 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm poppins-bold flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <span className="poppins-semibold">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("auth.connecting")}
                    </span>
                  ) : (
                    t("auth.continueGoogle")
                  )}
                </span>
              </button>
            </div>

            <div className="pt-2">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setError("");
                  setStep("email");
                }}
                className="text-xs poppins-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 underline"
              >
                {t("auth.troubleLogin")}
              </a>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <span className="text-xs poppins-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {t("auth.getAppBadge")}
              </span>
              <div className="flex items-center justify-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer text-left flex items-center gap-2">
                  <div className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400 leading-tight poppins-regular">
                    {t("auth.downloadAppStore")}<div className="text-xs poppins-bold text-zinc-900 dark:text-white">App Store</div>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer text-left flex items-center gap-2">
                  <div className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400 leading-tight poppins-regular">
                    {t("auth.getGooglePlay")}<div className="text-xs poppins-bold text-zinc-900 dark:text-white">Google Play</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-6 text-center">
            <div>
              <h2 className="text-2xl sm:text-3xl poppins-black tracking-tight text-zinc-900 dark:text-white mb-2">
                {t("auth.whatsEmail")}
              </h2>
              <p className="text-xs poppins-regular text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                {t("auth.emailNotice")}
              </p>
            </div>

            <div className="space-y-2 text-left">
              <input
                type="email"
                required
                placeholder={t("auth.enterEmailPlaceholder")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                disabled={isLoading}
                autoFocus
                className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm poppins-medium transition-all disabled:opacity-50"
              />
              {error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-500 pt-1 poppins-medium animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!email || isLoading}
              className="w-full py-3.5 rounded-full text-sm poppins-bold bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-95 text-white disabled:opacity-40 disabled:pointer-events-none transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("auth.sendingCode")}</span>
                </>
              ) : (
                <span>{t("auth.next")}</span>
              )}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-6 text-center">
            <div>
              <h2 className="text-2xl sm:text-3xl poppins-black tracking-tight text-zinc-900 dark:text-white mb-2">
                {t("auth.enterCode")}
              </h2>
              <p className="text-xs poppins-regular text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                {t("auth.codeSentTo")}{" "}
                <strong className="text-zinc-900 dark:text-zinc-200 poppins-semibold">{email || "your email"}</strong>. {t("auth.codeExpireNotice")}
              </p>
            </div>

            <div className="flex justify-center gap-2 sm:gap-3 py-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputsRef.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={isLoading}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  autoFocus={index === 0}
                  className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl poppins-bold rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all disabled:opacity-50"
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-500 poppins-medium animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {infoMessage && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-500 poppins-medium animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            <div>
              {resendTimer > 0 ? (
                <span className="text-xs poppins-regular text-zinc-500">
                  {t("auth.resendCodeIn")} <strong className="text-zinc-700 dark:text-zinc-400 poppins-semibold">{resendTimer}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending || isLoading}
                  className="text-xs poppins-semibold text-rose-500 dark:text-rose-400 hover:underline cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1 mx-auto"
                >
                  {resending && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>{t("auth.resendViaEmail")}</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={otp.some((d) => !d) || isLoading}
              className="w-full py-3.5 rounded-full text-sm poppins-bold bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-95 text-white disabled:opacity-40 disabled:pointer-events-none transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("auth.verifying")}</span>
                </>
              ) : (
                <span>{t("auth.next")}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


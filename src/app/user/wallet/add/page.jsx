"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  ArrowLeft,
  Plus,
  ShieldCheck,
  Zap,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  Sparkles,
  Lock,
  ArrowUpRight,
  Info,
  Gift,
  Coins,
  History,
  Check,
  AlertCircle,
} from "lucide-react";
import battleService from "@/lib/services/battle.service";
import FloatingToast from "@/components/user/FloatingToast";

const QUICK_AMOUNTS = [
  { amount: 50, bonus: "None", popular: false },
  { amount: 100, bonus: "+10% Bonus", popular: true },
  { amount: 250, bonus: "+15% Bonus", popular: false },
  { amount: 500, bonus: "+20% Bonus", popular: false },
  { amount: 1000, bonus: "+25% Bonus", popular: false },
  { amount: 2000, bonus: "+30% Bonus", popular: false },
];

const PAYMENT_METHODS = [
  {
    id: "upi",
    name: "UPI / QR Apps",
    desc: "Google Pay, PhonePe, Paytm, BHIM",
    icon: Zap,
    color: "from-amber-500 to-rose-500",
    badge: "Instant & Recommended",
  },
  {
    id: "qr",
    name: "Scan Dynamic QR",
    desc: "Scan using any UPI app on phone",
    icon: QrCode,
    color: "from-emerald-500 to-teal-500",
    badge: "Zero Fee",
  },
  {
    id: "card",
    name: "Debit / Credit Card",
    desc: "Visa, Mastercard, RuPay, Maestro",
    icon: CreditCard,
    color: "from-blue-500 to-indigo-500",
    badge: "Secure 3D-OTP",
  },
  {
    id: "netbanking",
    name: "Net Banking",
    desc: "SBI, HDFC, ICICI, Axis & 50+ Banks",
    icon: Building2,
    color: "from-purple-500 to-pink-500",
    badge: "All Major Banks",
  },
];

export default function AddCashPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState(() => battleService.getWallet());
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("PREM100");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const effectiveAmount = Number(customAmount) > 0 ? Number(customAmount) : selectedAmount;
  const bonusCash = appliedPromo ? Math.round(effectiveAmount * 0.1) : 0;
  const totalCredited = effectiveAmount + bonusCash;

  useEffect(() => {
    const handleWalletUpdated = (e) => {
      if (e.detail) {
        setWallet(e.detail);
      } else {
        setWallet(battleService.getWallet());
      }
    };

    window.addEventListener("pj-wallet-updated", handleWalletUpdated);
    setWallet(battleService.getWallet());

    battleService.syncWithBackend().then(() => {
      setWallet(battleService.getWallet());
    });

    return () => {
      window.removeEventListener("pj-wallet-updated", handleWalletUpdated);
    };
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleApplyPromo = (codeToApply) => {
    const code = (codeToApply || promoCode).trim().toUpperCase();
    if (!code) return;
    if (code === "PREM100" || code === "WELCOME10" || code === "BONUS20") {
      setAppliedPromo(code);
      setPromoCode("");
      showToast(`Promo code '${code}' applied! +10% Bonus Cash active!`, "success");
    } else {
      showToast("Invalid or expired promo code", "error");
    }
  };

  const handleAddCash = async (e) => {
    e.preventDefault();
    if (!effectiveAmount || effectiveAmount < 10) {
      showToast("Minimum deposit amount is ₹10", "error");
      return;
    }
    if (effectiveAmount > 50000) {
      showToast("Maximum single deposit limit is ₹50,000", "error");
      return;
    }

    setIsProcessing(true);
    try {
      await battleService.addCash(effectiveAmount, paymentMethod.toUpperCase());
      setIsProcessing(false);
      showToast(`₹${effectiveAmount} deposited successfully! ₹${bonusCash} bonus added.`, "success");
      setCustomAmount("");
      setSelectedAmount(100);
      setWallet(battleService.getWallet());

      setTimeout(() => {
        router.push("/user/wallet");
      }, 1500);
    } catch (err) {
      setIsProcessing(false);
      showToast(err?.message || "Failed to process deposit. Please try again.", "error");
    }
  };

  // Filter recent deposits from battleService transactions
  const recentDeposits = battleService
    .getTransactions()
    .filter((t) => t.type === "DEPOSIT" || t.type === "DEPOSIT_BONUS" || t.title?.toLowerCase().includes("add") || t.title?.toLowerCase().includes("deposit"))
    .slice(0, 5);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 select-none">
      {/* Toast Notification */}
      {toast && (
        <FloatingToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <Link
            href="/user/wallet"
            className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Back to Wallet"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Deposit</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Add Cash to Wallet
            </h1>
          </div>
        </div>

        {/* Current Balance Pill */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-xs">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block leading-tight">
              Current Balance
            </span>
            <span className="text-sm font-black text-zinc-900 dark:text-white leading-none">
              ₹{Number(wallet?.balance ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Promo & Benefits Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Amount & Payment Selector (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleAddCash}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6"
          >
            {/* Step 1: Select Amount */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                    1
                  </span>
                  Choose Deposit Amount
                </label>
                <span className="text-xs font-medium text-zinc-400">Min ₹10 • Max ₹50,000</span>
              </div>

              {/* Quick Pills */}
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
                {QUICK_AMOUNTS.map((item) => {
                  const isSelected = !customAmount && selectedAmount === item.amount;
                  return (
                    <button
                      key={item.amount}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(item.amount);
                        setCustomAmount("");
                      }}
                      className={`relative p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/20"
                          : "bg-zinc-50/70 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
                      }`}
                    >
                      {item.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-[9px] font-black text-white uppercase tracking-wider shadow-xs">
                          Popular
                        </span>
                      )}
                      <div className="text-lg font-black mt-1">₹{item.amount}</div>
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {item.bonus}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Amount Input */}
              <div className="relative mt-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-zinc-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Or enter custom amount (e.g. 750)"
                  className="w-full pl-9 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all placeholder:font-normal placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="space-y-3 pt-2">
              <label className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                  2
                </span>
                Select Payment Mode
              </label>

              <div className="space-y-2.5">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? "bg-rose-50/50 dark:bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/20"
                          : "bg-zinc-50/50 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${method.color} text-white flex items-center justify-center shadow-xs`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-zinc-900 dark:text-white">
                              {method.name}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                              {method.badge}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                            {method.desc}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-rose-500 bg-rose-500 text-white"
                            : "border-zinc-300 dark:border-zinc-600"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Breakdown Banner */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>Deposit Amount</span>
                <span className="font-bold text-zinc-900 dark:text-white">₹{effectiveAmount}</span>
              </div>
              {appliedPromo && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" />
                    Promo Bonus ({appliedPromo})
                  </span>
                  <span className="font-bold">+₹{bonusCash}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>Gateway & Handling Fee</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE (₹0)</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-sm font-bold text-zinc-900 dark:text-white">
                <span>Total Amount Credited</span>
                <span className="text-rose-500 text-base font-black">₹{totalCredited}</span>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isProcessing || !effectiveAmount || effectiveAmount < 10}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 text-white font-black text-sm tracking-wide shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Secure Deposit...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{effectiveAmount} & Add Instantly</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Promo Code, Guarantees & Recent History (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Promo Code Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-transparent dark:from-amber-950/30 dark:via-rose-950/20 border border-amber-200/60 dark:border-amber-900/40 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Have a Promo Code?
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Apply to get up to 30% extra bonus cash
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter code (e.g. PREM100)"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold uppercase text-zinc-900 dark:text-white placeholder:normal-case placeholder:font-normal placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => handleApplyPromo()}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs cursor-pointer transition-colors"
              >
                Apply
              </button>
            </div>

            {/* Quick Promo Pills */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[10px] text-zinc-400 font-medium">Try:</span>
              {["PREM100", "WELCOME10", "BONUS20"].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleApplyPromo(code)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition-all ${
                    appliedPromo === code
                      ? "bg-amber-500 text-white border-amber-600"
                      : "bg-white dark:bg-zinc-800 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* 100% Safe Guarantees Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
              Trust & Safe Deposit Guarantee
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                    256-Bit Bank Grade Security
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Your transactions and payment credentials are encrypted using RBI approved gateways.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                    Instant Auto-Credit (&lt; 5 Seconds)
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Funds are added to your battle wallet immediately upon successful payment.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                    Zero Cancellation Fee & Refund
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Failed payments are automatically reversed to the original source account.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Deposits summary */}
          {recentDeposits.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                  Recent Deposits
                </h3>
                <Link
                  href="/user/wallet"
                  className="text-[11px] font-bold text-rose-500 hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {recentDeposits.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                        {item.title || "Deposit Cash"}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {item.date || new Date().toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <span className="font-black text-emerald-500">
                      +₹{item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

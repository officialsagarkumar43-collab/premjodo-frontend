"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Building2,
  CheckCircle2,
  Lock,
  AlertCircle,
  HelpCircle,
  Coins,
  History,
  Check,
  Sparkles,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import battleService from "@/lib/services/battle.service";
import FloatingToast from "@/components/user/FloatingToast";

const QUICK_WITHDRAW_AMOUNTS = [100, 250, 500, 1000];

export default function WithdrawCashPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState(() => battleService.getWallet());
  const [withdrawType, setWithdrawType] = useState("upi"); // "upi" | "bank"
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const withdrawableBalance = Number(
    wallet?.winningsBalance ?? wallet?.winningBalance ?? 0
  );

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

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);

    if (!amount || amount < 50) {
      showToast("Minimum withdrawal amount is ₹50", "error");
      return;
    }
    if (amount > withdrawableBalance) {
      showToast(
        `Insufficient withdrawable winnings balance (Max: ₹${withdrawableBalance})`,
        "error"
      );
      return;
    }

    if (withdrawType === "upi") {
      if (!upiId || !upiId.includes("@")) {
        showToast("Please enter a valid UPI ID (e.g. yourname@oksbi)", "error");
        return;
      }
    } else {
      if (!accountNumber || accountNumber !== confirmAccountNumber) {
        showToast("Bank account numbers do not match", "error");
        return;
      }
      if (!ifscCode || ifscCode.length < 5) {
        showToast("Please enter a valid IFSC code", "error");
        return;
      }
      if (!accountHolderName.trim()) {
        showToast("Please enter Account Holder Name", "error");
        return;
      }
    }

    setIsProcessing(true);
    try {
      const destination =
        withdrawType === "upi"
          ? upiId
          : `Bank: ${accountNumber} (${ifscCode.toUpperCase()})`;

      await battleService.withdrawWinnings(amount, destination);
      setIsProcessing(false);
      showToast(
        `₹${amount} withdrawal initiated successfully to ${destination}!`,
        "success"
      );
      setWithdrawAmount("");
      setUpiId("");
      setAccountNumber("");
      setConfirmAccountNumber("");
      setIfscCode("");
      setAccountHolderName("");
      setWallet(battleService.getWallet());

      setTimeout(() => {
        router.push("/user/wallet");
      }, 1500);
    } catch (err) {
      setIsProcessing(false);
      showToast(
        err?.message || "Failed to process withdrawal. Please try again.",
        "error"
      );
    }
  };

  const recentWithdrawals = battleService
    .getTransactions()
    .filter(
      (t) =>
        t.type === "WITHDRAWAL" ||
        t.type === "WITHDRAW" ||
        t.title?.toLowerCase().includes("withdraw")
    )
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
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Payout</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Withdraw Winnings
            </h1>
          </div>
        </div>

        {/* Withdrawable Balance Pill */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xs">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block leading-tight">
              Withdrawable Winnings
            </span>
            <span className="text-sm font-black text-emerald-700 dark:text-emerald-300 leading-none">
              ₹{withdrawableBalance}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Rules & History Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Withdrawal Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleWithdraw}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6"
          >
            {/* Step 1: Amount to Withdraw */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                    1
                  </span>
                  Enter Withdrawal Amount
                </label>
                <span className="text-xs font-medium text-zinc-400">Min ₹50</span>
              </div>

              {/* Amount Input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="50"
                  max={withdrawableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount (e.g. 500)"
                  className="w-full pl-9 pr-24 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold text-base focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:font-normal placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(String(withdrawableBalance))}
                  disabled={withdrawableBalance <= 0}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
                >
                  Max All
                </button>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {QUICK_WITHDRAW_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={amt > withdrawableBalance}
                    onClick={() => setWithdrawAmount(String(amt))}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      Number(withdrawAmount) === amt
                        ? "bg-emerald-500 text-white border-emerald-600"
                        : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 disabled:opacity-40"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Withdrawal Mode (UPI vs Bank) */}
            <div className="space-y-3 pt-2">
              <label className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                  2
                </span>
                Choose Payout Destination
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setWithdrawType("upi")}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                    withdrawType === "upi"
                      ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20"
                      : "bg-zinc-50/50 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-zinc-900 dark:text-white block">
                      UPI ID / VPA
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Instant (0-10s)
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => setWithdrawType("bank")}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                    withdrawType === "bank"
                      ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20"
                      : "bg-zinc-50/50 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-zinc-900 dark:text-white block">
                      Bank Transfer
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      IMPS Direct (T+0)
                    </span>
                  </div>
                </div>
              </div>

              {/* Destination Form Fields */}
              {withdrawType === "upi" ? (
                <div className="pt-2">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                    Your UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. 9876543210@paytm or yourname@oksbi"
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white placeholder:font-normal placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Funds will be instantly transferred to your linked UPI bank account.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Name as per Bank Passbook"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Bank Account Number
                      </label>
                      <input
                        type="password"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter Account Number"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Confirm Account Number
                      </label>
                      <input
                        type="text"
                        value={confirmAccountNumber}
                        onChange={(e) => setConfirmAccountNumber(e.target.value)}
                        placeholder="Re-enter Account Number"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Bank IFSC Code
                    </label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SBIN0001234"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-bold uppercase text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payout Calculation & Fee Breakdown */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>Withdrawal Amount</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  ₹{Number(withdrawAmount) || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>Processing Fee (0%)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE (₹0)</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>TDS / Govt Tax Deduction</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₹0.00</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-sm font-bold text-zinc-900 dark:text-white">
                <span>Net Amount Transferred</span>
                <span className="text-emerald-500 text-base font-black">
                  ₹{Number(withdrawAmount) || 0}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={
                isProcessing ||
                !withdrawAmount ||
                Number(withdrawAmount) < 50 ||
                Number(withdrawAmount) > withdrawableBalance
              }
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Instant Payout...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Withdraw ₹{Number(withdrawAmount) || 0} to {withdrawType === "upi" ? "UPI" : "Bank"}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Rules, Guarantees & Recent Withdrawals (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Important Rules Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Withdrawal Rules & Guidelines</span>
            </h3>
            <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Minimum Withdrawal:</strong> ₹50 per transaction.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Withdrawable Balance Only:</strong> Only battle winnings can be withdrawn. Deposit cash is dedicated to playing matches.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>0% Commission:</strong> No hidden processing or gateway deduction fees.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Instant Settlement:</strong> Transfers reach your UPI / IMPS account in 10-60 seconds.
                </span>
              </div>
            </div>
          </div>

          {/* Security & Safety */}
          <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Guaranteed Payout Engine</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Prem Jodo processes all battle prize withdrawals instantly through verified RBI-approved banking partners. In case of bank server delays, transfers are resolved within 24 hours.
            </p>
          </div>

          {/* Recent Withdrawals List */}
          {recentWithdrawals.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                  Recent Withdrawals
                </h3>
                <Link
                  href="/user/wallet"
                  className="text-[11px] font-bold text-emerald-500 hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {recentWithdrawals.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                        {item.title || "UPI Withdrawal"}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {item.date || new Date().toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <span className="font-black text-rose-500">
                      -₹{item.amount}
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

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CheckCircle2,
  Zap,
  CreditCard,
  QrCode,
  Building2,
  AlertCircle,
  History,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Check,
  Lock,
  RefreshCw,
  Trophy,
  Swords,
  Plus,
} from "lucide-react";
import battleService from "@/lib/services/battle.service";
import FloatingToast from "@/components/user/FloatingToast";

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000, 2000];

function WalletPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";

  const [activeTab, setActiveTab] = useState(
    ["overview", "add", "withdraw", "history"].includes(initialTab)
      ? initialTab
      : "overview"
  );

  const [wallet, setWallet] = useState(() => battleService.getWallet());
  const [transactions, setTransactions] = useState(() => battleService.getTransactions());

  // Form states
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi"); // "upi" | "card" | "qr" | "netbanking"
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: "success" | "error" | "info" }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    const handleWalletUpdated = (e) => {
      if (e.detail) {
        setWallet(e.detail);
      } else {
        setWallet(battleService.getWallet());
      }
      setTransactions(battleService.getTransactions());
    };

    window.addEventListener("pj-wallet-updated", handleWalletUpdated);
    setWallet(battleService.getWallet());
    setTransactions(battleService.getTransactions());

    // Sync with backend
    battleService.syncWithBackend().then(() => {
      setWallet(battleService.getWallet());
      setTransactions(battleService.getTransactions());
    });

    return () => {
      window.removeEventListener("pj-wallet-updated", handleWalletUpdated);
    };
  }, []);

  // Sync tab with URL if changed externally
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "add", "withdraw", "history"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    router.replace(`/user/wallet?tab=${tabId}`, { scroll: false });
  };

  const handleAddCash = async (e) => {
    e.preventDefault();
    const amount = Number(customAmount) || selectedAmount;
    if (!amount || amount < 10) {
      showToast("Minimum deposit amount is ₹10", "error");
      return;
    }

    setIsProcessing(true);
    try {
      await battleService.addCash(amount, paymentMethod.toUpperCase());
      setIsProcessing(false);
      showToast(`₹${amount} added successfully to your Battle Wallet!`, "success");
      setCustomAmount("");
      setSelectedAmount(100);
      setWallet(battleService.getWallet());
      setTransactions(battleService.getTransactions());
      setTimeout(() => {
        handleTabChange("overview");
      }, 1200);
    } catch (err) {
      setIsProcessing(false);
      showToast(err?.message || "Failed to add cash. Please try again.", "error");
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount < 50) {
      showToast("Minimum withdrawal amount is ₹50", "error");
      return;
    }
    const withdrawable = Number(wallet.winningsBalance || wallet.winningBalance || 0);
    if (amount > withdrawable) {
      showToast(`Maximum withdrawable winnings balance is ₹${withdrawable}`, "error");
      return;
    }
    if (!upiId || !upiId.includes("@")) {
      showToast("Please enter a valid UPI ID (e.g. yourname@oksbi)", "error");
      return;
    }

    setIsProcessing(true);
    try {
      await battleService.withdrawWinnings(amount, upiId);
      setIsProcessing(false);
      showToast(`₹${amount} successfully transferred to ${upiId}!`, "success");
      setWithdrawAmount("");
      setUpiId("");
      setWallet(battleService.getWallet());
      setTransactions(battleService.getTransactions());
      setTimeout(() => {
        handleTabChange("overview");
      }, 1200);
    } catch (err) {
      setIsProcessing(false);
      showToast(err?.message || "Withdrawal failed. Please check your balance.", "error");
    }
  };

  return (
    <div className="w-full space-y-6 pb-20 select-none">
      {/* Toast Notification */}
      {toast && (
        <FloatingToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Safe & Instant Cash Payouts
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Battle Wallet & Payouts
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Deposit cash instantly, withdraw winnings directly to UPI, and track all transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/user/battle"
            className="px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Swords className="w-4 h-4 text-rose-500" />
            <span>Play Battles</span>
          </Link>
        </div>
      </div>

      {/* Wallet Balance High-Impact Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border border-zinc-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Total Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-white">
              ₹{Number(wallet?.balance ?? 0)}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Available for real-cash 1v1 and multiplayer battles
            </p>
          </div>
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Instant Deposit</span>
            <span className="text-emerald-400 font-bold">● Active</span>
          </div>
        </div>

        {/* Deposit Cash */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Deposit Cash
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
              ₹{wallet?.depositBalance || 0}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Added via UPI, Cards, or Netbanking
            </p>
          </div>
          <Link
            href="/user/wallet/add"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Cash</span>
          </Link>
        </div>

        {/* Withdrawable Winnings */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Winnings (Withdrawable)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{wallet?.winningsBalance || wallet?.winningBalance || 0}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Won from 1v1 Battle Matches • 0% Fee UPI Payout
            </p>
          </div>
          <Link
            href="/user/wallet/withdraw"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Withdraw to UPI</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "overview", label: "Overview & Stats", icon: Wallet },
          { id: "add", label: "Add Cash (+)", icon: ArrowDownLeft },
          { id: "withdraw", label: "Withdraw Winnings (↗)", icon: ArrowUpRight },
          { id: "history", label: "Transaction History", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 scale-[1.02]"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
            <h3 className="poppins-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Quick Cash Actions</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/user/wallet/add"
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 hover:border-rose-400 text-left transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm text-zinc-900 dark:text-white">
                  Deposit Cash
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Instant UPI / GPay / Cards with bonus coins
                </p>
              </Link>

              <Link
                href="/user/wallet/withdraw"
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 hover:border-emerald-400 text-left transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm text-zinc-900 dark:text-white">
                  Withdraw Winnings
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Direct transfer to your UPI within 60s
                </p>
              </Link>
            </div>

            {/* Security Guarantee Box */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200">
                <span className="font-bold block">100% Safe & RBI Regulated Payouts</span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed mt-0.5 block">
                  All transactions are encrypted with 256-bit SSL protocol. Instant withdrawal to GPay, PhonePe, Paytm, and BHIM UPI without any convenience fees.
                </span>
              </div>
            </div>
          </div>

          {/* Battle Statistics Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
            <h3 className="poppins-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Earnings & Battle Performance</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Won</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  ₹{wallet?.totalWon || 0}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Battles Won</span>
                <span className="text-xl font-black text-zinc-900 dark:text-white mt-1 block">
                  {wallet?.battlesWon || 0} Matches
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Battles Played</span>
                <span className="text-xl font-black text-zinc-900 dark:text-white mt-1 block">
                  {wallet?.battlesPlayed || 0} Total
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Win Rate</span>
                <span className="text-xl font-black text-rose-500 mt-1 block">
                  {wallet?.battlesPlayed > 0
                    ? `${Math.round(((wallet.battlesWon || 0) / wallet.battlesPlayed) * 100)}%`
                    : "0%"}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Recent Transactions</span>
              <button
                type="button"
                onClick={() => handleTabChange("history")}
                className="text-rose-500 font-bold hover:underline"
              >
                View History →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADD CASH */}
      {activeTab === "add" && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-xl poppins-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-500" />
                <span>Add Cash to Battle Wallet</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Instant deposit with UPI, Cards, Net Banking & Scan QR
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              ⚡ Instant Credit
            </span>
          </div>

          <form onSubmit={handleAddCash} className="space-y-5">
            {/* Quick Amount Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Select Amount to Add
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {QUICK_AMOUNTS.map((amt) => {
                  const isSelected = selectedAmount === amt && !customAmount;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount("");
                      }}
                      className={`py-3 px-3 rounded-2xl text-sm poppins-bold border transition-all relative cursor-pointer ${
                        isSelected
                          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/20 shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500"
                      }`}
                    >
                      ₹{amt}
                      {amt >= 500 && (
                        <span className="absolute -top-2 -right-1 bg-amber-500 text-black text-[9px] px-1.5 py-0.2 rounded-full font-bold shadow-xs">
                          +10% Bonus
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Or Enter Custom Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="e.g. 350"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    if (e.target.value) setSelectedAmount(0);
                  }}
                  className="w-full pl-9 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  min="10"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "upi", label: "Instant UPI", icon: Zap, sub: "GPay / PhonePe" },
                  { id: "card", label: "Cards", icon: CreditCard, sub: "Debit / Credit" },
                  { id: "qr", label: "Scan QR", icon: QrCode, sub: "Any UPI App" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        isSel
                          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400"
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1 text-rose-500" />
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{item.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-bold text-sm shadow-md shadow-rose-500/25 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Secure Payment...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span>Pay ₹{customAmount ? Number(customAmount) : selectedAmount} & Add Cash</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: WITHDRAW */}
      {activeTab === "withdraw" && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-xl poppins-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                <span>Withdraw Winnings to UPI</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Instant UPI transfer directly to your bank account within 60 seconds
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              0% Fee
            </span>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-5">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs leading-relaxed">
              💡 <strong>Instant Payout Policy</strong>: Winnings are transferred automatically to your provided UPI VPA (GPay, PhonePe, Paytm, BHIM) with zero deduction.
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Withdrawal Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder={`Min ₹50, Max ₹${wallet?.winningsBalance || wallet?.winningBalance || 0}`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  min="50"
                  max={wallet?.winningsBalance || wallet?.winningBalance || 0}
                />
              </div>
              <div className="flex justify-between items-center mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <span>Withdrawable: ₹{wallet?.winningsBalance || wallet?.winningBalance || 0}</span>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(String(wallet?.winningsBalance || wallet?.winningBalance || 0))}
                  className="text-rose-500 font-bold hover:underline cursor-pointer"
                >
                  Withdraw All
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Your UPI ID (VPA)
              </label>
              <input
                type="text"
                placeholder="e.g. yourname@oksbi / 9876543210@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing || !(wallet?.winningsBalance || wallet?.winningBalance)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-500/25 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Instant UPI Payout...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Withdraw ₹{withdrawAmount || 0} Instantly</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: TRANSACTION HISTORY */}
      {activeTab === "history" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="poppins-bold text-base text-zinc-900 dark:text-white">
              Complete Wallet Transaction History
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {transactions.length} Total Records
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 space-y-2">
              <History className="w-10 h-10 mx-auto text-zinc-400 opacity-60" />
              <p className="text-xs">No recent transactions recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold ${
                        tx.type === "DEPOSIT" || tx.type === "WIN"
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {tx.type === "DEPOSIT" || tx.type === "WIN" ? "+" : "-"}
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-white text-sm">
                        {tx.title}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {tx.date} • Reference ID: {tx.id}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-black text-sm poppins-bold ${
                        tx.type === "DEPOSIT" || tx.type === "WIN"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-zinc-900 dark:text-white"
                      }`}
                    >
                      {tx.type === "DEPOSIT" || tx.type === "WIN" ? "+" : "-"}₹{tx.amount}
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      {tx.status || "SUCCESS"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs text-zinc-400">Loading Wallet...</div>}>
      <WalletPageContent />
    </Suspense>
  );
}

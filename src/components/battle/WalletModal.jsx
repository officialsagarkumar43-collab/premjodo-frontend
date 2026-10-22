"use client";

import React, { useState } from "react";
import {
  X,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  CreditCard,
  QrCode,
  Building2,
  AlertCircle,
} from "lucide-react";
import battleService from "@/lib/services/battle.service";

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000, 2000];

export default function WalletModal({
  isOpen,
  onClose,
  initialTab = "add",
  onWalletUpdated,
  walletProp = null,
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // "add" | "withdraw" | "history"
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi"); // "upi" | "card" | "netbanking"
  const [upiId, setUpiId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const wallet =
    walletProp ||
    (typeof window !== "undefined"
      ? battleService.getWallet()
      : { balance: 0, depositBalance: 0, winningsBalance: 0, winningBalance: 0 });
  const transactions = typeof window !== "undefined" ? battleService.getTransactions() : [];

  if (!isOpen) return null;

  const handleAddCash = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const amount = Number(customAmount) || selectedAmount;
    if (!amount || amount < 10) {
      setErrorMessage("Minimum deposit is ₹10");
      return;
    }

    setIsProcessing(true);
    try {
      await battleService.addCash(amount, paymentMethod.toUpperCase());
      setIsProcessing(false);
      setSuccessMessage(`₹${amount} added successfully to your Battle Wallet!`);
      if (onWalletUpdated) onWalletUpdated();
      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 1500);
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage(err?.message || "Failed to add cash. Please try again.");
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const amount = Number(withdrawAmount);
    if (!amount || amount < 50) {
      setErrorMessage("Minimum withdrawal amount is ₹50");
      return;
    }
    const withdrawable = Number(wallet.winningsBalance || wallet.winningBalance || 0);
    if (amount > withdrawable) {
      setErrorMessage(`Max withdrawable winnings balance is ₹${withdrawable}`);
      return;
    }
    if (!upiId || !upiId.includes("@")) {
      setErrorMessage("Please enter a valid UPI ID (e.g. mobile@upi, username@okhdfcbank)");
      return;
    }

    setIsProcessing(true);
    try {
      await battleService.withdrawWinnings(amount, upiId);
      setIsProcessing(false);
      setSuccessMessage(`₹${amount} successfully transferred to ${upiId}!`);
      if (onWalletUpdated) onWalletUpdated();
      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 1500);
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage(err?.message || "Withdrawal failed. Please check your balance.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative p-5 pb-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="poppins-bold text-lg text-zinc-900 dark:text-white">
                Battle Wallet
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                100% Instant & Secure Cash Battles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Card Banner */}
        <div className="p-4 mx-5 mt-4 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border border-zinc-800 shadow-inner">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Total Available Balance
              </span>
              <div className="text-3xl poppins-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-white mt-0.5">
                ₹{Number(wallet?.balance ?? 0)}
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Verified
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-400">Deposit Cash:</span>{" "}
              <span className="font-semibold text-white">₹{wallet.depositBalance || 0}</span>
            </div>
            <div>
              <span className="text-zinc-400">Winnings (Withdrawable):</span>{" "}
              <span className="font-semibold text-emerald-400">₹{wallet.winningsBalance || wallet.winningBalance || 0}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 mx-5 mt-4 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl">
          <button
            type="button"
            onClick={() => { setActiveTab("add"); setErrorMessage(""); setSuccessMessage(""); }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${activeTab === "add"
                ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
            Add Cash
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("withdraw"); setErrorMessage(""); setSuccessMessage(""); }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${activeTab === "withdraw"
                ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
          >
            <ArrowUpRight className="w-4 h-4 text-amber-500" />
            Withdraw
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("history"); setErrorMessage(""); setSuccessMessage(""); }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${activeTab === "history"
                ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
          >
            History
          </button>
        </div>

        {/* Feedback Alert */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: ADD CASH */}
        {activeTab === "add" && (
          <form onSubmit={handleAddCash} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
                Select Amount to Add
              </label>
              <div className="grid grid-cols-3 gap-2">
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
                      className={`py-2.5 px-3 rounded-xl text-sm poppins-bold border transition-all relative ${isSelected
                          ? "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/30 shadow-sm"
                          : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400"
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

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                Or Enter Custom Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
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
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  min="10"
                />
              </div>
            </div>

            {/* Payment Options */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "upi", label: "Instant UPI", icon: Zap, sub: "GPay/PhonePe" },
                  { id: "card", label: "Debit/Credit", icon: CreditCard, sub: "All Cards" },
                  { id: "qr", label: "Scan QR", icon: QrCode, sub: "Fast Pay" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id)}
                      className={`p-2 rounded-xl text-left border transition-all ${isSel
                          ? "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400"
                          : "bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                        }`}
                    >
                      <Icon className="w-4 h-4 mb-1 text-rose-500" />
                      <div className="text-xs font-semibold">{item.label}</div>
                      <div className="text-[10px] text-zinc-400">{item.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Securing Payment...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-yellow-300" />
                  Pay ₹{customAmount ? Number(customAmount) : selectedAmount} & Add Cash
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: WITHDRAW */}
        {activeTab === "withdraw" && (
          <form onSubmit={handleWithdraw} className="p-5 space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs">
              💡 <strong>Instant Payout</strong>: Your winnings are directly sent to your UPI ID within 60 seconds without any fee.
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                Withdrawal Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder={`Min ₹50, Max ₹${wallet.winningsBalance || 0}`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  min="50"
                  max={wallet.winningsBalance || 0}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-[11px] text-zinc-400">
                <span>Withdrawable: ₹{wallet.winningsBalance || 0}</span>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(String(wallet.winningsBalance || 0))}
                  className="text-rose-500 font-semibold hover:underline"
                >
                  Withdraw All
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                Your UPI ID (VPA)
              </label>
              <input
                type="text"
                placeholder="e.g. yourname@oksbi / 9876543210@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing || !wallet.winningsBalance}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Instant Transfer...
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  Withdraw ₹{withdrawAmount || 0} Instantly
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: TRANSACTION HISTORY */}
        {activeTab === "history" && (
          <div className="p-5 max-h-72 overflow-y-auto space-y-2">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-400">
                No recent transactions found.
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${tx.type === "DEPOSIT" || tx.type === "WIN"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-rose-500/20 text-rose-500"
                        }`}
                    >
                      {tx.type === "DEPOSIT" || tx.type === "WIN" ? "+" : "-"}
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {tx.title}
                      </div>
                      <div className="text-[10px] text-zinc-400">{tx.date}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-bold poppins-bold ${tx.type === "DEPOSIT" || tx.type === "WIN"
                          ? "text-emerald-500"
                          : "text-zinc-800 dark:text-zinc-200"
                        }`}
                    >
                      {tx.type === "DEPOSIT" || tx.type === "WIN" ? "+" : "-"}₹{tx.amount}
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold">
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

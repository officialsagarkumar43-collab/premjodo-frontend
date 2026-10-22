"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import authService from "@/lib/services/auth.service";
import membershipService from "@/lib/services/membership.service";
import socketService from "@/lib/services/socket.service";
import {
  Crown,
  Sparkles,
  Zap,
  Check,
  CheckCircle2,
  Heart,
  RotateCcw,
  Eye,
  Flame,
  ArrowRight,
  AlertCircle,
  Loader2,
  X,
  HelpCircle,
  ChevronDown,
  Lock,
  Clock,
  Rocket,
  MessageSquare,
  Plus,
  ShoppingBag,
  Receipt,
  Download,
  ArrowLeft,
} from "lucide-react";

export default function UserSubscriptionsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") || "my-plan";

  const { user, profile, subscription, refreshSubscription, getCurrentUser } = useAuth();
  const justActivatedRef = useRef(false);

  const [activeTab, setActiveTab] = useState(initialTab); // 'my-plan' | 'plans' | 'topups' | 'billing'
  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' | 'annual'
  const [plans, setPlans] = useState([]);
  const [billingCycles, setBillingCycles] = useState([
    { id: "monthly", label: "Monthly Billing", discount: null },
    { id: "annual", label: "Annual Billing", discount: "SAVE 33%" },
  ]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [addons, setAddons] = useState([]);
  const [isLoadingAddons, setIsLoadingAddons] = useState(true);
  const [isActivatingBoost, setIsActivatingBoost] = useState(false);
  const [processingPlanSlug, setProcessingPlanSlug] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Boost timer & credits state (stored in localStorage for persistent user experience)
  const [boostActiveUntil, setBoostActiveUntil] = useState(() => {
    if (typeof window !== "undefined") {
      const savedBoostEnd = localStorage.getItem("pj_boost_end");
      if (savedBoostEnd) {
        const endMs = parseInt(savedBoostEnd, 10);
        if (endMs > Date.now()) return endMs;
        localStorage.removeItem("pj_boost_end");
      }
    }
    return null;
  });

  const [boostSecondsLeft, setBoostSecondsLeft] = useState(() => {
    if (typeof window !== "undefined") {
      const savedBoostEnd = localStorage.getItem("pj_boost_end");
      if (savedBoostEnd) {
        const endMs = parseInt(savedBoostEnd, 10);
        if (endMs > Date.now()) return Math.floor((endMs - Date.now()) / 1000);
      }
    }
    return 0;
  });

  const [localBonusCredits, setLocalBonusCredits] = useState({
    superLikes: 0,
    boosts: 0,
    directMessages: 0,
  });

  const storedU = typeof window !== "undefined" ? authService.getUser() || {} : {};
  const storedP = typeof window !== "undefined" ? authService.getProfile() || {} : {};
  const activeUser = { ...storedU, ...(user || {}) };
  const activeProfile = { ...storedP, ...(profile || {}) };

  // Calculate tier details with exhaustive fallback checks
  const isUserVip = Boolean(
    subscription?.status === "active" ||
    subscription?.isActive === true ||
    subscription?.isVip === true ||
    subscription?.isVIP === true ||
    activeUser?.vipBadge ||
    activeProfile?.vipBadge ||
    activeUser?.isVip ||
    activeProfile?.isVip ||
    (typeof window !== "undefined" && (
      localStorage.getItem("pj_user_is_vip") === "true" ||
      localStorage.getItem("pj_vip_badge") === "true"
    ))
  );

  const planSlug = String(
    (typeof subscription?.plan === "string" ? subscription.plan : subscription?.plan?.slug || subscription?.plan?.name) ||
    subscription?.planSlug ||
    subscription?.slug ||
    subscription?.planName ||
    subscription?.planId ||
    subscription?.plan?._id ||
    subscription?.tier ||
    subscription?.name ||
    activeUser?.membership?.plan ||
    activeUser?.membership?.slug ||
    activeUser?.membership?.tier ||
    activeUser?.membership?.name ||
    activeUser?.subscription?.plan ||
    activeUser?.subscription?.slug ||
    activeUser?.subscription?.tier ||
    activeUser?.tier ||
    activeUser?.membershipTier ||
    activeUser?.plan ||
    activeProfile?.membership?.plan ||
    activeProfile?.membership?.slug ||
    activeProfile?.membership?.tier ||
    activeProfile?.membership?.name ||
    (isUserVip ? "platinum" : "free")
  ).toLowerCase();

  const activePlanName =
    subscription?.planName ||
    (typeof subscription?.plan === "string"
      ? `Prem Jodo ${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}`
      : subscription?.plan?.name) ||
    subscription?.name ||
    activeUser?.membership?.name ||
    activeProfile?.membership?.name ||
    (planSlug.includes("platinum")
      ? "Prem Jodo Platinum"
      : planSlug.includes("gold")
      ? "Prem Jodo Gold"
      : planSlug.includes("plus")
      ? "Prem Jodo Plus"
      : planSlug.includes("diamond")
      ? "Prem Jodo Diamond"
      : "Free Explorer");

  // Refund eligibility check (Cancel Plan button is only shown if refund is eligible)
  const refundEligibility =
    subscription?.refundEligibility ||
    activeUser?.subscription?.refundEligibility ||
    null;

  const isRefundEligible = Boolean(
    typeof refundEligibility === "object" && refundEligibility !== null
      ? refundEligibility.isEligible === true
      : refundEligibility === true
  );

  const hasMessageBeforeMatch = Boolean(
    subscription?.perks?.messageBeforeMatch ?? isUserVip
  );

  // Purely derived credits calculation without cascading setState
  const credits = useMemo(() => {
    let base = {
      superLikes: 1,
      maxSuperLikes: 1,
      boosts: 0,
      maxBoosts: 0,
      directMessages: 0,
      maxDirectMessages: 0,
      rewinds: "1 / Day",
      swipes: 42,
    };

    if (subscription) {
      const sLikes =
        subscription.superLikesRemaining ??
        subscription.perks?.superLikesPerWeek ??
        (planSlug.includes("platinum") ? 10 : 5);
      const maxSLikes =
        subscription.perks?.superLikesPerWeek ??
        (planSlug.includes("platinum") ? 10 : 5);
      const bCount =
        subscription.boostsRemaining ??
        subscription.perks?.profileBoostPerMonth ??
        (planSlug.includes("platinum") ? 2 : 1);
      const maxBCount =
        subscription.perks?.profileBoostPerMonth ??
        (planSlug.includes("platinum") ? 2 : 1);
      const rew =
        subscription.perks?.rewindAllowed || isUserVip ? "Unlimited" : "1 / Day";
      const swp =
        subscription.perks?.unlimitedSwipes || isUserVip ? "Unlimited" : 50;
      const dm =
        subscription.directMessagesRemaining ??
        (subscription.perks?.messageBeforeMatch ? 5 : 2);
      const maxDm =
        subscription.perks?.messageBeforeMatch ? 5 : 2;

      base = {
        superLikes: sLikes,
        maxSuperLikes: Math.max(sLikes, maxSLikes),
        boosts: bCount,
        maxBoosts: Math.max(bCount, maxBCount),
        directMessages: dm,
        maxDirectMessages: Math.max(dm, maxDm),
        rewinds: rew,
        swipes: swp,
      };
    } else if (planSlug.includes("diamond")) {
      base = {
        superLikes: 25,
        maxSuperLikes: 25,
        boosts: 5,
        maxBoosts: 5,
        directMessages: 10,
        maxDirectMessages: 10,
        rewinds: "Unlimited",
        swipes: "Unlimited",
      };
    } else if (planSlug.includes("platinum")) {
      base = {
        superLikes: 10,
        maxSuperLikes: 10,
        boosts: 2,
        maxBoosts: 2,
        directMessages: 5,
        maxDirectMessages: 5,
        rewinds: "Unlimited",
        swipes: "Unlimited",
      };
    } else if (planSlug.includes("gold")) {
      base = {
        superLikes: 5,
        maxSuperLikes: 5,
        boosts: 1,
        maxBoosts: 1,
        directMessages: 2,
        maxDirectMessages: 2,
        rewinds: "Unlimited",
        swipes: "Unlimited",
      };
    } else if (planSlug.includes("plus")) {
      base = {
        superLikes: 5,
        maxSuperLikes: 5,
        boosts: 0,
        maxBoosts: 0,
        directMessages: 1,
        maxDirectMessages: 1,
        rewinds: "Unlimited",
        swipes: "Unlimited",
      };
    }

    return {
      ...base,
      superLikes: base.superLikes + (localBonusCredits.superLikes || 0),
      maxSuperLikes: Math.max(base.maxSuperLikes, base.superLikes + (localBonusCredits.superLikes || 0)),
      boosts: Math.max(0, base.boosts + (localBonusCredits.boosts || 0)),
      maxBoosts: Math.max(base.maxBoosts, base.boosts + (localBonusCredits.boosts || 0)),
      directMessages: base.directMessages + (localBonusCredits.directMessages || 0),
      maxDirectMessages: Math.max(base.maxDirectMessages, base.directMessages + (localBonusCredits.directMessages || 0)),
    };
  }, [subscription, isUserVip, planSlug, localBonusCredits]);

  // Live countdown timer for Boost mode
  useEffect(() => {
    if (!boostActiveUntil) {
      setBoostSecondsLeft(0);
      return;
    }

    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((boostActiveUntil - Date.now()) / 1000));
      setBoostSecondsLeft(diff);
      if (diff <= 0) {
        setBoostActiveUntil(null);
        setBoostSecondsLeft(0);
        if (typeof window !== "undefined") {
          localStorage.removeItem("pj_boost_end");
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [boostActiveUntil]);

  // Sync boost timer from backend profile if active
  useEffect(() => {
    if (!activeProfile && !user) return;

    if (activeProfile?.isBoosted && activeProfile?.boostExpiresAt) {
      const expTime = new Date(activeProfile.boostExpiresAt).getTime();
      if (expTime > Date.now()) {
        setBoostActiveUntil(expTime);
        if (typeof window !== "undefined") {
          localStorage.setItem("pj_boost_end", String(expTime));
        }
        return;
      }
    }

    // Backend profile is loaded and confirmed not currently boosted
    if (activeProfile && activeProfile.isBoosted === false && !justActivatedRef.current) {
      setBoostActiveUntil(null);
      setBoostSecondsLeft(0);
      if (typeof window !== "undefined") {
        localStorage.removeItem("pj_boost_end");
      }
    }
  }, [activeProfile?.isBoosted, activeProfile?.boostExpiresAt, activeProfile?._id, user?._id]);

  // Real-time socket sync for boost activation
  useEffect(() => {
    const sock = socketService?.getSocket?.();
    if (!sock) return;

    const handleBoostActivated = (payload) => {
      if (payload?.boostExpiresAt) {
        const expTime = new Date(payload.boostExpiresAt).getTime();
        setBoostActiveUntil(expTime);
        if (typeof window !== "undefined") {
          localStorage.setItem("pj_boost_end", String(expTime));
        }
      }
      refreshSubscription?.();
      getCurrentUser?.(true);
    };

    sock.on?.("boost_activated", handleBoostActivated);
    return () => {
      sock.off?.("boost_activated", handleBoostActivated);
    };
  }, [refreshSubscription, getCurrentUser]);

  // Load plans & addons & refresh subscription on mount
  useEffect(() => {
    let isMounted = true;
    refreshSubscription();

    // 1. Load Membership Plans
    membershipService
      .getPlansData()
      .then(({ plans: fetchedPlans, addons: fetchedAddonsFromPlans, billingCycles: fetchedCycles }) => {
        if (!isMounted) return;
        if (Array.isArray(fetchedPlans) && fetchedPlans.length > 0) {
          const sorted = [...fetchedPlans].sort(
            (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
          );
          setPlans(sorted);
        }
        if (Array.isArray(fetchedCycles) && fetchedCycles.length > 0) {
          setBillingCycles(fetchedCycles);
        }
        if (Array.isArray(fetchedAddonsFromPlans) && fetchedAddonsFromPlans.length > 0) {
          const sorted = [...fetchedAddonsFromPlans].sort(
            (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
          );
          setAddons(sorted);
          setIsLoadingAddons(false);
        }
      })
      .catch((err) => {
        console.warn("[UserSubscriptions] Error fetching plans:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingPlans(false);
      });

    // 2. Load Membership Add-ons directly from /membership/addons
    membershipService
      .getAddons()
      .then((fetchedAddons) => {
        if (!isMounted) return;
        if (Array.isArray(fetchedAddons) && fetchedAddons.length > 0) {
          const sorted = [...fetchedAddons].sort(
            (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
          );
          setAddons(sorted);
        }
      })
      .catch((err) => {
        console.warn("[UserSubscriptions] Error fetching addons:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingAddons(false);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshSubscription]);

  // Active plan helper with resilient matching
  const isCurrentPlanActive = useCallback(
    (plan) => {
      if (!isUserVip) return false;
      const planId = String(plan?._id || "").toLowerCase();
      const pSlug = String(plan?.slug || "").toLowerCase();
      const pName = String(plan?.name || "").toLowerCase();

      if (!planId && !pSlug && !pName) return false;

      // 1. Check specific tiers in exact hierarchical priority
      const tiers = ["platinum", "diamond", "gold", "plus"];
      for (const t of tiers) {
        if (planSlug.includes(t)) {
          if (pSlug.includes(t) || pName.includes(t)) {
            return true;
          }
          return false;
        }
      }

      // 2. Direct match with planSlug
      if (
        (planId && (planSlug === planId || planSlug.includes(planId))) ||
        (pSlug && (planSlug === pSlug || planSlug.includes(pSlug))) ||
        (pName && (planSlug.includes(pName) || pName.includes(planSlug)))
      ) {
        return true;
      }

      return false;
    },
    [isUserVip, planSlug]
  );

  // Activate 24h Profile Boost Mode (Consumes 1 Boost credit)
  const handleActivateBoost = async () => {
    if (credits.boosts <= 0) {
      setActiveTab("topups");
      setStatusMessage("You don't have any Profile Boosts left. Grab a Boost Pack below to activate!");
      return;
    }

    setIsActivatingBoost(true);
    setErrorMessage("");
    setStatusMessage("");
    justActivatedRef.current = true;

    try {
      const res = await membershipService.activateProfileBoost();
      const expiresAt = res?.boostExpiresAt
        ? new Date(res.boostExpiresAt).getTime()
        : Date.now() + 24 * 60 * 60 * 1000;

      setBoostActiveUntil(expiresAt);
      if (typeof window !== "undefined") {
        localStorage.setItem("pj_boost_end", String(expiresAt));
      }

      if (res?.profile) {
        authService.setProfile(res.profile);
      }

      // Concurrently sync both subscription quota and current user profile
      await Promise.allSettled([
        refreshSubscription?.(),
        getCurrentUser?.(true),
      ]);

      const successMsg =
        res?.message ||
        "🚀 Boost Activated! Your profile is now boosted at the top spot for 24 hours.";
      setStatusMessage(successMsg);
    } catch (err) {
      console.error("[handleActivateBoost] error:", err);
      justActivatedRef.current = false;
      setErrorMessage(
        err?.message || "Failed to activate Profile Boost. Please try again."
      );
    } finally {
      setIsActivatingBoost(false);
      setTimeout(() => {
        justActivatedRef.current = false;
      }, 5000);
    }
  };

  // Handle subscribe / upgrade checkout via Razorpay
  const handleSubscribe = async (plan) => {
    setErrorMessage("");
    setStatusMessage("");

    if (isUserVip) {
      setActiveTab("topups");
      setStatusMessage("You already have an active VIP subscription! You can add extra credits from the Top-Up Store.");
      return;
    }

    const isAnnual = billingCycle === "annual" || billingCycle === "yearly";
    const pricingData = isAnnual ? plan.pricing?.annual : plan.pricing?.monthly;
    const totalAmount =
      pricingData?.totalAmount ||
      (isAnnual ? (pricingData?.pricePerMonth || 399) * 12 : pricingData?.pricePerMonth || 599);

    setProcessingPlanSlug(plan.slug);

    try {
      const isScriptLoaded = await membershipService.loadRazorpayScript();
      if (!isScriptLoaded || typeof window === "undefined" || !window.Razorpay) {
        throw new Error("Razorpay SDK could not be loaded. Please check your connection.");
      }

      const orderData = await membershipService.createOrder({
        plan: plan.slug || plan._id,
        billingCycle: isAnnual ? "annual" : "monthly",
        customerPhone: user?.phoneNumber || profile?.phone || "",
        customerName: user?.fullName || profile?.fullName || "",
        customerEmail: user?.email || "",
      });

      const orderId =
        orderData?.orderId ||
        orderData?.razorpayOrderId ||
        orderData?.razorpay_order_id ||
        orderData?.id;

      const keyId = orderData?.keyId;
      if (!orderId) {
        throw new Error("Order creation failed on server. Please try again.");
      }

      const amountInPaise =
        orderData?.amountInPaise ||
        (orderData?.amount ? Math.round(orderData.amount * 100) : Math.round(totalAmount * 100));

      const options = {
        key: keyId,
        amount: amountInPaise,
        currency: orderData?.currency || "INR",
        name: "Prem Jodo",
        description: `Prem Jodo ${plan.name || "VIP Plan"} (${isAnnual ? "Annual" : "Monthly"})`,
        image: "/favicon.ico",
        order_id: orderId,
        prefill: {
          name: orderData?.user?.name || user?.fullName || profile?.fullName || "",
          email: orderData?.user?.email || user?.email || "",
          contact: orderData?.user?.contact || user?.phoneNumber || profile?.phone || "",
        },
        theme: {
          color: "#E11D48",
        },
        modal: {
          ondismiss: () => {
            setProcessingPlanSlug(null);
          },
        },
        handler: async (response) => {
          try {
            const verificationPayload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.slug || plan._id,
              billingCycle: isAnnual ? "annual" : "monthly",
            };

            await membershipService.verifyPayment(verificationPayload);
            setStatusMessage(`🎉 Congratulations! You are now upgraded to ${plan.name}. Your VIP credits are refreshed!`);
            setActiveTab("my-plan");
            await refreshSubscription();
          } catch (verifyErr) {
            setErrorMessage(verifyErr?.message || "Payment verification failed. Please contact support.");
          } finally {
            setProcessingPlanSlug(null);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setErrorMessage(response?.error?.description || "Payment failed. Please try again.");
        setProcessingPlanSlug(null);
      });

      rzp.open();
    } catch (err) {
      setErrorMessage(err?.message || "Checkout failed. Please try again.");
      setProcessingPlanSlug(null);
    }
  };

  // Handle Power-Up Top-up Checkout with type: "addon"
  const handleBuyTopup = async (topupItem) => {
    setErrorMessage("");
    setStatusMessage("");
    const addonSlug = topupItem.slug || topupItem.id || topupItem._id;
    setProcessingPlanSlug(addonSlug);

    try {
      const isScriptLoaded = await membershipService.loadRazorpayScript();
      if (!isScriptLoaded || typeof window === "undefined" || !window.Razorpay) {
        throw new Error("Razorpay SDK could not be loaded. Please check your connection.");
      }

      // CRITICAL: We pass type: "addon" and addon identifier
      const orderData = await membershipService.createOrder({
        type: "addon",
        addon: addonSlug,
        customerPhone: user?.phoneNumber || profile?.phone || "",
        customerName: user?.fullName || profile?.fullName || "",
        customerEmail: user?.email || "",
      });

      const orderId =
        orderData?.orderId ||
        orderData?.razorpayOrderId ||
        orderData?.razorpay_order_id ||
        orderData?.id;

      const keyId = orderData?.keyId;
      if (!orderId) {
        throw new Error("Order creation failed on server. Please try again.");
      }

      const amountInPaise =
        orderData?.amountInPaise ||
        (orderData?.amount ? Math.round(orderData.amount * 100) : Math.round(topupItem.price * 100));

      const options = {
        key: keyId,
        amount: amountInPaise,
        currency: orderData?.currency || "INR",
        name: "Prem Jodo Credits",
        description: topupItem.name || topupItem.title || "Power-Up Pack",
        image: "/favicon.ico",
        order_id: orderId,
        prefill: {
          name: orderData?.user?.name || user?.fullName || profile?.fullName || "",
          email: orderData?.user?.email || user?.email || "",
          contact: orderData?.user?.contact || user?.phoneNumber || profile?.phone || "",
        },
        theme: {
          color: "#E11D48",
        },
        modal: {
          ondismiss: () => setProcessingPlanSlug(null),
        },
        handler: async (response) => {
          try {
            const verificationPayload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              type: "addon",
              addon: addonSlug,
            };

            await membershipService.verifyPayment(verificationPayload);
            await refreshSubscription();

            const packTitle = topupItem.name || topupItem.title || "Credits Pack";
            const qty = topupItem.quantity || topupItem.amount || 1;
            setStatusMessage(`🎉 Success! ${packTitle} purchased. ${qty} credits added to your account.`);
            setActiveTab("my-plan");
          } catch (verifyErr) {
            setErrorMessage(verifyErr?.message || "Payment verification failed. Please contact support.");
          } finally {
            setProcessingPlanSlug(null);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res) => {
        setErrorMessage(res?.error?.description || "Payment was cancelled or failed.");
        setProcessingPlanSlug(null);
      });
      rzp.open();
    } catch (err) {
      setErrorMessage(err?.message || "Payment initiation failed. Please try again.");
      setProcessingPlanSlug(null);
    }
  };

  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    setErrorMessage("");
    setStatusMessage("");
    try {
      await membershipService.cancelSubscription({
        reason: cancelReason || "User requested cancellation from My Plan page",
      });
      setStatusMessage("Your subscription has been cancelled. VIP perks will remain active until the current billing period ends.");
      setShowCancelModal(false);
      await refreshSubscription();
    } catch (err) {
      setErrorMessage(err?.message || "Failed to cancel subscription. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Format boost timer (supports hours + mins + secs for 24h)
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Transaction history records
  const transactions = [
    {
      id: "INV-2026-8842",
      description: isUserVip ? `${activePlanName} (${billingCycle === "annual" ? "Annual" : "Monthly"})` : "Free Explorer Membership",
      date: subscription?.startDate
        ? new Date(subscription.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "01 Oct 2026",
      amount: isUserVip ? (billingCycle === "annual" ? "₹1,999" : "₹499") : "₹0",
      method: isUserVip ? "UPI / Razorpay" : "Free Plan",
      status: "PAID",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      id: "INV-2026-7910",
      description: "5 Super Likes Boost Pack",
      date: "28 Sep 2026",
      amount: "₹99",
      method: "UPI / Google Pay",
      status: "PAID",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      id: "INV-2026-6421",
      description: "1 Profile Boost (24 Hours)",
      date: "15 Sep 2026",
      amount: "₹149",
      method: "Paytm / NetBanking",
      status: "PAID",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
  ];

  const handleDownloadInvoice = (txn) => {
    setStatusMessage(`Invoice ${txn.id} downloaded successfully!`);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  // Dynamic Addon packs derived from backend API (with graceful fallback)
  const displayAddons = useMemo(() => {
    if (Array.isArray(addons) && addons.length > 0) {
      return addons.map((addon) => {
        const type = (addon.type || "").toLowerCase();
        const iconName = (addon.icon || "").toLowerCase();

        let iconComponent = Sparkles;
        let color = "from-indigo-500 to-purple-500";

        if (type.includes("boost") || iconName.includes("rocket")) {
          iconComponent = Rocket;
          color = (addon.quantity || 1) > 1 ? "from-indigo-500 to-blue-500" : "from-amber-500 to-orange-500";
        } else if (type.includes("super") || type.includes("like") || iconName.includes("heart")) {
          iconComponent = Heart;
          color = (addon.quantity || 1) >= 15 ? "from-pink-500 to-purple-500" : "from-rose-500 to-pink-500";
        } else if (type.includes("dm") || type.includes("message")) {
          iconComponent = MessageSquare;
          color = "from-emerald-500 to-teal-500";
        }

        return {
          id: addon.slug || addon._id,
          slug: addon.slug,
          _id: addon._id,
          title: addon.name,
          name: addon.name,
          type: addon.type,
          amount: addon.quantity || 1,
          quantity: addon.quantity || 1,
          price: addon.price,
          originalPrice: addon.originalPrice,
          badge: addon.tag || (addon.discountPercent ? `SAVE ${addon.discountPercent}%` : null),
          icon: iconComponent,
          color,
          description: addon.description,
        };
      });
    }

    // Default fallback if API is loading or empty
    return [
      {
        id: "5-super-likes",
        slug: "5-super-likes",
        title: "5 Super Likes Pack",
        name: "5 Super Likes Pack",
        type: "super_likes",
        amount: 5,
        quantity: 5,
        price: 99,
        originalPrice: 149,
        badge: "POPULAR",
        icon: Heart,
        color: "from-rose-500 to-pink-500",
        description: "Stand out 3x more and notify matches instantly.",
      },
      {
        id: "1-profile-boost",
        slug: "1-profile-boost",
        title: "1 Profile Boost (24 Hours)",
        name: "1 Profile Boost (24 Hours)",
        type: "profile_boost",
        amount: 1,
        quantity: 1,
        price: 149,
        originalPrice: 199,
        badge: "HOT",
        icon: Rocket,
        color: "from-amber-500 to-orange-500",
        description: "Be the top profile in your area for 24 hours.",
      },
      {
        id: "15-super-likes",
        slug: "15-super-likes",
        title: "15 Super Likes Mega Pack",
        name: "15 Super Likes Mega Pack",
        type: "super_likes",
        amount: 15,
        quantity: 15,
        price: 249,
        originalPrice: 449,
        badge: "BEST VALUE",
        icon: Heart,
        color: "from-pink-500 to-purple-500",
        description: "Save 45% with our ultimate Super Likes bundle.",
      },
      {
        id: "3-profile-boosts",
        slug: "3-profile-boosts",
        title: "3 Profile Boosts Bundle",
        name: "3 Profile Boosts Bundle",
        type: "profile_boost",
        amount: 3,
        quantity: 3,
        price: 349,
        originalPrice: 597,
        badge: "SAVE 40%",
        icon: Rocket,
        color: "from-indigo-500 to-blue-500",
        description: "Multiply your matches during peak dating hours.",
      },
    ];
  }, [addons]);

  const faqs = [
    {
      q: "When do my daily Super Likes and Swipes reset?",
      a: "Daily Super Likes and swipe quotas automatically replenish every 24 hours at midnight IST.",
    },
    {
      q: "How does the 24-Hour Profile Boost work?",
      a: "When you tap 'Activate Boost', your profile card is placed at the top of the discovery deck for 24 hours for every active user in your area, delivering up to 10x more visibility and matches.",
    },
    {
      q: "Do top-up credits expire?",
      a: "No! Top-up credits purchased from the Power-Up store never expire. They stay in your account balance until used.",
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes! You can cancel anytime directly from your active membership card. Your perks remain active until the end of your prepaid period.",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-32 sm:pb-24 px-1.5 sm:px-0">
      {/* 1. TOP HEADER WITH BACK ICON */}
      <div className="border-b border-zinc-200/80 dark:border-zinc-800 pb-4 sm:pb-5">
        <div className="flex items-start sm:items-center gap-3">
          <Link
            href="/user"
            aria-label="Back to Discover"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 shadow-xs mt-0.5 sm:mt-0"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-800 dark:text-zinc-100" />
          </Link>
          <div className="space-y-2 sm:space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 tracking-tight">
              <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 fill-amber-500/20 shrink-0" />
              <span>My Plan & Credits</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Track daily Super Likes, Boost mode, swipe limits, and manage your VIP membership.
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {statusMessage && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage("")} className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")} className="text-rose-600 hover:text-rose-800 dark:hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. MOBILE-FRIENDLY SEGMENTED TABS */}
      <div className="bg-zinc-100/90 dark:bg-zinc-900/90 p-1 sm:p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar border border-zinc-200/60 dark:border-zinc-800/80 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("my-plan")}
          className={`flex-1 min-w-[130px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap select-none ${activeTab === "my-plan"
              ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs scale-[1.01]"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
        >
          <Crown className="w-4 h-4 text-amber-500 shrink-0" />
          <span>My Plan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`flex-1 min-w-[130px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap select-none ${activeTab === "plans"
              ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs scale-[1.01]"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
        >
          <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
          <span>VIP Plans</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("topups")}
          className={`flex-1 min-w-[140px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap select-none ${activeTab === "topups"
              ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs scale-[1.01]"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
        >
          <ShoppingBag className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Top-Up Store</span>
          <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-rose-500 text-white shrink-0">
            HOT
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={`flex-1 min-w-[130px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap select-none ${activeTab === "billing"
              ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs scale-[1.01]"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
        >
          <Receipt className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Invoices</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MY PLAN & LIVE CREDITS BREAKDOWN */}
      {/* ========================================================================= */}
      {activeTab === "my-plan" && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
          {/* Active Plan Hero Card (Theme-Aware) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50/90 via-pink-50/40 to-amber-50/50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black text-zinc-900 dark:text-white p-6 sm:p-7 border border-rose-200/80 dark:border-zinc-800 shadow-lg shadow-rose-500/5 dark:shadow-2xl space-y-4">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-rose-400/15 via-amber-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
                    Active Membership
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isUserVip
                        ? planSlug.includes("platinum")
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                          : planSlug.includes("gold")
                          ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-xs"
                          : "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs"
                        : "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    {isUserVip ? <Crown className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {activePlanName}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {isUserVip ? "You have Active VIP Superpowers" : "Free Explorer Account"}
                </h2>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                  {isUserVip
                    ? `Your VIP plan is active. Enjoy unlimited swipes, direct chatting, 3x discovery boost, and verified crown badge on your profile.`
                    : `Upgrade to unlock daily Super Likes, Profile Boosts, Unlimited Swipes, and see all secret admirers who liked your profile.`}
                </p>

                {(() => {
                  const renewDate = subscription?.endDate || subscription?.validUntil || subscription?.currentPeriodEnd;
                  if (!renewDate) return null;
                  return (
                    <div className="pt-1 text-xs text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-rose-500 dark:text-amber-400 shrink-0" />
                      <span>
                        Renews on:{" "}
                        <strong className="text-zinc-900 dark:text-white font-semibold">
                          {new Date(renewDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </strong>
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons Responsive */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 sm:pt-0 shrink-0">
                {isUserVip && isRefundEligible && (
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-center cursor-pointer order-3 sm:order-1 shadow-xs"
                  >
                    Cancel Plan
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab("topups")}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer order-2 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-rose-500" />
                  <span>Get Top-Ups</span>
                </button>

                {isUserVip ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("topups")}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md shadow-amber-500/25 hover:opacity-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer order-1 sm:order-3"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Get Top-Up Credits</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab("plans")}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white shadow-md shadow-rose-500/25 hover:opacity-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer order-1 sm:order-3"
                  >
                    <span>Upgrade to VIP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* LIVE CREDITS & QUOTAS BREAKDOWN GRID */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                <span>Your Live Credits & Quotas</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {/* 1. Super Likes Meter */}
              <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3 sm:space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500/20" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">Super Likes</h4>
                        <p className="text-[10px] sm:text-[11px] text-zinc-500">3x Match Rate</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">
                        {credits.superLikes}
                      </span>
                      <span className="text-[11px] sm:text-xs text-zinc-400"> / {credits.maxSuperLikes} left</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full h-1.5 sm:h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.round((credits.superLikes / (credits.maxSuperLikes || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] text-zinc-500">Daily replenishment</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("topups")}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Add More</span>
                  </button>
                </div>
              </div>

              {/* 2. Profile Boost Mode */}
              <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3 sm:space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                        <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">Profile Boost</h4>
                        <p className="text-[10px] sm:text-[11px] text-zinc-500">Top Spot for 24h</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {boostSecondsLeft > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 animate-pulse">
                          <Clock className="w-3 h-3" />
                          {formatTime(boostSecondsLeft)}
                        </span>
                      ) : (
                        <div>
                          <span className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">
                            {credits.boosts}
                          </span>
                          <span className="text-[11px] sm:text-xs text-zinc-400"> left</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Boost Status / Trigger */}
                  <div className="mt-3">
                    {boostSecondsLeft > 0 ? (
                      <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/40 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                          <span className="font-semibold">🔥 Boost running!</span>
                        </div>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          {formatTime(boostSecondsLeft)}
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleActivateBoost}
                        disabled={isActivatingBoost}
                        className="w-full py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                      >
                        {isActivatingBoost ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Activating Boost...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 fill-white" />
                            <span>Activate 24h Boost</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] text-zinc-500">
                    {credits.boosts > 0 ? `${credits.boosts} Boost ready` : "0 Boost remaining"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("topups")}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Buy Boost</span>
                  </button>
                </div>
              </div>

              {/* 3. Message Before Match */}
              <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">Message Before Match</h4>
                      <p className="text-[10px] sm:text-[11px] text-zinc-500">DM & notes with likes</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      hasMessageBeforeMatch
                        ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {hasMessageBeforeMatch ? "Unlocked" : "Locked"}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {hasMessageBeforeMatch
                    ? "Attach personal introductory notes directly with your likes before matching."
                    : "Send a note before matching to stand out. Upgrade to VIP to unlock."}
                </p>
              </div>

              {/* 4. Rewinds Quota */}
              <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-500 flex items-center justify-center">
                      <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">Swipe Rewinds</h4>
                      <p className="text-[10px] sm:text-[11px] text-zinc-500">Undo accidental pass</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                    {isUserVip ? "Unlimited" : "1 / Day"}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {isUserVip
                    ? "Rewind as many passes as you like anytime from your discovery deck."
                    : "Free members get 1 rewind per day. Upgrade to get unlimited rewinds."}
                </p>
              </div>

              {/* 5. Daily Swipes */}
              <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
                      <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">Daily Swipes</h4>
                      <p className="text-[10px] sm:text-[11px] text-zinc-500">Discover nearby profiles</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                    {isUserVip ? "Unlimited" : "50 / Day"}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {isUserVip
                    ? "No swipe limits. Connect with matches freely without interruptions."
                    : "Standard account limit resets every 24 hours at midnight IST."}
                </p>
              </div>

              {/* 6. Secret Admirers (Who Liked You) */}
              <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">See Who Liked You</h4>
                      <p className="text-[10px] sm:text-[11px] text-zinc-500">Instant Match Grid</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isUserVip
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    }`}>
                    {isUserVip ? "Unlocked" : "Locked"}
                  </span>
                </div>
                <Link
                  href="/user/likes"
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1"
                >
                  <span>View Who Liked You →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UPGRADE & ALL PLANS GRID */}
      {/* ========================================================================= */}
      {activeTab === "plans" && (
        <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <span>Choose Your VIP Tier</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Select your billing duration to unlock unlimited matching. Cancel anytime.
              </p>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="inline-flex p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto w-full sm:w-auto">
              {billingCycles.map((cycle) => {
                const isSelected = billingCycle === cycle.id;
                return (
                  <button
                    key={cycle.id}
                    type="button"
                    onClick={() => setBillingCycle(cycle.id)}
                    className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isSelected
                        ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs font-bold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }`}
                  >
                    <span>{cycle.label}</span>
                    {cycle.discount && (
                      <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-rose-500 text-white">
                        {cycle.discount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active VIP Plan Notice */}
          {isUserVip && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/50 dark:border-amber-700/50 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-amber-500 shrink-0" />
                <span>
                  You currently have an active {activePlanName} membership. Plan switching is locked during active billing cycles. You can add extra Super Likes or Boosts anytime from the Top-Up Store!
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("topups")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-xs whitespace-nowrap shadow-xs cursor-pointer transition-all shrink-0"
              >
                Open Top-Up Store →
              </button>
            </div>
          )}

          {/* Plans Grid */}
          {isLoadingPlans ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
              <p className="text-xs text-zinc-500">Loading VIP subscription plans...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {plans.map((plan) => {
                const isAnnual = billingCycle === "annual" || billingCycle === "yearly";
                const pricing = isAnnual ? plan.pricing?.annual : plan.pricing?.monthly;
                const pricePerMonth = pricing?.pricePerMonth ?? (isAnnual ? 399 : 599);
                const totalAmount = pricing?.totalAmount ?? (isAnnual ? pricePerMonth * 12 : pricePerMonth);
                const isCurrent = isCurrentPlanActive(plan);
                const isPopular = plan.isPopular || plan.slug === "platinum" || plan.slug === "gold";
                const isProcessing = processingPlanSlug === plan.slug;

                return (
                  <div
                    key={plan.slug || plan._id}
                    className={`relative rounded-3xl p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 border ${
                      isCurrent
                        ? "bg-gradient-to-b from-emerald-500/10 via-white to-white dark:from-emerald-950/20 dark:via-zinc-900 dark:to-zinc-900 border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/20 z-10 scale-[1.01]"
                        : isPopular
                        ? "bg-gradient-to-b from-rose-50/60 via-white to-white dark:from-rose-950/20 dark:via-zinc-900 dark:to-zinc-900 border-rose-400/80 dark:border-rose-500/40 shadow-lg shadow-rose-500/10"
                        : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md"
                    }`}
                  >
                    {isCurrent ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-md flex items-center gap-1 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3" />
                          Current Active Plan
                        </span>
                      </div>
                    ) : isPopular ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white shadow-xs flex items-center gap-1 whitespace-nowrap">
                          <Sparkles className="w-3 h-3" />
                          Most Popular
                        </span>
                      </div>
                    ) : null}

                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
                          <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        {isCurrent ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Current Active
                          </span>
                        ) : null}
                      </div>

                      <h4 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {plan.name}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 min-h-[30px] leading-relaxed">
                        {plan.description || "Unlock premium matching features and VIP benefits."}
                      </p>

                      <div className="my-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
                            ₹{pricePerMonth}
                          </span>
                          <span className="text-xs text-zinc-500 font-medium">/ month</span>
                        </div>
                        {isAnnual && (
                          <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
                            Billed annually at ₹{totalAmount}/yr
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 mb-5 text-xs text-zinc-700 dark:text-zinc-300">
                        {Array.isArray(plan.features) &&
                          plan.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 leading-snug">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="text-xs">{feat}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      {isCurrent ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-3 rounded-xl text-xs font-black bg-emerald-500 text-white shadow-xs cursor-default text-center flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Current Active Plan</span>
                        </button>
                      ) : isUserVip ? (
                        <button
                          type="button"
                          onClick={() => setActiveTab("topups")}
                          className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Get Top-Up Credits</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSubscribe(plan)}
                          disabled={isProcessing}
                          className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                            isPopular
                              ? "bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:opacity-95 shadow-rose-500/25"
                              : "bg-zinc-900 hover:bg-zinc-800 dark:bg-rose-600 dark:hover:bg-rose-500"
                          }`}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <span>Upgrade Now</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: POWER-UP TOP-UPS STORE */}
      {/* ========================================================================= */}
      {activeTab === "topups" && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
          <div>
            <h3 className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
              <span>A La Carte Power-Ups & Credits</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Need extra boosts or Super Likes without upgrading your full plan? Top up instantly. Credits never expire!
            </p>
          </div>

          {isLoadingAddons && displayAddons.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
                  <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayAddons.map((pack) => {
                const PackIcon = pack.icon;
                const isBuying = processingPlanSlug === (pack.slug || pack.id || pack._id);

                return (
                  <div
                    key={pack.id || pack.slug}
                    className="relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
                  >
                    {pack.badge && (
                      <div className="absolute -top-2.5 right-4 sm:right-6">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-xs">
                          {pack.badge}
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr ${pack.color} text-white flex items-center justify-center shadow-xs shrink-0`}>
                          <PackIcon className="w-5 h-5 fill-white/20" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-tight">
                            {pack.title}
                          </h4>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                              ₹{pack.price}
                            </span>
                            {pack.originalPrice && (
                              <span className="text-[11px] text-zinc-400 line-through">
                                ₹{pack.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {pack.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBuyTopup(pack)}
                      disabled={isBuying}
                      className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-60"
                    >
                      {isBuying ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Opening Checkout...</span>
                        </>
                      ) : (
                        <>
                          <span>Get {pack.amount} Credits</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BILLING & TRANSACTION HISTORY */}
      {/* ========================================================================= */}
      {activeTab === "billing" && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
          <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-500" />
                  <span>Billing & Invoices</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  View past payments, download receipts, and renewal records.
                </p>
              </div>
            </div>

            {/* Mobile Cards List for Billing */}
            <div className="block sm:hidden space-y-3">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {txn.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${txn.badgeColor}`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {txn.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {txn.description}
                      </h4>
                      <p className="text-[10px] text-zinc-500">{txn.date} • {txn.method}</p>
                    </div>
                    <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                      {txn.amount}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(txn)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[11px] font-semibold cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Transactions Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-zinc-200/70 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-2">Invoice ID</th>
                    <th className="pb-3 px-2">Item / Plan</th>
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2">Method</th>
                    <th className="pb-3 px-2">Amount</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium text-zinc-700 dark:text-zinc-300">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-2 font-mono text-xs text-zinc-900 dark:text-zinc-100 font-bold">
                        {txn.id}
                      </td>
                      <td className="py-3 px-2 font-semibold text-zinc-900 dark:text-zinc-100">
                        {txn.description}
                      </td>
                      <td className="py-3 px-2 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {txn.date}
                      </td>
                      <td className="py-3 px-2 text-zinc-600 dark:text-zinc-400">
                        {txn.method}
                      </td>
                      <td className="py-3 px-2 font-bold text-zinc-900 dark:text-zinc-100">
                        {txn.amount}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${txn.badgeColor}`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(txn)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>Need a GST tax invoice or billing assistance?</span>
              </div>
              <Link
                href="/support"
                className="font-bold text-rose-600 dark:text-rose-400 hover:underline self-start sm:self-auto"
              >
                Contact Billing Support →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. FAQS ACCORDION */}
      <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-2.5 pt-1">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl sm:rounded-2xl border border-zinc-200/70 dark:border-zinc-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 font-semibold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-rose-500" : ""
                      }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && isRefundEligible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs animate-in fade-in"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                Cancel Active Subscription
              </h4>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Are you sure you want to cancel your VIP subscription? You will lose access to secret admirers, 3x profile boost, and unlimited swipes after your current period ends.
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Reason for cancellation (optional)
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="">Select a reason</option>
                <option value="Found a match">Found a match on Prem Jodo</option>
                <option value="Too expensive">Looking for a different plan</option>
                <option value="Taking a break">Taking a break from dating</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Keep My VIP
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1.5"
              >
                {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

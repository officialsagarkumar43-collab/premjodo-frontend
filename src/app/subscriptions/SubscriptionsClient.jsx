"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import authService from "@/lib/services/auth.service";
import membershipService from "@/lib/services/membership.service";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";
import "@/styles/subscriptions.css";
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  X,
  Plus,
  Minus,
} from "lucide-react";

// Code-split AuthModal for enhanced page load performance
const AuthModal = dynamic(
  () => import("@/components/common/AuthModal").then((mod) => mod.AuthModal),
  { ssr: false }
);

export default function SubscriptionsClient({
  initialPlans = [],
  initialBillingCycles = null,
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    user,
    profile,
    isAuthenticated,
    subscription,
    refreshSubscription,
    isLoading: authLoading,
  } = useAuth();

  // Intersection Observers for smooth reveal animations without viewport layout delay
  const [heroRef, isHeroVisible] = useIntersectionObserver({
    threshold: 0,
    rootMargin: "0px 0px 150px 0px",
    freezeOnceVisible: true,
  });

  const [plansRef, isPlansVisible] = useIntersectionObserver({
    threshold: 0,
    rootMargin: "0px 0px 150px 0px",
    freezeOnceVisible: true,
  });

  const [faqRef, isFaqVisible] = useIntersectionObserver({
    threshold: 0,
    rootMargin: "0px 0px 150px 0px",
    freezeOnceVisible: true,
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' | 'annual'
  const [plans, setPlans] = useState(() => {
    if (Array.isArray(initialPlans) && initialPlans.length > 0) {
      return [...initialPlans].sort(
        (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
      );
    }
    return [];
  });
  const [billingCycles, setBillingCycles] = useState(
    initialBillingCycles || [
      { id: "monthly", label: "Monthly Billing", discount: null },
      { id: "annual", label: "Annual Billing", discount: "SAVE 33%" },
    ]
  );
  // Initial loading spinner state until both plans and user subscription status are fetched from API
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [processingPlanSlug, setProcessingPlanSlug] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [successPlan, setSuccessPlan] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const openAuth = () => {
    if (isAuthenticated) {
      router.push("/user");
      return;
    }
    setIsAuthOpen(true);
  };

  // Dedicated data loader to fetch fresh plans & active subscription concurrently from API
  const fetchAllData = useCallback(async () => {
    setIsLoadingPlans(true);
    setIsInitialLoading(true);
    try {
      const promises = [];

      // 1. Fetch subscription plans and billing cycles from API
      promises.push(
        membershipService
          .getPlansData()
          .then(({ plans: fetchedPlans, billingCycles: fetchedCycles }) => {
            if (Array.isArray(fetchedPlans) && fetchedPlans.length > 0) {
              const sorted = [...fetchedPlans].sort(
                (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
              );
              setPlans(sorted);
            }
            if (Array.isArray(fetchedCycles) && fetchedCycles.length > 0) {
              setBillingCycles(fetchedCycles);
            }
          })
          .catch((err) => {
            console.warn("[SubscriptionsClient] Error fetching plans:", err);
          })
      );

      // 2. If authenticated or token exists, fetch current user subscription from API
      const hasToken =
        typeof window !== "undefined" &&
        Boolean(authService.isAuthenticated());

      if (hasToken) {
        promises.push(
          refreshSubscription().catch((err) => {
            console.warn("[SubscriptionsClient] Error refreshing subscription:", err);
          })
        );
      }

      await Promise.all(promises);
    } catch (err) {
      console.warn("[SubscriptionsClient] Error loading initial plans data:", err);
    } finally {
      setIsLoadingPlans(false);
      setIsInitialLoading(false);
    }
  }, [refreshSubscription]);

  // Initial mount: fetch all data and prevent infinite spinner with fallback timer
  useEffect(() => {
    let isMounted = true;

    fetchAllData();

    // If plans failed to load on initial mount (e.g. cold start), auto-retry once after 2.5s
    const retryTimer = setTimeout(() => {
      if (isMounted) {
        setPlans((current) => {
          if (!current || current.length === 0) {
            fetchAllData();
          }
          return current;
        });
      }
    }, 2500);

    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoadingPlans(false);
        setIsInitialLoading(false);
      }
    }, 6000);

    return () => {
      isMounted = false;
      clearTimeout(retryTimer);
      clearTimeout(fallbackTimer);
    };
  }, [fetchAllData]);

  // Keep subscription fresh when auth changes dynamically
  useEffect(() => {
    if (isAuthenticated) {
      refreshSubscription();
    }
  }, [isAuthenticated, refreshSubscription]);

  // Unified loading flag: true during initial load or while fetching API data / auth sync
  const isDataLoading =
    isInitialLoading ||
    isLoadingPlans ||
    (typeof window !== "undefined" && authService.isAuthenticated() && authLoading);

  // Memoized sorted plans list
  const sortedPlans = useMemo(() => {
    if (!Array.isArray(plans)) return [];
    return [...plans].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [plans]);

  // Memoized active subscription slug / plan identifier
  const isUserVip = Boolean(
    subscription?.isActive === true ||
    subscription?.status === "active" ||
    subscription?.isVip === true ||
    subscription?.isVIP === true ||
    user?.isVip === true ||
    user?.isVIP === true ||
    user?.vipBadge === true ||
    user?.membership?.isActive === true ||
    user?.membership?.status === "active" ||
    profile?.isVip === true ||
    profile?.isVIP === true ||
    profile?.vipBadge === true ||
    profile?.membership?.isActive === true ||
    profile?.membership?.status === "active"
  );

  const activePlanIdOrSlug = useMemo(() => {
    const raw =
      (typeof subscription?.plan === "string"
        ? subscription.plan
        : subscription?.plan?.slug || subscription?.plan?.name) ||
      subscription?.planName ||
      subscription?.planSlug ||
      subscription?.slug ||
      subscription?.planId ||
      subscription?.plan?._id ||
      subscription?.tier ||
      subscription?.name ||
      user?.membership?.plan ||
      user?.membership?.slug ||
      user?.membership?.tier ||
      user?.membership?.name ||
      user?.subscription?.plan ||
      user?.subscription?.slug ||
      user?.subscription?.tier ||
      user?.tier ||
      user?.membershipTier ||
      user?.plan ||
      profile?.membership?.plan ||
      profile?.membership?.slug ||
      profile?.membership?.tier ||
      profile?.membership?.name ||
      (isUserVip ? "platinum" : "");
    return String(raw).toLowerCase();
  }, [subscription, user, profile, isUserVip]);

  const isCurrentPlanActive = useCallback(
    (plan) => {
      if (!isUserVip || !activePlanIdOrSlug) return false;
      const planId = String(plan?._id || "").toLowerCase();
      const pSlug = String(plan?.slug || "").toLowerCase();
      const pName = String(plan?.name || "").toLowerCase();

      // Check specific tiers in exact priority order
      const tiers = ["platinum", "diamond", "gold", "plus"];
      for (const t of tiers) {
        if (activePlanIdOrSlug.includes(t)) {
          if (pSlug.includes(t) || pName.includes(t)) {
            return true;
          }
          // If active is platinum, do NOT match other tiers
          return false;
        }
      }

      if (
        (planId && (activePlanIdOrSlug === planId || activePlanIdOrSlug.includes(planId))) ||
        (pSlug && (activePlanIdOrSlug === pSlug || activePlanIdOrSlug.includes(pSlug))) ||
        (pName && (activePlanIdOrSlug.includes(pName) || pName.includes(activePlanIdOrSlug)))
      ) {
        return true;
      }

      return false;
    },
    [isUserVip, activePlanIdOrSlug]
  );

  // Dynamic icon resolution
  const getPlanIcon = (iconName) => {
    switch (String(iconName).toLowerCase()) {
      case "zap":
        return Zap;
      case "crown":
        return Crown;
      case "sparkles":
        return Sparkles;
      default:
        return Crown;
    }
  };

  // Pure CSS class mapping for tier icon gradients
  const getPlanIconClass = (slug) => {
    switch (slug) {
      case "plus":
        return "sub-icon-plus";
      case "gold":
        return "sub-icon-gold";
      case "platinum":
        return "sub-icon-platinum";
      default:
        return "sub-icon-default";
    }
  };

  // Handle subscribe checkout with dynamic pricing via Razorpay
  const handleSubscribe = async (plan) => {
    setErrorMessage("");
    setStatusMessage("");

    // Guard against checkout calls while verifying initial data or processing
    if (isDataLoading || processingPlanSlug || isVerifying) {
      return;
    }

    if (!isAuthenticated) {
      openAuth();
      return;
    }

    if (isUserVip || isCurrentPlanActive(plan)) {
      router.push("/user/subscriptions?tab=topups");
      return;
    }

    const isAnnual = billingCycle === "annual" || billingCycle === "yearly";
    const pricingData = isAnnual ? plan.pricing?.annual : plan.pricing?.monthly;
    const totalAmount =
      pricingData?.totalAmount ||
      (isAnnual ? (pricingData?.pricePerMonth || 199) * 12 : pricingData?.pricePerMonth || 299);

    setProcessingPlanSlug(plan.slug);

    try {
      // 1. Ensure Razorpay Checkout SDK is loaded
      const isScriptLoaded = await membershipService.loadRazorpayScript();
      if (!isScriptLoaded || typeof window === "undefined" || !window.Razorpay) {
        throw new Error("Razorpay SDK could not be loaded. Please check your internet connection.");
      }

      // 2. Initialize Order with backend
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

      // 3. Open Razorpay Checkout standard popup
      const options = {
        key: keyId,
        amount: amountInPaise,
        currency: orderData?.currency || "INR",
        name: "Prem Jodo",
        description: `Prem Jodo ${plan.name || orderData?.planName || "Membership"} (${isAnnual ? "Annual" : "Monthly"})`,
        image: "/favicon.ico",
        order_id: orderId,
        prefill: {
          name: orderData?.user?.name || user?.fullName || profile?.fullName || "",
          email: orderData?.user?.email || user?.email || "",
          contact: orderData?.user?.contact || user?.phoneNumber || profile?.phone || "",
        },
        theme: {
          color: "#e11d48",
        },
        modal: {
          ondismiss: function () {
            setProcessingPlanSlug(null);
          },
        },
        handler: async function (response) {
          try {
            setIsVerifying(true);
            setErrorMessage("");

            // 4. Verify payment with backend
            await membershipService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id || orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.slug || plan._id,
              billingCycle: isAnnual ? "annual" : "monthly",
            });

            await refreshSubscription();
            setIsVerifying(false);
            setSuccessPlan(plan);
            setStatusMessage("Payment successful! Your membership is now active 🎉");
          } catch (verifyErr) {
            console.error("Payment verification failed:", verifyErr);
            setErrorMessage(verifyErr?.message || "Payment verification failed. Please contact support.");
            setIsVerifying(false);
          } finally {
            setProcessingPlanSlug(null);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.warn("Razorpay payment failed:", response.error);
        setErrorMessage(
          response?.error?.description || response?.error?.reason || "Payment was cancelled or failed."
        );
        setProcessingPlanSlug(null);
      });

      rzp.open();
    } catch (err) {
      console.warn("Subscription checkout error:", err);
      setErrorMessage(err?.message || "Failed to initialize payment. Please try again later.");
      setProcessingPlanSlug(null);
    }
  };

  return (
    <div className="sub-page-root">
      <Navbar onOpenAuth={openAuth} />

      <main className="sub-page-main">
        {/* Header Hero */}
        <section
          ref={heroRef}
          className={`sub-hero-section sub-reveal ${isHeroVisible ? "sub-reveal-visible" : ""}`}
        >
          <div className="sub-hero-inner">
            <h1 className="sub-hero-title">
              {t("subscriptionsPage.titlePrefix") || "Level Up Your "}
              <span className="sub-title-gradient">
                {t("subscriptionsPage.titleHighlight") || "Connection Journey"}
              </span>
            </h1>
            <p className="sub-hero-subtitle">
              {t("subscriptionsPage.subtitle") ||
                "Get unmatched visibility, skip the waiting queue, and connect with your dream partner faster with our premium membership plans."}
            </p>

            {/* Active VIP Plan banner */}
            {isUserVip && (
              <div className="sub-vip-banner">
                <div className="sub-vip-banner-content">
                  <Crown className="sub-vip-banner-icon" />
                  <span>
                    You already have an active VIP membership ({activePlanIdOrSlug ? activePlanIdOrSlug.toUpperCase() : "VIP"}). To get extra Super Likes, Boosts, or Direct Crushes, grab a top-up bundle!
                  </span>
                </div>
                <Link
                  href="/user/subscriptions?tab=topups"
                  className="sub-vip-topup-btn"
                >
                  Visit Top-Up Store →
                </Link>
              </div>
            )}

            {/* Error banner if payment or action failed */}
            {errorMessage && (
              <div className="sub-alert-banner sub-alert-error">
                <AlertCircle className="sub-alert-icon" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Status banner */}
            {statusMessage && (
              <div className="sub-alert-banner sub-alert-success">
                <CheckCircle2 className="sub-alert-icon" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Dynamic Billing Toggle */}
            <div className="sub-billing-wrapper">
              <div className="sub-billing-track">
                {billingCycles.map((cycle) => {
                  const isActive = billingCycle === cycle.id;
                  return (
                    <button
                      key={cycle.id}
                      onClick={() => setBillingCycle(cycle.id)}
                      className={`sub-billing-btn ${isActive ? "sub-billing-btn-active" : ""}`}
                    >
                      <span>{cycle.label}</span>
                      {cycle.discount && (
                        <span className="sub-billing-discount">
                          {cycle.discount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Pricing Cards Grid */}
        <section
          ref={plansRef}
          className={`sub-pricing-section sub-reveal ${isPlansVisible ? "sub-reveal-visible" : ""}`}
        >
          <div className="sub-pricing-container">
            {isDataLoading ? (
              <div className="sub-plans-loading-wrapper">
                <div className="sub-plans-spinner-container">
                  <div className="sub-plans-spinner-ring" />
                  <div className="sub-plans-spinner-glow" />
                  <Crown className="sub-plans-spinner-icon" />
                </div>
                <div className="sub-plans-loading-content">
                  <h3 className="sub-plans-loading-heading">Loading Membership Plans...</h3>
                </div>
                <div className="sub-plans-loading-dots">
                  <span className="sub-loading-dot" />
                  <span className="sub-loading-dot" />
                  <span className="sub-loading-dot" />
                </div>
              </div>
            ) : sortedPlans.length === 0 ? (
              <div className="sub-plans-empty-wrapper">
                <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
                <h3 className="sub-plans-loading-heading">Unable to Load Plans</h3>
                <p className="sub-plans-loading-subtitle">
                  We could not fetch the subscription plans right now. Please try again.
                </p>
                <button
                  type="button"
                  onClick={fetchAllData}
                  className="sub-retry-btn"
                >
                  Reload Plans
                </button>
              </div>
            ) : (
              <div className="sub-cards-grid">
                {sortedPlans.map((plan, index) => {
                  const Icon = getPlanIcon(plan.icon);
                  const isAnnual = billingCycle === "annual" || billingCycle === "yearly";
                  const pricingData = isAnnual ? plan.pricing?.annual : plan.pricing?.monthly;
                  const totalAmount =
                    pricingData?.totalAmount ?? (isAnnual ? (pricingData?.pricePerMonth ? pricingData.pricePerMonth * 12 : 2388) : pricingData?.pricePerMonth || 299);
                  const pricePerMonth =
                    pricingData?.pricePerMonth ?? (isAnnual ? Math.round(totalAmount / 12) : 299);
                  const discountPercent = pricingData?.discountPercent ?? (isAnnual ? 33 : 0);

                  const mainPrice = isAnnual ? totalAmount : pricePerMonth;
                  const mainPeriod = isAnnual
                    ? (t("subscriptionsPage.perYear") || "/ year")
                    : (t("subscriptionsPage.perMonth") || "/ month");

                  const isProcessing = processingPlanSlug === plan.slug;
                  const isUserActivePlan = isCurrentPlanActive(plan);
                  const isPopular = plan.isMostPopular || plan.slug === "gold";
                  const badgeText = plan.tag || plan.subtitle || (isPopular ? "Most Popular" : null);

                  return (
                    <div
                      key={plan.slug || plan._id}
                      className={`sub-card stagger-${(index % 3) + 1} ${isUserActivePlan
                        ? "sub-card-active"
                        : isPopular
                          ? "sub-card-popular"
                          : ""
                        }`}
                    >
                      {isUserActivePlan ? (
                        <span className="sub-card-badge sub-card-badge-active">
                          <CheckCircle2 className="sub-badge-icon" />
                          <span>Active Plan</span>
                        </span>
                      ) : badgeText ? (
                        <span
                          className={`sub-card-badge ${isPopular ? "sub-card-badge-popular" : "sub-card-badge-generic"
                            }`}
                        >
                          {badgeText}
                        </span>
                      ) : null}

                      <div>
                        <div className="sub-card-header">
                          <div className="sub-card-header-main">
                            <div
                              className={`sub-card-icon-box ${getPlanIconClass(
                                plan.slug
                              )}`}
                              style={plan.themeColor ? { backgroundColor: plan.themeColor } : {}}
                            >
                              <Icon className="sub-card-icon-svg" />
                            </div>
                            <div className="sub-card-title-group">
                              <h3 className="sub-card-title">
                                {plan.name}
                              </h3>
                              {plan.subtitle && !isPopular && (
                                <span className="sub-card-subtitle">
                                  {plan.subtitle}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="sub-card-desc">
                          {plan.description}
                        </p>

                        <div className="sub-price-box">
                          <div className="sub-price-row">
                            <span className="sub-price-amount">
                              ₹{mainPrice}
                            </span>
                            <span className="sub-price-period">
                              {mainPeriod}
                            </span>
                          </div>
                          {isAnnual && (
                            <span className="sub-annual-note">
                              ₹{pricePerMonth}/month{discountPercent > 0 ? ` • Save ${discountPercent}%` : ""}
                            </span>
                          )}
                        </div>

                        <ul className="sub-features-list">
                          {Array.isArray(plan.features) &&
                            plan.features.map((feat, i) => (
                              <li key={i} className="sub-feature-item">
                                <Check className="sub-feature-icon" />
                                <span>{feat}</span>
                              </li>
                            ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => {
                          if (isDataLoading) return;
                          if (isUserVip && !isUserActivePlan) {
                            router.push("/user/subscriptions?tab=topups");
                            return;
                          }
                          handleSubscribe(plan);
                        }}
                        disabled={
                          isProcessing ||
                          isUserActivePlan ||
                          isDataLoading
                        }
                        className={`sub-cta-btn ${isUserActivePlan
                          ? "sub-cta-active"
                          : isUserVip
                            ? "sub-cta-vip"
                            : isPopular
                              ? "sub-cta-popular"
                              : "sub-cta-standard"
                          }`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="sub-spinner" />
                            <span>Securing Checkout...</span>
                          </>
                        ) : isDataLoading ? (
                          <>
                            <Loader2 className="sub-spinner" />
                            <span>Checking Plan...</span>
                          </>
                        ) : isUserActivePlan ? (
                          <span>Currently Subscribed</span>
                        ) : isUserVip ? (
                          <span>Get Top-Up Credits</span>
                        ) : (
                          <span>Get {plan.name}</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section
          ref={faqRef}
          className={`sub-faq-section sub-reveal ${isFaqVisible ? "sub-reveal-visible" : ""}`}
        >
          <div className="sub-faq-container">
            <div className="sub-faq-header">
              <h2 className="sub-faq-title">
                {t("subscriptionsPage.faqHeading") || "Frequently Asked Questions"}
              </h2>
              <p className="sub-faq-subtitle">
                {t("subscriptionsPage.faqSub") ||
                  "Everything you need to know about our subscription and billing."}
              </p>
            </div>

            <div className="sub-faq-list">
              {[
                {
                  q: t("subscriptionsPage.q1") || "Can I cancel my subscription at any time?",
                  a:
                    t("subscriptionsPage.a1") ||
                    "Yes, you can cancel your subscription anytime directly from your profile settings or subscriptions page. Your perks remain active until the billing period ends.",
                },
                {
                  q: t("subscriptionsPage.q2") || "What payment methods are supported?",
                  a:
                    t("subscriptionsPage.a2") ||
                    "We accept UPI (Google Pay, PhonePe, Paytm, BHIM), all major Debit & Credit Cards, Net Banking, and Wallet payments via Cashfree.",
                },
                {
                  q: t("subscriptionsPage.q3") || "What happens to my matches if I downgrade?",
                  a:
                    t("subscriptionsPage.a3") ||
                    "All your existing matches, chats, and messages stay 100% safe forever. You will never lose any connected person when your plan changes.",
                },
                {
                  q: "How soon are VIP benefits activated after payment?",
                  a:
                    "Your VIP privileges (unlimited swipes, rewinds, priority matching, and verified badge) are activated instantly right after payment verification.",
                },
                {
                  q: "Is my payment transaction secure?",
                  a: "Yes, 100% secure.",
                },
              ].map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`sub-faq-item stagger-${(idx % 5) + 1} ${isOpen ? "sub-faq-item-open" : ""
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                      className="sub-faq-trigger"
                    >
                      <span className="sub-faq-question">
                        {faq.q}
                      </span>
                      <div className="sub-faq-toggle-icon">
                        {isOpen ? (
                          <Minus className="sub-faq-icon-inner" />
                        ) : (
                          <Plus className="sub-faq-icon-inner" />
                        )}
                      </div>
                    </button>

                    <div
                      className={`sub-faq-collapse ${isOpen ? "sub-faq-collapse-open" : ""}`}
                    >
                      <div className="sub-faq-collapse-inner">
                        <div className="sub-faq-answer-wrap">
                          <div className="sub-faq-answer-divider">
                            <p className="sub-faq-answer-text">
                              {faq.a}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="register"
      />

      {/* Payment Verification Overlay Loader */}
      {isVerifying && (
        <div className="sub-verify-backdrop">
          <div className="sub-verify-card">
            <Loader2 className="sub-verify-spinner" />
            <h3 className="sub-verify-text">
              Verifying Payment...
            </h3>
          </div>
        </div>
      )}

      {/* Payment Success Celebration Modal */}
      {successPlan && (
        <div className="sub-modal-backdrop">
          <div
            className="sub-modal-scrim"
            onClick={() => setSuccessPlan(null)}
          />

          <div className="sub-modal-card">
            <button
              onClick={() => setSuccessPlan(null)}
              className="sub-modal-close-btn"
            >
              <X className="sub-perk-icon" />
            </button>

            <div className="sub-success-icon-box">
              <Crown className="sub-success-crown" />
            </div>

            <div>
              <h2 className="sub-success-title">
                Welcome to {successPlan.name}!
              </h2>
              <p className="sub-success-desc">
                Your payment was verified successfully. All premium VIP privileges and superpowers are now activated on your account.
              </p>
            </div>

            <div className="sub-success-perks-box">
              <div className="sub-perk-row">
                <Check className="sub-perk-icon" />
                <span>Unlimited Swipes & Rewinds Active</span>
              </div>
              <div className="sub-perk-row">
                <Check className="sub-perk-icon" />
                <span>Priority Matching & Likes Unlocked</span>
              </div>
              <div className="sub-perk-row">
                <Check className="sub-perk-icon" />
                <span>Verified VIP Badge Applied</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessPlan(null);
                router.push("/user");
              }}
              className="sub-success-cta-btn"
            >
              <span>Explore Discover Feed</span>
              <ArrowRight className="sub-perk-icon" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

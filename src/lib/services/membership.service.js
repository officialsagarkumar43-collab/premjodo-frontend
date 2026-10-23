/**
 * Membership & Subscription API Service for Prem Jodo
 * Backend Routes:
 * - GET  /membership/plans
 * - GET  /membership/my-subscription
 * - GET  /membership/status
 * - POST /membership/create-order
 * - POST /membership/verify-payment
 * - POST /membership/cancel
 */

import { apiFetch } from "./apiClient";

let plansCache = null;
let plansPromise = null;
let addonsCache = null;
let addonsPromise = null;
let mySubscriptionPromise = null;

export const membershipService = {
  /**
   * Fetch all subscription plans, addons and billing cycles from backend (Memoized)
   * GET /membership/plans
   * @param {boolean} [forceRefresh=false]
   * @returns {Promise<{ plans: Array, addons: Array, billingCycles: Array|null }>}
   */
  async getPlansData(forceRefresh = false) {
    if (!forceRefresh && plansCache && plansCache.plans?.length > 0) {
      return plansCache;
    }
    if (plansPromise) {
      return plansPromise;
    }

    plansPromise = (async () => {
      try {
        const res = await apiFetch("/membership/plans", { method: "GET" });
        if (res && res.ok) {
          const json = await res.json().catch(() => ({}));
          const data = json?.data || json;
          const plans =
            (Array.isArray(data?.plans) ? data.plans : null) ||
            (Array.isArray(data) ? data : null) ||
            (Array.isArray(json?.plans) ? json.plans : []) ||
            [];
          const addons =
            (Array.isArray(data?.addons) ? data.addons : null) ||
            (Array.isArray(json?.addons) ? json.addons : []) ||
            [];
          const billingCycles = Array.isArray(data?.billingCycles) ? data.billingCycles : null;

          if (addons.length > 0 && !addonsCache) {
            addonsCache = addons;
          }

          plansCache = { plans, addons, billingCycles };
          return plansCache;
        }
      } catch (err) {
        console.warn("[membershipService] getPlans error:", err);
      } finally {
        plansPromise = null;
      }
      return { plans: [], addons: [], billingCycles: null };
    })();

    return plansPromise;
  },

  /**
   * Fetch only plans array
   * @returns {Promise<Array>}
   */
  async getPlans(forceRefresh = false) {
    const { plans } = await this.getPlansData(forceRefresh);
    return plans;
  },

  /**
   * Fetch all active addons from backend (Memoized)
   * GET /membership/addons
   * @param {boolean} [forceRefresh=false]
   * @returns {Promise<Array>}
   */
  async getAddons(forceRefresh = false) {
    if (!forceRefresh && addonsCache && addonsCache.length > 0) {
      return addonsCache;
    }
    if (addonsPromise) {
      return addonsPromise;
    }

    addonsPromise = (async () => {
      try {
        const res = await apiFetch("/membership/addons", { method: "GET" });
        if (res && res.ok) {
          const json = await res.json().catch(() => ({}));
          const data = json?.data || json;
          const addons =
            (Array.isArray(data?.addons) ? data.addons : null) ||
            (Array.isArray(data) ? data : null) ||
            (Array.isArray(json?.addons) ? json.addons : []) ||
            [];

          if (addons.length > 0) {
            addonsCache = addons;
            return addons;
          }
        }
      } catch (err) {
        console.warn("[membershipService] getAddons error:", err);
      } finally {
        addonsPromise = null;
      }

      // Fallback: check if getPlansData already cached addons
      if (plansCache?.addons && Array.isArray(plansCache.addons) && plansCache.addons.length > 0) {
        return plansCache.addons;
      }

      return [];
    })();

    return addonsPromise;
  },

  /**
   * Fetch current active membership of logged in user (in-flight deduplicated)
   * GET /membership/my-subscription
   * @returns {Promise<Object|null>}
   */
  async getMySubscription() {
    if (mySubscriptionPromise) {  
      return mySubscriptionPromise;
    }

    mySubscriptionPromise = (async () => {
      try {
        const res = await apiFetch("/membership/my-subscription", { method: "GET" });
        if (res && res.ok) {
          const json = await res.json().catch(() => ({}));
          const sub =
            json?.data?.subscription ||
            json?.data?.membership ||
            json?.data?.plan ||
            json?.subscription ||
            json?.membership ||
            json?.data;

          if (sub && typeof sub === "object") {
            const isVip =
              json?.data?.isVip ??
              json?.isVip ??
              sub?.isVip ??
              sub?.isVIP ??
              (sub?.status === "active" || sub?.isActive === true);

            return {
              ...sub,
              isVip: Boolean(isVip),
              refundEligibility:
                json?.data?.refundEligibility ||
                sub?.refundEligibility ||
                json?.refundEligibility ||
                null,
              swipesRemainingToday:
                json?.data?.swipesRemainingToday ??
                sub?.swipesRemainingToday ??
                null,
              dailySwipeLimit:
                json?.data?.dailySwipeLimit ??
                sub?.perks?.dailySwipeLimit ??
                50,
              swipesUsedToday:
                json?.data?.swipesUsedToday ??
                sub?.swipesUsedToday ??
                0,
            };
          }
        }
      } catch (err) {
        console.warn("[membershipService] getMySubscription error:", err);
      } finally {
        mySubscriptionPromise = null;
      }
      return null;
    })();

    return mySubscriptionPromise;
  },

  /**
   * Fetch complete membership details including daily swipe limit and remaining balance
   * GET /membership/details
   * @returns {Promise<Object|null>}
   */
  async getMembershipDetails() {
    try {
      const res = await apiFetch("/membership/details", { method: "GET" });
      if (res && res.ok) {
        const json = await res.json().catch(() => ({}));
        return json?.data || json;
      }
    } catch (err) {
      console.warn("[membershipService] getMembershipDetails error:", err);
    }
    return null;
  },

  /**
   * Alias for backward compatibility
   */
  async getMyMembership() {
    return this.getMySubscription();
  },

  /**
   * Create Razorpay order for subscription or addon checkout
   * POST /membership/create-order
   * @param {Object} payload - { type, plan, planId, slug, addon, addonId, addonSlug, billingCycle, customerPhone, customerName, customerEmail }
   * @returns {Promise<Object>}
   */
  async createOrder({
    type = "subscription",
    plan,
    planId,
    slug,
    addon,
    addonId,
    addonSlug,
    billingCycle = "annual",
    customerPhone,
    customerName,
    customerEmail,
  } = {}) {
    const isAddonOrder =
      type?.toLowerCase() === "addon" ||
      type?.toLowerCase() === "addons" ||
      Boolean(addon || addonId || addonSlug);

    const chosenPlan = plan || slug || planId;
    const chosenAddon = addon || addonSlug || addonId || (isAddonOrder ? chosenPlan : null);
    const cycle = billingCycle === "yearly" ? "annual" : billingCycle || "annual";

    const body = {
      type: isAddonOrder ? "addon" : "subscription",
      paymentMethod: "Razorpay",
      customerPhone,
      customerName,
      customerEmail,
    };

    if (isAddonOrder) {
      body.addon = chosenAddon;
      // also include plan for fallback compatibility if needed
      body.plan = chosenAddon;
    } else {
      body.plan = chosenPlan || "gold";
      body.billingCycle = cycle;
    }

    const res = await apiFetch("/membership/create-order", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (res && res.ok) {
      const json = await res.json().catch(() => ({}));
      return json?.data || json;
    } else if (res) {
      const errData = await res.json().catch(() => ({}));
      const validationMsg =
        Array.isArray(errData?.errors) && errData.errors.length > 0
          ? errData.errors.map((e) => e.message).join(", ")
          : null;
      throw new Error(validationMsg || errData?.message || `Order creation failed (${res.status})`);
    }

    throw new Error("Failed to initialize payment order. Please try again.");
  },

  /**
   * Verify Razorpay payment signature & status with backend
   * POST /membership/verify-payment
   * @param {Object} paymentData - { type, addon, plan, billingCycle, razorpay_order_id, razorpay_payment_id, razorpay_signature }
   * @returns {Promise<Object>}
   */
  async verifyPayment(paymentData) {
    const isAddonPayment =
      paymentData.type === "addon" ||
      paymentData.type === "addons" ||
      Boolean(paymentData.addon || paymentData.addonId || paymentData.addonSlug);

    const chosenPlan = paymentData.plan || paymentData.slug || paymentData.planId;
    const chosenAddon = paymentData.addon || paymentData.addonSlug || paymentData.addonId;
    const cycle = paymentData.billingCycle === "yearly" ? "annual" : paymentData.billingCycle || "annual";
    const orderId =
      paymentData.razorpay_order_id ||
      paymentData.orderId ||
      paymentData.order_id;
    const paymentId =
      paymentData.razorpay_payment_id ||
      paymentData.paymentId ||
      paymentData.payment_id;
    const signature =
      paymentData.razorpay_signature ||
      paymentData.signature;

    const payload = {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      orderId,
      paymentId,
      signature,
    };

    if (isAddonPayment) {
      payload.type = "addon";
      payload.addon = chosenAddon || chosenPlan;
      if (chosenPlan) payload.plan = chosenPlan;
    } else {
      payload.plan = chosenPlan;
      payload.billingCycle = cycle;
    }

    const res = await apiFetch("/membership/verify-payment", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res && res.ok) {
      const json = await res.json().catch(() => ({}));
      return json?.data || json;
    } else if (res) {
      const errData = await res.json().catch(() => ({}));
      const validationMsg =
        Array.isArray(errData?.errors) && errData.errors.length > 0
          ? errData.errors.map((e) => e.message).join(", ")
          : null;
      throw new Error(validationMsg || errData?.message || `Payment verification failed (${res.status})`);
    }

    throw new Error("Payment verification failed. Please contact support.");
  },

  /**
   * Activate Profile Boost (Consumes 1 Boost credit for 24 hours)
   * POST /membership/activate-boost
   * @returns {Promise<Object>}
   */
  async activateProfileBoost() {
    const res = await apiFetch("/membership/activate-boost", {
      method: "POST",
    });

    if (res && res.ok) {
      const json = await res.json().catch(() => ({}));
      const data = json?.data || json || {};
      return {
        ...data,
        message: json?.message || data?.message || "Profile Boost activated successfully! You are now top profile in your area for 24 hours.",
      };
    } else if (res) {
      const errData = await res.json().catch(() => ({}));
      const errorMsg =
        errData?.message ||
        (Array.isArray(errData?.errors) && errData.errors[0]?.message) ||
        `Failed to activate boost (${res.status})`;
      throw new Error(errorMsg);
    }

    throw new Error("Failed to activate boost. Please try again.");
  },

  /**
   * Cancel active subscription
   * POST /membership/cancel
   * @param {Object} options - { reason }
   * @returns {Promise<Object>}
   */
  async cancelSubscription(options = {}) {
    const res = await apiFetch("/membership/cancel", {
      method: "POST",
      body: JSON.stringify(options),
    });

    if (res && res.ok) {
      const json = await res.json().catch(() => ({}));
      return json?.data || json;
    } else if (res) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.message || `Cancellation failed (${res.status})`);
    }

    throw new Error("Failed to cancel subscription.");
  },

  /**
   * Helper to load Razorpay checkout SDK dynamically
   * @returns {Promise<boolean>}
   */
  loadRazorpayScript() {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);

      const existing = document.getElementById("razorpay-sdk-script");
      if (existing) {
        existing.addEventListener("load", () => resolve(true));
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-sdk-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  /**
   * Fallback aliases
   */
  loadCashfreeScript() {
    return this.loadRazorpayScript();
  },
};

export default membershipService;

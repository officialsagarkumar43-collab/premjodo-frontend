import { apiFetch } from "./apiClient";

export const TICKET_CATEGORIES = [
  {
    key: "general_support",
    label: "General Support",
    description: "Account, features & app feedback",
  },
  {
    key: "subscriptions_payments",
    label: "Subscriptions & Payments",
    description: "Plus, Gold, Platinum billing & refunds",
  },
  {
    key: "safety_reporting",
    label: "Safety & Reporting an Account",
    description: "Harassment, fake profiles & safety issues",
  },
  {
    key: "selfie_verification",
    label: "Selfie Verification Issue",
    description: "Blue badge & face scan assistance",
  },
];

export const ticketService = {
  /**
   * Fetch ticket categories from API with fallback to static categories
   * GET /tickets/categories
   */
  async getCategories() {
    try {
      const res = await apiFetch("/tickets/categories", { method: "GET" });
      if (res && res.ok) {
        const json = await res.json().catch(() => ({}));
        const data = json?.data || json?.categories || json;
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item) => {
            if (typeof item === "string") {
              const matched = TICKET_CATEGORIES.find((c) => c.key === item);
              return matched || { key: item, label: item, description: "" };
            }
            return {
              key: item.key || item.id || item.value,
              label: item.label || item.name || item.title || item.key,
              description: item.description || item.desc || "",
            };
          });
        }
      }
    } catch (err) {
      console.warn("[ticketService] getCategories failed, using fallback:", err);
    }
    return TICKET_CATEGORIES;
  },

  /**
   * Create a support ticket for registered or guest users
   * POST /tickets
   * @param {Object} data Ticket details
   * @param {boolean} [isGuest=false] Whether the submission is from an unauthenticated user
   */
  async createTicket(data, isGuest = false) {
    const isGuestUser = Boolean(isGuest);

    const desc = (data.description || data.message || "").trim();
    if (!desc) {
      throw new Error("Please enter a description for your ticket.");
    }

    // Auto-generate subject from first line of description if subject is omitted
    const autoSubject =
      data.subject?.trim() ||
      desc.split("\n")[0].trim().slice(0, 80) ||
      "Support Request";

    const payload = {
      category: data.category || "general_support",
      subject: autoSubject,
      description: desc,
      priority: data.priority || "medium",
      attachments: Array.isArray(data.attachments) ? data.attachments : [],
    };

    if (isGuestUser) {
      if (!data.name || !String(data.name).trim()) {
        throw new Error("Name is mandatory for guest ticket submission.");
      }
      if (!data.email || !String(data.email).trim()) {
        throw new Error("Email is mandatory for guest ticket submission.");
      }
      payload.name = String(data.name).trim();
      payload.email = String(data.email).trim();
      if (data.phone) {
        payload.phone = String(data.phone).trim();
      }
    } else {
      // For logged in user, optionally send info if available
      if (data.name) payload.name = String(data.name).trim();
      if (data.email) payload.email = String(data.email).trim();
      if (data.phone) payload.phone = String(data.phone).trim();
    }

    const res = await apiFetch("/tickets", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: isGuestUser,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg =
        json?.message ||
        json?.error ||
        `Failed to submit ticket (${res.status})`;
      throw new Error(errMsg);
    }

    return json?.data || json;
  },
};

export default ticketService;


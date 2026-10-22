import SubscriptionsClient from "./SubscriptionsClient";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://prem-jodo-backend.onrender.com/api/v1";

const defaultBillingCycles = [
  { id: "monthly", label: "Monthly Billing", discount: null },
  { id: "annual", label: "Annual Billing", discount: "SAVE 33%" },
];

/**
 * Server-Side Data Fetching for Membership Plans (Direct from API)
 */
async function getInitialPlansData() {
  try {
    const url = `${API_BASE_URL.replace(/\/+$/, "")}/membership/plans`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 }, // Revalidate cache every 60 seconds (SSR / ISR)
    });

    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      const data = json?.data || json;
      const plans =
        (Array.isArray(data?.plans) ? data.plans : null) ||
        (Array.isArray(data) ? data : null) ||
        (Array.isArray(json?.plans) ? json.plans : []) ||
        [];
      const billingCycles = Array.isArray(data?.billingCycles)
        ? data.billingCycles
        : defaultBillingCycles;

      return {
        plans,
        billingCycles,
      };
    }
  } catch (err) {
    console.warn("[SSR getInitialPlansData] Failed to fetch plans on server:", err);
  }

  return {
    plans: [],
    billingCycles: defaultBillingCycles,
  };
}

export default async function SubscriptionsPage() {
  const { plans, billingCycles } = await getInitialPlansData();

  return (
    <SubscriptionsClient
      initialPlans={plans}
      initialBillingCycles={billingCycles}
    />
  );
}

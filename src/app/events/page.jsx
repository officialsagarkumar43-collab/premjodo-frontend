"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AuthModal } from "@/components/common/AuthModal";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Ticket,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Filter,
} from "lucide-react";

export default function EventsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("all");
  const [registeredEvent, setRegisteredEvent] = useState(null);

  const openAuth = () => {
    if (isAuthenticated) {
      router.push("/user");
      return;
    }
    setIsAuthOpen(true);
  };

  const events = [
    {
      id: "ev-1",
      city: "mumbai",
      cityName: "Mumbai",
      type: "In-Person Mixer",
      badgeColor: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
      title: "Prem Jodo Sunset Coffee Mixer",
      desc: "An intimate, icebreaker-driven evening for verified singles over artisan pour-overs and board games.",
      location: "Bandra West, Mumbai",
      date: "Saturday, 12 Sept",
      time: "5:30 PM - 8:00 PM",
      spotsLeft: 6,
      price: "Free for Verified Members",
    },
    {
      id: "ev-2",
      city: "bengaluru",
      cityName: "Bengaluru",
      type: "Live Music & Social",
      badgeColor: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
      title: "Indie Acoustic Singles Night",
      desc: "Live indie artist performances with speed-chat rounds and craft drinks in a relaxed garden setup.",
      location: "Indiranagar, Bengaluru",
      date: "Friday, 18 Sept",
      time: "7:30 PM - 10:30 PM",
      spotsLeft: 12,
      price: "₹499 (Includes 1 Drink)",
    },
    {
      id: "ev-3",
      city: "delhi",
      cityName: "Delhi NCR",
      type: "Sip & Paint Singles",
      badgeColor: "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400",
      title: "Canvas & Connections Art Mixer",
      desc: "Collaborative painting sessions paired with singles partner swaps every 15 minutes. No art skills needed!",
      location: "Hauz Khas Village, New Delhi",
      date: "Sunday, 20 Sept",
      time: "4:00 PM - 7:00 PM",
      spotsLeft: 8,
      price: "₹799 (Includes Canvas & Supplies)",
    },
    {
      id: "ev-4",
      city: "virtual",
      cityName: "Virtual",
      type: "Online Speed Networking",
      badgeColor: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
      title: "Nationwide 3-Minute Vibe Checks",
      desc: "Join rapid 3-minute 1-on-1 video rounds from the comfort of your couch. Match only if you both say yes.",
      location: "Prem Jodo In-App Video Lounge",
      date: "Every Wednesday",
      time: "9:00 PM - 10:00 PM",
      spotsLeft: 25,
      price: "Free for Gold & Platinum",
    },
  ];

  const filteredEvents =
    selectedCity === "all"
      ? events
      : events.filter((e) => e.city === selectedCity);

  const handleRegister = (ev) => {
    setRegisteredEvent(ev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar onOpenAuth={openAuth} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 sm:py-24 px-4 text-center overflow-hidden bg-gradient-to-b from-rose-50/70 via-white to-white dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl poppins-black tracking-tight text-zinc-900 dark:text-white">
              {t("eventsPage.titlePrefix")}
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
                {t("eventsPage.titleHighlight")}
              </span>
            </h1>
            <p className="text-base sm:text-lg poppins-regular text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              {t("eventsPage.subtitle")}
            </p>

            {/* City Filters */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
              {[
                { key: "all", label: t("eventsPage.allEvents") },
                { key: "mumbai", label: "Mumbai" },
                { key: "delhi", label: "Delhi NCR" },
                { key: "bengaluru", label: "Bengaluru" },
                { key: "virtual", label: "Virtual Lounge" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedCity(filter.key)}
                  className={`px-4 py-2 rounded-full text-xs poppins-bold transition-all cursor-pointer ${
                    selectedCity === filter.key
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-rose-400 dark:hover:border-rose-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-[11px] poppins-bold uppercase px-3 py-1 rounded-full ${ev.badgeColor}`}
                    >
                      {ev.type}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {ev.spotsLeft} {t("eventsPage.spotsLeft")}
                    </span>
                  </div>

                  <h3 className="text-xl poppins-black text-zinc-900 dark:text-white mb-2">
                    {ev.title}
                  </h3>
                  <p className="text-xs sm:text-sm poppins-regular text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                    {ev.desc}
                  </p>

                  <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">{ev.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                      <span>{ev.date} • {ev.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="font-semibold text-zinc-900 dark:text-white">{ev.price}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRegister(ev)}
                  className="w-full py-3.5 rounded-2xl text-xs poppins-bold text-white bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 hover:opacity-95 shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
                >
                  {t("eventsPage.reserveBtn")}
                </button>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* RSVP Confirmation Modal */}
        {registeredEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl text-center space-y-4 border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl poppins-black text-zinc-900 dark:text-white">
                {t("eventsPage.rsvpSuccess")} ({registeredEvent.title})
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                We have added you to the guestlist for <strong>{registeredEvent.date}</strong> in <strong>{registeredEvent.cityName}</strong>. Complete your free member profile to receive your QR entry ticket.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setRegisteredEvent(null);
                    openAuth();
                  }}
                  className="flex-1 py-3 rounded-xl text-xs poppins-bold text-white bg-rose-600 hover:bg-rose-700"
                >
                  {t("eventsPage.completeProfile")}
                </button>
                <button
                  onClick={() => setRegisteredEvent(null)}
                  className="px-4 py-3 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="register"
      />
    </div>
  );
}

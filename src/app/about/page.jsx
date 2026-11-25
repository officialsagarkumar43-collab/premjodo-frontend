"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useAuth } from "@/context/AuthContext";

const AuthModal = dynamic(
  () => import("@/components/common/AuthModal").then((m) => m.AuthModal),
  { ssr: false }
);

export default function AboutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const openAuth = () => {
    if (isAuthenticated) {
      router.push("/user");
      return;
    }
    setIsAuthOpen(true);
  };

  return (
    <div className="about-page-root min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar onOpenAuth={openAuth} />

      <main className="flex-1">
        <section className="pagehead">
          <div className="wrap">
            <span className="pill">OUR STORY</span>
            <h1>We believe connection should feel human.</h1>
            <p>
              Prem Jodo is built around a simple idea: dating can be more thoughtful when people feel seen, respected and in control.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap split">
            <div
              className="mock-photo"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=85')",
              }}
            />
            <div>
              <div className="eyebrow">Our philosophy</div>
              <h2 style={{ font: "700 38px/1.2 'Playfair Display', Georgia, serif", margin: "14px 0", color: "var(--ink)" }}>
                Less pressure. More possibility.
              </h2>
              <p className="lead" style={{ marginBottom: "24px" }}>
                We want to create space for genuine introductions, honest conversations and connections that grow at a pace that feels right.
              </p>
              <Link className="btn" href="/product">
                Explore the experience →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          defaultMode="register"
        />
      )}
    </div>
  );
}

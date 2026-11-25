"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { FooterWordmark } from "./FooterWordmark";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageModal } from "./LanguageModal";
import { LanguageIcon } from "./LanguageIcon";
import "@/style/footer.css";

export function Footer() {
  const { t, language, supportedLanguages } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const currentLangObj = useMemo(() => {
    return (
      supportedLanguages?.find((l) => l.code === language) ||
      supportedLanguages?.[0] || { code: "en", name: "English", nativeName: "English" }
    );
  }, [supportedLanguages, language]);

  return (
    <>
      <footer className="site-footer">
        <div className="wrap">
          <div className="footgrid">
            {/* Brand Info */}
            <div>
              <div style={{ marginBottom: "14px" }}>
                <Logo size="sm" variant="dark" />
              </div>
              <p style={{ color: "#ffffff", opacity: 0.92, fontSize: "14px", lineHeight: "1.7", maxWidth: "340px", margin: 0 }}>
                {t("footer.tagline", "Make room for meaningful connections. Meet people with intention, confidence and care.")}
              </p>
            </div>

            {/* Explore */}
            <div>
              <h4 style={{ color: "#ffffff", fontSize: "15px", fontWeight: "700", marginTop: 0, marginBottom: "14px" }}>
                Explore
              </h4>
              <Link href="/product" className="foot-link">
                {t("nav.howItWorks", "How it works")}
              </Link>
              <Link href="/subscriptions" className="foot-link">
                {t("nav.membership", "Membership")}
              </Link>
              <Link href="/download" className="foot-link">
                {t("nav.download", "Get the app")}
              </Link>
            </div>

            {/* Your Safety */}
            <div>
              <h4 style={{ color: "#ffffff", fontSize: "15px", fontWeight: "700", marginTop: 0, marginBottom: "14px" }}>
                Your safety
              </h4>
              <Link href="/safety" className="foot-link">
                {t("nav.safety", "Safety centre")}
              </Link>
              <Link href="/support" className="foot-link">
                {t("nav.support", "Help & support")}
              </Link>
              <Link href="/privacy" className="foot-link">
                Privacy
              </Link>
            </div>

            {/* Company */}
            <div>
              <h4 style={{ color: "#ffffff", fontSize: "15px", fontWeight: "700", marginTop: 0, marginBottom: "14px" }}>
                Company
              </h4>
              <Link href="/about" className="foot-link">
                About us
              </Link>
              <Link href="/contact-us" className="foot-link">
                Contact
              </Link>
              <Link href="/terms" className="foot-link">
                Terms
              </Link>
              <Link href="/refunds" className="foot-link">
                Refunds policy
              </Link>
            </div>
          </div>

          {/* Bottom Copyright & Language Row */}
          <div className="copyright-row">
            <div className="copyright">
              © {new Date().getFullYear()} Prem Jodo. All rights reserved.
            </div>

            <button
              type="button"
              onClick={() => setIsLangOpen(true)}
              className="footer-lang-btn-preview"
              title="Change Language"
            >
              <LanguageIcon
                code={language}
                symbol={currentLangObj?.symbol}
                size="xs"
              />
              <span>
                {currentLangObj?.nativeName || currentLangObj?.name || "English"}
              </span>
            </button>
          </div>
        </div>

        {/* Tinder-style Giant All-Caps SVG Wordmark Banner (Individual Vector Paths) */}
        <FooterWordmark />
      </footer>

      <LanguageModal
        isOpen={isLangOpen}
        onClose={() => setIsLangOpen(false)}
      />
    </>
  );
}

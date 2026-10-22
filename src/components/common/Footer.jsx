"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
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
        <div className="footer-container">
          <div className="footer-grid">
            {/* Brand Info */}
            <div className="footer-col-brand">
              <Logo size="sm" />
              <p className="footer-tagline">
                {t("footer.tagline") ||
                  "Prem Jodo — Connecting verified individuals with trust, transparency, and respect."}
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer-col footer-col-platform">
              <h4 className="footer-heading">Platform</h4>
              <div className="footer-links-list">
                <Link href="/user" className="footer-link">
                  {t("footer.discover") || "Discover Singles"}
                </Link>
                <Link href="/user/matches" className="footer-link">
                  {t("footer.matches") || "Matches & Chats"}
                </Link>
                <Link href="/subscriptions" className="footer-link">
                  {t("footer.subscriptions") || "VIP Subscriptions"}
                </Link>
                <Link href="/safety-tips" className="footer-link">
                  {t("footer.safetyTips") || "Safety Tips & Rules"}
                </Link>
              </div>
            </div>

            {/* Legal & Compliance */}
            <div className="footer-col footer-col-legal">
              <h4 className="footer-heading">Legal & Policies</h4>
              <div className="footer-links-list">
                <Link href="/terms" className="footer-link">
                  {t("footer.terms") || "Terms & Conditions"}
                </Link>
                <Link href="/privacy" className="footer-link">
                  {t("footer.privacy") || "Privacy Policy"}
                </Link>
                <Link href="/refund-policy" className="footer-link">
                  {t("footer.refundPolicy") || "Cancellation & Refund Policy"}
                </Link>
                <Link href="/contact-us" className="footer-link">
                  {t("footer.contactUs") || "Contact Us"}
                </Link>
              </div>
            </div>

            {/* Customer Care / Support */}
            <div className="footer-col footer-col-support">
              <h4 className="footer-heading">Support</h4>
              <div className="footer-links-list">
                <Link href="/support" className="footer-link">
                  {t("footer.support") || "Help Center & FAQs"}
                </Link>
                <Link href="/contact-us" className="footer-link">
                  Grievance Officer
                </Link>
                <span className="footer-support-time">
                  Mon - Sat: 9 AM - 7 PM IST
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <p className="footer-copyright">
              {t("footer.copyright") || "Prem Jodo Official Platform ©"}{" "}
              {new Date().getFullYear()} Prem Jodo. All rights reserved.
            </p>
            <div className="footer-bottom-actions">
              <button
                type="button"
                onClick={() => setIsLangOpen(true)}
                className="footer-lang-btn"
                title="Change Language"
              >
                <LanguageIcon
                  code={language}
                  symbol={currentLangObj?.symbol}
                  size="xs"
                  className="footer-lang-icon"
                />
                <span>
                  {currentLangObj?.nativeName || currentLangObj?.name || "English"}
                </span>
              </button>

              <div className="footer-bottom-links">
                <Link href="/terms" className="footer-bottom-link">
                  Terms
                </Link>
                <span className="footer-dot">•</span>
                <Link href="/privacy" className="footer-bottom-link">
                  Privacy
                </Link>
                <span className="footer-dot">•</span>
                <Link href="/refund-policy" className="footer-bottom-link">
                  Refunds
                </Link>
                <span className="footer-dot">•</span>
                <Link href="/contact-us" className="footer-bottom-link">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <LanguageModal
        isOpen={isLangOpen}
        onClose={() => setIsLangOpen(false)}
      />
    </>
  );
}

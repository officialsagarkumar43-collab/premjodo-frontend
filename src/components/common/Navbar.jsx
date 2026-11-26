"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import {
  Menu,
  X,
  Sparkles,
  CreditCard,
  ShieldCheck,
  HelpCircle,
  Download,
  ChevronRight,
  ChevronDown,
  User,
  HeartHandshake,
  MessageCircle,
  MessageSquareText,
  LogOut,
  Crown,
  ShoppingBag,
  Film,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { AuthModal } from "./AuthModal";
import { LanguageModal } from "./LanguageModal";
import { LanguageIcon } from "./LanguageIcon";
import { ThemeToggle } from "./ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { extractPrimaryPhoto } from "@/lib/utility/imageUrl";
import authService from "@/lib/services/auth.service";
import "@/style/header.css";

// Persistent indicator coordinates across route switches
let globalNavIndicatorPos = { left: 0, width: 0, opacity: 0, initialized: false };

export function Navbar({ onOpenAuth }) {
  const pathname = usePathname();
  const { t, language, supportedLanguages } = useLanguage();
  const { user, profile, subscription, isAuthenticated, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const accountMenuRef = useRef(null);
  const navContainerRef = useRef(null);
  const itemRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState(() => ({ ...globalNavIndicatorPos }));
  const [authTicker, setAuthTicker] = useState(0);

  useEffect(() => {
    setImgError(false);
  }, [pathname, user, profile, authTicker]);

  useEffect(() => {
    const handleAuthUpdated = () => setAuthTicker((v) => v + 1);
    window.addEventListener("pj-auth-changed", handleAuthUpdated);
    window.addEventListener("storage", handleAuthUpdated);
    return () => {
      window.removeEventListener("pj-auth-changed", handleAuthUpdated);
      window.removeEventListener("storage", handleAuthUpdated);
    };
  }, []);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    };
    if (isAccountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  // Prevent background scrolling when mobile sidebar is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const currentLangObj = useMemo(() => {
    return (
      supportedLanguages?.find((l) => l.code === language) ||
      supportedLanguages?.[0] || { code: "en", name: "English", symbol: "En" }
    );
  }, [supportedLanguages, language]);

  const handleOpenLogin = () => {
    setIsMobileMenuOpen(false);
    if (onOpenAuth) {
      onOpenAuth("login");
    } else {
      setIsAuthOpen(true);
    }
  };

  // Memoized user and profile data to avoid heavy recalculations on render
  const { storedU, storedP } = useMemo(() => {
    if (typeof window === "undefined") return { storedU: {}, storedP: {} };
    return {
      storedU: authService?.getUser?.() || {},
      storedP: authService?.getProfile?.() || {},
    };
  }, [authTicker]);

  const activeUser = useMemo(() => ({ ...storedU, ...(user || {}) }), [storedU, user]);
  const activeProfile = useMemo(() => ({ ...storedP, ...(profile || {}) }), [storedP, profile]);

  const displayName = useMemo(() => {
    return (
      activeProfile?.fullName ||
      activeProfile?.firstName ||
      activeUser?.fullName ||
      activeUser?.firstName ||
      activeUser?.name ||
      profile?.fullName ||
      profile?.firstName ||
      user?.fullName ||
      user?.firstName ||
      user?.name ||
      (activeUser?.email ? activeUser.email.split("@")[0] : user?.email ? user.email.split("@")[0] : "My Account")
    );
  }, [activeProfile, activeUser, profile, user]);

  const hasVipBadge = useMemo(() => {
    const planName = (subscription?.planName || subscription?.name || subscription?.plan?.name || "").toLowerCase();
    const planTier = (subscription?.tier || subscription?.plan?.tier || "").toLowerCase();
    const hasVipFeature = Boolean(
      Array.isArray(subscription?.plan?.features) &&
      subscription.plan.features.some((f) => typeof f === "string" && /vip/i.test(f))
    );

    return Boolean(
      activeUser?.vipBadge ||
      activeProfile?.vipBadge ||
      user?.vipBadge ||
      profile?.vipBadge ||
      storedU?.vipBadge ||
      storedP?.vipBadge ||
      activeUser?.isVip ||
      activeProfile?.isVip ||
      user?.isVip ||
      profile?.isVip ||
      storedU?.isVip ||
      storedP?.isVip ||
      activeUser?.isVIP ||
      activeProfile?.isVIP ||
      subscription?.vipBadge ||
      subscription?.isVip ||
      hasVipFeature ||
      planName.includes("platinum") ||
      planName.includes("vip") ||
      planTier.includes("platinum") ||
      planTier.includes("vip") ||
      (subscription?.status === "active" && !planName.includes("free")) ||
      (subscription?.isActive && !planName.includes("free"))
    );
  }, [activeUser, activeProfile, user, profile, storedU, storedP, subscription]);

  const userPhoto = useMemo(() => {
    return extractPrimaryPhoto(
      {
        profile,
        user,
        ...(profile || {}),
        ...(user || {}),
      },
      ""
    );
  }, [profile, user]);

  const userEmail = user?.email || profile?.email || "";
  const initials = useMemo(() => (displayName || "U").trim().charAt(0).toUpperCase(), [displayName]);

  const isPathActive = useCallback((href) => {
    if (!pathname) return false;
    const normCurrent = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
    const normHref = href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;

    if (normHref === "/") {
      return normCurrent === "/";
    }
    return normCurrent === normHref || normCurrent.startsWith(normHref + "/");
  }, [pathname]);

  const navItems = useMemo(() => [
    { key: "home", href: "/", label: t("nav.home", "Home"), icon: Sparkles },
    { key: "product", href: "/product", label: t("nav.howItWorks", "How it works"), icon: Sparkles },
    { key: "safety", href: "/safety", label: t("nav.safety", "Safety"), icon: ShieldCheck },
    { key: "subscriptions", href: "/subscriptions", label: t("nav.membership", "Membership"), icon: CreditCard },
    { key: "support", href: "/support", label: t("nav.support", "Support"), icon: HelpCircle },
    { key: "download", href: "/download", label: t("nav.download", "Download"), icon: Download },
  ], [t]);

  const mobileNavItems = useMemo(() => [
    { key: "home", href: "/", label: t("nav.home", "Home"), icon: Sparkles },
    { key: "product", href: "/product", label: t("nav.howItWorks", "How it works"), icon: Sparkles },
    { key: "safety", href: "/safety", label: t("nav.safety", "Safety"), icon: ShieldCheck },
    { key: "subscriptions", href: "/subscriptions", label: t("nav.membership", "Membership"), icon: CreditCard },
    { key: "support", href: "/support", label: t("nav.support", "Support"), icon: HelpCircle },
    { key: "download", href: "/download", label: t("nav.download", "Download"), icon: Download },
  ], [t]);

  // Non-blocking indicator updater using requestAnimationFrame to prevent forced reflows during page switch
  const updateIndicator = useCallback(() => {
    if (typeof window === "undefined") return;

    window.requestAnimationFrame(() => {
      const activeItem = navItems.find((item) => isPathActive(item.href));
      const activeKey = activeItem ? activeItem.key : null;

      const el = activeKey ? itemRefs.current[activeKey] : null;
      const navEl = navContainerRef.current;

      if (el && navEl) {
        const elRect = el.getBoundingClientRect();
        const navRect = navEl.getBoundingClientRect();

        const newPos = {
          left: elRect.left - navRect.left,
          width: elRect.width,
          opacity: 1,
          initialized: true,
        };

        globalNavIndicatorPos = newPos;
        setIndicatorStyle(newPos);
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    });
  }, [navItems, isPathActive]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator, { passive: true });
    return () => {
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  return (
    <>
      <header className="site-header">
        <div className="header-container">
          {/* Logo */}
          <div className="header-brand">
            <Logo size="md" />
          </div>

          {/* Desktop Center Navigation Links */}
          <nav ref={navContainerRef} className="header-nav">
            {navItems.map((item) => {
              const isActive = isPathActive(item.href);

              return (
                <Link
                  key={item.key}
                  ref={(el) => {
                    if (el) itemRefs.current[item.key] = el;
                  }}
                  href={item.href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  <span>{item.label}</span>
                  <span className="nav-link-indicator-fallback" />
                </Link>
              );
            })}

            {/* Desktop Sliding Smooth Active Indicator */}
            <span
              className="nav-indicator-slider"
              style={{
                transform: `translateX(${indicatorStyle.left}px)`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
            />
          </nav>

          {/* Right Actions */}
          <div className="header-actions">
            {/* Theme Switcher (Dark / White Mode) - Desktop Only */}
            <div className="header-theme-toggle">
              <ThemeToggle />
            </div>

            {/* Random 1v1 Text Chat Shortcut - Desktop Only (After Mode Switch) */}
            <Link
              href="/text-chat"
              className={`header-chat-btn ${
                pathname === "/text-chat" || pathname === "/guest-chat" ? "active" : ""
              }`}
              title="Random 1v1 Text Chat"
              aria-label="Random 1v1 Text Chat"
            >
              <MessageSquareText className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 hover:scale-110" />
            </Link>

            {/* If Authenticated: My Account Dropdown / Icon */}
            {isAuthenticated ? (
              <div className="account-wrapper" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  className="header-avatar-btn"
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="true"
                  title="My Account"
                >
                  {userPhoto && !imgError ? (
                    <img
                      src={userPhoto}
                      alt={displayName}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className="header-avatar-img"
                    />
                  ) : (
                    <div className="header-avatar-fallback">
                      {initials}
                    </div>
                  )}
                </button>

                {/* Account Dropdown Menu */}
                {isAccountMenuOpen && (
                  <div className="account-dropdown-panel">
                    <div className="account-header-info">
                      <div className="account-name-row">
                        <p className="account-user-name">{displayName}</p>
                        {hasVipBadge && (
                          <span className="vip-pill">👑 VIP</span>
                        )}
                      </div>
                      {userEmail && (
                        <p className="account-user-email">{userEmail}</p>
                      )}
                    </div>

                    {/* Active Membership Widget */}
                    <div className="account-membership-card">
                      <div className="account-membership-left">
                        <div className="account-crown-box">
                          <Crown style={{ width: "1rem", height: "1rem" }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="account-membership-label">
                            Membership {hasVipBadge ? "• VIP" : ""}
                          </div>
                          <div className="account-membership-title">
                            {subscription?.planName || subscription?.name || (hasVipBadge ? "VIP Member" : "Free Member")}
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/subscriptions"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="account-upgrade-btn"
                      >
                        {subscription?.plan && subscription.plan !== "free" ? "Manage" : "Upgrade"}
                      </Link>
                    </div>

                    {/* Menu links */}
                    <div className="account-menu-list">
                      <Link
                        href="/user"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="account-menu-item"
                      >
                        <HeartHandshake style={{ width: "1rem", height: "1rem", color: "#f43f5e" }} />
                        <span>Discover Matches</span>
                      </Link>
                      <Link
                        href="/user/matches"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="account-menu-item"
                      >
                        <MessageCircle style={{ width: "1rem", height: "1rem", color: "#ec4899" }} />
                        <span>Matches & Chats</span>
                      </Link>
                      <Link
                        href="/subscriptions"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="account-menu-item"
                      >
                        <CreditCard style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />
                        <span>VIP Subscriptions</span>
                      </Link>
                      <Link
                        href="/user/profile"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="account-menu-item"
                      >
                        <User style={{ width: "1rem", height: "1rem", color: "#a855f7" }} />
                        <span>My Profile & Settings</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsLangOpen(true);
                        }}
                        className="account-menu-item"
                        style={{ justifyContent: "space-between" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <Globe style={{ width: "1rem", height: "1rem", color: "#6366f1" }} />
                          <span>Language ({currentLangObj?.nativeName || currentLangObj?.name || "English"})</span>
                        </div>
                        <LanguageIcon code={language} symbol={currentLangObj?.symbol} size="xs" />
                      </button>
                    </div>

                    <div className="account-footer-actions">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsAccountMenuOpen(false);
                          await logout();
                        }}
                        className="account-logout-btn"
                      >
                        <LogOut style={{ width: "1rem", height: "1rem" }} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop Join Prem Jodo Button */
              <button onClick={handleOpenLogin} className="btn btn-header-login">
                {t("nav.joinPremJodo", "Join Prem Jodo")}
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="header-hamburger-btn"
              aria-label="Open navigation menu"
            >
              <Menu style={{ width: "1.5rem", height: "1.5rem" }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Drawer from Left Side */}
      <div className={`mobile-drawer-root ${isMobileMenuOpen ? "open" : ""}`}>
        {/* Backdrop overlay */}
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="mobile-drawer-overlay"
          aria-hidden="true"
        />

        {/* Drawer Sidebar sliding from Left */}
        <aside className="mobile-drawer-panel">
          {/* Top Header inside Drawer */}
          <div className="mobile-drawer-header">
            <Logo size="sm" />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mobile-drawer-close-btn"
              aria-label="Close navigation menu"
            >
              <X style={{ width: "1.125rem", height: "1.125rem" }} />
            </button>
          </div>

          {/* User profile card in drawer if authenticated */}
          {isAuthenticated && (
            <div className="mobile-drawer-user">
              {userPhoto && !imgError ? (
                <img
                  src={userPhoto}
                  alt={displayName}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="mobile-user-img"
                />
              ) : (
                <div className="mobile-user-fallback">
                  {initials}
                </div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="mobile-user-name">{displayName}</p>
                {userEmail && <p className="mobile-user-email">{userEmail}</p>}
              </div>
            </div>
          )}

          {/* Nav Items List (Chitchat Clean Style) */}
          <div className="mobile-drawer-body">
            {isAuthenticated && (
              <div className="mobile-auth-quick-links">
                <Link
                  href="/user"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-nav-item"
                >
                  <div className="mobile-nav-left">
                    <HeartHandshake className="mobile-nav-icon" style={{ width: "1.15rem", height: "1.15rem" }} />
                    <span className="mobile-nav-title">Discover Matches</span>
                  </div>
                </Link>
                <Link
                  href="/user/matches"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-nav-item"
                >
                  <div className="mobile-nav-left">
                    <MessageCircle className="mobile-nav-icon" style={{ width: "1.15rem", height: "1.15rem" }} />
                    <span className="mobile-nav-title">Matches & Chats</span>
                  </div>
                </Link>
                <Link
                  href="/user/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-nav-item"
                >
                  <div className="mobile-nav-left">
                    <User className="mobile-nav-icon" style={{ width: "1.15rem", height: "1.15rem" }} />
                    <span className="mobile-nav-title">My Profile</span>
                  </div>
                </Link>
              </div>
            )}

            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isPathActive(item.href);
              const isSoon = item.isSoon;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`mobile-nav-item ${isActive ? "active" : ""}`}
                >
                  <div className="mobile-nav-left">
                    <Icon className="mobile-nav-icon" style={{ width: "1.15rem", height: "1.15rem" }} />
                    <span className="mobile-nav-title">{item.label}</span>
                  </div>
                  {isSoon && <span className="badge-soon">Soon</span>}
                </Link>
              );
            })}
          </div>

          {/* Drawer Footer with Chitchat Style CTAs */}
          <div className="mobile-drawer-footer">
            <div className="mobile-drawer-cta-group">
              <Link
                href="/text-chat"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-drawer-cta-btn mobile-drawer-cta-primary"
              >
                <MessageSquareText style={{ width: "1.125rem", height: "1.125rem" }} />
                <span>Random Text Chat</span>
              </Link>
            </div>

            <div className="mobile-drawer-footer-actions">
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="mobile-footer-pill-btn"
                title="Toggle Theme"
              >
                {resolvedTheme === "dark" ? (
                  <>
                    <Sun style={{ width: "0.9375rem", height: "0.9375rem", color: "#f59e0b" }} />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon style={{ width: "0.9375rem", height: "0.9375rem", color: "#6366f1" }} />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              {/* Language Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLangOpen(true);
                }}
                className="mobile-footer-pill-btn"
                title="Change Language"
              >
                <Globe style={{ width: "0.9375rem", height: "0.9375rem", color: "#ec4899" }} />
                <span>{currentLangObj?.name || "English"}</span>
              </button>
            </div>


            <p className="mobile-footer-brand-tag">
              Prem Jodo • Made with ❤️ in India
            </p>
          </div>
        </aside>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="login"
      />

      {/* Language Selection Modal */}
      <LanguageModal
        isOpen={isLangOpen}
        onClose={() => setIsLangOpen(false)}
      />
    </>
  );
}

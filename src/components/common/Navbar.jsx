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
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const accountMenuRef = useRef(null);
  const servicesMenuRef = useRef(null);
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
      if (servicesMenuRef.current && !servicesMenuRef.current.contains(event.target)) {
        setIsServicesOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
        setIsServicesOpen(false);
      }
    };
    if (isAccountMenuOpen || isServicesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountMenuOpen, isServicesOpen]);

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

  const isServicesActive = useMemo(() => {
    return (
      pathname?.startsWith("/ecommerce") ||
      pathname?.startsWith("/ecommerce-services") ||
      pathname?.startsWith("/movies") ||
      pathname?.startsWith("/movie-booking")
    );
  }, [pathname]);

  const servicesSubItems = useMemo(() => [
    {
      key: "ecommerce",
      href: "/ecommerce",
      label: t("nav.ecommerce") || "Ecommerce Services",
      icon: ShoppingBag,
    },
    {
      key: "movies",
      href: "/movies",
      label: t("nav.movies") || "Movie Booking",
      icon: Film,
    },
  ], [t]);

  const navItems = useMemo(() => [
    { key: "product", href: "/product", label: t("nav.product") || "Product", icon: Sparkles },
    {
      key: "services",
      label: t("nav.services") || "Services",
      isDropdown: true,
      subItems: servicesSubItems,
    },
    { key: "safety", href: "/safety", label: t("nav.safety") || "Safety", icon: ShieldCheck },
    { key: "support", href: "/support", label: t("nav.support") || "Support", icon: HelpCircle },
    { key: "subscriptions", href: "/subscriptions", label: t("nav.subscriptions") || "Subscriptions", icon: CreditCard },
    { key: "download", href: "/download", label: t("nav.download") || "Download", icon: Download },
  ], [t, servicesSubItems]);

  const mobileNavItems = useMemo(() => [
    { key: "product", href: "/product", label: t("nav.product") || "Product", icon: Sparkles },
    { key: "ecommerce", href: "/ecommerce", label: t("nav.ecommerce") || "Ecommerce Services", icon: ShoppingBag, isSoon: true },
    { key: "movies", href: "/movies", label: t("nav.movies") || "Movie Booking", icon: Film, isSoon: true },
    { key: "safety", href: "/safety", label: t("nav.safety") || "Safety", icon: ShieldCheck },
    { key: "support", href: "/support", label: t("nav.support") || "Support", icon: HelpCircle },
    { key: "subscriptions", href: "/subscriptions", label: t("nav.subscriptions") || "Subscriptions", icon: CreditCard },
    { key: "download", href: "/download", label: t("nav.download") || "Download", icon: Download },
  ], [t]);

  // Non-blocking indicator updater using requestAnimationFrame to prevent forced reflows during page switch
  const updateIndicator = useCallback(() => {
    if (typeof window === "undefined") return;

    window.requestAnimationFrame(() => {
      let activeKey = null;
      if (isServicesActive) {
        activeKey = "services";
      } else {
        const activeItem = navItems.find((item) => !item.isDropdown && isPathActive(item.href));
        if (activeItem) activeKey = activeItem.key;
      }

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
  }, [navItems, isServicesActive, isPathActive]);

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
              if (item.isDropdown) {
                return (
                  <div
                    key={item.key}
                    ref={(el) => {
                      if (el) itemRefs.current[item.key] = el;
                    }}
                    className="nav-dropdown-wrapper"
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setIsServicesOpen((prev) => !prev)}
                      className={`nav-dropdown-btn ${isServicesActive ? "active" : ""}`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`nav-dropdown-chevron ${isServicesOpen ? "open" : ""}`} />
                      <span className="nav-link-indicator-fallback" />
                    </button>

                    {/* Services Dropdown Menu */}
                    {isServicesOpen && (
                      <div ref={servicesMenuRef} className="services-dropdown-panel">
                        {item.subItems.map((sub) => {
                          const SubIcon = sub.icon;
                          const isSubActive = isPathActive(sub.href);
                          return (
                            <Link
                              key={sub.key}
                              href={sub.href}
                              onClick={() => setIsServicesOpen(false)}
                              className={`services-dropdown-link ${isSubActive ? "active" : ""}`}
                            >
                              <div className="services-icon-box">
                                <SubIcon style={{ width: "1rem", height: "1rem" }} />
                              </div>
                              <div className="services-item-title">
                                <span>{sub.label}</span>
                                <span className="badge-soon">Soon</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

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
                  {item.label}
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
              /* Desktop Log in Button */
              <button onClick={handleOpenLogin} className="btn-header-login">
                {t("nav.login")}
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
              <X style={{ width: "1.25rem", height: "1.25rem" }} />
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

          {/* Nav Items List */}
          <div className="mobile-drawer-body">
            {isAuthenticated && (
              <div className="mobile-auth-quick-links">
                <Link
                  href="/user"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-nav-item"
                >
                  <div className="mobile-nav-left">
                    <div className="mobile-nav-icon-box">
                      <HeartHandshake style={{ width: "1rem", height: "1rem" }} />
                    </div>
                    <span>Discover Matches</span>
                  </div>
                  <ChevronRight style={{ width: "1rem", height: "1rem", opacity: 0.5 }} />
                </Link>
                <Link
                  href="/user/matches"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-nav-item"
                >
                  <div className="mobile-nav-left">
                    <div className="mobile-nav-icon-box">
                      <MessageCircle style={{ width: "1rem", height: "1rem" }} />
                    </div>
                    <span>Matches & Chats</span>
                  </div>
                  <ChevronRight style={{ width: "1rem", height: "1rem", opacity: 0.5 }} />
                </Link>
                <Link
                  href="/user/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-nav-item"
                >
                  <div className="mobile-nav-left">
                    <div className="mobile-nav-icon-box">
                      <User style={{ width: "1rem", height: "1rem" }} />
                    </div>
                    <span>My Profile</span>
                  </div>
                  <ChevronRight style={{ width: "1rem", height: "1rem", opacity: 0.5 }} />
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
                    <div className="mobile-nav-icon-box">
                      <Icon style={{ width: "1rem", height: "1rem" }} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <div className="mobile-nav-right">
                    {isSoon && <span className="badge-soon">Soon</span>}
                    <ChevronRight style={{ width: "1rem", height: "1rem", opacity: 0.6 }} />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Drawer Footer Actions */}
          <div className="mobile-drawer-footer">
            <div className="mobile-quick-grid">
              {isAuthenticated ? (
                <Link
                  href="/user/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-quick-btn"
                  title="My Account"
                >
                  <div className="mobile-quick-icon">
                    <User style={{ width: "1rem", height: "1rem" }} />
                  </div>
                  <span className="mobile-quick-label">Account</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="mobile-quick-btn"
                  title="Log In"
                >
                  <div className="mobile-quick-icon">
                    <User style={{ width: "1rem", height: "1rem" }} />
                  </div>
                  <span className="mobile-quick-label">Login</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsLangOpen(true)}
                className="mobile-quick-btn"
                title="Change Language"
              >
                <div className="mobile-quick-icon" style={{ backgroundColor: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}>
                  <LanguageIcon code={language} symbol={currentLangObj?.symbol} size="sm" />
                </div>
                <span className="mobile-quick-label">{t("nav.language", "Language")}</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="mobile-quick-btn"
                title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} mode`}
              >
                <div className="mobile-quick-icon" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                  {resolvedTheme === "dark" ? (
                    <Sun style={{ width: "1rem", height: "1rem" }} />
                  ) : (
                    <Moon style={{ width: "1rem", height: "1rem" }} />
                  )}
                </div>
                <span className="mobile-quick-label">
                  {resolvedTheme === "dark" ? "Light" : "Dark"}
                </span>
              </button>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await logout();
                  }}
                  className="mobile-quick-btn"
                  title="Log Out"
                >
                  <div className="mobile-quick-icon">
                    <LogOut style={{ width: "1rem", height: "1rem" }} />
                  </div>
                  <span className="mobile-quick-label">Logout</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="mobile-quick-btn login-btn"
                  title="Sign In"
                >
                  <div className="mobile-quick-icon">
                    <LogOut style={{ width: "1rem", height: "1rem", transform: "rotate(180deg)" }} />
                  </div>
                  <span className="mobile-quick-label">Sign In</span>
                </button>
              )}
            </div>
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

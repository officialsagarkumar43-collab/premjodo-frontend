"use client";

import React, { useState, useEffect } from "react";

export function DocSidebar({ items = [] }) {
  const [activeId, setActiveId] = useState(items[0]?.id || "");

  useEffect(() => {
    if (!items.length) return;

    const handleScroll = () => {
      // Offset for trigger detection while scrolling
      const scrollPosition = window.scrollY + 160;

      for (let i = items.length - 1; i >= 0; i--) {
        const el = document.getElementById(items[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveId(items[i].id);
            return;
          }
        }
      }

      setActiveId(items[0].id);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 95; // navbar height offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setActiveId(id);
    }
  };

  return (
    <>
      {/* Mobile Horizontal Pill Scrollspy */}
      <div className="lg:hidden sticky top-[4rem] z-30 -mx-4 px-4 py-2.5 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 w-max">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => handleLinkClick(e, item.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {item.shortTitle || item.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sticky Sidebar (matching chitchat.gg doc__toc) */}
      <aside className="doc-sidebar hidden lg:block" aria-label="On this page">
        <div className="doc-toc">
          <p className="doc-toc-title">ON THIS PAGE</p>
          <ul className="doc-toc-list">
            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleLinkClick(e, item.id)}
                    className={`doc-toc-link ${isActive ? "active" : ""}`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span>{item.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}

export default DocSidebar;

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";

export function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select an option...",
  disabled = false,
  className = "",
  dropdownClassName = "",
  size = "md",
  name,
  icon: Icon,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options array into { value, label, desc, icon }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string" || typeof opt === "number") {
      return { value: opt, label: String(opt) };
    }
    return {
      value: opt.value,
      label: opt.label || String(opt.value),
      desc: opt.desc,
      icon: opt.icon,
    };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close dropdown on outside click
  const handleOutsideClick = useCallback((e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen, handleOutsideClick]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex((opt) => opt.value === value);
        const nextIndex = (currentIndex + 1) % normalizedOptions.length;
        onChange?.(normalizedOptions[nextIndex].value);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex((opt) => opt.value === value);
        const prevIndex = (currentIndex - 1 + normalizedOptions.length) % normalizedOptions.length;
        onChange?.(normalizedOptions[prevIndex].value);
      }
    }
  };

  const handleSelect = (val) => {
    onChange?.(val);
    setIsOpen(false);
  };

  // Size styling matching standard text inputs
  const sizeClasses = {
    sm: "px-3.5 py-3 text-xs rounded-xl min-h-[38px]",
    md: "px-4 py-3 text-xs rounded-xl min-h-[42px]",
    lg: "px-4 py-3.5 text-sm rounded-xl min-h-[46px]",
  }[size] || "px-4 py-3 text-xs rounded-xl min-h-[42px]";

  return (
    <div
      ref={containerRef}
      className={`relative w-full text-left select-none ${isOpen ? "z-50" : "z-10"} ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Hidden input for HTML form validation & submission */}
      {name && <input type="hidden" name={name} value={value || ""} />}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2.5 bg-white dark:bg-zinc-950 border transition-all duration-200 cursor-pointer shadow-sm ${isOpen
            ? "border-rose-500 ring-2 ring-rose-500/20 shadow-md"
            : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
          } ${sizeClasses} ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {Icon && <Icon className="w-4 h-4 text-zinc-400 shrink-0" />}
          {selectedOption?.icon && (
            <selectedOption.icon className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span
            className={`truncate poppins-medium ${selectedOption
                ? "text-zinc-900 dark:text-white font-medium"
                : "text-zinc-400 dark:text-zinc-500"
              }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-rose-500" : ""
            }`}
        />
      </button>

      {/* Dropdown Menu Popup with distinct gap and spaced items */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 z-[100] mt-2 max-h-60 overflow-y-auto bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 custom-scrollbar space-y-1.5 ${dropdownClassName}`}
        >
          {normalizedOptions.length === 0 ? (
            <div className="py-3 px-4 text-xs text-center text-zinc-400 poppins-medium">
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              const OptIcon = opt.icon;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 text-xs border ${isSelected
                      ? "bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                      : "border-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-950 dark:hover:text-white"
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {OptIcon && (
                      <OptIcon
                        className={`w-4 h-4 shrink-0 ${isSelected ? "text-rose-500" : "text-zinc-400"
                          }`}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="truncate leading-tight poppins-medium">{opt.label}</p>
                      {opt.desc && (
                        <p className={`text-[11px] font-normal truncate mt-0.5 ${isSelected ? "text-rose-500/80 dark:text-rose-400/70" : "text-zinc-400 dark:text-zinc-500"
                          }`}>
                          {opt.desc}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { createContext, useContext, useSyncExternalStore, useCallback, useEffect } from "react";
import { translations, supportedLanguages } from "@/lib/common/translations";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  supportedLanguages,
});

const STORAGE_KEY = "premjodo_lang";
const DYNAMIC_CACHE_KEY = "premjodo_dynamic_translations_v2";

// In-memory cache for dynamic auto-translations
const memoryDynamicCache = {};
const pendingRequests = new Set();
let dynamicVersion = 0;

const getPersistedDynamicCache = () => {
  if (typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(DYNAMIC_CACHE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(memoryDynamicCache, parsed);
    }
  } catch {
    // Storage safety
  }
};

if (typeof window !== "undefined") {
  getPersistedDynamicCache();
}

const subscribeLanguage = (callback) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("premjodo_lang_change", callback);
  window.addEventListener("premjodo_dynamic_trans_update", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("premjodo_lang_change", callback);
    window.removeEventListener("premjodo_dynamic_trans_update", callback);
  };
};

const getLanguageSnapshot = () => {
  if (typeof window === "undefined") return `en:${dynamicVersion}`;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const lang = saved && supportedLanguages.some((l) => l.code === saved) ? saved : "en";
    return `${lang}:${dynamicVersion}`;
  } catch {
    return `en:${dynamicVersion}`;
  }
};

const getServerSnapshot = () => "en:0";

/**
 * Fetch dynamic translation for single or multiple phrases from Google Translate API
 */
const fetchDynamicTranslation = async (text, targetLang) => {
  if (!text || !targetLang || targetLang === "en") return;
  const requestKey = `${targetLang}:::${text}`;
  if (pendingRequests.has(requestKey)) return;
  if (memoryDynamicCache[targetLang]?.[text]) return;

  pendingRequests.add(requestKey);

  try {
    const apiLang = targetLang === "bho" ? "bho" : targetLang === "mai" ? "mai" : targetLang;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${apiLang}&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Translation request failed");

    const data = await res.json();
    let translated = "";
    if (Array.isArray(data?.[0])) {
      translated = data[0].map((item) => item[0]).join("");
    }

    if (translated && typeof translated === "string") {
      if (!memoryDynamicCache[targetLang]) {
        memoryDynamicCache[targetLang] = {};
      }
      memoryDynamicCache[targetLang][text] = translated;

      try {
        localStorage.setItem(DYNAMIC_CACHE_KEY, JSON.stringify(memoryDynamicCache));
      } catch {
        // Storage safety
      }

      dynamicVersion += 1;
      window.dispatchEvent(new Event("premjodo_dynamic_trans_update"));
    }
  } catch (err) {
    console.warn("Dynamic translation error:", text, err);
  } finally {
    pendingRequests.delete(requestKey);
  }
};

/**
 * Extract all leaf string values from the base English translations dictionary
 */
const extractAllEnglishStrings = (obj, acc = []) => {
  if (!obj || typeof obj !== "object") return acc;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === "string") {
      acc.push(val);
    } else if (typeof val === "object") {
      extractAllEnglishStrings(val, acc);
    }
  }
  return acc;
};

export function LanguageProvider({ children }) {
  const snapshot = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerSnapshot
  );

  const language = snapshot.split(":")[0] || "en";

  const setLanguage = (langCode) => {
    try {
      localStorage.setItem(STORAGE_KEY, langCode);
      window.dispatchEvent(new Event("premjodo_lang_change"));
    } catch {
      // Storage safety
    }
  };

  // Pre-translate strings for the chosen non-English language in batches
  useEffect(() => {
    if (language === "en") return;

    const allStrings = extractAllEnglishStrings(translations.en);
    const missingStrings = allStrings.filter(
      (str) => !memoryDynamicCache[language]?.[str]
    );

    if (missingStrings.length === 0) return;

    // Fetch initial batch
    missingStrings.slice(0, 30).forEach((str) => {
      fetchDynamicTranslation(str, language);
    });
  }, [language]);

  /**
   * Helper function for dynamic translation of both keys (e.g. "nav.product") and raw strings ("How are you")
   */
  const t = useCallback(
    (pathOrText, fallback) => {
      if (!pathOrText) return "";
      const query = typeof pathOrText === "string" ? pathOrText.trim() : "";
      if (!query) return "";

      // 1. Resolve base English string
      let englishText = query;
      const keys = query.split(".");
      let current = translations.en;
      for (const k of keys) {
        if (current && current[k] !== undefined) {
          current = current[k];
        } else {
          current = undefined;
          break;
        }
      }

      if (typeof current === "string") {
        englishText = current;
      }

      // If active language is English, return English string directly
      if (language === "en") {
        return englishText || fallback || query;
      }

      // 2. Check if translation exists in dynamic cache
      if (memoryDynamicCache[language]?.[englishText]) {
        return memoryDynamicCache[language][englishText];
      }
      if (memoryDynamicCache[language]?.[query]) {
        return memoryDynamicCache[language][query];
      }

      // 3. Trigger asynchronous background translation
      if (typeof window !== "undefined") {
        fetchDynamicTranslation(englishText, language);
      }

      // Return English text as fallback while fetching
      return fallback || englishText;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        supportedLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

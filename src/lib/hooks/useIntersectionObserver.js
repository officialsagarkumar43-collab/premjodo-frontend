"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight, high-performance Intersection Observer Hook
 * @param {Object} options
 * @param {number|number[]} [options.threshold=0.15] - Intersection ratio threshold
 * @param {string} [options.rootMargin="0px 0px -50px 0px"] - Margin around root
 * @param {boolean} [options.freezeOnceVisible=true] - Stop observing once element is in view
 * @returns {[React.RefObject, boolean]} [elementRef, isIntersecting]
 */
export function useIntersectionObserver({
  threshold = 0.15,
  rootMargin = "0px 0px -50px 0px",
  freezeOnceVisible = true,
} = {}) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = elementRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    if (freezeOnceVisible && isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (freezeOnceVisible) {
            observer.unobserve(node);
            observer.disconnect();
          }
        } else if (!freezeOnceVisible) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, freezeOnceVisible, isVisible]);

  return [elementRef, isVisible];
}

export default useIntersectionObserver;

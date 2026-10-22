import React from "react";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { cn } from "@/lib/common/utils";

export function Logo({ className, size = "md", href = "/" }) {
  const sizeClasses = {
    xs: "text-sm gap-1.5",
    sm: "text-base sm:text-lg gap-1.5 sm:gap-2",
    md: "text-lg sm:text-2xl gap-2 sm:gap-2.5",
    lg: "text-2xl sm:text-4xl gap-2.5 sm:gap-3.5",
  };

  const iconWrapperSizes = {
    xs: "w-6 h-6 rounded-lg",
    sm: "w-7 h-7 sm:w-8 sm:h-8 rounded-xl",
    md: "w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl",
    lg: "w-11 h-11 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl",
  };

  const heartSizes = {
    xs: "w-3.5 h-3.5",
    sm: "w-3.5 h-3.5 sm:w-4 sm:h-4",
    md: "w-4 h-4 sm:w-5 sm:h-5",
    lg: "w-5.5 h-5.5 sm:w-7 sm:h-7",
  };

  const content = (
    <div
      className={cn(
        "inline-flex items-center tracking-tight select-none poppins-bold notranslate skiptranslate",
        sizeClasses[size],
        className
      )}
      translate="no"
    >
      {/* Prem Jodo Connected Heart Badge */}
      <div
        className={cn(
          "relative flex items-center justify-center bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 text-white shadow-md sm:shadow-lg shadow-rose-500/25 flex-shrink-0 group-hover:scale-105 transition-transform",
          iconWrapperSizes[size]
        )}
      >
        <HeartHandshake className={cn("fill-white/20 stroke-[2.2]", heartSizes[size])} />
        <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-amber-400 rounded-full border border-white sm:border-2 dark:border-zinc-950 animate-pulse" />
      </div>

      {/* Brand Typography - Always English 'Prem Jodo' */}
      <div className="flex flex-col leading-none notranslate skiptranslate" translate="no">
        <div className="flex items-center notranslate" translate="no">
          <span className="text-zinc-900 dark:text-white poppins-black tracking-tight notranslate" translate="no">
            Prem
          </span>
          <span className="ml-1 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent poppins-black notranslate" translate="no">
            Jodo
          </span>
        </div>
        {size === "lg" && (
          <span className="text-[11px] poppins-semibold tracking-widest text-zinc-400 uppercase mt-0.5 notranslate" translate="no">
            Dil Se Dil Tak
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group hover:opacity-95 transition-opacity inline-block">
        {content}
      </Link>
    );
  }

  return content;
}

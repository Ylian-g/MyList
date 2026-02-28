"use client";

import { useRef, useState, useEffect } from "react";

interface CarouselProps {
  children: React.ReactNode;
  title?: string;
  badge?: string;
  badgeClass?: string;
}

export function Carousel({ children, title, badge, badgeClass }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el?.removeEventListener("scroll", updateScrollState);
  }, []);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <div className="group/carousel relative">
      {(title || badge) && (
        <div className="mb-3 flex items-center gap-3">
          {title && (
            <h3 className="font-display text-lg tracking-wider text-base-content/80 uppercase">
              {title}
            </h3>
          )}
          {badge && (
            <span className={`badge badge-sm ${badgeClass ?? "badge-primary"}`}>
              {badge}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        {/* Fade edges */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-base-100 to-transparent" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-base-100 to-transparent" />
        )}

        {/* Arrows */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-base-300/80 p-2 text-base-content/70 opacity-0 shadow-lg backdrop-blur transition-all hover:bg-primary hover:text-primary-content group-hover/carousel:opacity-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-base-300/80 p-2 text-base-content/70 opacity-0 shadow-lg backdrop-blur transition-all hover:bg-primary hover:text-primary-content group-hover/carousel:opacity-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        <div
          ref={scrollRef}
          className="carousel-snap flex gap-3 overflow-x-auto pb-2"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

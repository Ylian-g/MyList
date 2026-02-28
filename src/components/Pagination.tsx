"use client";

import { useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const [goToInput, setGoToInput] = useState("");

  if (totalPages <= 1) return null;

  // Show max 7 page buttons
  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  function handleGoTo(e: React.FormEvent) {
    e.preventDefault();
    const p = parseInt(goToInput);
    if (p >= 1 && p <= totalPages) {
      onPageChange(p);
      setGoToInput("");
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn btn-ghost btn-sm text-base-content/40 disabled:opacity-20"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-sm text-base-content/20">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                p === currentPage
                  ? "bg-primary text-primary-content shadow-lg shadow-primary/20"
                  : "text-base-content/40 hover:bg-base-300/50 hover:text-base-content"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn btn-ghost btn-sm text-base-content/40 disabled:opacity-20"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Go to page */}
      <form onSubmit={handleGoTo} className="flex items-center gap-2">
        <span className="text-xs text-base-content/30">Aller à</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={goToInput}
          onChange={(e) => setGoToInput(e.target.value)}
          placeholder={String(currentPage)}
          className="input input-xs w-20 border-white/10 bg-base-300/30 text-center text-sm focus:border-primary/30 focus:outline-none"
        />
        <button type="submit" className="btn btn-ghost btn-xs text-primary">
          OK
        </button>
        <span className="text-xs text-base-content/20">/ {totalPages.toLocaleString()}</span>
      </form>
    </div>
  );
}

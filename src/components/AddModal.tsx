"use client";

import { useState } from "react";
import Image from "next/image";
import type { Status, ExternalMedia } from "@/types";

interface AddModalProps {
  item: ExternalMedia;
  onConfirm: (data: {
    status: Status;
    rating: number | null;
    comment: string | null;
    isRewatch: boolean;
  }) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: Status; label: string; icon: string }[] = [
  { value: "PLANNED", label: "À voir", icon: "📋" },
  { value: "IN_PROGRESS", label: "En cours", icon: "▶" },
  { value: "COMPLETED", label: "Terminé", icon: "✓" },
  { value: "PAUSED", label: "En pause", icon: "⏸" },
  { value: "DROPPED", label: "Abandonné", icon: "✕" },
];

export function AddModal({ item, onConfirm, onClose }: AddModalProps) {
  const [status, setStatus] = useState<Status>("PLANNED");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [isRewatch, setIsRewatch] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm({
      status,
      rating: rating ? parseFloat(rating) : null,
      comment: comment || null,
      isRewatch,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md animate-fade-in-up overflow-hidden rounded-2xl border border-white/10 bg-base-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative h-32 overflow-hidden">
          {item.imageUrl ? (
            <>
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover blur-sm scale-110"
                sizes="448px"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-base-200" />
            </>
          ) : (
            <div className="h-full bg-gradient-to-br from-primary/20 to-base-300" />
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-black/60 hover:text-white"
          >
            ✕
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-display text-xl tracking-wider text-white drop-shadow-lg">
              {item.title}
            </h3>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* Status grid */}
          <div>
            <label className="mb-2 block text-xs font-bold tracking-wider text-base-content/40 uppercase">
              Statut
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    status === opt.value
                      ? "bg-primary text-primary-content shadow-lg shadow-primary/20"
                      : "bg-base-300/50 text-base-content/60 hover:bg-base-300"
                  }`}
                >
                  <span className="text-[10px]">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="mb-2 block text-xs font-bold tracking-wider text-base-content/40 uppercase">
              Note
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={rating || 0}
                onChange={(e) => setRating(e.target.value === "0" ? "" : e.target.value)}
                className="range range-primary range-xs flex-1"
              />
              <span className="w-12 text-center font-display text-lg text-primary">
                {rating || "—"}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="mb-2 block text-xs font-bold tracking-wider text-base-content/40 uppercase">
              Commentaire
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ton avis en quelques mots..."
              rows={2}
              className="textarea w-full resize-none border-white/5 bg-base-300/50 text-sm placeholder:text-base-content/20 focus:border-primary/30 focus:outline-none"
            />
          </div>

          {/* Rewatch toggle */}
          <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-base-300/30 p-3">
            <input
              type="checkbox"
              checked={isRewatch}
              onChange={(e) => setIsRewatch(e.target.checked)}
              className="toggle toggle-primary toggle-sm"
            />
            <div>
              <span className="text-sm font-medium">Rewatch / Replay</span>
              <p className="text-[11px] text-base-content/40">
                Tu l&apos;as déjà vu/joué avant
              </p>
            </div>
          </label>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn btn-primary flex-1">
              Ajouter à ma liste
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

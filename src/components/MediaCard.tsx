"use client";

import Image from "next/image";
import type { Status } from "@prisma/client";
import { StatusBadge } from "./StatusBadge";
import { useState } from "react";

interface MediaCardProps {
  id: number;
  title: string;
  imageUrl?: string | null;
  description?: string | null;
  status: Status;
  rating?: number | null;
  comment?: string | null;
  isRewatch?: boolean;
  onUpdate: (data: { status: Status; rating: number | null; comment: string | null }) => void;
  onRemove: () => void;
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "PLANNED", label: "Planifié" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "PAUSED", label: "En pause" },
  { value: "DROPPED", label: "Abandonné" },
];

export function MediaCard({
  title,
  imageUrl,
  description,
  status,
  rating,
  comment,
  isRewatch,
  onUpdate,
  onRemove,
}: MediaCardProps) {
  const [editing, setEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<Status>(status);
  const [editRating, setEditRating] = useState<string>(rating != null ? String(rating) : "");
  const [editComment, setEditComment] = useState(comment ?? "");

  function handleSave() {
    onUpdate({
      status: editStatus,
      rating: editRating ? parseFloat(editRating) : null,
      comment: editComment || null,
    });
    setEditing(false);
  }

  return (
    <div className="glass-card group animate-fade-in-up overflow-hidden rounded-xl transition-all duration-300 hover:border-primary/20">
      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-base-300 text-xl text-base-content/20">
              ?
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-bold">{title}</h3>
            {isRewatch && (
              <span className="badge badge-outline badge-xs shrink-0 opacity-60">RE</span>
            )}
          </div>

          {description && (
            <p className="mt-0.5 line-clamp-1 text-[11px] opacity-40">{description}</p>
          )}

          {!editing && (
            <>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <StatusBadge status={status} />
                {rating != null && (
                  <span className="flex items-center gap-0.5 text-xs font-bold text-primary">
                    {rating}
                    <span className="text-[9px] opacity-60">/10</span>
                  </span>
                )}
              </div>
              {comment && (
                <p className="mt-1 truncate text-[11px] italic opacity-30">
                  &ldquo;{comment}&rdquo;
                </p>
              )}
              <div className="mt-auto flex gap-1.5 pt-1.5">
                <button
                  onClick={() => setEditing(true)}
                  className="btn btn-ghost btn-xs opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Modifier
                </button>
                <button
                  onClick={onRemove}
                  className="btn btn-ghost btn-xs text-error/60 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Supprimer
                </button>
              </div>
            </>
          )}

          {editing && (
            <div className="mt-1.5 flex flex-col gap-1.5 animate-fade-in">
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as Status)}
                className="select select-bordered select-xs w-full bg-base-300/50"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  placeholder="Note /10"
                  value={editRating}
                  onChange={(e) => setEditRating(e.target.value)}
                  className="input input-bordered input-xs w-20 bg-base-300/50"
                />
                <input
                  type="text"
                  placeholder="Commentaire..."
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="input input-bordered input-xs flex-1 bg-base-300/50"
                />
              </div>
              <div className="flex gap-1.5">
                <button onClick={handleSave} className="btn btn-primary btn-xs">
                  Sauver
                </button>
                <button onClick={() => setEditing(false)} className="btn btn-ghost btn-xs">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

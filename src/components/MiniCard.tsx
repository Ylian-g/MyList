"use client";

import Image from "next/image";

interface MiniCardProps {
  title: string;
  imageUrl?: string | null;
  onClick?: () => void;
  overlay?: React.ReactNode;
}

export function MiniCard({ title, imageUrl, onClick, overlay }: MiniCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative w-36 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-base-300 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="144px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-base-300 text-3xl text-base-content/20">
            ?
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="line-clamp-2 text-left text-[11px] font-semibold leading-tight text-white drop-shadow-lg">
            {title}
          </p>
        </div>

        {/* Hover glow border */}
        <div className="absolute inset-0 rounded-xl border border-white/0 transition-colors duration-300 group-hover:border-primary/40" />
      </div>

      {overlay && (
        <div className="absolute right-1.5 top-1.5">{overlay}</div>
      )}
    </button>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const tabs = [
  { href: "/", label: "Accueil", theme: "mylist-home", icon: "◆" },
  { href: "/anime", label: "Anime", theme: "mylist-anime", icon: "▲" },
  { href: "/manga", label: "Manga", theme: "mylist-manga", icon: "■" },
  { href: "/games", label: "Jeux", theme: "mylist-games", icon: "●" },
];

export function Navbar() {
  const pathname = usePathname();

  const activeTab = tabs.find((t) =>
    t.href === "/" ? pathname === "/" : pathname.startsWith(t.href)
  );

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      activeTab?.theme ?? "mylist-home"
    );
  }, [activeTab]);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-base-100/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="font-display text-2xl tracking-widest text-primary transition-colors hover:text-primary/80"
        >
          MYLIST
        </Link>
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`group relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-base-content/50 hover:bg-base-300/50 hover:text-base-content"
                }`}
              >
                <span
                  className={`text-[10px] transition-transform duration-300 ${
                    isActive ? "scale-100" : "scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                  }`}
                >
                  {tab.icon}
                </span>
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

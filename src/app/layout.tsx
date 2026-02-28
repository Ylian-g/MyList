import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "MyList",
  description: "Ma liste personnelle d'anime, manga et jeux vidéo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-theme="mylist-home">
      <body className="min-h-screen bg-base-100 text-base-content antialiased">
        <Navbar />
        <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-6">
          {children}
        </main>
      </body>
    </html>
  );
}

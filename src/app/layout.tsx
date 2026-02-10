import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "posh-real-es", description: "Marketplace social multi-vertical de eventos" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <header className="flex items-center justify-between gap-4">
            <a href="/" className="no-underline font-semibold text-lg">posh-real-es</a>
            <nav className="flex gap-4 text-sm">
              <a className="no-underline hover:underline" href="/explore">Explorar</a>
              <a className="no-underline hover:underline" href="/dashboard">Dashboard</a>
              <a className="no-underline hover:underline" href="/login">Login</a>
              <a className="no-underline hover:underline" href="/admin">Admin</a>
            </nav>
          </header>
          <main className="mt-6">{children}</main>
        </div>
      </body>
    </html>
  );
}

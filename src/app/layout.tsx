import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AppProvider } from "@/components/app-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PizzaHub — Hot & fresh pizza delivered",
    template: "%s · PizzaHub",
  },
  description:
    "Discover local pizza shops, explore hand-crafted menus and order hot, fresh pizza for delivery with PizzaHub.",
  keywords: ["pizza", "delivery", "restaurants", "PizzaHub", "food ordering"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AppProvider>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              style: {
                borderRadius: "14px",
                border: "1px solid #eddacb",
                fontFamily: "var(--font-geist-sans)",
              },
            }}
          />
        </AppProvider>
      </body>
    </html>
  );
}

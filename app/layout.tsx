import type { Metadata } from "next";
import { io } from "next/cache";
import { JetBrains_Mono, Plus_Jakarta_Sans, Sora } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { getAppDisplayName } from "@/lib/user-info";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const FALLBACK_TITLE = "Saiful Finance";
const FALLBACK_DESCRIPTION =
  "Track income, debts, investments, DSR, and repayments.";

export async function generateMetadata(): Promise<Metadata> {
  await io();
  const displayName = await getAppDisplayName();

  if (!displayName) {
    return {
      title: FALLBACK_TITLE,
      description: FALLBACK_DESCRIPTION,
    };
  }

  return {
    title: `${displayName} Finance`,
    description: `Personal finance tracker for ${displayName} — income, debts, investments, and repayments.`,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${sora.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <AppShell>{children}</AppShell>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

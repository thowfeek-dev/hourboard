import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { AppFrame } from "@/components/layout/app-frame";
import { ColorOrbs } from "@/components/art/scene";
import { todayISO } from "@/lib/dates";
import { APP_NAME, appOrigin } from "@/lib/constants";
import { isClerkConfigured } from "@/lib/clerk";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: "Private 8-hour work log. Every user gets their own board, charts, and exports.",
  metadataBase: new URL(appOrigin()),
};

export const dynamic = "force-dynamic";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let userId: string | null = null;
  if (isClerkConfigured()) {
    try {
      userId = (await auth()).userId;
    } catch {
      userId = null;
    }
  }

  const body = (
    <>
      <ColorOrbs />
      <Providers>
        <AppFrame signedIn={Boolean(userId)} currentDate={todayISO()} timeFormat="24h">
          {children}
        </AppFrame>
      </Providers>
    </>
  );

  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable} h-full`}>
      <head>
        <style>{`.dark input,.dark textarea,.dark select{background:#182234!important;color:#e8eef8!important;-webkit-text-fill-color:#e8eef8!important}.dark input::placeholder,.dark textarea::placeholder{color:#8ea0b8!important}`}</style>
      </head>
      <body className="relative min-h-full antialiased">
        {isClerkConfigured() ? (
          <ClerkProvider
            appearance={{
              cssLayerName: "clerk",
              variables: { colorPrimary: "#4f46e5" },
            }}
          >
            {body}
          </ClerkProvider>
        ) : (
          body
        )}
      </body>
    </html>
  );
}

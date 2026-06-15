import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/frontend/auth/contexts/auth-context";
import { ThemeProvider } from "@/frontend/providers/theme-provider";
import { QueryProvider } from "@/frontend/providers/query-provider";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const neueMontreal = localFont({
  variable: "--font-display",
  src: [
    { path: "./fonts/NeueMontreal-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/NeueMontreal-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/NeueMontreal-Bold.otf", weight: "700", style: "normal" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Solo App",
  description: "Aplicativo de monitoramento solar da Solo Energia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${neueMontreal.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


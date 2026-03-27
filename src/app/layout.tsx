import type { Metadata } from "next";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { inter } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Atomic Solve",
  description: "Build a daily study habit and improve your grades with Atomic Solve.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased dark`} suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          <ThemeProvider defaultTheme="dark" storageKey="revision-ui-theme">
            <SidebarConfigProvider>
              {children}
            </SidebarConfigProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

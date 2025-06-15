import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import AuthProvider from "@/context/AuthProvider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/ThemeProvider";

import Navbar from "@/components/Navbar";

// Use Poppins as main font and Inter as fallback
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AnonyChat - Anonymous Messaging Platform",
  description: "Send and receive anonymous messages securely with AnonyChat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
      ${poppins.variable} ${inter.variable}
      font-sans antialiased
      bg-background text-foreground
      selection:bg-primary/20 selection:text-primary
      transition-colors duration-200 ease-in-out
    `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />

              <main className="flex-grow px-4 md:px-6 py-6">{children}</main>

              <footer className="py-4 border-t border-border bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 text-center text-xs sm:text-sm text-muted-foreground">
                  © {new Date().getFullYear()}{" "}
                  <span className="font-medium text-primary">AnonyChat</span>.
                  All rights reserved.
                </div>
              </footer>

              <Toaster />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

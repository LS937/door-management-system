import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProviderWrapper } from "@/components/auth-provider-wrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Door Management System",
  description: "Complete solution for handling wooden door orders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className="font-mono antialiased"
        style={{ fontFamily: "'Roboto Mono', monospace" }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProviderWrapper useSimpleAuth={true}>
            {children}
          </AuthProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANYPLAN - AI-Driven Deep Thinking Exploration Tool",
  description: "Collaborate with AI to deeply analyze and solve complex problems through visual hierarchical structures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

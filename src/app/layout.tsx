import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANYPLAN - AI驱动的深度思维探索工具",
  description: "通过可视化的层级结构，与AI协作深入分析和解决复杂问题",
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

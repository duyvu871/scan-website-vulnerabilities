import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "src/layouts/global-theme";
import {cn} from "src/utils/tailwind";
import MainLayout from "src/layouts/main-layout";
import AppProvider from "src/providers/app-provider";
import Toast from "src/layouts/Toast";
import FullscreenLoader from "src/layouts/fullscreen-loader";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quét lỗ hổng bảo mật của trang web",
  description: "Quét lỗ hổng bảo mật của trang web với công cụ quét lỗ hổng bảo mật được xây dựng bởi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={"dark"}>
      <body className={cn(inter.className, "dark dark:bg-zinc-950 bg-white text-zinc-700 dark:text-white")}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
            // enableSystem={false}
            forcedTheme={'dark'}
        >
          <AppProvider>
            <Toast>
              <FullscreenLoader>
                <MainLayout>
                  {children}
                </MainLayout>
              </FullscreenLoader>
            </Toast>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

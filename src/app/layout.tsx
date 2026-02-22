import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Adisyon Menü Sistemi",
  description: "Restoran ve kafeler için dijital menü ve sipariş sistemi",
  manifest: "/manifest.json",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // DB'den dinamik tema renklerini al
  let themeStyles = "";
  try {
    const settings = await getSettings();
    if (settings) {
      themeStyles = `
        :root {
          --primary: ${settings.primaryColor};
          --secondary: ${settings.secondaryColor};
        }
      `;
    }
  } catch (error) {
    // Kurulum aşamasında veritabanı boş olabilir (veya migration bekliyor olabilir)
    // Bu yüzden hatayı yutuyoruz ve default CSS fallback'leri (globals.css içindeki) çalışıyor
    console.error("Theme Error:", error);
  }

  return (
    <html lang="tr">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {themeStyles && (
          <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
        )}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LexConnect — Abogados verificados en Argentina",
    template: "%s | LexConnect",
  },
  description:
    "Encontrá abogados y estudios jurídicos verificados en Argentina. Consultá tu caso, chateá en tiempo real y contratá con total seguridad.",
  keywords: [
    "abogados argentina",
    "asesoramiento legal online",
    "estudios jurídicos",
    "consulta legal",
    "abogados verificados",
    "marketplace legal",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://lexconnect.ar",
    siteName: "LexConnect",
    title: "LexConnect — Abogados verificados en Argentina",
    description:
      "Conectamos personas con abogados verificados. Seguro, transparente y profesional.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LexConnect",
    description: "Abogados verificados en Argentina",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

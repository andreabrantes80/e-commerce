import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GJ TECH MODA FEMININA",
  description:
    "Moda feminina, roupas e acessórios para mulheres que gostam de estilo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
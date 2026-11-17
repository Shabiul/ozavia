import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});
const jost = Jost({ variable: "--font-jost", subsets: ["latin"], weight: ["300", "400", "500"] });

export const metadata: Metadata = {
  title: "Ozavia Premium Spices — Pure Taste. Naturally Yours.",
  description:
    "Four masalas and the histories behind them: Garam Masala, Biryani Masala, Elite All Purpose Masala and Pili Mirch.",
  openGraph: {
    title: "Ozavia Premium Spices",
    description: "Pure Taste. Naturally Yours.",
    images: ["/renders/hero.webp"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}

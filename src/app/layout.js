import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "BioVibe Peptides | Premium Peptide Solutions",
  description: "Supporting Providers with Guidance on Peptide Solutions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}

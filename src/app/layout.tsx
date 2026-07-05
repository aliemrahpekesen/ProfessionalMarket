import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "ProfessionalMarket — market values, transfers & rumors for professionals",
    template: "%s | ProfessionalMarket",
  },
  description:
    "The Transfermarkt of the business world: professional profiles with market value history, job-move transfer records, company rosters and a rumor mill.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Nav />
        <main className="mx-auto min-h-[60vh] w-full max-w-6xl px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

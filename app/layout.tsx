import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Petruwalus fp - Unik Products",
  description: "Delicious and nutritious Unik products delivered fast to your door.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fbfaf6] text-[#2c241e] antialiased">
        {children}
      </body>
    </html>
  );
}

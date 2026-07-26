import type { Metadata } from "next";
import "./globals.css";
import "./search.css";
import "./contact.css";

export const metadata: Metadata = {
  title: "Iman Truck Sales | New & Used Commercial Trucks",
  description: "Shop quality commercial trucks, explore financing, and get help starting your box truck business with Iman Truck Sales.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

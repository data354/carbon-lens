import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryClientProvider } from "@/lib/react-query/provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarbonLens",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${figtree.variable} font-sans antialiased`}
      >
        <QueryClientProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </QueryClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

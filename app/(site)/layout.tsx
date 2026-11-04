"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useContent } from "@/lib/content";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings } = useContent();
  return (
    <>
      {settings.announcement && (
        <div className="bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white" role="status">{settings.announcement}</div>
      )}
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

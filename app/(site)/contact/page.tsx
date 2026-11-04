"use client";

import { Mail, MapPin } from "lucide-react";
import ContactForm from "./ContactForm";
import { useContent } from "@/lib/content";

export default function Contact() {
  const { settings } = useContent();
  return (
    <section className="section grid gap-10 py-16 lg:grid-cols-2">
      <div>
        <h1 className="text-4xl font-extrabold">Contact us</h1>
        <p className="mt-3 max-w-md text-slate-600">
          Questions about courses, payments or your account? Send a message and the team will reply by email.
        </p>
        <ul className="mt-8 space-y-4 text-sm text-slate-700">
          <li className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Mail size={18} /></span>{settings.support_email || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@your-domain.com"}</li>
          <li className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><MapPin size={18} /></span>Nigeria</li>
        </ul>
      </div>
      <ContactForm />
    </section>
  );
}

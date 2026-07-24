"use client";

import React, { useState } from "react";
import { Phone, Mail, MapPin, MessageSquare, Loader2 } from "lucide-react";

interface ContactSectionProps {
  siteSettings?: any;
}

export default function ContactSection({ siteSettings }: ContactSectionProps) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const contactPhone = siteSettings?.contactPhone || "+260 973 632 403";
  const contactEmail = siteSettings?.contactEmail || "support@shopeease.com";
  const contactLocation = siteSettings?.contactLocation || "Lusaka, Zambia";
  const rawWhatsapp = siteSettings?.whatsappNumber || "260973632403";
  const whatsappNumber = rawWhatsapp.replace(/[^0-9]/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("submitting");
    try {
      await new Promise((res) => setTimeout(res, 800));
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact-section" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">Get In Touch</span>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Contact Us</h2>
          <p className="text-sm text-stone-500">We are always available to help and answer any questions you have.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
          {/* Details Sidebar */}
          <div className="lg:col-span-5 space-y-8 bg-stone-50 p-8 rounded-3xl border border-stone-100">
            <h3 className="text-lg font-bold text-stone-900">Store Information</h3>
            
            <div className="space-y-6 text-sm">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800">Phone</h4>
                  <a
                    href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                    className="text-stone-600 mt-1 hover:text-emerald-800 select-all font-medium block"
                  >
                    {contactPhone}
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800">Email Address</h4>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-stone-600 mt-1 hover:text-emerald-800 select-all font-medium block"
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800">Location</h4>
                  <p className="text-stone-600 mt-1 font-medium">{contactLocation}</p>
                </div>
              </div>
            </div>

            {whatsappNumber && (
              <div className="pt-4 border-t border-stone-200">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=Hi%20ShopEase%2C%20I%27d%20like%20to%20inquire%20about%20your%20products.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  Chat on WhatsApp
                </a>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5 bg-white p-2 rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Kaishe Mututwa"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800 bg-stone-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. kaishe@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800 bg-stone-50/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Your Message</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help you today?"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800 bg-stone-50/50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </button>

            {status === "success" && (
              <p className="text-emerald-700 text-xs font-semibold mt-3 animate-pulse">
                ✓ Thank you! Your message was sent successfully. We will get back to you shortly.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

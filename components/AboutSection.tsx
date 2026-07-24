"use client";

import React from "react";
import { Star, Shield, Truck, Award } from "lucide-react";

interface AboutSectionProps {
  siteSettings?: any;
}

export default function AboutSection({ siteSettings }: AboutSectionProps) {
  const defaultTeam = [
    { name: "Mututwa Mututwa", role: "Founder & CEO", initials: "MM", desc: "Visionary leader driving retail innovation in Zambia." },
    { name: "Kaishe Mututwa", role: "Operations Manager", initials: "KM", desc: "Logistics specialist ensuring speedy regional deliveries." },
    { name: "Mututwa Junior", role: "Customer Support Lead", initials: "MJ", desc: "Dedicated champion for customer-first service." },
  ];

  let team = defaultTeam;
  if (siteSettings?.teamMembers) {
    try {
      const parsed = typeof siteSettings.teamMembers === "string"
        ? JSON.parse(siteSettings.teamMembers)
        : siteSettings.teamMembers;
      if (Array.isArray(parsed) && parsed.length > 0) {
        team = parsed;
      }
    } catch {
      team = defaultTeam;
    }
  }

  const aboutTitle = siteSettings?.aboutTitle || "About ShopEase";
  const aboutSubtitle = siteSettings?.aboutSubtitle || "Your trusted partner for quality products, fast delivery, and exceptional service.";
  const aboutMission = siteSettings?.aboutMission || "To make online shopping effortless, enjoyable, and accessible to everyone. We curate only the best products, ensuring premium quality at fair prices, and deliver them to your doorstep with care and speed.";
  const aboutStory = siteSettings?.aboutStory || "ShopEase was founded in 2025 by a group of e-commerce enthusiasts who believed that shopping online should be simple, safe, and satisfying. What started as a small local store in Lusaka has grown into Zambia's most reliable retail platform, connecting families and businesses with premium-quality daily essentials, nutritious foods, and bespoke products.";

  return (
    <section id="about-section" className="py-16 bg-stone-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">Our Identity</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">{aboutTitle}</h2>
          <p className="text-sm text-stone-500">{aboutSubtitle}</p>
        </div>

        {/* Mission & Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl">
                🎯
              </div>
              <h3 className="text-xl font-bold text-stone-900">Our Mission</h3>
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                {aboutMission}
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl">
                📖
              </div>
              <h3 className="text-xl font-bold text-stone-900">Our Story</h3>
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                {aboutStory}
              </p>
            </div>
          </div>
        </div>

        {/* Unique Selling Points */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-stone-900 text-center">What Makes Us Unique</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-stone-100 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Star className="w-5 h-5 fill-current text-emerald-600" />
              </div>
              <h4 className="font-bold text-sm text-stone-900">Premium Curation</h4>
              <p className="text-xs text-stone-500">Only carefully sourced, tested, and high-quality products enter our catalog.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-100 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Truck className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-bold text-sm text-stone-900">Rapid Delivery</h4>
              <p className="text-xs text-stone-500">Fast local shipping across Lusaka and other major Zambian regions.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-100 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-bold text-sm text-stone-900">Secure Payments</h4>
              <p className="text-xs text-stone-500">Safe payments via Bank Cards or standard local Mobile Money wallets.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-100 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-bold text-sm text-stone-900">Zambian Proud</h4>
              <p className="text-xs text-stone-500">100% locally operated and dedicated to community growth.</p>
            </div>
          </div>
        </div>

        {/* Leadership Team */}
        {team.length > 0 && (
          <div className="space-y-6 pt-4">
            <h3 className="text-xl font-bold text-stone-900 text-center">Meet Our Store Team</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map((member: any, idx: number) => {
                const initials = member.initials || (member.name ? member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "TM");
                return (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-xs text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-sm">
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{member.name}</h4>
                      <span className="text-xs text-emerald-700 font-semibold">{member.role}</span>
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
                      {member.desc || member.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

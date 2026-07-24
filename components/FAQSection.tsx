"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, MapPin, Wallet, RotateCcw, Truck } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
  icon: React.ReactNode;
}

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const faqs: FAQItem[] = [
    {
      id: "delivery-timelines",
      question: "What are your delivery timelines to Lusaka and other Zambian provinces?",
      icon: <Truck className="w-5 h-5 text-emerald-600" />,
      answer: (
        <div className="space-y-2">
          <p>We provide swift nationwide dispatch from our primary fulfillment hub in Lusaka:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Lusaka Province:</strong> Same-day delivery. Orders placed before 14:00 CAT are delivered in under 2 to 4 hours.</li>
            <li><strong>Copperbelt & Southern Provinces (Kitwe, Ndola, Choma, Livingstone):</strong> Delivery in 24 to 48 hours via premium logistics dispatch.</li>
            <li><strong>Other Provinces (Eastern, Northern, Muchinga, Western, Luapula, North-Western):</strong> Delivered in 2 to 3 business days, routed through leading regional transit partners (e.g., PowerTools, Mazhandu Family Bus, or local courier services).</li>
          </ul>
        </div>
      )
    },
    {
      id: "payment-methods",
      question: "What secure payment options do you support?",
      icon: <Wallet className="w-5 h-5 text-emerald-600" />,
      answer: (
        <div className="space-y-2">
          <p>We support fully secured local and digital payment methods popular across Zambia:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Mobile Money (MoMo):</strong> Instantly authorize sandbox or real transactions via <strong>MTN MoMo</strong>, <strong>Airtel Money</strong>, <strong>M-Pesa</strong>, or <strong>Zamtel Kwacha</strong> wallets.</li>
            <li><strong>Cash on Delivery (CoD):</strong> Available exclusively for orders in Lusaka Central and immediate residential surroundings.</li>
            <li><strong>Bank Transfer & Electronic Wallets:</strong> Standard EFT payments or instant e-wallets (FNB eWallet, ABSA, etc.) are available upon request through our support dispatch.</li>
          </ul>
        </div>
      )
    },
    {
      id: "returns",
      question: "How does your return and refund policy work?",
      icon: <RotateCcw className="w-5 h-5 text-emerald-600" />,
      answer: (
        <div className="space-y-2">
          <p>We strive to make returns hassle-free for all our customers:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>7-Day Window:</strong> Items can be returned within 7 days of delivery if they are unused, in original packaging, and in saleable condition.</li>
            <li><strong>Lusaka Returns:</strong> Simply bring the product to our central Lusaka depot, or we can coordinate a dispatch rider to collect it for a nominal fee.</li>
            <li><strong>Provincial Returns:</strong> Coordinate with our support center to ship the product back via our partner provincial couriers. Once inspected, we will process your replacement or mobile wallet/bank refund within 24 hours.</li>
          </ul>
        </div>
      )
    },
    {
      id: "physical-location",
      question: "Do you have a physical pickup station or warehouse?",
      icon: <MapPin className="w-5 h-5 text-emerald-600" />,
      answer: (
        <p>
          Yes! Our primary office and central depot is situated along <strong>Great East Road, Lusaka, Zambia</strong>. While we operate primarily online with doorstep delivery, local customers can select &quot;Warehouse Pickup&quot; during checkout to collect their products directly and avoid delivery fees.
        </p>
      )
    }
  ];

  return (
    <section id="faq-section" className="py-16 bg-stone-50/50 border-t border-b border-stone-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-bold tracking-widest uppercase">
            <HelpCircle className="w-3.5 h-3.5" />
            Zambian Customer Resource Center
          </div>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-stone-500 max-w-xl mx-auto">
            Find immediate answers regarding local delivery times, province shipments, mobile wallet authorization, and returns.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                id={`faq-${faq.id}`}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 bg-emerald-50 rounded-xl">
                      {faq.icon}
                    </div>
                    <span className="text-sm sm:text-base font-extrabold text-stone-800 hover:text-emerald-700 transition-colors">
                      {faq.question}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-stone-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 sm:pb-7 border-t border-stone-100 pt-4 text-xs sm:text-sm text-stone-600 leading-relaxed bg-stone-50/20">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

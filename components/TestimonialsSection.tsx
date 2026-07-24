"use client";

import React, { useState } from "react";
import { Star, MessageSquare, Plus, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  content: string;
  approved: boolean;
  createdAt: string;
  image?: string | null;
}

interface TestimonialsSectionProps {
  initialTestimonials: Testimonial[];
}

export default function TestimonialsSection({ initialTestimonials }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter for approved testimonials to display
  const approvedTestimonials = testimonials.filter((t) => t.approved);

  // Compute average rating
  const avgRating = approvedTestimonials.length > 0 
    ? (approvedTestimonials.reduce((sum, t) => sum + t.rating, 0) / approvedTestimonials.length).toFixed(1)
    : "5.0";

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, rating, content }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitMessage({
          type: "success",
          text: data.message || "Thank you! Your testimonial has been submitted and is pending admin approval.",
        });
        // Clear form
        setName("");
        setRating(5);
        setContent("");
        
        // Optionally prepend to local list with unapproved status so they can visually see it on their current session if we want to show "Pending Approval"
        if (data.testimonial) {
          setTestimonials((prev) => [
            { ...data.testimonial, approved: false },
            ...prev
          ]);
        }
      } else {
        setSubmitMessage({
          type: "error",
          text: data.error || "Failed to submit testimonial. Please try again.",
        });
      }
    } catch (err) {
      console.error("Testimonial submission error:", err);
      setSubmitMessage({
        type: "error",
        text: "A connection error occurred. Please verify your internet connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="testimonials-section" className="py-16 bg-white border-t border-b border-stone-100 scroll-mt-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-bold tracking-widest uppercase">
            <MessageSquare className="w-3.5 h-3.5" />
            Zambian Shopper Feedback
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Loved by Customers Across Zambia
          </h2>
          <p className="text-sm text-stone-500">
            Read real stories from our valued customers in Lusaka, Copperbelt, Southern, and other provinces.
          </p>
        </div>

        {/* Highlight Score & Submit Action Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-stone-50/50 p-6 sm:p-8 rounded-3xl border border-stone-100">
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-lg font-black text-stone-900">Highly Rated Experience</h3>
            <p className="text-xs text-stone-500">Our customer satisfaction score across hundreds of deliveries.</p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-stone-900 tracking-tight">{avgRating}</span>
              <span className="text-stone-400 font-bold text-sm">/ 5.0</span>
            </div>
            <div className="flex items-center gap-0.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 fill-current ${
                    star <= Math.round(Number(avgRating)) ? "text-amber-500" : "text-stone-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
              Based on {approvedTestimonials.length} verified reviews
            </span>
          </div>

          <div className="flex justify-center md:justify-end">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setSubmitMessage(null);
              }}
              className="px-5 py-3 text-white text-xs font-bold tracking-wider uppercase rounded-2xl transition-all shadow hover:brightness-105 inline-flex items-center gap-2 cursor-pointer bg-emerald-700 hover:bg-emerald-800"
            >
              {showForm ? "View Reviews" : "Submit Testimonial"}
              <Plus className={`w-4 h-4 transition-transform duration-300 ${showForm ? "rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* Dynamic Panel Content */}
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="testimonial-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm"
            >
              <h3 className="text-xl font-bold text-stone-900 mb-2 text-center">Share Your Experience</h3>
              <p className="text-xs text-stone-500 text-center mb-6">
                Your feedback directly helps us improve and guides other local shoppers in making great choices.
              </p>

              {submitMessage && (
                <div
                  className={`p-4 rounded-xl mb-6 text-xs font-semibold flex items-start gap-3 ${
                    submitMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                      : "bg-rose-50 text-rose-800 border border-rose-100"
                  }`}
                >
                  {submitMessage.type === "success" && <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                  <p>{submitMessage.text}</p>
                </div>
              )}

              <form onSubmit={handleTestimonialSubmit} className="space-y-5">
                {/* Rating Selector */}
                <div className="space-y-1.5 text-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                    Your Rating
                  </label>
                  <div className="flex items-center justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = hoveredRating !== null ? star <= hoveredRating : star <= rating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(null)}
                          className="p-1 focus:outline-none transition-transform active:scale-95"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              isActive ? "text-amber-500 fill-amber-400" : "text-stone-200 fill-transparent"
                            } transition-colors duration-150`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="client-name" className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Full Name
                  </label>
                  <input
                    id="client-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bornface Kangombe"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:border-emerald-600 transition-colors"
                  />
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <label htmlFor="client-content" className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Your Review
                  </label>
                  <textarea
                    id="client-content"
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tell us what you liked about our products, delivery time, customer care, or anything else!"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:border-emerald-600 transition-colors resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting Feedback...
                    </>
                  ) : (
                    "Submit Review for Approval"
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="testimonials-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {approvedTestimonials.length > 0 ? (
                  approvedTestimonials.map((testimonial) => (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-stone-50/50 p-6 rounded-2xl border border-stone-150 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Rating stars */}
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 fill-current ${
                                star <= testimonial.rating ? "text-amber-500" : "text-stone-200"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Feedback comment */}
                        <p className="text-stone-700 text-xs sm:text-sm leading-relaxed italic">
                          &ldquo;{testimonial.content}&rdquo;
                        </p>
                      </div>

                      {/* Reviewer Meta details */}
                      <div className="mt-5 pt-4 border-t border-stone-200/50 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-[10px] uppercase">
                          {testimonial.name.slice(0, 2)}
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-extrabold text-stone-900 leading-none">{testimonial.name}</h4>
                          <span className="text-[10px] text-stone-400 mt-1 block">
                            Verified Zambian Buyer &bull; {new Date(testimonial.createdAt).toLocaleDateString("en-ZA", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-stone-500 bg-stone-50 rounded-2xl border border-stone-100">
                    <p className="font-semibold text-sm">No verified reviews found yet.</p>
                    <p className="text-xs text-stone-400 mt-1">Be the first to share your experience by clicking &apos;Submit Testimonial&apos;!</p>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

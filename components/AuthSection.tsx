"use client";

import React, { useState } from "react";
import { Loader2, Lock, User, Mail, ShieldAlert } from "lucide-react";

interface AuthSectionProps {
  onAuthSuccess: (user: { id: string; name: string; email: string; role: string }, token: string) => void;
  brandColor: string;
}

export default function AuthSection({ onAuthSuccess, brandColor }: AuthSectionProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", adminSecret: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });

        let data: any = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          throw new Error(text.slice(0, 100) || `Request failed with status ${response.status}`);
        }

        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        onAuthSuccess(data.user, data.token);
      } else {
        // REGISTRATION
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: isAdminMode ? "ADMIN" : "CUSTOMER",
            adminSecret: isAdminMode ? form.adminSecret : undefined,
          }),
        });

        let data: any = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          throw new Error(text.slice(0, 100) || `Request failed with status ${response.status}`);
        }

        if (!response.ok) {
          throw new Error(data.error || "Registration failed");
        }

        setMessage("Account created successfully! Please log in above.");
        setIsLogin(true);
        setForm({ ...form, password: "", adminSecret: "" });
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-3xl border border-stone-100 shadow-md space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          {isLogin ? "Welcome Back" : isAdminMode ? "Admin Registration" : "Create Account"}
        </h3>
        <p className="text-xs text-stone-500">
          {isLogin
            ? "Sign in to access your orders and real-time shipment status"
            : isAdminMode
            ? "Create an administrator profile with a secure authorization secret"
            : "Register as a customer to browse and purchase premium products"}
        </p>
      </div>

      {/* Tabs */}
      {!isAdminMode && (
        <div className="flex bg-stone-100 p-1.5 rounded-xl gap-1">
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              isLogin ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              !isLogin ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Register
          </button>
        </div>
      )}

      {/* Forms */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium leading-relaxed animate-pulse">
            {message}
          </div>
        )}

        {!isLogin && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Bornface Kangombe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="buyer@gmail.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
            />
          </div>
        </div>

        {!isLogin && isAdminMode && (
          <div className="space-y-1 border-t border-dashed border-stone-200 pt-3">
            <div className="flex items-center gap-1.5 mb-1 text-amber-700">
              <ShieldAlert className="w-3.5 h-3.5" />
              <label className="text-[10px] font-bold uppercase tracking-wider">Admin Authorization Secret *</label>
            </div>
            <input
              type="password"
              required={isAdminMode}
              value={form.adminSecret}
              onChange={(e) => setForm({ ...form, adminSecret: e.target.value })}
              placeholder="Enter authorization secret key"
              className="w-full px-4 py-2.5 rounded-xl border border-amber-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/10 placeholder-stone-400"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
          style={{ backgroundColor: brandColor }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : isLogin ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Footer Mode Switcher */}
      <div className="text-center text-xs border-t border-stone-100 pt-4">
        {isAdminMode ? (
          <button
            onClick={() => {
              setIsAdminMode(false);
              setIsLogin(true);
              setError("");
            }}
            className="text-stone-500 hover:text-emerald-700 font-semibold"
          >
            ← Back to Customer Sign In
          </button>
        ) : (
          <div className="space-y-1">
            <span className="text-stone-400">Are you a ShopEase employee?</span>{" "}
            <button
              onClick={() => {
                setIsAdminMode(true);
                setIsLogin(false);
                setError("");
              }}
              className="text-emerald-700 font-bold hover:underline"
            >
              Register Admin Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

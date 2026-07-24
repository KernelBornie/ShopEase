"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ShoppingBag, X, Star, Check, ArrowRight, Loader2, Info, DollarSign, Sliders, Shield, Menu, UserCheck, MessageSquare, Heart } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

// Import modular layouts
import AboutSection from "./AboutSection";
import ContactSection from "./ContactSection";
import AuthSection from "./AuthSection";
import CustomerDashboard from "./CustomerDashboard";
import AdminDashboard from "./AdminDashboard";
import FAQSection from "./FAQSection";
import TestimonialsSection from "./TestimonialsSection";
import PromotionalAds from "./PromotionalAds";

// Import Toast, Carousel and Skeleton components
import ToastContainer, { ToastMessage } from "./Toast";
import ProductCarousel from "./ProductCarousel";
import { ProductSkeletonGrid } from "./ProductSkeleton";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string;
  category: string;
  featured: boolean;
  createdAt: string;
}

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  content: string;
  approved: boolean;
  image: string | null;
}

interface SiteSettings {
  id: string;
  siteName: string;
  primaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
  footerText: string;
}

interface ProductListProps {
  initialProducts: Product[];
  initialCategories?: any[];
  siteSettings: SiteSettings | null;
  testimonials: Testimonial[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

function parseProductImages(imageStr: string): string[] {
  if (!imageStr) return ["https://images.unsplash.com/photo-1553456558-aff63285bdd1?auto=format&fit=crop&q=80&w=400"];
  try {
    if (imageStr.startsWith("data:image")) return [imageStr];
    let current = imageStr;
    while (typeof current === "string") {
      if ((current.startsWith('"') && current.endsWith('"')) || (current.startsWith("'") && current.endsWith("'"))) {
        current = current.slice(1, -1);
      } else {
        break;
      }
    }
    current = current.replace(/\\\\/g, "\\").replace(/\\"/g, '"');
    const parsed = JSON.parse(current);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(s => typeof s === "string" ? s : String(s));
    if (typeof parsed === "string") return [parsed];
  } catch {
    const match = imageStr.match(/https?:\/\/[^\s"',\\]+/gi);
    if (match && match.length > 0) return match;
  }
  return [imageStr];
}

function parseProductImage(imageStr: string): string {
  const list = parseProductImages(imageStr);
  return list[0] || "https://images.unsplash.com/photo-1553456558-aff63285bdd1?auto=format&fit=crop&q=80&w=400";
}

export default function ProductList({ initialProducts, initialCategories, siteSettings, testimonials }: ProductListProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<"home" | "products" | "about" | "contact" | "dashboard" | "admin">("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Currency (Default: Zambian Kwacha ZMW, convertible to USD $)
  // Exchange rate: 1 USD = 25 ZMW
  const [currency, setCurrency] = useState<"ZMW" | "USD">("ZMW");

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "low-high" | "high-low" | "newest">("default");
  
  // Price Limit filter (stored in base ZMW)
  const [priceFilter, setPriceFilter] = useState(20000);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Skeleton Loading simulator
  const [isFetching, setIsFetching] = useState(true);

  // Dynamic loaded products from database
  const [products, setProducts] = useState<Product[]>(initialProducts || []);

  // Toast Notification System State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    message?: string,
    type: "success" | "cart" | "filter" | "info" = "success",
    actionLabel?: string,
    onAction?: () => void
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, title, message, type, actionLabel, onAction }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch products from database on mount
  useEffect(() => {
    let active = true;
    const loadLatestProducts = async () => {
      try {
        const res = await fetch("/api/admin/products");
        if (res.ok && active) {
          const data = await res.json();
          if (data.products) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.error("Error loading products on mount:", err);
      } finally {
        if (active) {
          setIsFetching(false);
        }
      }
    };
    loadLatestProducts();
    return () => {
      active = false;
    };
  }, []);

  // Cart & Drawer
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Session Authentication
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);

  // Saved Wishlist State
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Product modal (Quick View)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);

  // Checkout layout states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"details" | "momo_pay" | "success">("details");
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    deliveryMode: "STANDARD",
    momoOperator: "AIRTEL",
    momoPhone: "",
    momoPin: "",
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessDetails, setOrderSuccessDetails] = useState<{
    orderNumber: string;
    total: number;
    deliveryMode: string;
  } | null>(null);

  // Newsletter subscription
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Format amount dynamically
  const formatPrice = (amountZMW: number) => {
    if (currency === "USD") {
      return `$${(amountZMW / 25).toFixed(2)}`;
    }
    return `K${amountZMW.toFixed(2)}`;
  };

  // Synchronize dynamic skeleton loading on search or filter parameters updates
  useEffect(() => {
    setIsFetching(true);
    const timer = setTimeout(() => setIsFetching(false), 550);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, sortBy, priceFilter, currentPage]);

  // Load session & cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("shopease_cart");
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }

    const savedToken = localStorage.getItem("shopease_token");
    const savedUser = localStorage.getItem("shopease_user");
    if (savedToken && savedUser) {
      try {
        setAuthToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Saved Wishlist synchronizer
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`shopeease_wishlist_${currentUser.id}`);
      if (saved) {
        try {
          setWishlist(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      } else {
        setWishlist([]);
      }
    } else {
      const saved = localStorage.getItem("shopeease_wishlist_anonymous");
      if (saved) {
        try {
          setWishlist(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      } else {
        setWishlist([]);
      }
    }
  }, [currentUser]);

  const toggleWishlist = (productId: string) => {
    const isSaved = wishlist.includes(productId);
    const updated = isSaved
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    setWishlist(updated);
    
    if (currentUser) {
      localStorage.setItem(`shopeease_wishlist_${currentUser.id}`, JSON.stringify(updated));
    } else {
      localStorage.setItem("shopeease_wishlist_anonymous", JSON.stringify(updated));
    }

    const prod = products.find((p) => p.id === productId);
    addToast(
      isSaved ? "Removed from Saved Items" : "Saved to Favorites",
      prod ? `${prod.name} ${isSaved ? "removed from" : "added to"} your wishlist.` : undefined,
      "info"
    );
  };

  // Dynamic SEO Metadata Updater for Zambian Search Engines
  useEffect(() => {
    let title = "ShopEase Zambia | Premium Local Deliveries & Logistics";
    let description = "Order high-quality groceries, electronics, and home goods with real-time Zambian courier tracking (Yango, ZamPost, Mercury) to all provinces.";

    if (selectedCategory && selectedCategory !== "all") {
      const categoryName = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
      title = `ShopEase Zambia | Buy Premium ${categoryName} Online`;
      description = `Shop premium ${categoryName} on ShopEase. Express delivery from Lusaka to Copperbelt, Southern, and all provinces. Real-time trackable delivery.`;
    } else if (searchTerm) {
      title = `ShopEase Zambia | Search Results for "${searchTerm}"`;
      description = `Find high-quality products matching "${searchTerm}" on ShopEase. Safe local payment methods and immediate same-day delivery options across Zambia.`;
    }

    if (typeof document !== "undefined") {
      document.title = title;
      
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", description);
    }
  }, [selectedCategory, searchTerm]);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("shopease_cart", JSON.stringify(newCart));
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      const updated = cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
          : item
      );
      saveCart(updated);
    } else {
      saveCart([...cart, { product, quantity }]);
    }

    addToast(
      "Added to Delivery Box!",
      `${product.name} (x${quantity}) is now in your cart.`,
      "cart",
      "View Cart Box",
      () => setIsCartOpen(true)
    );

    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      saveCart(cart.filter(item => item.product.id !== productId));
    } else {
      saveCart(cart.map(item => item.product.id === productId ? { ...item, quantity } : item));
    }
  };

  const removeFromCart = (productId: string) => {
    saveCart(cart.filter(item => item.product.id !== productId));
  };

  const handleAuthSuccess = (user: any, token: string) => {
    setAuthToken(token);
    setCurrentUser(user);
    localStorage.setItem("shopease_token", token);
    localStorage.setItem("shopease_user", JSON.stringify(user));
    
    // Auto redirect
    if (user.role === "ADMIN") {
      setActiveTab("admin");
    } else {
      setActiveTab("dashboard");
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem("shopease_token");
    localStorage.removeItem("shopease_user");
    setActiveTab("home");
  };

  // Categories extraction
  const dbCategoryNames = initialCategories ? initialCategories.map(c => c.name) : [];
  const rawCategories = Array.from(new Set([...dbCategoryNames, ...products.map(p => p.category)]));
  const categories = ["All", ...rawCategories.filter(Boolean)];

  // Filtering products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesPrice = p.price <= priceFilter;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sorting products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "low-high") return a.price - b.price;
    if (sortBy === "high-low") return b.price - a.price;
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0; // Default
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const currentItems = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Checkout Placement
  const handlePlaceOrder = async () => {
    setIsSubmittingOrder(true);
    const finalTotal = cartTotal + (checkoutForm.deliveryMode === "STANDARD" ? 15 : checkoutForm.deliveryMode === "EXPRESS" ? 40 : 0);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: checkoutForm.name,
          email: checkoutForm.email,
          phone: checkoutForm.phone,
          address: checkoutForm.address,
          deliveryMode: checkoutForm.deliveryMode,
          userId: currentUser?.id || null,
          momoOperator: checkoutForm.momoOperator,
          momoPhone: checkoutForm.momoPhone,
          cartItems: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            name: item.product.name,
          })),
          total: finalTotal,
        }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrderSuccessDetails({
        orderNumber: data.orderNumber,
        total: finalTotal,
        deliveryMode: checkoutForm.deliveryMode,
      });
      setCheckoutStep("success");
      saveCart([]);
    } catch {
      alert("Order checkout transaction failed. Please retry.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus("submitting");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      if (res.ok) {
        setNewsletterStatus("success");
        setNewsletterEmail("");
      } else {
        setNewsletterStatus("error");
      }
    } catch {
      setNewsletterStatus("error");
    }
  };

  const brandColor = "#15803d"; // Zambian Green

  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50/20 selection:bg-emerald-100 selection:text-emerald-900 text-stone-800">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      
      {/* BRAND HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow" style={{ backgroundColor: brandColor }}>
              S
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-stone-900 block leading-none">ShopEase</span>
              <span className="text-[10px] text-emerald-700 font-bold tracking-wider uppercase">Zambian Sourced</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-stone-600">
            <button
              onClick={() => {
                setActiveTab("home");
                // Wait small micro-tick and scroll to products
                setTimeout(() => document.getElementById("products-nav-section")?.scrollIntoView({ behavior: "smooth" }), 50);
              }}
              className="hover:text-emerald-800 transition-colors"
            >
              Products
            </button>
            <button
              onClick={() => {
                setActiveTab("home");
                setTimeout(() => document.getElementById("about-nav-section")?.scrollIntoView({ behavior: "smooth" }), 50);
              }}
              className="hover:text-emerald-800 transition-colors"
            >
              About Us
            </button>
            <button
              onClick={() => {
                setActiveTab("home");
                setTimeout(() => document.getElementById("campaigns-nav-section")?.scrollIntoView({ behavior: "smooth" }), 50);
              }}
              className="hover:text-emerald-800 transition-colors flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              Campaigns
            </button>
            <button
              onClick={() => {
                setActiveTab("home");
                setTimeout(() => document.getElementById("contact-nav-section")?.scrollIntoView({ behavior: "smooth" }), 50);
              }}
              className="hover:text-emerald-800 transition-colors"
            >
              Contact
            </button>
            
            {currentUser && (
              <button
                onClick={() => setActiveTab(currentUser.role === "ADMIN" ? "admin" : "dashboard")}
                className="text-emerald-700 hover:text-emerald-950 font-extrabold"
              >
                {currentUser.role === "ADMIN" ? "Admin Control" : "My Orders"}
              </button>
            )}
          </nav>

          {/* Actions Column */}
          <div className="flex items-center gap-4">
            
            {/* Currency Switcher Toggle */}
            <div className="flex bg-stone-100 p-1 rounded-lg border border-stone-200">
              <button
                onClick={() => setCurrency("ZMW")}
                className={`px-2 py-1 text-[10px] font-extrabold rounded ${currency === "ZMW" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"}`}
              >
                K ZMW
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-2 py-1 text-[10px] font-extrabold rounded ${currency === "USD" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"}`}
              >
                $ USD
              </button>
            </div>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-stone-50 rounded-full transition-all"
            >
              <ShoppingBag className="w-5.5 h-5.5 text-stone-700 hover:text-stone-900" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-600 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Authentication state */}
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="hidden lg:inline text-xs font-bold text-stone-700">{currentUser.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 border border-stone-200 hover:bg-stone-50 rounded-lg text-[10px] font-extrabold uppercase tracking-wide text-stone-600 transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("dashboard")}
                className="hidden sm:block px-4 py-2 text-white text-xs font-bold tracking-wider uppercase rounded-xl transition-all shadow hover:brightness-105"
                style={{ backgroundColor: brandColor }}
              >
                Login / Register
              </button>
            )}

            {/* Hamburger Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-stone-50 rounded-full md:hidden transition-all flex items-center justify-center"
              aria-label="Open Menu"
            >
              <Menu className="w-5.5 h-5.5 text-stone-700 hover:text-stone-900" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION SIDEBAR */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 md:hidden"
            />

            {/* Sidebar menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl border-l border-stone-100 z-50 md:hidden flex flex-col p-6 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-stone-150 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-base shadow" style={{ backgroundColor: brandColor }}>
                    S
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-stone-950 block leading-none">ShopEase</span>
                    <span className="text-[9px] text-emerald-700 font-bold tracking-wider uppercase">Zambian Sourced</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-stone-50 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              <nav className="flex flex-col gap-4 text-sm font-bold uppercase tracking-wider text-stone-600">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveTab("home");
                    setTimeout(() => document.getElementById("products-nav-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="text-left py-2 border-b border-stone-50 hover:text-emerald-800 transition-colors"
                >
                  Products
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveTab("home");
                    setTimeout(() => document.getElementById("about-nav-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="text-left py-2 border-b border-stone-50 hover:text-emerald-800 transition-colors"
                >
                  About Us
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveTab("home");
                    setTimeout(() => document.getElementById("campaigns-nav-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="text-left py-2 border-b border-stone-50 hover:text-emerald-800 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  Campaigns
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveTab("home");
                    setTimeout(() => document.getElementById("contact-nav-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="text-left py-2 border-b border-stone-50 hover:text-emerald-800 transition-colors"
                >
                  Contact
                </button>
                
                {currentUser && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setActiveTab(currentUser.role === "ADMIN" ? "admin" : "dashboard");
                    }}
                    className="text-left py-2 text-emerald-700 hover:text-emerald-950 font-extrabold"
                  >
                    {currentUser.role === "ADMIN" ? "Admin Control" : "My Orders"}
                  </button>
                )}
              </nav>

              {/* Account state block in sidebar */}
              <div className="border-t border-stone-150 pt-6 flex-1 flex flex-col justify-end">
                {currentUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase">
                        {currentUser.name.slice(0, 2)}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-stone-900 leading-none">{currentUser.name}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5 leading-none">{currentUser.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full py-2.5 border border-stone-200 hover:bg-stone-50 rounded-xl text-[10px] font-extrabold uppercase tracking-wide text-stone-600 transition-all"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setActiveTab("dashboard");
                    }}
                    className="w-full py-3 text-white text-xs font-bold tracking-wider uppercase rounded-xl transition-all shadow hover:brightness-105 text-center"
                    style={{ backgroundColor: brandColor }}
                  >
                    Login / Register
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CORE CONTAINER TAB SELECTOR */}
      {activeTab === "home" && (
        <div className="flex flex-col">
          {/* HERO SPLASH BANNER */}
          <section className="relative bg-gradient-to-b from-stone-100 via-stone-50 to-white py-16 sm:py-24 overflow-hidden border-b border-stone-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-100">
                    ★ Premium Zambian Grocer
                  </span>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-tight">
                    {siteSettings?.heroTitle || "ShopEase"}
                  </h1>
                  <p className="text-lg text-stone-600 max-w-lg leading-relaxed">
                    {siteSettings?.heroSubtitle || "Your trusted partner for quality products, fast delivery, and exceptional service across Lusaka."}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-4">
                    <button
                      onClick={() => document.getElementById("products-nav-section")?.scrollIntoView({ behavior: "smooth" })}
                      className="px-6 py-3 rounded-xl text-white font-bold text-xs tracking-wide uppercase transition-all shadow-md hover:shadow-lg hover:translate-y-[-1px]"
                      style={{ backgroundColor: brandColor }}
                    >
                      Shop Catalog
                    </button>
                    <button
                      onClick={() => document.getElementById("about-nav-section")?.scrollIntoView({ behavior: "smooth" })}
                      className="px-6 py-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 font-bold text-xs tracking-wide uppercase text-stone-700 transition-all shadow-sm"
                    >
                      Our Story
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="bg-emerald-50/40 p-8 rounded-3xl border border-emerald-100 space-y-4 max-w-sm mx-auto text-center shadow-xs">
                    <span className="text-4xl block animate-pulse">🚚</span>
                    <h3 className="text-lg font-black text-stone-900">Same-Day Logistics</h3>
                    <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
                      All grocery boxes are shipped with customized cooling packs directly from our Lusaka hub using local Zambian delivery services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PRODUCTS CATALOG SECTION */}
          <section id="products-nav-section" className="py-16 scroll-mt-18">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="text-3xl font-extrabold text-stone-950 tracking-tight">Our Catalog</h2>
                <p className="text-sm text-stone-500">Search and discover premium daily goods, gourmet spices, and fresh peanut butter packs.</p>
              </div>

              {/* PROMINENT STANDALONE SEARCH BAR CARD */}
              <div className="max-w-2xl mx-auto w-full relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search products by name or description..."
                  className="w-full pl-12 pr-4 py-3 bg-white text-sm text-stone-800 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs focus:shadow-sm transition-all"
                />
              </div>

              {/* DYNAMIC CATEGORY TOP-BAR TABS */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${
                        isActive
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                          : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* COMPACT FILTERS & CONTROLS BAR */}
              <div className="bg-white p-5 rounded-3xl border border-stone-150 shadow-xs max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Custom Sorter Dropdown */}
                <div className="w-full md:w-1/3 space-y-1.5">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Sort Products By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      const newSort = e.target.value as any;
                      setSortBy(newSort);
                      setCurrentPage(1);
                      addToast("Filter Applied", `Sorted by ${newSort}`, "filter");
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none cursor-pointer"
                  >
                    <option value="default">Default Sorting</option>
                    <option value="low-high">Price: Low-to-High</option>
                    <option value="high-low">Price: High-to-Low</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>

                {/* Price Range Slider */}
                <div className="w-full md:w-2/3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Max Price Filter</span>
                    <div className="flex items-center gap-1.5 font-black text-emerald-800 text-xs">
                      <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{formatPrice(priceFilter)}</span>
                    </div>
                  </div>

                  <div className="w-full flex items-center gap-3">
                    <span className="text-[10px] font-bold text-stone-400">K0</span>
                    <input
                      type="range"
                      min="0"
                      max="20000"
                      step="100"
                      value={priceFilter}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPriceFilter(val);
                        setCurrentPage(1);
                      }}
                      onMouseUp={(e) => {
                        addToast("Price Filter Updated", `Max Price set to K${priceFilter.toLocaleString()}`, "filter");
                      }}
                      onTouchEnd={(e) => {
                        addToast("Price Filter Updated", `Max Price set to K${priceFilter.toLocaleString()}`, "filter");
                      }}
                      className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                    />
                    <span className="text-[10px] font-bold text-stone-400">K20,000</span>
                  </div>
                </div>
              </div>

              {/* DYNAMIC PRODUCT LISTING CARDS OR SKELETON LOADERS */}
              {isFetching ? (
                /* LIVE SHIMMERING SKELETON LOADERS */
                <ProductSkeletonGrid count={6} />
              ) : currentItems.length > 0 ? (
                /* ACTUAL PRODUCTS GRID */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentItems.map((product) => {
                    const imageList = parseProductImages(product.images);
                    const isOutOfStock = product.stock <= 0;
                    
                    return (
                      <article
                        key={product.id}
                        className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                      >
                        {/* Image overlay with Carousel */}
                        <div className="relative aspect-square w-full bg-stone-50 overflow-hidden group">
                          <ProductCarousel
                            images={imageList}
                            productName={product.name}
                            aspectRatio="aspect-square"
                            showThumbnails={false}
                            onImageClick={() => { setSelectedProduct(product); setQuickViewQty(1); }}
                          />

                          {/* Category Badge - Always top-left */}
                          <span className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase text-stone-800 shadow-xs border border-stone-100 pointer-events-none">
                            {product.category || "General"}
                          </span>

                          {/* Out of Stock Badge - Bottom-left if applicable */}
                          {isOutOfStock && (
                            <span className="absolute bottom-3 left-3 z-10 bg-red-600 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow pointer-events-none">
                              Out of stock
                            </span>
                          )}

                          {/* Wishlist Heart Button - Always top-right */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product.id);
                            }}
                            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs shadow-xs border border-stone-150 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group/heart"
                            title={wishlist.includes(product.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                          >
                            <Heart
                              className={`w-4 h-4 transition-all ${
                                wishlist.includes(product.id)
                                  ? "text-rose-500 fill-rose-500 scale-110"
                                  : "text-stone-400 group-hover/heart:text-rose-500"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Description metadata */}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <h3
                                onClick={() => { setSelectedProduct(product); setQuickViewQty(1); }}
                                className="font-extrabold text-stone-900 text-base hover:text-emerald-800 cursor-pointer transition-colors line-clamp-1"
                              >
                                {product.name}
                              </h3>
                              <span className="font-black text-emerald-800 text-base shrink-0">
                                {formatPrice(product.price)}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                              {product.description}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-stone-50 flex gap-2">
                            <button
                              onClick={() => { setSelectedProduct(product); setQuickViewQty(1); }}
                              className="flex-1 px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                            >
                              <Info className="w-3.5 h-3.5" />
                              Quick View
                            </button>
                            <button
                              disabled={isOutOfStock}
                              onClick={() => addToCart(product)}
                              className="flex-1 px-3 py-2.5 text-white font-bold text-xs rounded-xl transition-all hover:brightness-105 disabled:opacity-50 shadow-xs"
                              style={{ backgroundColor: brandColor }}
                            >
                              Add to Box
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                /* EMPTY SEARCH STATE */
                <div className="bg-white rounded-3xl p-12 border border-dashed border-stone-200 text-center max-w-md mx-auto space-y-4">
                  <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 text-xl mx-auto">
                    🔎
                  </div>
                  <h3 className="font-bold text-stone-800">No matching products</h3>
                  <p className="text-xs text-stone-500">
                    We couldn&apos;t find any items matching those criteria in our database. Try sliding the price filter higher or clearing search tags.
                  </p>
                  <button
                    onClick={() => { setSearchTerm(""); setSelectedCategory("All"); setPriceFilter(500); }}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold hover:bg-stone-50 text-stone-700 transition-all"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

              {/* COMPLEX PAGINATION FOOTER CONTROL */}
              {!isFetching && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1.5 border border-stone-200 rounded-lg text-xs font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-all"
                  >
                    Prev
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pg = i + 1;
                    return (
                      <button
                        key={pg}
                        onClick={() => setCurrentPage(pg)}
                        className={`w-8.5 h-8.5 rounded-lg text-xs font-black transition-all border ${
                          currentPage === pg
                            ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                            : "border-stone-200 hover:bg-stone-50 text-stone-600"
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-3 py-1.5 border border-stone-200 rounded-lg text-xs font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* PORTABLE ABOUT SECTION */}
          <div id="about-nav-section" className="scroll-mt-18">
            <AboutSection />
          </div>

          {/* CAMPAIGNS MARKETING CAMPAIGNS HUB */}
          <div id="campaigns-nav-section" className="scroll-mt-18">
            <PromotionalAds isAdmin={currentUser?.role === "ADMIN"} />
          </div>

          {/* FAQ SECTION */}
          <FAQSection />

          {/* CUSTOMER TESTIMONIALS SECTION */}
          <TestimonialsSection initialTestimonials={testimonials || []} />

          {/* PORTABLE CONTACT SECTION */}
          <div id="contact-nav-section" className="scroll-mt-18">
            <ContactSection />
          </div>
        </div>
      )}

      {/* SECURE CUSTOMER / ADMIN AUTH VIEW CONTAINER */}
      {activeTab === "dashboard" && (
        <div className="py-12 bg-stone-50/40">
          {authToken && currentUser ? (
            <CustomerDashboard
              token={authToken}
              user={currentUser}
              brandColor={brandColor}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              products={products}
              onAddToCart={addToCart}
            />
          ) : (
            <AuthSection onAuthSuccess={handleAuthSuccess} brandColor={brandColor} />
          )}
        </div>
      )}

      {/* SECURE ADMINISTRATOR CONTROL VIEW CONTAINER */}
      {activeTab === "admin" && (
        <div className="py-12 bg-stone-50/40">
          {authToken && currentUser && currentUser.role === "ADMIN" ? (
            <AdminDashboard token={authToken} brandColor={brandColor} />
          ) : (
            <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-red-100 shadow text-center space-y-4">
              <span className="text-4xl">⚠️</span>
              <h3 className="text-lg font-black text-stone-900">Access Denied</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                You must be logged in with a certified administrator profile to access the ShopEase Logistics and Inventory dashboards.
              </p>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="px-5 py-2.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-105"
                style={{ backgroundColor: brandColor }}
              >
                Access Authorization Form
              </button>
            </div>
          )}
        </div>
      )}

      {/* FOOTER SECTION */}
      <footer className="mt-auto bg-stone-950 text-stone-400 py-12 border-t border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-stone-900 pb-8">
            {/* Logo */}
            <div className="md:col-span-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black text-lg">
                S
              </div>
              <div>
                <span className="font-extrabold text-white text-base block">ShopEase</span>
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Premium Grocer Zambia</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-stone-900/40 p-4 rounded-2xl border border-stone-900">
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-white uppercase tracking-wider">Join our local newsletters</h4>
                <p className="text-[10px] text-stone-500">Subscribe for regional stock notifications and batch arrivals.</p>
              </div>

              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full sm:max-w-xs">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter email..."
                  className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === "submitting"}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-xl transition-all disabled:opacity-55"
                >
                  {newsletterStatus === "submitting" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Subscribe"}
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-600">
            <p>{siteSettings?.footerText || "© 2025 ShopEase. All rights reserved."}</p>
            <p>EVERYTHING ZAMBIAN BASED • +260 973 632 403 • Lusaka, Zambia</p>
          </div>
        </div>
      </footer>

      {/* QUICK VIEW MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={() => setSelectedProduct(null)} />
          
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-100 z-10 animate-in zoom-in-95 duration-150 flex flex-col md:flex-row gap-8">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Product Image Carousel in Quick View Modal */}
            <div className="w-full md:w-1/2 rounded-2xl bg-stone-100 overflow-hidden relative border border-stone-100">
              <ProductCarousel
                images={parseProductImages(selectedProduct.images)}
                productName={selectedProduct.name}
                aspectRatio="aspect-square"
                showThumbnails={true}
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-emerald-50 text-emerald-800">
                  {selectedProduct.category || "General"}
                </span>
                
                <h3 className="text-2xl font-black text-stone-900 leading-tight">{selectedProduct.name}</h3>
                
                <span className="text-xl font-black text-emerald-800 block">
                  {formatPrice(selectedProduct.price)}
                </span>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Available Stock:</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-stone-100 rounded-full overflow-hidden border border-stone-150">
                      <div
                        className="h-full bg-emerald-600"
                        style={{ width: `${Math.min(100, (selectedProduct.stock / 1500) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-extrabold text-stone-700 shrink-0">{selectedProduct.stock} units</span>
                  </div>
                </div>

                <p className="text-xs text-stone-500 leading-relaxed max-h-36 overflow-y-auto pr-1">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50/50">
                  <button
                    onClick={() => setQuickViewQty(q => Math.max(1, q - 1))}
                    className="px-3.5 py-2 font-black text-stone-500 hover:bg-stone-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-black text-stone-800">{quickViewQty}</span>
                  <button
                    onClick={() => setQuickViewQty(q => Math.min(selectedProduct.stock, q + 1))}
                    className="px-3.5 py-2 font-black text-stone-500 hover:bg-stone-100"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={selectedProduct.stock <= 0}
                  onClick={() => {
                    addToCart(selectedProduct, quickViewQty);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-3 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-105 transition-all shadow-sm"
                  style={{ backgroundColor: brandColor }}
                >
                  Add To Box
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER SHOPPING CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop with fade-in/out */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs"
              onClick={() => setIsCartOpen(false)}
            />

            {/* Panel sliding from right */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="relative w-screen max-w-md bg-white shadow-2xl flex flex-col h-full z-10"
            >
              <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-stone-600" />
                  Your Delivery Box
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="p-1.5 rounded-full text-stone-400 hover:text-stone-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length > 0 ? (
                  <ul className="space-y-4">
                    {cart.map((item) => (
                      <li key={item.product.id} className="flex gap-4 p-3.5 rounded-2xl border border-stone-150 bg-stone-50/30">
                        <img
                          src={parseProductImage(item.product.images)}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-150"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex items-start justify-between">
                            <h4 className="font-extrabold text-xs text-stone-900 line-clamp-1">{item.product.name}</h4>
                            <span className="font-extrabold text-xs text-emerald-800 ml-2">{formatPrice(item.product.price * item.quantity)}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-stone-500 mt-3">
                            <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white shadow-xs">
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                className="px-2.5 py-1 text-stone-500 hover:bg-stone-50 font-bold"
                              >
                                -
                              </button>
                              <span className="px-3.5 py-1 font-bold text-stone-800 border-x border-stone-200 bg-stone-50">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                className="px-2.5 py-1 text-stone-500 hover:bg-stone-50 font-bold"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-stone-400 hover:text-red-600 font-extrabold uppercase tracking-wider text-[9px]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                    <span className="text-4xl animate-bounce">🛒</span>
                    <h4 className="font-extrabold text-stone-800">Your delivery box is empty</h4>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto">
                      Explore our delicious catalog to add nutritious daily essentials, peanut butter, and spices.
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="px-5 py-2.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow hover:brightness-105"
                      style={{ backgroundColor: brandColor }}
                    >
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="px-6 py-5 border-t border-stone-150 bg-stone-50">
                  <div className="flex justify-between items-center text-stone-950 font-extrabold text-sm mb-4">
                    <span>Order Total</span>
                    <span className="text-emerald-800 text-base">{formatPrice(cartTotal)}</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setCheckoutStep("details");
                      setCheckoutForm({
                        ...checkoutForm,
                        name: currentUser?.name || "",
                        email: currentUser?.email || "",
                      });
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full py-3.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all hover:brightness-105 shadow flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: brandColor }}
                  >
                    Go To Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHECKOUT MODAL COMPLETE WITH MOBILE MONEY SIMULATOR */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={() => {
            if (checkoutStep !== "success") setIsCheckoutOpen(false);
          }} />

          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-100 z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {checkoutStep !== "success" && (
              <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            )}

            {checkoutStep === "details" ? (
              /* Step 1: Customer Details */
              <div className="space-y-5 text-stone-700">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">SECURE CHECKOUT</span>
                  <h3 className="text-xl font-extrabold text-stone-900">Delivery Details</h3>
                  <p className="text-xs text-stone-500">Provide shipping coordinates for same-day Lusaka log dispatches.</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={checkoutForm.name}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                      placeholder="Bornface Kangombe"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={checkoutForm.email}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                        placeholder="bornface@gmail.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={checkoutForm.phone}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                        placeholder="+260 971 234 567"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">Lusaka Delivery Address *</label>
                    <textarea
                      required
                      rows={2}
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      placeholder="e.g. Plot 100, Great East Road, Lusaka"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">Select Region Delivery Mode</label>
                    <select
                      value={checkoutForm.deliveryMode}
                      onChange={(e) => {
                        const mode = e.target.value;
                        setCheckoutForm({
                          ...checkoutForm,
                          deliveryMode: mode,
                          address: mode === "PICKUP" ? "ShopEase Central Depot (Self Pick-up), Cairo Road, Lusaka" : (checkoutForm.address === "ShopEase Central Depot (Self Pick-up), Cairo Road, Lusaka" ? "" : checkoutForm.address)
                        });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none bg-white"
                    >
                      <option value="STANDARD">Standard Shipping (K15.00)</option>
                      <option value="EXPRESS">Express Courier (K40.00)</option>
                      <option value="PICKUP">Self Pick-up at Depot (K0.00)</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-stone-150 pt-4 flex flex-col gap-1.5 text-xs font-semibold">
                  <div className="flex justify-between text-stone-600">
                    <span>Box Subtotal:</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Logistics Fee ({checkoutForm.deliveryMode === "PICKUP" ? "Pick-up" : "Delivery"}):</span>
                    <span>{formatPrice(checkoutForm.deliveryMode === "STANDARD" ? 15 : checkoutForm.deliveryMode === "EXPRESS" ? 40 : 0)}</span>
                  </div>
                  <div className="flex justify-between text-stone-900 font-extrabold text-base pt-2 border-t border-stone-100">
                    <span>Grand Total Due:</span>
                    <span className="text-emerald-800">{formatPrice(cartTotal + (checkoutForm.deliveryMode === "STANDARD" ? 15 : checkoutForm.deliveryMode === "EXPRESS" ? 40 : 0))}</span>
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutStep("momo_pay")}
                  disabled={!checkoutForm.name || !checkoutForm.email || !checkoutForm.phone || !checkoutForm.address}
                  className="w-full py-3 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow flex items-center justify-center gap-1.5 hover:brightness-105 disabled:opacity-50"
                  style={{ backgroundColor: brandColor }}
                >
                  Proceed to Payment
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : checkoutStep === "momo_pay" ? (
              /* Step 2: Zambian Mobile Money Interactive PIN Simulator */
              <div className="space-y-5 text-stone-700">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">SECURE PAYMENT GATEWAY</span>
                  <h3 className="text-xl font-extrabold text-stone-900">Mobile Money Wallet</h3>
                  <p className="text-xs text-stone-500">Authorize payments securely utilizing regional telecom pins.</p>
                </div>

                <div className="space-y-4 text-xs bg-stone-50 p-5 rounded-2xl border border-stone-150">
                  <div className="grid grid-cols-4 bg-white p-1 rounded-xl border border-stone-250 gap-1">
                    <button
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, momoOperator: "AIRTEL" })}
                      className={`py-1.5 rounded-lg text-[9px] font-black uppercase transition-all text-center ${
                        checkoutForm.momoOperator === "AIRTEL" ? "bg-red-600 text-white shadow-xs" : "text-stone-500 hover:bg-stone-50"
                      }`}
                    >
                      Airtel
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, momoOperator: "MTN" })}
                      className={`py-1.5 rounded-lg text-[9px] font-black uppercase transition-all text-center ${
                        checkoutForm.momoOperator === "MTN" ? "bg-amber-400 text-stone-900 shadow-xs" : "text-stone-500 hover:bg-stone-50"
                      }`}
                    >
                      MTN MoMo
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, momoOperator: "MPESA" })}
                      className={`py-1.5 rounded-lg text-[9px] font-black uppercase transition-all text-center ${
                        checkoutForm.momoOperator === "MPESA" ? "bg-emerald-600 text-white shadow-xs" : "text-stone-500 hover:bg-stone-50"
                      }`}
                    >
                      M-Pesa
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, momoOperator: "ZAMTEL" })}
                      className={`py-1.5 rounded-lg text-[9px] font-black uppercase transition-all text-center ${
                        checkoutForm.momoOperator === "ZAMTEL" ? "bg-teal-600 text-white shadow-xs" : "text-stone-500 hover:bg-stone-50"
                      }`}
                    >
                      Zamtel
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        {checkoutForm.momoOperator === "AIRTEL" ? "Airtel Money Wallet" :
                         checkoutForm.momoOperator === "MTN" ? "MTN MoMo Wallet" :
                         checkoutForm.momoOperator === "MPESA" ? "M-Pesa Wallet" : "Zamtel Wallet"} Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={checkoutForm.momoPhone}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, momoPhone: e.target.value })}
                        placeholder={
                          checkoutForm.momoOperator === "AIRTEL" ? "+260 971 234 567 (Airtel)" :
                          checkoutForm.momoOperator === "MTN" ? "+260 961 234 567 (MTN)" :
                          checkoutForm.momoOperator === "MPESA" ? "+260 751 234 567 (M-Pesa)" :
                          "+260 951 234 567 (Zamtel)"
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:border-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        Enter Wallet 4-Digit Security PIN
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={checkoutForm.momoPin}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, momoPin: e.target.value })}
                        placeholder="••••"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none text-center tracking-widest font-black"
                      />
                      <span className="text-[9px] text-stone-400 block text-center mt-1">This is a secure offline Sandbox telecom simulation. No actual funds are charged.</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-stone-150 pt-4 flex items-center justify-between text-stone-900 font-extrabold text-base">
                  <span>Authorized Total:</span>
                  <span className="text-emerald-800">{formatPrice(cartTotal)}</span>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setCheckoutStep("details")}
                    className="flex-1 py-3 border border-stone-200 text-stone-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-stone-50"
                  >
                    Go Back
                  </button>
                  
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmittingOrder || !checkoutForm.momoPhone || checkoutForm.momoPin.length < 4}
                    className="flex-1 py-3 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow flex items-center justify-center gap-1.5 hover:brightness-105 disabled:opacity-50"
                    style={{ backgroundColor: brandColor }}
                  >
                    {isSubmittingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    Confirm Pay
                  </button>
                </div>
              </div>
            ) : (
              /* Step 3: Success details confirmation */
              <div className="text-center space-y-6 py-4 animate-in fade-in duration-200 text-stone-700">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto border border-emerald-100 animate-bounce">
                  ✓
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-stone-900 tracking-tight">Order Successful!</h3>
                  <p className="text-stone-500 text-xs leading-relaxed">
                    Your order was recorded and saved successfully in our Neon cloud database!
                  </p>
                </div>

                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-150 text-left space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-stone-500">Order Code:</span>
                    <span className="font-extrabold text-stone-900 select-all font-mono">#{orderSuccessDetails?.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-stone-500">Total Settled:</span>
                    <span className="font-black text-emerald-800">{formatPrice(orderSuccessDetails?.total || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-stone-500">Mode:</span>
                    <span className="font-extrabold text-stone-700">{orderSuccessDetails?.deliveryMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-stone-500">Status:</span>
                    <span className="px-2 py-0.5 rounded-full font-bold text-[9px] bg-amber-50 text-amber-800 uppercase animate-pulse">Pending Dispatch</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400">
                  You can now track this shipment in real-time. Navigate to your customer portal using the navigation header.
                </p>

                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setCheckoutStep("details");
                    setOrderSuccessDetails(null);
                    // Open the client orders tab instantly so they can watch live tracking!
                    setActiveTab("dashboard");
                  }}
                  className="w-full py-3.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow hover:brightness-105"
                  style={{ backgroundColor: brandColor }}
                >
                  Track Order Progress
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import bcrypt from "bcryptjs";

// Global in-memory storage to persist across Next.js dev reloads
const globalForInMemoryDb = globalThis as unknown as {
  __inMemoryDbStore?: Record<string, any[]>;
};

if (!globalForInMemoryDb.__inMemoryDbStore) {
  // Preseed default products
  const defaultProducts = [
    {
      id: "prod_seed_1",
      name: "Organic Zambian Forest Honey",
      slug: "organic-zambian-honey",
      description: "Pure, unprocessed, organic forest honey harvested from the pristine Miombo woodlands of Northwestern Province.",
      price: 85,
      stock: 24,
      images: JSON.stringify(["https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600"]),
      category: "Groceries",
      featured: true,
      createdAt: new Date()
    },
    {
      id: "prod_seed_2",
      name: "Premium White Spoon Sugar (2kg)",
      slug: "premium-white-sugar-2kg",
      description: "High-quality, fine granulated white sugar proudly grown and milled locally in Zambia. Perfect for everyday use.",
      price: 65,
      stock: 50,
      images: JSON.stringify(["https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&q=80&w=600"]),
      category: "Groceries",
      featured: false,
      createdAt: new Date()
    },
    {
      id: "prod_seed_3",
      name: "Zambian Mosi Premium Lager (6-pack)",
      slug: "mosi-lager-6pack",
      description: "The classic taste of Zambia. A crisp, golden lager brewed locally since 1978. Truly refreshing.",
      price: 110,
      stock: 30,
      images: JSON.stringify(["https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=600"]),
      category: "Groceries",
      featured: true,
      createdAt: new Date()
    },
    {
      id: "prod_seed_4",
      name: "Solar Powered Rechargeable LED Lantern",
      slug: "solar-led-lantern",
      description: "Multi-functional LED emergency light with built-in solar panels and a USB charging port. Stay illuminated during load shedding.",
      price: 350,
      stock: 15,
      images: JSON.stringify(["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600"]),
      category: "Electronics",
      featured: true,
      createdAt: new Date()
    },
    {
      id: "prod_seed_5",
      name: "Handmade Chitenge Accent Pillow",
      slug: "chitenge-accent-pillow",
      description: "Stunning 45x45cm cushion cover hand-stitched in Lusaka using vibrant 100% cotton Chitenge fabric. Pattern varies.",
      price: 120,
      stock: 12,
      images: JSON.stringify(["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=600"]),
      category: "Home Goods",
      featured: false,
      createdAt: new Date()
    },
    {
      id: "prod_seed_6",
      name: "Original Zambezi Bream / Tilapia (Whole, 1kg)",
      slug: "zambezi-bream-1kg",
      description: "Freshly harvested Tilapia from the clean waters of the Zambezi. Descaled and gutted, frozen fresh.",
      price: 145,
      stock: 18,
      images: JSON.stringify(["https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&q=80&w=600"]),
      category: "Groceries",
      featured: true,
      createdAt: new Date()
    }
  ];

  // Seed default users
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync("123456", salt);

  const defaultUsers = [
    {
      id: "user_admin",
      email: "director@example.com",
      password: hash,
      name: "Director",
      role: "ADMIN",
      approved: true,
      createdAt: new Date()
    },
    {
      id: "user_customer",
      email: "customer@example.com",
      password: hash,
      name: "Customer",
      role: "CUSTOMER",
      approved: true,
      createdAt: new Date()
    },
    {
      id: "user_mututwa",
      email: "mututwa@example.com",
      password: hash,
      name: "Mututwa Mututwa",
      role: "ADMIN",
      approved: true,
      createdAt: new Date()
    },
    {
      id: "user_kaishe",
      email: "kaishe@example.com",
      password: hash,
      name: "Kaishe Mututwa",
      role: "ADMIN",
      approved: true,
      createdAt: new Date()
    },
    {
      id: "user_junior",
      email: "junior@example.com",
      password: hash,
      name: "Mututwa Junior",
      role: "ADMIN",
      approved: true,
      createdAt: new Date()
    },
    {
      id: "user_mj",
      email: "mj@example.com",
      password: hash,
      name: "Mututwa Junior",
      role: "ADMIN",
      approved: true,
      createdAt: new Date()
    },
    {
      id: "user_ben",
      email: "ben@example.com",
      password: hash,
      name: "Ben",
      role: "CUSTOMER",
      approved: true,
      createdAt: new Date()
    }
  ];

  const defaultCampaigns = [
    {
      id: "camp_seed_1",
      title: "Shop B33 Tour",
      highlights: "A complete walking tour around our flagship Shop B33 wholesale warehouse in Lusaka. Showing off premium Zambian-sourced grocery reserves.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-bag-full-of-fresh-vegetables-and-fruits-40545-large.mp4",
      views: 0,
      likes: 0,
      createdAt: new Date()
    },
    {
      id: "camp_seed_2",
      title: "Pixel Unboxing",
      highlights: "Unboxing the latest Google Pixel series directly at our tech department. Pristine quality imports ready for order with same-day delivery.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-holding-a-green-shopping-bag-34237-large.mp4",
      views: 0,
      likes: 0,
      createdAt: new Date()
    }
  ];

  globalForInMemoryDb.__inMemoryDbStore = {
    cart: [],
    cartItem: [],
    coupon: [],
    category: [],
    newsletterSubscriber: [],
    order: [],
    orderItem: [],
    product: defaultProducts,
    review: [],
    siteSettings: [{
      id: "shop_ease_settings",
      siteName: "ShopEase",
      primaryColor: "#15803d",
      heroTitle: "ShopEase",
      heroSubtitle: "Your trusted partner for quality products, fast delivery, and exceptional service.",
      footerText: "© 2025 ShopEase. All rights reserved.",
      aboutTitle: "About ShopEase",
      aboutSubtitle: "Your trusted partner for quality products, fast delivery, and exceptional service.",
      aboutMission: "To make online shopping effortless, enjoyable, and accessible to everyone. We curate only the best products, ensuring premium quality at fair prices, and deliver them to your doorstep with care and speed.",
      aboutStory: "ShopEase was founded in 2025 by a group of e-commerce enthusiasts who believed that shopping online should be simple, safe, and satisfying. What started as a small local store in Lusaka has grown into Zambia's most reliable retail platform, connecting families and businesses with premium-quality daily essentials, nutritious foods, and bespoke products.",
      contactPhone: "+260 973 632 403",
      contactEmail: "support@shopeease.com",
      contactLocation: "Lusaka, Zambia",
      whatsappNumber: "260973632403",
      teamMembers: JSON.stringify([
        { name: "Mututwa Mututwa", role: "Founder & CEO", initials: "MM", desc: "Visionary leader driving retail innovation in Zambia." },
        { name: "Kaishe Mututwa", role: "Operations Manager", initials: "KM", desc: "Logistics specialist ensuring speedy regional deliveries." },
        { name: "Mututwa Junior", role: "Customer Support Lead", initials: "MJ", desc: "Dedicated champion for customer-first service." }
      ]),
      updatedAt: new Date()
    }],
    testimonial: [],
    trackingLog: [],
    user: defaultUsers,
    campaign: defaultCampaigns
  };
}

const store = globalForInMemoryDb.__inMemoryDbStore!;

function createMockTable(modelName: string) {
  const getTable = () => store[modelName] || [];
  const setTable = (data: any[]) => {
    store[modelName] = data;
  };

  const matches = (item: any, where: any): boolean => {
    if (!where) return true;
    for (const [key, val] of Object.entries(where)) {
      if (val && typeof val === "object" && !Array.isArray(val)) {
        if ("equals" in val) {
          if (item[key] !== val.equals) return false;
        } else if ("in" in val) {
          if (!Array.isArray(val.in) || !val.in.includes(item[key])) return false;
        } else {
          if (!matches(item[key], val)) return false;
        }
      } else {
        if (item[key] !== val) return false;
      }
    }
    return true;
  };

  // Helper to resolve relationships if "include" is specified
  const applyIncludes = (item: any, include: any): any => {
    if (!item || !include) return item;
    const resolved = { ...item };

    for (const [key, incVal] of Object.entries(include)) {
      if (!incVal) continue;

      if (key === "OrderItem") {
        const orderItems = (store.orderItem || []).filter((oi: any) => oi.orderId === resolved.id);
        resolved.OrderItem = orderItems.map((oi: any) => {
          if (typeof incVal === "object" && (incVal as any).include) {
            return applyIncludes(oi, (incVal as any).include);
          }
          return oi;
        });
      } else if (key === "Product") {
        const prod = (store.product || []).find((p: any) => p.id === resolved.productId);
        resolved.Product = prod || null;
      } else if (key === "TrackingLog") {
        let logs = (store.trackingLog || []).filter((tl: any) => tl.orderId === resolved.id);
        if (typeof incVal === "object" && (incVal as any).orderBy) {
          const orderBy = Array.isArray((incVal as any).orderBy) ? (incVal as any).orderBy[0] : (incVal as any).orderBy;
          for (const [obKey, obDir] of Object.entries(orderBy)) {
            logs = [...logs].sort((a, b) => {
              let valA = a[obKey];
              let valB = b[obKey];
              if (valA instanceof Date) valA = valA.getTime();
              if (valB instanceof Date) valB = valB.getTime();
              if (valA === valB) return 0;
              if (valA < valB) return obDir === "desc" ? 1 : -1;
              return obDir === "desc" ? -1 : 1;
            });
          }
        }
        resolved.TrackingLog = logs;
      } else if (key === "CartItem") {
        const cartItems = (store.cartItem || []).filter((ci: any) => ci.cartId === resolved.id);
        resolved.CartItem = cartItems.map((ci: any) => {
          if (typeof incVal === "object" && (incVal as any).include) {
            return applyIncludes(ci, (incVal as any).include);
          }
          return ci;
        });
      }
    }
    return resolved;
  };

  return {
    findMany: async (args?: any) => {
      let list = [...getTable()];
      if (args?.where) {
        list = list.filter(item => matches(item, args.where));
      }
      if (args?.orderBy) {
        const orderBy = Array.isArray(args.orderBy) ? args.orderBy[0] : args.orderBy;
        for (const [key, dir] of Object.entries(orderBy)) {
          list.sort((a, b) => {
            let valA = a[key];
            let valB = b[key];
            if (valA instanceof Date) valA = valA.getTime();
            if (valB instanceof Date) valB = valB.getTime();
            if (valA === valB) return 0;
            if (valA < valB) return dir === "desc" ? 1 : -1;
            return dir === "desc" ? -1 : 1;
          });
        }
      }
      if (args?.include) {
        list = list.map(item => applyIncludes(item, args.include));
      }
      return list;
    },

    findFirst: async (args?: any) => {
      let list = [...getTable()];
      if (args?.where) {
        list = list.filter(item => matches(item, args.where));
      }
      let item = list[0] || null;
      if (item && args?.include) {
        item = applyIncludes(item, args.include);
      }
      return item;
    },

    findUnique: async (args?: any) => {
      let list = [...getTable()];
      if (args?.where) {
        list = list.filter(item => matches(item, args.where));
      }
      let item = list[0] || null;
      if (item && args?.include) {
        item = applyIncludes(item, args.include);
      }
      return item;
    },

    create: async (args: any) => {
      const data = { ...args.data };
      if (!data.id) {
        data.id = `${modelName.slice(0, 3)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      }
      if (!data.createdAt) {
        data.createdAt = new Date();
      }
      if (!data.updatedAt) {
        data.updatedAt = new Date();
      }
      const table = getTable();
      table.push(data);
      setTable(table);
      return data;
    },

    update: async (args: any) => {
      const table = getTable();
      const index = table.findIndex(item => matches(item, args.where));
      if (index === -1) {
        throw new Error(`Record not found in ${modelName}`);
      }
      const existing = table[index];
      const updated = { ...existing, ...args.data, updatedAt: new Date() };
      table[index] = updated;
      setTable(table);
      return updated;
    },

    delete: async (args: any) => {
      const table = getTable();
      const index = table.findIndex(item => matches(item, args.where));
      if (index === -1) {
        throw new Error(`Record not found in ${modelName}`);
      }
      const deleted = table[index];
      table.splice(index, 1);
      setTable(table);
      return deleted;
    },

    deleteMany: async (args?: any) => {
      const table = getTable();
      if (!args?.where) {
        setTable([]);
        return { count: table.length };
      }
      const remaining = table.filter(item => !matches(item, args.where));
      const deletedCount = table.length - remaining.length;
      setTable(remaining);
      return { count: deletedCount };
    },

    count: async (args?: any) => {
      let list = [...getTable()];
      if (args?.where) {
        list = list.filter(item => matches(item, args.where));
      }
      return list.length;
    },

    upsert: async (args: any) => {
      const table = getTable();
      const index = table.findIndex(item => matches(item, args.where));
      if (index !== -1) {
        const existing = table[index];
        const updated = { ...existing, ...args.update, updatedAt: new Date() };
        table[index] = updated;
        setTable(table);
        return updated;
      } else {
        const data = { ...args.create };
        if (!data.id) {
          data.id = `${modelName.slice(0, 3)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        }
        if (!data.createdAt) {
          data.createdAt = new Date();
        }
        if (!data.updatedAt) {
          data.updatedAt = new Date();
        }
        table.push(data);
        setTable(table);
        return data;
      }
    }
  };
}

// Build the mock db client object
export const db: any = {
  cart: createMockTable("cart"),
  cartItem: createMockTable("cartItem"),
  coupon: createMockTable("coupon"),
  category: createMockTable("category"),
  newsletterSubscriber: createMockTable("newsletterSubscriber"),
  order: createMockTable("order"),
  orderItem: createMockTable("orderItem"),
  product: createMockTable("product"),
  review: createMockTable("review"),
  siteSettings: createMockTable("siteSettings"),
  testimonial: createMockTable("testimonial"),
  trackingLog: createMockTable("trackingLog"),
  user: createMockTable("user"),
  campaign: createMockTable("campaign"),

  $connect: async () => {},
  $disconnect: async () => {},
  $transaction: async (callback: (tx: any) => Promise<any>) => {
    return await callback(db);
  }
};

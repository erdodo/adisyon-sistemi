export type TemplateType = "cafe" | "restaurant" | "bar" | "bakery" | "fastfood" | "pub";

export type StaffRole = "admin" | "waiter" | "kitchen" | "cashier";

export type OrderStatus = "pending" | "preparing" | "ready" | "served" | "paid" | "cancelled";

export type PaymentMethod = "cash" | "credit_card" | "setcard" | "ticket" | "multinet";

export interface TemplateOption {
  id: TemplateType;
  name: string;
  description: string;
  icon: string;
  defaultCategories: string[];
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface SetupFormData {
  template: TemplateType;
  businessName: string;
  phone: string;
  address: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  adminPassword: string;
}

export const TEMPLATES: TemplateOption[] = [
  {
    id: "cafe",
    name: "Kafe",
    description: "Kahve, tatlı ve hafif yiyecekler",
    icon: "☕",
    defaultCategories: ["Sıcak İçecekler", "Soğuk İçecekler", "Tatlılar", "Atıştırmalıklar"],
  },
  {
    id: "restaurant",
    name: "Restoran",
    description: "Tam kapsamlı yemek menüsü",
    icon: "🍽️",
    defaultCategories: ["Çorbalar", "Salatalar", "Ana Yemekler", "Tatlılar", "İçecekler"],
  },
  {
    id: "bar",
    name: "Bar",
    description: "İçecekler ve bar menüsü",
    icon: "🍸",
    defaultCategories: ["Kokteyller", "Biralar", "Şaraplar", "Bar Menüsü"],
  },
  {
    id: "bakery",
    name: "Pastane / Fırın",
    description: "Pasta, börek ve unlu mamuller",
    icon: "🥐",
    defaultCategories: ["Pastalar", "Börekler", "Ekmekler", "Kurabiyeler", "İçecekler"],
  },
  {
    id: "fastfood",
    name: "Fast Food",
    description: "Hamburger, pizza, döner ve daha fazlası",
    icon: "🍔",
    defaultCategories: ["Burgerler", "Pizzalar", "Dönerler", "Yan Ürünler", "İçecekler"],
  },
  {
    id: "pub",
    name: "Pub / Meyhane",
    description: "İçecekler ve mezeler",
    icon: "🍺",
    defaultCategories: ["Mezeler", "Sıcak Mezeler", "Ana Yemekler", "Biralar", "Rakılar", "Şaraplar"],
  },
];

export const PAYMENT_METHODS: { id: PaymentMethod; name: string; icon: string }[] = [
  { id: "cash", name: "Nakit", icon: "💵" },
  { id: "credit_card", name: "Kredi Kartı", icon: "💳" },
  { id: "setcard", name: "Setcard", icon: "🎫" },
  { id: "ticket", name: "Ticket", icon: "🎟️" },
  { id: "multinet", name: "Multinet", icon: "🏷️" },
];

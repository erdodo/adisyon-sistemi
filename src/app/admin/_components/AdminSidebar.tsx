"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import {
  LayoutDashboard,
  ReceiptText,
  Tags,
  Coffee,
  Utensils,
  Users,
  Settings,
  Menu,
  X,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  role: string;
}

export default function AdminSidebar({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    {
      href: "/admin/orders",
      label: "Siparişler",
      icon: <ReceiptText size={20} />,
    },
    {
      href: "/admin/categories",
      label: "Kategoriler",
      icon: <Tags size={20} />,
    },
    { href: "/admin/products", label: "Ürünler", icon: <Coffee size={20} /> },
    { href: "/admin/tables", label: "Masalar", icon: <Utensils size={20} /> },
    { href: "/admin/staff", label: "Personel", icon: <Users size={20} /> },
    { href: "/admin/settings", label: "Ayarlar", icon: <Settings size={20} /> },
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobil Header - Sadece mobilde görünür. */}
      {/* Scroll yapıldığında üstte sabit kalması için sticky kullanıyoruz. Min-h-screen layout'u ile uyumlu çalışır. */}
      <div className="md:hidden w-full h-16 shrink-0 bg-white border-b flex items-center justify-between px-4 z-30 sticky top-0 shadow-sm">
        <Link
          href="/admin"
          className="font-bold text-xl text-primary flex items-center gap-2"
        >
          Adisyon Menu
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobil Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar Yüzeyi (Desktop & Mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-2xl md:shadow-none flex flex-col transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b shrink-0 md:justify-center">
          <Link
            href="/admin"
            className="font-black text-2xl text-primary tracking-tight"
            onClick={closeMenu}
          >
            Adisyon Menu
          </Link>
          <button
            onClick={closeMenu}
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 hide-scrollbar">
          <ul className="space-y-1.5 px-3">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-3 rounded-xl transition-all font-medium group
                      ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-orange-200/50"
                          : "text-gray-600 hover:bg-orange-50 hover:text-primary"
                      }
                    `}
                  >
                    <span
                      className={`mr-3 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-primary"
                      }`}
                    >
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t bg-gray-50 shrink-0">
          <div className="mb-4 px-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Hesap Bilgisi
            </span>
            <div className="font-bold text-sm text-gray-800 line-clamp-1">
              {user?.name || "Kullanıcı"}
            </div>
            <div className="text-xs text-primary font-medium capitalize mt-0.5">
              {user?.role || "Yetkisiz"} Yetkisi
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}

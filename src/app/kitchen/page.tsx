"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Clock, Play, CheckCircle2, LogOut } from "lucide-react";

interface Product {
  name: string;
}

interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  note: string | null;
}

interface Order {
  id: number;
  status: "pending" | "preparing" | "ready" | "served" | "paid";
  customerName: string | null;
  createdAt: string;
  table: { name: string } | null;
  items: OrderItem[];
  note: string | null;
}

export default function KitchenDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/kitchen/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        router.push("/login");
      }
    } catch {
      console.error("Siparişler alınamadı");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
    // 15 saniyede bir yeni siparişleri kontrol et
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch("/api/kitchen/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch {
      alert("Durum güncellenemedi.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Yükleniyor...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-orange-600 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <ChefHat size={28} />
          <h1 className="text-xl font-bold">Mutfak Ekranı</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors"
        >
          <LogOut size={16} /> Çıkış Yap
        </button>
      </header>

      <main className="flex-1 p-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bekleyen Siparişler (Yeni Gelenler) */}
        <section className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden flex flex-col h-full max-h-[85vh]">
          <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-orange-800 flex items-center gap-2">
              <Clock size={20} /> Bekleyen Siparişler
            </h2>
            <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
              {pendingOrders.length}
            </span>
          </div>

          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {pendingOrders.length === 0 ? (
              <div className="text-center text-gray-400 py-10 italic">
                Bekleyen sipariş yok.
              </div>
            ) : (
              pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-orange-100 bg-orange-50/30 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3 border-b border-orange-100 pb-2">
                    <div>
                      <span className="text-sm font-bold text-gray-500">
                        #{order.id}
                      </span>
                      <h3 className="font-bold text-lg text-gray-900 mt-0.5">
                        {order.table
                          ? order.table.name
                          : order.customerName || "Masasız"}
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <li key={item.id} className="text-sm">
                        <span className="font-bold text-gray-800">
                          {item.quantity}x
                        </span>{" "}
                        {item.product.name}
                        {item.note && (
                          <div className="text-xs text-red-500 italic ml-5">
                            - Not: {item.note}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>

                  {order.note && (
                    <div className="bg-white text-xs border border-orange-200 text-orange-800 p-2 rounded mb-4 font-medium">
                      📝 {order.note}
                    </div>
                  )}

                  <button
                    onClick={() => updateOrderStatus(order.id, "preparing")}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-md flex items-center justify-center gap-2 transition-colors"
                  >
                    <Play size={16} /> Hazırlamaya Başla
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Hazırlanan Siparişler */}
        <section className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden flex flex-col h-full max-h-[85vh]">
          <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2">
              <ChefHat size={20} /> Hazırlananlar
            </h2>
            <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
              {preparingOrders.length}
            </span>
          </div>

          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {preparingOrders.length === 0 ? (
              <div className="text-center text-gray-400 py-10 italic">
                Şu an hazırlanan sipariş yok.
              </div>
            ) : (
              preparingOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-blue-100 bg-blue-50/30 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3 border-b border-blue-100 pb-2">
                    <div>
                      <span className="text-sm font-bold text-gray-500">
                        #{order.id}
                      </span>
                      <h3 className="font-bold text-lg text-gray-900 mt-0.5">
                        {order.table
                          ? order.table.name
                          : order.customerName || "Masasız"}
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500 animate-pulse text-blue-500 font-medium">
                      Hazırlanıyor...
                    </span>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <li key={item.id} className="text-sm">
                        <span className="font-bold text-gray-800">
                          {item.quantity}x
                        </span>{" "}
                        {item.product.name}
                        {item.note && (
                          <div className="text-xs text-red-500 italic ml-5">
                            - Not: {item.note}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => updateOrderStatus(order.id, "ready")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle2 size={16} /> Hazır Olarak İşaretle
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

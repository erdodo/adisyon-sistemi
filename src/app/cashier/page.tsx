"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import {
  Banknote,
  ReceiptText,
  Clock,
  ChefHat,
  CheckCircle2,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface Product {
  name: string;
}

interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  status: "pending" | "preparing" | "ready" | "served";
  totalAmount: number;
  customerName: string | null;
  createdAt: string;
  table: { name: string } | null;
  items: OrderItem[];
}

export default function CashierDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/cashier/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        router.push("/login");
      }
    } catch {
      console.error("Açık hesaplar alınamadı");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handlePayment = async (orderId: number) => {
    if (!confirm("Siparişin ödemesini onaylıyor musunuz? (Geri alınamaz)"))
      return;

    setProcessingId(orderId);
    try {
      const res = await fetch("/api/cashier/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "paid" }),
      });
      if (res.ok) {
        fetchOrders();
      } else {
        alert("Tahsilat işlemi başarısız oldu.");
      }
    } catch {
      alert("Tahsilat alınamadı.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Yükleniyor...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-emerald-600 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Banknote size={28} />
          <h1 className="text-xl font-bold">Kasa (Tahsilat) Ekranı</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors"
        >
          <LogOut size={16} /> Çıkış Yap
        </button>
      </header>

      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
              <ReceiptText size={20} /> Bekleyen Açık Hesaplar
            </h2>
            <div className="flex gap-4 text-sm">
              <div className="text-gray-600">
                <span className="font-bold">{orders.length}</span> Adisyon
              </div>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-10 italic">
                Şu an bekleyen açık hesap yok.
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 bg-white rounded-xl overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md hover:border-emerald-300"
                >
                  {/* Başlık Alanı */}
                  <div
                    className={`p-3 border-b flex justify-between items-start ${
                      order.status === "ready" || order.status === "served"
                        ? "bg-emerald-50/50"
                        : "bg-gray-50/50"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-gray-500">
                        #{order.id}
                      </span>
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">
                        {order.table
                          ? order.table.name
                          : order.customerName || "Masasız"}
                      </h3>
                    </div>

                    {/* Durum İkonu */}
                    <div className="text-xs font-medium flex items-center gap-1 px-2 py-1 rounded bg-white border">
                      {order.status === "pending" && (
                        <>
                          <Clock size={12} className="text-orange-500" />{" "}
                          Bekliyor
                        </>
                      )}
                      {order.status === "preparing" && (
                        <>
                          <ChefHat size={12} className="text-blue-500" />{" "}
                          Mutfakta
                        </>
                      )}
                      {(order.status === "ready" ||
                        order.status === "served") && (
                        <>
                          <CheckCircle2
                            size={12}
                            className="text-emerald-500"
                          />{" "}
                          Serviste
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sipariş Kalemleri */}
                  <div className="p-3 flex-1 bg-white max-h-48 overflow-y-auto min-h-[100px] text-xs space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex-1 pr-2">
                          <span className="font-bold text-gray-800">
                            {item.quantity}x
                          </span>{" "}
                          {item.product.name}
                        </div>
                        <div className="font-medium text-gray-600 whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Toplam & Ödeme Butonu */}
                  <div className="p-3 border-t bg-gray-50 mt-auto">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Genel Toplam
                      </span>
                      <span className="text-xl font-black text-emerald-600">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    <button
                      onClick={() => handlePayment(order.id)}
                      disabled={processingId === order.id}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      {processingId === order.id ? (
                        "İşleniyor..."
                      ) : (
                        <>
                          Tahsilatı Onayla <ChevronRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

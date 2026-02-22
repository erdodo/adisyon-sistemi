"use client";

import { useState, useEffect, useCallback } from "react";
import { formatPrice } from "@/lib/utils";

interface Product {
  name: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  note: string | null;
  status: string;
}

export interface Order {
  id: number;
  status: string;
  totalAmount: number;
  note: string | null;
  customerName: string | null;
  createdAt: string;
  table: { name: string } | null;
  staff: { name: string } | null;
  items: OrderItem[];
}

import {
  Clock,
  ChefHat,
  CheckCircle2,
  CheckCircle,
  Banknote,
  XCircle,
  ReceiptText,
} from "lucide-react";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <span className="bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Clock size={12} /> Bekliyor
        </span>
      );
    case "preparing":
      return (
        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <ChefHat size={12} /> Hazırlanıyor
        </span>
      );
    case "ready":
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <CheckCircle2 size={12} /> Hazır
        </span>
      );
    case "served":
      return (
        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <CheckCircle size={12} /> Sunuldu
        </span>
      );
    case "paid":
      return (
        <span className="bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Banknote size={12} /> Ödendi
        </span>
      );
    case "cancelled":
      return (
        <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <XCircle size={12} /> İptal
        </span>
      );
    default:
      return (
        <span className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold">
          {status}
        </span>
      );
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    try {
      const url =
        filter === "all" ? "/api/orders" : `/api/orders?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <ReceiptText className="text-primary" /> Son Siparişler
        </h1>
        <select
          className="input max-w-xs border-gray-300 shadow-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tümü</option>
          <option value="pending">Sadece Bekleyenler</option>
          <option value="preparing">Hazırlananlar</option>
          <option value="paid">Ödenmiş Siparişler</option>
          <option value="cancelled">İptal Edilenler</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            Yükleniyor...
          </div>
        ) : orders.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100 italic">
            Belirtilen kritere uygun sipariş bulunamadı.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="card p-5 relative bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full rounded-xl"
            >
              <div className="flex justify-between items-start mb-4 border-b pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 mb-0.5">
                    Sipariş #{order.id}
                  </h3>
                  <p className="text-lg font-black text-gray-900 leading-tight">
                    {order.table?.name ||
                      order.customerName ||
                      "Masasız Müşteri"}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="text-xs text-gray-500 mb-4 font-medium flex justify-between bg-gray-50 p-2 rounded">
                <span>
                  Saat:{" "}
                  {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>
                  Garson:{" "}
                  <strong className="text-gray-700">
                    {order.staff?.name || "-"}
                  </strong>
                </span>
              </div>

              <div className="space-y-3 mb-4 flex-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1 pr-2">
                      <span className="font-bold text-gray-800">
                        {item.quantity}x
                      </span>{" "}
                      {item.product.name}
                      {item.note && (
                        <p className="text-xs text-red-500 ml-5 italic mt-0.5">
                          - Not: {item.note}
                        </p>
                      )}
                    </div>
                    <div className="font-bold text-gray-600 whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {order.note && (
                <div className="bg-yellow-50 text-yellow-800 p-3 text-xs rounded-lg mb-4 border border-yellow-100 font-medium">
                  📝 {order.note}
                </div>
              )}

              <div className="flex justify-between items-end pt-4 border-t mt-auto">
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Toplam
                </span>
                <span className="text-2xl font-black text-emerald-600">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

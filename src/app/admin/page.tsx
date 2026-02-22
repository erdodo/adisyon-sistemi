import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Coffee,
  ShoppingBag,
  Tags,
  Utensils,
  Banknote,
  User,
  ChefHat,
  LayoutGrid,
} from "lucide-react";

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalOrders,
    activeTables,
    totalProducts,
    categories,
    todaysOrders,
    topItems,
  ] = await Promise.all([
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({
      where: { status: { in: ["preparing", "ready", "served"] } },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: { createdAt: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 3,
    }),
  ]);

  // Saatlik sipariş verilerini hazırla
  const hourlyData = new Array(24).fill(0);
  todaysOrders.forEach((order) => {
    const hour = new Date(order.createdAt).getHours();
    hourlyData[hour]++;
  });
  const maxPerHour = Math.max(...hourlyData, 1);

  // En çok satan ürünlerin detayları
  const topProductsWithDetails = await Promise.all(
    topItems.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { name: true, price: true, imageUrl: true },
      });
      return {
        id: item.productId,
        name: product?.name || "Silinmiş/Bilinmeyen Ürün",
        quantity: item._sum.quantity || 0,
        price: product?.price || 0,
        imageUrl: product?.imageUrl,
      };
    }),
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Özeti</h1>

      {/* Üst İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-md shadow-orange-200 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-orange-100 text-sm font-bold mb-1 uppercase tracking-wider">
              Bekleyen Sipariş
            </h3>
            <p className="text-4xl font-black">{totalOrders}</p>
          </div>
          <ShoppingBag className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-20 group-hover:scale-110 transition-transform duration-300" />
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-md shadow-blue-200 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-blue-100 text-sm font-bold mb-1 uppercase tracking-wider">
              Aktif Masa (Dolu)
            </h3>
            <p className="text-4xl font-black">{activeTables}</p>
          </div>
          <Utensils className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-20 group-hover:scale-110 transition-transform duration-300" />
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 shadow-md shadow-emerald-200 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-emerald-100 text-sm font-bold mb-1 uppercase tracking-wider">
              Aktif Ürün
            </h3>
            <p className="text-4xl font-black">{totalProducts}</p>
          </div>
          <Coffee className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-20 group-hover:scale-110 transition-transform duration-300" />
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-md shadow-purple-200 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-purple-100 text-sm font-bold mb-1 uppercase tracking-wider">
              Kategori Sayısı
            </h3>
            <p className="text-4xl font-black">{categories}</p>
          </div>
          <Tags className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-20 group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saatlik Sipariş Grafiği (Native CSS Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            📊 Bugünün Sipariş Yoğunluğu (Saatlik)
          </h2>
          <div className="flex-1 min-h-[200px] flex items-end gap-1 sm:gap-2">
            {hourlyData.map((count, index) => {
              const heightPercentage = Math.round((count / maxPerHour) * 100);
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center group relative h-full justify-end"
                >
                  <div
                    className="w-full bg-orange-200 rounded-t-md hover:bg-orange-400 border-b border-orange-500 transition-colors relative"
                    style={{ height: `${Math.max(heightPercentage, 2)}%` }} // min 2% to show the bar for 0 too
                  >
                    {count > 0 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-md">
                        {count} Sipariş
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2 font-medium hidden sm:block">
                    {index.toString().padStart(2, "0")}:00
                  </span>
                  <span className="text-[10px] text-gray-400 mt-2 font-medium sm:hidden">
                    {index}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* En Çok Satan 3 Ürün */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            🏆 Bugün En Çok Satanlar
          </h2>
          <div className="space-y-4 flex-1">
            {topProductsWithDetails.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400 text-sm italic text-center">
                  Henüz istatistik oluşmadı.
                </p>
              </div>
            ) : (
              topProductsWithDetails.map((prod, i) => (
                <div
                  key={prod.id}
                  className="flex items-center gap-4 bg-gray-50/50 hover:bg-orange-50/30 transition-colors p-3 rounded-xl border border-gray-100 group"
                >
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-xl text-orange-400 border border-orange-100 shrink-0 group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {prod.name}
                    </p>
                    <p className="text-xs text-orange-600 font-bold bg-orange-100 px-2 py-0.5 rounded-full inline-block mt-1">
                      {prod.quantity} Sipariş
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Hızlı Yönlendirmeler */}
      <h2 className="text-lg font-bold text-gray-900 pt-4 flex items-center gap-2">
        ⚡ Hızlı Ekran Yönlendirmeleri
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6">
        <Link
          href="/cashier"
          className="flex flex-col items-center justify-center gap-3 bg-white py-6 px-4 rounded-2xl border border-gray-100 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
            <Banknote size={32} />
          </div>
          <span className="font-bold text-gray-800 group-hover:text-emerald-700">
            Kasa Ekranı
          </span>
        </Link>

        <Link
          href="/waiter"
          className="flex flex-col items-center justify-center gap-3 bg-white py-6 px-4 rounded-2xl border border-gray-100 hover:border-orange-500 hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
            <User size={32} />
          </div>
          <span className="font-bold text-gray-800 group-hover:text-orange-700">
            Personel (Garson)
          </span>
        </Link>

        <Link
          href="/kitchen"
          className="flex flex-col items-center justify-center gap-3 bg-white py-6 px-4 rounded-2xl border border-gray-100 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
            <ChefHat size={32} />
          </div>
          <span className="font-bold text-gray-800 group-hover:text-blue-700">
            Mutfak Ekranı
          </span>
        </Link>

        <Link
          href="/menu"
          target="_blank"
          className="flex flex-col items-center justify-center gap-3 bg-white py-6 px-4 rounded-2xl border border-gray-100 hover:border-purple-500 hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
            <LayoutGrid size={32} />
          </div>
          <span className="font-bold text-gray-800 group-hover:text-purple-700">
            Müşteri Menüsü
          </span>
        </Link>
      </div>
    </div>
  );
}

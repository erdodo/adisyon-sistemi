"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Utensils, LayoutGrid, CheckCircle2, User } from "lucide-react";

interface Table {
  id: number;
  name: string;
  capacity: number;
  isOccupied: boolean;
  hasReadyOrder?: boolean;
  activeOrderId: number | null;
}

interface TableGroup {
  id: number;
  name: string;
  tables: Table[];
}

export default function WaiterDashboard() {
  const router = useRouter();
  const [groupsData, setGroupsData] = useState<TableGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await fetch("/api/waiter/tables");
        if (res.ok) {
          const data = await res.json();
          setGroupsData(data);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Masalar alınamadı", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, [router]);

  const handleTableClick = (table: Table) => {
    // Masaya tıklanınca sipariş menüsünü aç ve URL'e masa idsini ekle
    // Eğer sipariş varsa sipariş detayına da gidilebilir ancak projedeki şimdiki akış:
    // Sipariş alma ekranı -> /menu?masa=ID şeklindeydi
    router.push(`/menu?masa=${table.id}`);
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
      <header className="bg-primary text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <User size={24} />
          <h1 className="text-xl font-bold">Personel / Masalar</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full font-medium transition-colors"
        >
          Çıkış Yap
        </button>
      </header>

      <main className="flex-1 p-4 max-w-5xl mx-auto w-full space-y-8 pb-12">
        {groupsData.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 p-8 bg-white rounded-xl shadow-sm border">
            Henüz aktif masa grubu eklenmemiş. Lütfen yönetici panelinden masa
            ekleyin.
          </div>
        ) : (
          groupsData.map((group) => (
            <section key={group.id} className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                <LayoutGrid size={20} className="text-primary" />
                {group.name}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {group.tables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    className={`
                                    relative p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-sm border
                                    ${
                                      table.hasReadyOrder
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 ring-2 ring-emerald-500 ring-offset-2 animate-pulse"
                                        : table.isOccupied
                                          ? "bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100"
                                          : "bg-white border-gray-200 text-gray-800 hover:border-primary hover:text-primary"
                                    }
                                `}
                  >
                    {/* İkon */}
                    <div
                      className={`p-3 rounded-full ${table.hasReadyOrder ? "bg-emerald-200 text-emerald-700" : table.isOccupied ? "bg-orange-100 text-orange-600" : "bg-gray-50 text-gray-400"}`}
                    >
                      {table.hasReadyOrder ? (
                        <Utensils size={28} className="animate-bounce" />
                      ) : table.isOccupied ? (
                        <Utensils size={28} />
                      ) : (
                        <Coffee size={28} />
                      )}
                    </div>

                    {/* Masa Adı */}
                    <div className="text-center">
                      <span className="block font-bold truncate w-full px-1">
                        {table.name}
                      </span>
                      <span className="text-[10px] font-medium opacity-60 bg-black/5 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {table.capacity} Kişilik
                      </span>
                    </div>

                    {/* Dolu Rozeti */}
                    {table.isOccupied && (
                      <div
                        className={`absolute top-2 right-2 text-white rounded-full p-1 shadow-sm ${table.hasReadyOrder ? "bg-emerald-500" : "bg-orange-500"}`}
                      >
                        <CheckCircle2 size={12} />
                      </div>
                    )}
                    {table.hasReadyOrder && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
                        Sipariş Hazır
                      </div>
                    )}
                  </button>
                ))}
                {group.tables.length === 0 && (
                  <div className="col-span-full text-sm text-gray-400 py-4 italic">
                    Bu gruba ait masa bulunmuyor.
                  </div>
                )}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}

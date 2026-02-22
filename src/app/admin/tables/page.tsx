"use client";

import { useState, useEffect } from "react";
import { generateQRUrl } from "@/lib/utils";

interface TableGroup {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

interface Table {
  id: number;
  name: string;
  capacity: number;
  groupId: number | null;
  group: TableGroup | null;
  isActive: boolean;
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [groups, setGroups] = useState<TableGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab yapısı: 0 = Masalar, 1 = Gruplar
  const [activeTab, setActiveTab] = useState(0);

  // Form States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "4",
    groupId: "",
  });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/tables");
      const data = await res.json();
      setTables(data.tables);
      setGroups(data.groups);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = "/api/tables";
    const method = editingId ? "PUT" : "POST";

    // activeTab === 0 (Masa), activeTab === 1 (Grup)
    const payload = {
      ...formData,
      type: activeTab === 0 ? "table" : "group",
      capacity: parseInt(formData.capacity) || 0,
      ...(editingId && { id: editingId, isActive: true }),
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      resetForm();
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error || "Bir hata oluştu");
    }
  };

  const handleEdit = (item: any, isGroup: boolean) => {
    setFormData({
      name: item.name,
      capacity: isGroup ? item.sortOrder.toString() : item.capacity.toString(),
      groupId: isGroup ? "" : item.groupId?.toString() || "",
    });
    setEditingId(item.id);
    setActiveTab(isGroup ? 1 : 0);
  };

  const handleDelete = async (id: number, isGroup: boolean) => {
    const typeText = isGroup ? "Bölümü" : "Masayı";
    if (!confirm(`Bu ${typeText} silmek istediğinize emin misiniz?`)) return;

    const res = await fetch(
      `/api/tables?id=${id}&type=${isGroup ? "group" : "table"}`,
      { method: "DELETE" },
    );
    const data = await res.json();

    if (res.ok) {
      if (data.message) alert(data.message);
      fetchData();
    } else {
      alert(data.error || "Silinirken hata oluştu");
    }
  };

  const handleToggleActive = async (item: any, isGroup: boolean) => {
    await fetch("/api/tables", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...item,
        isActive: !item.isActive,
        type: isGroup ? "group" : "table",
        capacity: isGroup ? item.sortOrder : item.capacity,
      }),
    });
    fetchData();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      capacity: activeTab === 0 ? "4" : "0",
      groupId: groups.length > 0 ? groups[0].id.toString() : "",
    });
    setEditingId(null);
  };

  // Sekme değiştiğinde formu sıfırla
  useEffect(() => {
    if (!editingId) resetForm();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Masa ve Bölüm Yönetimi</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="card p-6 h-fit top-4 sticky">
          <div className="flex border-b mb-6 border-gray-200">
            <button
              className={`flex-1 py-2 font-medium text-sm text-center border-b-2 ${activeTab === 0 ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              onClick={() => {
                setActiveTab(0);
                setEditingId(null);
              }}
            >
              Masalar
            </button>
            <button
              className={`flex-1 py-2 font-medium text-sm text-center border-b-2 ${activeTab === 1 ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              onClick={() => {
                setActiveTab(1);
                setEditingId(null);
              }}
            >
              Bölümler (Gruplar)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                {activeTab === 0 ? "Masa Adı / No" : "Bölüm Adı"} *
              </label>
              <input
                required
                type="text"
                className="input"
                placeholder={
                  activeTab === 0
                    ? "Örn: Masa 1, Teras 5"
                    : "Örn: Bahçe, İç Mekan"
                }
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {activeTab === 0 ? (
              // Masa İçin Form Elemanları
              <>
                <div>
                  <label className="label">Kişi Kapasitesi</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label">Bulunduğu Bölüm</label>
                  <select
                    className="input"
                    value={formData.groupId}
                    onChange={(e) =>
                      setFormData({ ...formData, groupId: e.target.value })
                    }
                  >
                    <option value="">Bağımsız Yok</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              // Grup için form elemanları
              <div>
                <label className="label">Sıra No (Küçük başa gelir)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button type="submit" className="btn btn-primary flex-1">
                {editingId ? "Güncelle" : "Ekle"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-outline"
                >
                  İptal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          {activeTab === 0 ? (
            // Masa Listesi
            <div className="card overflow-hidden bg-white shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-4 text-sm font-semibold text-gray-600 w-16">
                        ID
                      </th>
                      <th className="p-4 text-sm font-semibold text-gray-600">
                        Masa Adı
                      </th>
                      <th className="p-4 text-sm font-semibold text-gray-600">
                        Bölüm
                      </th>
                      <th className="p-4 text-sm font-semibold text-gray-600">
                        Durum
                      </th>
                      <th className="p-4 text-sm font-semibold text-gray-600 text-right">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-4 text-center text-gray-500"
                        >
                          Yükleniyor...
                        </td>
                      </tr>
                    ) : tables.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-4 text-center text-gray-500 py-10"
                        >
                          Masa bulunamadı.
                        </td>
                      </tr>
                    ) : (
                      tables.map((table) => {
                        const qrUrl = generateQRUrl(
                          typeof window !== "undefined"
                            ? window.location.origin
                            : "",
                          table.id,
                        );

                        return (
                          <tr
                            key={table.id}
                            className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-4 font-mono text-sm text-gray-500">
                              #{table.id}
                            </td>
                            <td className="p-4 font-bold text-gray-800">
                              {table.name}
                              <div className="text-xs text-gray-500 font-normal mt-0.5">
                                {table.capacity} Kişilik
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600 font-medium">
                              {table.group?.name || "-"}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleActive(table, false)}
                                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                                  table.isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                }`}
                              >
                                {table.isActive ? "Aktif" : "Pasif"}
                              </button>
                            </td>
                            <td className="p-4 text-right space-x-3">
                              <button
                                onClick={() =>
                                  window.open(
                                    `/api/qrcode?url=${encodeURIComponent(qrUrl)}`,
                                    "_blank",
                                  )
                                }
                                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                                title="QR Kod İndir"
                              >
                                QR
                              </button>
                              <button
                                onClick={() => handleEdit(table, false)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                              >
                                Düzenle
                              </button>
                              <button
                                onClick={() => handleDelete(table.id, false)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                              >
                                Sil
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Grup Listesi
            <div className="card overflow-hidden bg-white shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-4 text-sm font-semibold text-gray-600 w-16 text-center">
                        Sıra
                      </th>
                      <th className="p-4 text-sm font-semibold text-gray-600">
                        Bölüm Adı
                      </th>
                      <th className="p-4 text-sm font-semibold text-gray-600 text-right">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-4 text-center text-gray-500"
                        >
                          Yükleniyor...
                        </td>
                      </tr>
                    ) : groups.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-4 text-center text-gray-500 py-10"
                        >
                          Bölüm bulunamadı.
                        </td>
                      </tr>
                    ) : (
                      groups.map((group) => (
                        <tr
                          key={group.id}
                          className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4 text-center font-mono text-gray-500">
                            {group.sortOrder}
                          </td>
                          <td className="p-4 font-bold text-gray-800">
                            {group.name}
                          </td>
                          <td className="p-4 text-right space-x-3">
                            <button
                              onClick={() => handleEdit(group, true)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDelete(group.id, true)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                            >
                              Sil
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

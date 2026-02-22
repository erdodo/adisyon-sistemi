"use client";

import { useState, useEffect } from "react";

interface Category {
  id: number;
  name: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    sortOrder: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = "/api/categories";
    const method = editingId ? "PUT" : "POST";
    const body = editingId
      ? { ...formData, id: editingId, isActive: true }
      : formData;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setFormData({ name: "", icon: "", sortOrder: 0 });
      setEditingId(null);
      fetchCategories();
    } else {
      const data = await res.json();
      alert(data.error || "Bir hata oluştu");
    }
  };

  const handleEdit = (cat: Category) => {
    setFormData({
      name: cat.name,
      icon: cat.icon || "",
      sortOrder: cat.sortOrder,
    });
    setEditingId(cat.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;

    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchCategories();
    } else {
      const data = await res.json();
      alert(data.error || "Silinirken hata oluştu");
    }
  };

  const handleToggleActive = async (cat: Category) => {
    await fetch("/api/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cat, isActive: !cat.isActive }),
    });
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kategoriler</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="card p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Kategori Adı *</label>
              <input
                required
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">
                İkon (Opsiyonel - Emoji kullanabilirsiniz)
              </label>
              <input
                type="text"
                className="input"
                placeholder="🍕"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Sıra No (Küçük başa gelir)</label>
              <input
                type="number"
                className="input"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sortOrder: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="flex gap-2 pt-4">
              <button type="submit" className="btn btn-primary flex-1">
                {editingId ? "Güncelle" : "Ekle"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: "", icon: "", sortOrder: 0 });
                  }}
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
          <div className="card overflow-hidden bg-white shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 text-sm font-semibold text-gray-600 w-16 text-center">
                      Sıra
                    </th>
                    <th className="p-4 text-sm font-semibold text-gray-600 w-16 text-center">
                      İkon
                    </th>
                    <th className="p-4 text-sm font-semibold text-gray-600">
                      Kategori Adı
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
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        Yükleniyor...
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 text-center text-gray-500 py-10"
                      >
                        Kategori bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr
                        key={cat.id}
                        className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 text-center font-mono text-gray-500">
                          {cat.sortOrder}
                        </td>
                        <td className="p-4 text-xl text-center">{cat.icon}</td>
                        <td className="p-4 font-bold text-gray-800">
                          {cat.name}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleActive(cat)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                              cat.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            }`}
                          >
                            {cat.isActive ? "Aktif" : "Pasif"}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-3">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
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
        </div>
      </div>
    </div>
  );
}

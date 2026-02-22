"use client";

import { useState, useEffect, useCallback } from "react";
import { formatPrice } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  category: Category;
  isActive: boolean;
  sortOrder: number;
  preparationTime: number | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
    sortOrder: "0",
    preparationTime: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);
      const prodData = await prodRes.json();
      const catData: Category[] = await catRes.json();
      setProducts(prodData);
      setCategories(catData.filter((c) => c.isActive));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = "/api/products";
    const method = editingId ? "PUT" : "POST";

    // Convert string values to numbers where needed
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      categoryId: parseInt(formData.categoryId),
      sortOrder: parseInt(formData.sortOrder) || 0,
      preparationTime: formData.preparationTime
        ? parseInt(formData.preparationTime)
        : null,
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

  const handleEdit = (prod: Product) => {
    setFormData({
      name: prod.name,
      description: prod.description || "",
      price: prod.price.toString(),
      categoryId: prod.categoryId.toString(),
      imageUrl: prod.imageUrl || "",
      sortOrder: prod.sortOrder.toString(),
      preparationTime: prod.preparationTime
        ? prod.preparationTime.toString()
        : "",
    });
    setEditingId(prod.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      if (data.message) alert(data.message); // Soft delete mesajı
      fetchData();
    } else {
      alert(data.error || "Silinirken hata oluştu");
    }
  };

  const handleToggleActive = async (prod: Product) => {
    await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...prod, isActive: !prod.isActive }),
    });
    fetchData();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: categories.length > 0 ? categories[0].id.toString() : "",
      imageUrl: "",
      sortOrder: "0",
      preparationTime: "",
    });
    setEditingId(null);
  };

  // Set initial category when categories load
  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      setFormData((prev) => ({
        ...prev,
        categoryId: categories[0].id.toString(),
      }));
    }
  }, [categories, formData.categoryId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ürün Yönetimi</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="card p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Ürün Adı *</label>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Fiyat (₺) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Kategori *</label>
                <select
                  required
                  className="input"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Seçiniz
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Açıklama (İçerik vb.)</label>
              <textarea
                className="input min-h-[80px]"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="label">Görsel URL (Opsiyonel)</label>
              <input
                type="url"
                className="input"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Hazırlanma Süresi (Dk)</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={formData.preparationTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preparationTime: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="label">Sıralama</label>
                <input
                  type="number"
                  className="input"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={categories.length === 0}
              >
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
            {categories.length === 0 && (
              <p className="text-xs text-red-500 mt-2">
                Ürün eklemek için en az bir kategori oluşturmalısınız.
              </p>
            )}
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden bg-white shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 text-sm font-semibold text-gray-600 w-16">
                      Görsel
                    </th>
                    <th className="p-4 text-sm font-semibold text-gray-600">
                      Ürün Adı
                    </th>
                    <th className="p-4 text-sm font-semibold text-gray-600">
                      Kategori
                    </th>
                    <th className="p-4 text-sm font-semibold text-gray-600">
                      Fiyat
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
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        Yükleniyor...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-4 text-center text-gray-500 py-10"
                      >
                        Ürün bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    products.map((prod) => (
                      <tr
                        key={prod.id}
                        className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          {prod.imageUrl ? (
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-12 h-12 rounded-lg object-cover shadow-sm border"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs border shadow-sm">
                              Yok
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-bold text-gray-800">
                          {prod.name}
                          {prod.description && (
                            <p className="text-xs font-normal text-gray-500 line-clamp-1 mt-0.5">
                              {prod.description}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-600 font-medium">
                          {prod.category?.name}
                        </td>
                        <td className="p-4 font-bold text-emerald-600">
                          {formatPrice(prod.price)}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleActive(prod)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                              prod.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            }`}
                          >
                            {prod.isActive ? "Aktif" : "Pasif"}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-3">
                          <button
                            onClick={() => handleEdit(prod)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id)}
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

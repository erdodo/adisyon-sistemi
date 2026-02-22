"use client";

import { useState, useEffect, useCallback } from "react";
import { StaffRole } from "@/types";

interface Staff {
  id: number;
  name: string;
  phone: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<StaffRole, string> = {
  admin: "Yönetici",
  waiter: "Garson",
  kitchen: "Mutfak",
  cashier: "Kasa",
};

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    role: "waiter" as StaffRole,
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      setStaffList(data);
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
    const url = "/api/staff";
    const method = editingId ? "PUT" : "POST";

    // Düzenlerken şifre boşsa gönderme
    const payload = {
      ...formData,
      ...(editingId && { id: editingId, isActive: true }),
    };

    if (editingId && !formData.password) {
      delete (payload as Partial<typeof formData>).password;
    }

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

  const handleEdit = (staff: Staff) => {
    setFormData({
      name: staff.name,
      phone: staff.phone,
      password: "", // Şifre gösterilmez, yeni girilmek istenirse girilir
      role: staff.role,
    });
    setEditingId(staff.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu personeli silmek istediğinize emin misiniz?")) return;

    const res = await fetch(`/api/staff?id=${id}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      if (data.message) alert(data.message);
      fetchData();
    } else {
      alert(data.error || "Silinirken hata oluştu");
    }
  };

  const handleToggleActive = async (staff: Staff) => {
    await fetch("/api/staff", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...staff, isActive: !staff.isActive }),
    });
    fetchData();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      password: "",
      role: "waiter",
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="card p-6 h-fit sticky top-4">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Personeli Düzenle" : "Yeni Personel Ekle"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Ad Soyad *</label>
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
              <label className="label">Telefon Numarası *</label>
              <input
                required
                type="tel"
                className="input"
                placeholder="05XX XXX XX XX"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Giriş yaparken bu numarayı kullanacak.
              </p>
            </div>

            <div>
              <label className="label">
                {editingId ? "Yeni Şifre (Opsiyonel)" : "Şifre *"}
              </label>
              <input
                type="password"
                required={!editingId}
                minLength={6}
                className="input"
                placeholder="En az 6 karakter"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <div>
              <label className="label">Rol / Yetki *</label>
              <select
                required
                className="input"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as StaffRole,
                  })
                }
              >
                <option value="waiter">Garson (Sipariş Alabilir)</option>
                <option value="kitchen">Mutfak (Siparişleri Görür)</option>
                <option value="cashier">Kasa (Ödeme Alır)</option>
                <option value="admin">Yönetici (Tam Yetki)</option>
              </select>
            </div>

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
          <div className="card overflow-hidden bg-white shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 text-sm font-semibold text-gray-600">
                      Ad Soyad
                    </th>
                    <th className="p-4 text-sm font-semibold text-gray-600">
                      Telefon
                    </th>
                    <th className="p-4 text-sm font-semibold text-gray-600">
                      Rol
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
                  ) : staffList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 text-center text-gray-500 py-10"
                      >
                        Personel bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    staffList.map((staff) => (
                      <tr
                        key={staff.id}
                        className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 font-medium">{staff.name}</td>
                        <td className="p-4 text-gray-600 font-mono text-sm">
                          {staff.phone}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              staff.role === "admin"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : staff.role === "kitchen"
                                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                                  : staff.role === "cashier"
                                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                                    : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {ROLE_LABELS[staff.role]}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleActive(staff)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                              staff.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            }`}
                          >
                            {staff.isActive ? "Aktif" : "Pasif"}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-3">
                          <button
                            onClick={() => handleEdit(staff)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(staff.id)}
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

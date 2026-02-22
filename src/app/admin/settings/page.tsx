"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, Lock } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    phone: "",
    address: "",
    description: "",
    primaryColor: "",
    secondaryColor: "",
    logoUrl: "",
    currency: "₺",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setFormData((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      setMessage({ text: "Şifreler eşleşmiyor!", type: "error" });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage({ text: "Ayarlar başarıyla güncellendi.", type: "success" });
        setFormData((prev) => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
        }));
        router.refresh(); // Tema renkleri güncellenmiş olabilir
      } else {
        const data = await res.json();
        setMessage({
          text: data.error || "Güncellenirken hata oluştu",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({ text: "Bir hata oluştu", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassword) return;

    if (
      !confirm(
        "DİKKAT! Tüm verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz! Devam etmek istiyor musunuz?",
      )
    ) {
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch("/api/admin/reset-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(
          "Sistem başarıyla sıfırlandı. Giriş ekranına yönlendiriliyorsunuz.",
        );
        window.location.href = "/login";
      } else {
        alert(data.error || "Sıfırlama başarısız.");
      }
    } catch (error) {
      alert("Bir hata oluştu.");
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">İşletme Ayarları</h1>

      {message.text && (
        <div
          className={`p-4 rounded-md ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* İşletme Bilgileri */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            Genel Bilgiler
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">İşletme Adı</label>
              <input
                required
                type="text"
                className="input"
                value={formData.businessName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Telefon Numarası</label>
              <input
                required
                type="text"
                className="input"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Adres</label>
              <textarea
                required
                className="input min-h-[80px]"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Açıklama / Slogan</label>
              <textarea
                className="input min-h-[80px]"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Para Birimi</label>
              <select
                required
                className="input"
                value={formData.currency || "₺"}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
              >
                <option value="₺">₺ (TL)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Görünüm Ayarları */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            Görünüm Ayarları
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Logo URL</label>
              <input
                type="url"
                className="input"
                placeholder="https://"
                value={formData.logoUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, logoUrl: e.target.value })
                }
              />
            </div>
            <div className="col-span-1"></div>

            <div>
              <label className="label">Ana Renk (Primary)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  className="h-10 w-10 p-1 rounded cursor-pointer"
                  value={formData.primaryColor || "#e67e22"}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryColor: e.target.value })
                  }
                />
                <span className="text-sm text-gray-500">
                  {formData.primaryColor}
                </span>
              </div>
            </div>
            <div>
              <label className="label">İkincil Renk (Secondary)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  className="h-10 w-10 p-1 rounded cursor-pointer"
                  value={formData.secondaryColor || "#2c3e50"}
                  onChange={(e) =>
                    setFormData({ ...formData, secondaryColor: e.target.value })
                  }
                />
                <span className="text-sm text-gray-500">
                  {formData.secondaryColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook Entegrasyonu */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
            🔗 Entegrasyonlar (Webhook)
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Sipariş oluşturulduğunda, hazır olduğunda veya ödendiğinde bu adrese
            otomatik olarak POST isteği (JSON) gönderilir. Harici POS veya
            Muhasebe yazılımlarınızı tetiklemek için kullanabilirsiniz.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="label">Webhook URL (İsteğe Bağlı)</label>
              <input
                type="url"
                className="input"
                placeholder="https://api.sisteminiz.com/webhook"
                value={formData.webhookUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, webhookUrl: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Güvenlik */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2 text-red-600">
            Yönetici Şifre Yenileme
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Yeni Şifre</label>
              <input
                type="password"
                className="input"
                minLength={6}
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                placeholder="Değiştirmek istemiyorsanız boş bırakın"
              />
            </div>
            <div>
              <label className="label">Yeni Şifre Tekrar</label>
              <input
                type="password"
                className="input"
                minLength={6}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Tekrar girin"
                disabled={!formData.newPassword}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary px-8 py-3 text-lg"
          >
            {saving ? "Kaydediliyor..." : "Ayarlarımı Güncelle"}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t-2 border-dashed border-red-200">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertTriangle size={28} />
            <h2 className="text-xl font-black uppercase tracking-tight">
              Danger Zone
            </h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="font-bold text-red-800 text-lg">
                Sistemi Fabrika Ayarlarına Döndür
              </h3>
              <p className="text-red-600/80 text-sm mt-1">
                Bu işlem; tüm siparişleri, ürünleri, kategorileri, masaları ve
                personel listesini (siz hariç) kalıcı olarak siler.
                <span className="font-bold underline block mt-1">
                  Bu işlem geri alınamaz!
                </span>
              </p>
            </div>

            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-red-200 flex items-center gap-2 whitespace-nowrap self-start md:self-center"
              >
                <Trash2 size={20} />
                Tüm Verileri Sil
              </button>
            ) : (
              <form
                onSubmit={handleResetData}
                className="flex-1 max-w-sm space-y-3"
              >
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400"
                    size={18}
                  />
                  <input
                    type="password"
                    required
                    placeholder="Onay için admin şifrenizi girin"
                    className="w-full pl-10 pr-4 py-3 border-2 border-red-200 rounded-xl focus:border-red-500 outline-none text-sm transition-all shadow-inner"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                  >
                    {resetLoading ? "Siliniyor..." : "KALICI OLARAK SİL"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetConfirm(false);
                      setResetPassword("");
                    }}
                    className="px-4 bg-white border-2 border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm"
                  >
                    Vazgeç
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

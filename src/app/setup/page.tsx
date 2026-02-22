"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEMPLATES, SetupFormData } from "@/types";

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<SetupFormData>({
    template: "restaurant",
    businessName: "",
    phone: "",
    address: "",
    description: "",
    primaryColor: "#e67e22",
    secondaryColor: "#2c3e50",
    adminPassword: "",
  });

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bir hata oluştu");
      }

      // Kurulum bitti, login'e yönlendir
      router.push("/login?setup=success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sisteme Hoş Geldiniz
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1 && "Lütfen işletme türünüzü seçin"}
          {step === 2 && "İşletme bilgilerinizi girin"}
          {step === 3 && "Yönetici şifrenizi belirleyin"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 p-4 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() =>
                    setFormData({ ...formData, template: tmpl.id })
                  }
                  className={`border rounded-lg p-6 cursor-pointer transition-all ${
                    formData.template === tmpl.id
                      ? "border-orange-500 bg-orange-50 ring-2 ring-orange-500"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <div className="text-4xl mb-3">{tmpl.icon}</div>
                  <h3 className="font-bold text-lg">{tmpl.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {tmpl.description}
                  </p>
                </div>
              ))}
              <div className="col-span-1 md:col-span-2 mt-6 flex justify-end">
                <button onClick={handleNext} className="btn btn-primary px-8">
                  İleri
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label">İşletme Adı</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Telefon Numarası</label>
                <input
                  type="tel"
                  required
                  className="input"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Adres</label>
                <textarea
                  required
                  className="input min-h-[80px]"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Ana Renk</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      className="h-10 w-10 p-1 rounded cursor-pointer"
                      value={formData.primaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primaryColor: e.target.value,
                        })
                      }
                    />
                    <span className="text-sm text-gray-500">
                      {formData.primaryColor}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="label">İkincil Renk</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      className="h-10 w-10 p-1 rounded cursor-pointer"
                      value={formData.secondaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          secondaryColor: e.target.value,
                        })
                      }
                    />
                    <span className="text-sm text-gray-500">
                      {formData.secondaryColor}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={handlePrev} className="btn btn-outline">
                  Geri
                </button>
                <button
                  onClick={handleNext}
                  disabled={
                    !formData.businessName ||
                    !formData.phone ||
                    !formData.address
                  }
                  className="btn btn-primary px-8"
                >
                  İleri
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Yönetici Şifresi</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input"
                  value={formData.adminPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, adminPassword: e.target.value })
                  }
                  placeholder="En az 6 karakter"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Bu şifre ve telefon numaranızla sisteme giriş yapacaksınız.
                </p>
              </div>
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="btn btn-outline"
                  disabled={loading}
                >
                  Geri
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.adminPassword.length < 6}
                  className="btn btn-primary px-8"
                >
                  {loading ? "Kuruluyor..." : "Kurulumu Tamamla"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetupSuccess = searchParams?.get("setup") === "success";

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Giriş başarısız");
      }

      // Role göre yönlendir
      if (data.role === "admin") {
        router.push("/admin");
      } else if (data.role === "kitchen") {
        router.push("/kitchen");
      } else if (data.role === "cashier") {
        router.push("/cashier");
      } else {
        router.push("/waiter"); // Garsonlar masa seçimi yapacak
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Personel Girişi
          </h2>
        </div>

        {isSetupSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-center">
            Kurulum başarıyla tamamlandı. Lütfen giriş yapın.
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="label">Telefon Numarası</label>
              <input
                name="phone"
                type="tel"
                required
                className="input"
                placeholder="05XX XXX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Şifre</label>
              <input
                name="password"
                type="password"
                required
                className="input"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => router.push("/menu")}
            className="text-sm text-primary hover:underline bg-transparent border-none cursor-pointer"
          >
            Müşteri menüsüne git
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Yükleniyor...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

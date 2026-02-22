"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // Cookie silme işlemi için API çağrısı
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="btn btn-outline w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
    >
      Sistemden Çıkış
    </button>
  );
}

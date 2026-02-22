"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { CartItem } from "@/types";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  preparationTime: number | null;
}

interface Category {
  id: number;
  name: string;
  icon: string | null;
  products: Product[];
}

export default function MenuPage() {
  const searchParams = useSearchParams();
  const tableIdParams = searchParams?.get("masa");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Sepet
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sipariş Onayı
  const [orderNote, setOrderNote] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Kategori Scroll Senkronizasyonu
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const categoryRefs = useRef<Record<number, HTMLElement | null>>({});
  const tabContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch("/api/menu");
        const data = await res.json();
        setCategories(data);
        if (data.length > 0) setActiveCategoryId(data[0].id);
      } catch (error) {
        console.error("Menü yüklenemedi", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for header

      for (const category of categories) {
        const element = categoryRefs.current[category.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveCategoryId(category.id);

            // Tab'ı görünüme kaydır
            if (tabContainerRef.current) {
              const tabButton = tabContainerRef.current.querySelector(
                `[data-cat-id="${category.id}"]`,
              ) as HTMLElement;
              if (tabButton) {
                tabContainerRef.current.scrollTo({
                  left: tabButton.offsetLeft - 20,
                  behavior: "smooth",
                });
              }
            }
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  const scrollToCategory = (id: number) => {
    const element = categoryRefs.current[id];
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // Offset for sticky header
        behavior: "smooth",
      });
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const cartTotalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleOrder = async () => {
    if (!tableIdParams) {
      alert("Sipariş verebilmek için masadaki QR kodu okutmalısınız.");
      return;
    }

    setIsOrdering(true);
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: tableIdParams,
          items: cart,
          note: orderNote,
          totalAmount: cartTotalAmount,
        }),
      });

      if (res.ok) {
        setOrderSuccess(true);
        setCart([]);
        setIsCartOpen(false);
      } else {
        const data = await res.json();
        alert(data.error || "Sipariş verilirken hata oluştu");
      }
    } catch (error) {
      alert("Sipariş alınamadı.");
    } finally {
      setIsOrdering(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Menü Yükleniyor...
      </div>
    );

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6 text-center">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm border-2 border-green-200">
          ✓
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Siparişiniz Alındı!
        </h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Siparişiniz mutfağa iletildi. En kısa sürede masanıza servis
          edilecektir. Bizi tercih ettiğiniz için teşekkür ederiz.
        </p>
        <button
          onClick={() => setOrderSuccess(false)}
          className="btn btn-primary px-8 py-3 rounded-full font-bold shadow-lg"
        >
          Menüye Dön
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <h1 className="text-xl font-bold text-center">
          Hoş Geldiniz
          {tableIdParams && (
            <span className="block text-xs font-normal opacity-80 mt-0.5">
              Masa {tableIdParams}
            </span>
          )}
        </h1>

        {/* Kategoriler Tab Bar */}
        <div
          ref={tabContainerRef}
          className="flex overflow-x-auto hide-scrollbar gap-2 mt-4 pb-2 snap-x"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              data-cat-id={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategoryId === cat.id
                  ? "bg-white text-primary shadow-sm"
                  : "bg-primary/20 hover:bg-primary/30 text-white"
              }`}
            >
              <span className="mr-1">{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-8">
        {categories.map((cat) => (
          <div
            key={cat.id}
            ref={(el) => {
              categoryRefs.current[cat.id] = el;
            }}
            className="scroll-mt-32" // Leave space for fixed header
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 border-b pb-2">
              <span>{cat.icon}</span> {cat.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cat.products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-md"
                >
                  {prod.imageUrl && (
                    <div className="w-full h-40 relative bg-gray-100">
                      <Image
                        src={prod.imageUrl}
                        alt={prod.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 leading-tight">
                        {prod.name}
                      </h3>
                      <span className="font-bold text-primary whitespace-nowrap">
                        {formatPrice(prod.price)}
                      </span>
                    </div>
                    {prod.description && (
                      <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                        {prod.description}
                      </p>
                    )}

                    <div className="mt-auto flex justify-between items-center">
                      {prod.preparationTime && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          ⏳ {prod.preparationTime} dk
                        </span>
                      )}
                      {!prod.preparationTime && <span />}

                      {tableIdParams && (
                        <button
                          onClick={() => addToCart(prod)}
                          className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                          aria-label="Sepete Ekle"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* Floating Cart Button */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-6 w-full max-w-3xl left-1/2 -translate-x-1/2 px-4 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-primary text-white p-4 rounded-xl shadow-2xl flex justify-between items-center hover:bg-primary/90 transition-transform active:scale-[0.98]"
          >
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
              {cartTotalItems} Ürün
            </div>
            <div className="font-bold text-lg">Sepeti Görüntüle</div>
            <div className="font-bold">{formatPrice(cartTotalAmount)}</div>
          </button>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-sm">
          <div className="flex-1" onClick={() => setIsCartOpen(false)} />
          <div className="bg-white rounded-t-3xl w-full max-w-3xl mx-auto h-[80vh] flex flex-col px-4 pt-6 pb-safe animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-2xl font-bold">Sipariş Özeti</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 bg-gray-100 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 px-2">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col border-b pb-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">{item.name}</span>
                    <span className="font-bold text-primary">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold hover:bg-primary/20"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                  Sepetiniz boş.
                </div>
              )}
            </div>

            <div className="border-t pt-4 px-2 space-y-4 bg-white mt-auto">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Sipariş Notu (Opsiyonel)
                </label>
                <input
                  type="text"
                  placeholder="Zili çalmayın, ketçap olmasın vb."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex justify-between items-center text-xl font-bold">
                <span>Toplam</span>
                <span className="text-primary">
                  {formatPrice(cartTotalAmount)}
                </span>
              </div>

              <button
                onClick={handleOrder}
                disabled={cart.length === 0 || isOrdering}
                className="w-full bg-primary text-white p-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOrdering ? "İletiliyor..." : "Siparişi Tamamla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles for hide-scrollbar */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}

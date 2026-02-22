import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Setup veya auth sayfaları kontrolü
  if (path === "/setup" || path === "/login") {
    return NextResponse.next();
  }

  // API Route - setup kontrolü (api route'lar hariç)
  if (path.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Admin sayfaları koruma
  if (path.startsWith("/admin")) {
    const token = request.cookies.get("auth-token")?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const user = await verifyToken(token);
    if (!user || user.role !== "admin") {
      // Admin değilse yetkisiz olarak login'e atarız veya bir yetki hatası sayfasına. Şimdilik login'e.
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Garson/Mutfak/Kasa rotaları da benzer şekilde korunacak
  if (path.startsWith("/kitchen") || path.startsWith("/cashier")) {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const user = await verifyToken(token);
    if (!user || (user.role !== "admin" && user.role !== "kitchen" && user.role !== "cashier")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (path.startsWith("/waiter")) {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const user = await verifyToken(token);
    if (!user || (user.role !== "admin" && user.role !== "waiter")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)"],
};

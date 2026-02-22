import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Lütfen telefon ve şifre girin" },
        { status: 400 }
      );
    }

    const user = await prisma.staff.findUnique({
      where: { phone },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı veya aktif değil" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Şifre hatalı" },
        { status: 401 }
      );
    }

    const token = await createToken({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role as "admin" | "waiter" | "kitchen" | "cashier",
    });

    const response = NextResponse.json({
      success: true,
      role: user.role,
    });

    // Cookie set (7 days)
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 hafta
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Giriş sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

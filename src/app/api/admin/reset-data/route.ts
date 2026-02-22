import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();

    // Sadece admin yetkisi olanlar bu işlemi yapabilir
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Şifre zorunludur" }, { status: 400 });
    }

    // Admin kullanıcısının şifresini doğrula
    const adminStaff = await prisma.staff.findUnique({
      where: { id: user.id },
    });

    if (!adminStaff) {
      return NextResponse.json({ error: "Yönetici hesabı bulunamadı" }, { status: 404 });
    }

    const isMatch = await verifyPassword(password, adminStaff.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Hatalı yönetici şifresi" }, { status: 403 });
    }

    // TÜM VERİLERİ SİL (Transaction ile güvenli silme)
    await prisma.$transaction([
      prisma.payment.deleteMany(),
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.product.deleteMany(),
      prisma.category.deleteMany(),
      prisma.table.deleteMany(),
      prisma.tableGroup.deleteMany(),
      // Mevcut admin hariç tüm personeli sil
      prisma.staff.deleteMany({
        where: {
          id: { not: user.id }
        }
      }),
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "Tüm sistem verileri başarıyla sıfırlandı." 
    });
  } catch (error) {
    console.error("Veri sıfırlama hatası:", error);
    return NextResponse.json({ 
      error: "Sistem sıfırlanırken teknik bir hata oluştu" 
    }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) return NextResponse.json({ error: "Ayarlar bulunamadı" }, { status: 404 });
    
    // Şifreyi cliente gönderme
    const { adminPassword: _adminPassword, ...safeSettings } = settings;
    return NextResponse.json(safeSettings);
  } catch (_error) {
    return NextResponse.json({ error: "Ayarlar getirilemedi" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const settings = await prisma.settings.findFirst();

    if (!settings) return NextResponse.json({ error: "Ayarlar bulunamadı" }, { status: 404 });

    const updateData: Record<string, string | number | null> = {
      businessName: data.businessName,
      phone: data.phone,
      address: data.address,
      description: data.description,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      logoUrl: data.logoUrl,
      currency: data.currency,
      webhookUrl: data.webhookUrl,
    };

    if (data.newPassword) {
      updateData.adminPassword = await hashPassword(data.newPassword);
      // Admin staff parolasını da güncelle
      await prisma.staff.updateMany({
         where: { role: "admin" },
         data: { password: updateData.adminPassword as string }
      });
    }

    const updatedSettings = await prisma.settings.update({
      where: { id: settings.id },
      data: updateData as any, // Prisma model type check için temporarily any
    });

    const { adminPassword: _adminPassword, ...safeSettings } = updatedSettings;
    return NextResponse.json(safeSettings);
  } catch (_error) {
    return NextResponse.json({ error: "Ayarlar güncellenemedi" }, { status: 500 });
  }
}

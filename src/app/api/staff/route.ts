import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const staffList = await prisma.staff.findMany({
      select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(staffList);
  } catch (error) {
    console.error("GET Staff Error:", error);
    return NextResponse.json({ error: "Personel getirilemedi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, phone, password, role } = await req.json();
    
    // Telefon no kontrolü
    const exists = await prisma.staff.findUnique({ where: { phone } });
    if (exists) {
        return NextResponse.json({ error: "Bu telefon numarası zaten sisteme kayıtlı." }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newStaff = await prisma.staff.create({
      data: { name, phone, password: hashedPassword, role },
      select: { id: true, name: true, phone: true, role: true, isActive: true }
    });
    
    return NextResponse.json(newStaff);
  } catch (error) {
    console.error("POST Staff Error:", error);
    return NextResponse.json({ error: "Personel eklenemedi" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, phone, password, role, isActive } = await req.json();
    
    // Kendisi dışında numara kontrolü
    const exists = await prisma.staff.findFirst({ where: { phone, id: { not: Number(id) } } });
    if (exists) {
        return NextResponse.json({ error: "Bu telefon numarası başka bir personelde kullanılıyor." }, { status: 400 });
    }

    const updateData: Record<string, string | boolean> = { name, phone, role, isActive };
    if (password) {
        updateData.password = await hashPassword(password);
    }

    const updatedStaff = await prisma.staff.update({
      where: { id: Number(id) },
      data: updateData as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      select: { id: true, name: true, phone: true, role: true, isActive: true }
    });
    
    return NextResponse.json(updatedStaff);
  } catch (error) {
    console.error("PUT Staff Error:", error);
    return NextResponse.json({ error: "Personel güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    try {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      
      const staff = await prisma.staff.findUnique({ where: { id: Number(id) } });
      if (staff?.role === "admin") {
          const adminCount = await prisma.staff.count({ where: { role: "admin", isActive: true }});
          if (adminCount <= 1) {
              return NextResponse.json({ error: "Sistemde en az 1 aktif yönetici kalmalıdır." }, { status: 400 });
          }
      }
      
      const ordersCount = await prisma.order.count({ where: { staffId: Number(id) } });
      if (ordersCount > 0) {
          await prisma.staff.update({ where: { id: Number(id) }, data: { isActive: false } });
          return NextResponse.json({ success: true, message: "Personel sipariş geçmişine sahip olduğu için tamamen silinmedi, pasife alındı." });
      }
  
      await prisma.staff.delete({ where: { id: Number(id) } });
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("DELETE Staff Error:", error);
      return NextResponse.json({ error: "Personel silinemedi" }, { status: 500 });
    }
  }

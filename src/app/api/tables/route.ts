import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      include: { group: true },
      orderBy: [{ groupId: "asc" }, { id: "asc" }],
    });
    
    const groups = await prisma.tableGroup.findMany({
       orderBy: { sortOrder: "asc" }
    });

    return NextResponse.json({ tables, groups });
  } catch (_error) {
    return NextResponse.json({ error: "Masalar getirilemedi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, capacity, groupId, type } = await req.json();

    if (type === "group") {
       const group = await prisma.tableGroup.create({
          data: { name, sortOrder: capacity || 0 }
       });
       return NextResponse.json(group);
    }

    const table = await prisma.table.create({
      data: {
        name,
        capacity: Number(capacity) || 4,
        groupId: groupId ? Number(groupId) : null,
      },
      include: { group: true }
    });
    return NextResponse.json(table);
  } catch (_error) {
    return NextResponse.json({ error: "Masa/Grup eklenemedi" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, capacity, groupId, isActive, type } = await req.json();

     if (type === "group") {
       const group = await prisma.tableGroup.update({
          where: { id: Number(id) },
          data: { name, sortOrder: capacity || 0, isActive }
       });
       return NextResponse.json(group);
    }

    const table = await prisma.table.update({
      where: { id: Number(id) },
      data: {
        name,
        capacity: Number(capacity),
        groupId: groupId ? Number(groupId) : null,
        isActive,
      },
      include: { group: true }
    });
    return NextResponse.json(table);
  } catch (_error) {
    return NextResponse.json({ error: "Masa/Grup güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const type = url.searchParams.get("type");
    
    if (type === "group") {
        const tableCount = await prisma.table.count({ where: { groupId: Number(id) }});
        if (tableCount > 0) {
            return NextResponse.json({ error: "Bu grupta aktif masalar var. Önce onları silmelisiniz." }, { status: 400 });
        }
        await prisma.tableGroup.delete({ where: { id: Number(id) } });
        return NextResponse.json({ success: true });
    }

    // Masanın aktif siparişi var mı kontrol et
    const activeOrders = await prisma.order.count({ 
        where: { tableId: Number(id), status: { notIn: ["paid", "cancelled"] } } 
    });

    if (activeOrders > 0) {
      return NextResponse.json({ error: "Bu masada aktif sipariş var. Kapatılmadan silinemez." }, { status: 400 });
    }

    // Geçmiş siparişleri varsa soft delete
    const allOrders = await prisma.order.count({ where: { tableId: Number(id) } });
    
    if (allOrders > 0) {
        await prisma.table.update({ where: { id: Number(id) }, data: { isActive: false } });
        return NextResponse.json({ success: true, message: "Masa sipariş geçmişi olduğu için silinmedi, pasife alındı." });
    }

    await prisma.table.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Masa silinemedi" }, { status: 500 });
  }
}

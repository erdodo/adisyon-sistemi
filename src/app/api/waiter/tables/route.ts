import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || (user.role !== "admin" && user.role !== "waiter")) {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const tableGroups = await prisma.tableGroup.findMany({
      where: { isActive: true },
      include: {
        tables: {
          where: { isActive: true },
          // Her masa için aktif siparişi var mı kontrol edelim
          include: {
              orders: {
                  where: {
                      status: {
                          in: ["pending", "preparing", "ready", "served"]
                      }
                  }
              }
          }
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const formattedGroups = tableGroups.map(group => ({
        ...group,
        tables: group.tables.map(table => ({
            id: table.id,
            name: table.name,
            capacity: table.capacity,
            isOccupied: table.orders.length > 0,
            hasReadyOrder: table.orders.some(order => order.status === "ready"),
            activeOrderId: table.orders.length > 0 ? table.orders[0].id : null
        }))
    }));

    return NextResponse.json(formattedGroups);
  } catch (_error) {
    return NextResponse.json({ error: "Sipariş açık masalar getirilemedi" }, { status: 500 });
  }
}

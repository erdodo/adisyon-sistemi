import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const whereParams: Record<string, string> = {};
    if (status) {
        whereParams.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereParams,
      include: {
          table: true,
          staff: true,
          items: {
              include: { product: true }
          }
      },
      orderBy: { createdAt: "desc" },
      take: 100 // Son 100 sipariş
    });
    return NextResponse.json(orders);
  } catch (_error) {
    return NextResponse.json({ error: "Siparişler getirilemedi" }, { status: 500 });
  }
}

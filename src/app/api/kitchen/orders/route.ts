import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || !["admin", "kitchen"].includes(user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["pending", "preparing"] }
      },
      include: {
        table: true,
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Siparişler getirilemedi" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || !["admin", "kitchen"].includes(user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { orderId, status } = await req.json();

    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { status }
    });

    // Webhook tetikleme (Mutfak sipariş durumu güncellediğinde)
    import("@/lib/webhook").then(({ triggerWebhook }) => {
      triggerWebhook("ORDER_STATUS_CHANGED", updatedOrder.id);
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: "Durum güncellenemedi" }, { status: 500 });
  }
}

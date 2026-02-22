import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || !["admin", "cashier"].includes(user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // Kasada sadece ödenmemiş (pending, preparing, ready, served) siparişler görünsün
    const orders = await prisma.order.findMany({
      where: {
        status: { notIn: ["paid", "cancelled"] }
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
    return NextResponse.json({ error: "Açık hesaplar getirilemedi" }, { status: 500 });
  }
}

// Siparişi Ödendi olarak işaretle
export async function PUT(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || !["admin", "cashier"].includes(user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { orderId, status } = await req.json();

    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { status }
    });

    // Webhook tetikleme (Kasiyer ödeme aldığında veya iptal ettiğinde)
    import("@/lib/webhook").then(({ triggerWebhook }) => {
      const eventName = status === "paid" ? "ORDER_PAID" : "ORDER_STATUS_CHANGED";
      triggerWebhook(eventName, updatedOrder.id);
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: "Tahsilat alınamadı" }, { status: 500 });
  }
}

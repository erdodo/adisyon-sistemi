import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { tableId, items, note, customerName, totalAmount } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Sepet boş olamaz" }, { status: 400 });
    }

    const authUser = await getAuthUser();

    interface OrderItemInput {
      productId: number;
      quantity: number;
      price: number;
      note?: string;
    }

    const orderReqData = {
      status: "pending",
      totalAmount,
      note,
      customerName,
      tableId: tableId ? Number(tableId) : undefined,
      staffId: (authUser?.role === "waiter" || authUser?.role === "admin") ? authUser.id : undefined,
      items: {
        create: items.map((item: OrderItemInput) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          note: item.note,
          status: "pending"
        }))
      }
    };

    if (!tableId) {
        return NextResponse.json({ error: "Lütfen sipariş için bir masa seçin." }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: orderReqData,
      include: { items: true, table: true }
    });

    // Webhook tetikleme (Siparişi engellememesi için await'i zorunlu kılmadan çağırıyoruz)
    import("@/lib/webhook").then(({ triggerWebhook }) => {
      triggerWebhook("ORDER_CREATED", order.id);
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
     console.error("Sipariş oluşturulamadı:", error);
    return NextResponse.json({ error: "Sipariş oluşturulurken bir hata oluştu" }, { status: 500 });
  }
}

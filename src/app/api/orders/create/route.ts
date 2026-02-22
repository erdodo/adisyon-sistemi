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

    const orderReqData: any = {
      status: "pending",
      totalAmount,
      note,
      customerName,
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          note: item.note,
          status: "pending"
        }))
      }
    };

    if (authUser && (authUser.role === "waiter" || authUser.role === "admin")) {
        orderReqData.staffId = authUser.id;
    }

    if (tableId) {
       orderReqData.tableId = Number(tableId);
    } else {
        // Eğer masa yoksa ve müşteri adı varsa, "Gel Al" gibi düşünebiliriz ama
        // sistem masa zorunlu kılıyorsa buraya varsayılan "Paket Servis" masası ID'si verilmeli
        // Şimdilik demo için masası olmayan siparişe izin vermemek en iyisi:
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

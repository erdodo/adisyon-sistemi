import { prisma } from "./db";

type WebhookEvent = "ORDER_CREATED" | "ORDER_STATUS_CHANGED" | "ORDER_PAID";

interface WebhookItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

interface WebhookPayload {
  event: WebhookEvent;
  orderId: number;
  tableId: number;
  tableName: string;
  status: string;
  totalAmount: number;
  customerName?: string | null;
  items?: WebhookItem[];
  timestamp: string;
}

export async function triggerWebhook(
  event: WebhookEvent,
  orderId: number
): Promise<void> {
  try {
    const settings = await prisma.settings.findFirst({
      select: { webhookUrl: true },
    });

    if (!settings || !settings.webhookUrl) {
      // Webhook tanımlı değilse sessizce çık
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) return;

    const payload: WebhookPayload = {
      event,
      orderId: order.id,
      tableId: order.tableId,
      tableName: order.table?.name || "Bilinmiyor",
      status: order.status,
      totalAmount: order.totalAmount,
      customerName: order.customerName,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
      timestamp: new Date().toISOString(),
    };

    // Arka planda beklemeden gönder (akışı engellememesi için catch ile yakala)
    fetch(settings.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error("Webhook tetikleme hatası (fetch):", err);
    });
  } catch (error) {
    console.error("Webhook payload oluşturulurken hata:", error);
  }
}

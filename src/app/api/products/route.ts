import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId");

    const where = categoryId ? { categoryId: Number(categoryId) } : {};

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
    });
    return NextResponse.json(products);
  } catch (_error) {
    return NextResponse.json({ error: "Ürünler getirilemedi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        categoryId: Number(data.categoryId),
        sortOrder: Number(data.sortOrder) || 0,
        imageUrl: data.imageUrl,
        preparationTime: data.preparationTime ? Number(data.preparationTime) : null,
      },
      include: { category: true },
    });
    return NextResponse.json(product);
  } catch (_error) {
    return NextResponse.json({ error: "Ürün eklenemedi" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const product = await prisma.product.update({
      where: { id: Number(data.id) },
      data: {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        categoryId: Number(data.categoryId),
        sortOrder: Number(data.sortOrder),
        isActive: data.isActive,
        imageUrl: data.imageUrl,
        preparationTime: data.preparationTime ? Number(data.preparationTime) : null,
      },
      include: { category: true },
    });
    return NextResponse.json(product);
  } catch (_error) {
    return NextResponse.json({ error: "Ürün güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    // Ürün siparişlerde kullanılmışsa silmeyi reddet, sadece pasife çek
    const orderItemsCount = await prisma.orderItem.count({ where: { productId: Number(id) } });
    if (orderItemsCount > 0) {
      await prisma.product.update({
        where: { id: Number(id) },
        data: { isActive: false }
      });
      return NextResponse.json({ success: true, message: "Ürün sipariş geçmişinde kullanıldığı için silinmedi, pasife alındı." });
    }

    await prisma.product.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Ürün silinemedi" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "Kategoriler getirilemedi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, icon, sortOrder } = await req.json();
    const category = await prisma.category.create({
      data: { name, icon, sortOrder: Number(sortOrder) || 0 },
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Kategori eklenemedi" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, icon, sortOrder, isActive } = await req.json();
    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: { name, icon, sortOrder: Number(sortOrder), isActive },
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Kategori güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    // Ürünleri olan kategorinin silinmesini engelle
    const productsCount = await prisma.product.count({ where: { categoryId: Number(id) } });
    if (productsCount > 0) {
       return NextResponse.json({ error: "Bu kategoriye ait ürünler var. Önce onları silmelisiniz." }, { status: 400 });
    }

    await prisma.category.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Kategori silinemedi" }, { status: 500 });
  }
}

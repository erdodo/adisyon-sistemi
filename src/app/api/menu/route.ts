import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Menüde sadece ürün olan kategoriler listelensin
    const categoriesWithProducts = categories.filter(c => c.products.length > 0);

    return NextResponse.json(categoriesWithProducts);
  } catch (error) {
    return NextResponse.json({ error: "Menü getirilemedi" }, { status: 500 });
  }
}

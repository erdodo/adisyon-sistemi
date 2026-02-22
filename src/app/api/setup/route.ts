import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SetupFormData, TEMPLATES } from "@/types";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const data: SetupFormData = await req.json();

    // Setup zaten yapıldıysa engelle
    const existingSettings = await prisma.settings.findFirst();
    if (existingSettings?.isSetupDone) {
      return NextResponse.json(
        { error: "Kurulum zaten tamamlanmış." },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await hashPassword(data.adminPassword);

    // Ayarları kaydet
    await prisma.settings.create({
      data: {
        businessName: data.businessName,
        phone: data.phone,
        address: data.address,
        description: data.description,
        template: data.template,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        adminPassword: hashedPassword,
        isSetupDone: true,
      },
    });

    // Admin kullanıcısını oluştur
    await prisma.staff.create({
      data: {
        name: "Yönetici",
        phone: data.phone,
        password: hashedPassword,
        role: "admin",
      },
    });

    // Template'e ait default kategorileri ekle
    const selectedTemplate = TEMPLATES.find((t) => t.id === data.template);
    if (selectedTemplate) {
      const categoryPromises = selectedTemplate.defaultCategories.map((cat, index) =>
        prisma.category.create({
          data: {
            name: cat,
            sortOrder: index,
          },
        })
      );
      
      const createdCategories = await Promise.all(categoryPromises);

      // Adminin görmesi için örnek 2-3 ürün ekleyelim (Opsiyonel ama iyi olur)
      if (createdCategories.length > 0) {
        await prisma.product.create({
          data: {
            name: "Örnek Ürün 1",
            description: "Bu deneme amaçlı oluşturulmuş bir üründür.",
            price: 150.0,
            categoryId: createdCategories[0].id,
            sortOrder: 0,
          }
        });
         await prisma.product.create({
          data: {
            name: "Örnek Ürün 2",
            description: "Bu deneme amaçlı oluşturulmuş bir üründür.",
            price: 85.0,
            categoryId: createdCategories[0].id,
            sortOrder: 1,
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Kurulum sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

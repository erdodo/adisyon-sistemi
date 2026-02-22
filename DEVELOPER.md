# Adisyon Sistem - Geliştirici Dökümanı

Bu döküman, projenin teknik kurulumu, mimarisi ve geliştirme süreçleri hakkında bilgiler içermektedir.

## 🛠 Teknolojiler

- **Framework:** Next.js 15 (App Router)
- **Veritabanı:** PostgreSQL (Prisma ORM)
- **Kimlik Doğrulama:** JWT (Jose) & Bcryptjs
- **UI:** Tailwind CSS & Lucide React
- **Konteynerleştirme:** Docker & Docker Compose

## 🚀 Hızlı Kurulum (Docker)

Sistemi tek bir komutla ayağa kaldırmak için aşağıdaki komutu kullanabilirsiniz:

```bash
curl -L https://github.com/erdodo/adisyon-sistemi/archive/refs/heads/main.tar.gz | tar xz && cd adisyon-sistemi-main && sudo docker compose up -d --build
```

Bu komut:

1. Kaynak kodları indirir.
2. PostgreSQL veritabanını oluşturur.
3. Uygulamayı build eder ve başlatır.
4. Veritabanı şemasını otomatik olarak senkronize eder.

**Erişim:** [http://localhost:3000](http://localhost:3000)

## 💻 Yerel Geliştirme (Local Development)

Docker kullanmadan çalıştırmak isterseniz:

1. **Bağımlılıkları Yükleyin:**

   ```bash
   npm install
   ```

2. **Veritabanı Yapılandırması:**
   `.env` dosyasını oluşturun ve `DATABASE_URL` (PostgreSQL) bilgisini ekleyin.

3. **Prisma Generate:**

   ```bash
   npx prisma generate
   ```

4. **Uygulamayı Başlatın:**
   ```bash
   npm run dev
   ```

## 🏗 Proje Yapısı

- `/src/app/admin`: Yönetim paneli sayfaları.
- `/src/app/waiter`: Garson (personel) arayüzü.
- `/src/app/kitchen`: Mutfak ekranı.
- `/src/app/cashier`: Kasa ekranı.
- `/src/app/menu`: Müşteri QR menü ekranı.
- `/src/app/api`: Backend API rotaları.
- `/src/lib`: Veritabanı, Auth ve Webhook yardımcı kütüphaneleri.

## 🔗 Webhook Entegrasyonu

Sistem, sipariş olaylarını (Yaratıldı, Durum Değişti, Ödendi) dış sistemlere iletebilir. `lib/webhook.ts` üzerinden yönetilir.

## 🚨 Danger Zone (Sıfırlama)

Sistem verilerini tamamen temizlemek için `api/admin/reset-data` rotası kullanılır. Admin şifresi ile doğrulama gerektirir.

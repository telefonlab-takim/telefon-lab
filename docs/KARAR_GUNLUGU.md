# Karar Günlüğü

Bu dosyada projede verdiğimiz önemli kararları, **neden** verdiğimizi ve hangi alternatifleri
değerlendirdiğimizi yazıyoruz. Jüri "neden böyle yaptınız?" diye sorduğunda cevap buradadır.

Her kayıt şu şablonu izler:

```
## K-XXX: Kararın kısa adı
- **Tarih:**
- **Durum:** Önerildi / Kabul edildi / Değiştirildi
- **Karar:**
- **Neden:**
- **Değerlendirilen alternatifler:**
- **Sonuçları / bedeli:**
```

---

## K-001: Düz HTML + CSS + JavaScript, derleme adımı yok
- **Tarih:** 2026-11-17
- **Durum:** Önerildi
- **Karar:** React/Vue gibi framework ve Vite/Webpack gibi derleme araçları kullanmıyoruz.
  Tarayıcının doğrudan anladığı ES modülleri (`<script type="module">`) ile yazıyoruz.
- **Neden:**
  - Kodu 1 kişi yazıyor, 4 kişi anlayıp jüriye anlatacak. Yazdığımız dosya = tarayıcının çalıştırdığı dosya.
  - `npm install` yok, bağımlılık güncellemesi yok, derleme hatası yok.
  - Çevrimdışı çalışma (Service Worker) için önbelleğe alınacak dosya listesi küçük ve açık.
  - Uygulamamız küçük: birkaç sayfa, birkaç grafik. Framework'ün getirdiği kolaylık burada ihtiyaç değil.
- **Değerlendirilen alternatifler:** React + Vite (güçlü ama öğrenme ve açıklama yükü fazla), Svelte (derleme gerekir).
- **Sonuçları / bedeli:** Ekran güncellemelerini elle yazacağız. Sayfa sayısı çok artarsa bu karar gözden geçirilir.

## K-002: Veri cihazdan çıkmaz
- **Tarih:** 2026-11-17
- **Durum:** Kabul edildi
- **Karar:** Ölçüm verileri yalnızca telefonda işlenir. Sunucuya gönderim, analitik, dış CDN yok.
- **Neden:** Öğrenci gizliliği; internet olmadan çalışabilme; jüriye net bir güvence.
- **Sonuçları / bedeli:** Kullanılacak her kütüphane proje klasörüne kopyalanmalı.

## K-003: Sarkaçta periyodu jiroskop (dönme hızı) sinyalinden bulmak
- **Tarih:** 2026-11-17
- **Durum:** Önerildi
- **Karar:** Telefon sarkacın ucuna asılır. Periyodu `DeviceMotionEvent.rotationRate` (açısal hız) sinyalinden buluruz.
  İvmeölçer yedek yöntem olarak kalır.
- **Neden:** İdeal sarkaçta telefonla birlikte serbestçe salınan ivmeölçer, salınım yönünde neredeyse **sıfır** ölçer
  (telefon o yönde "serbest düşer" gibidir). İvmeölçer en net sinyali ip doğrultusunda verir ve bu sinyal
  **periyodun yarısıyla** tekrarlar (her en alt noktadan geçişte bir tepe). Açısal hız ise doğrudan periyot T ile salınır,
  yorumlaması daha kolaydır. Her iki sinyal de aynı `devicemotion` olayıyla gelir.
- **Değerlendirilen alternatifler:** Yalnızca ivmeölçer (T/2 karışıklığı), kamera ile takip (daha karmaşık).
- **Sonuçları / bedeli:** Jiroskobu olmayan çok eski telefonlarda ivmeölçer yöntemine düşülür.

## K-004: Geliştirme araçları: yalnızca Git ve Python
- **Tarih:** 2026-11-17
- **Durum:** Kabul edildi
- **Karar:** Bilgisayara yalnızca Git (sürüm takibi) ve Python (yerel test sunucusu) kuruldu.
  Python yalnızca geliştirme sırasında dosyaları sunmak için kullanılır; uygulamanın parçası değildir.
- **Neden:** Git ile her adım kaydedilir, hatalı değişiklik geri alınabilir ve projenin gelişimi jüriye gösterilebilir.
  Python'un hazır `http.server` modülü ek paket kurmadan yerel sunucu açar.
- **Değerlendirilen alternatifler:** Node.js + npm (derleme adımımız olmadığı için gereksiz),
  VS Code Live Server eklentisi (çalışır ama komut satırından başlatılamaz).
- **Sonuçları / bedeli:** Yok denecek kadar az; iki ücretsiz program.

## K-005: Yayın için GitHub Pages
- **Tarih:** 2026-11-17
- **Durum:** Kabul edildi
- **Karar:** Uygulama https://telefonlab-takim.github.io/telefon-lab/ adresinde, public bir GitHub deposundan yayınlanıyor.
- **Neden:** Telefon sensörleri yalnızca HTTPS ile çalışır; GitHub Pages ücretsiz ve HTTPS'i kendisi sağlar.
  Yalnızca dosya sunar, sunucu tarafında kod çalıştırmaz; bu yüzden ölçüm verisi hiçbir zaman sunucuya gitmez.
- **Değerlendirilen alternatifler:** Netlify / Cloudflare Pages (benzer, ama ek hesap gerekir),
  bilgisayardan yerel ağda yayın (telefon için HTTPS sertifikası kurmak gerekir, karmaşık).
- **Sonuçları / bedeli:** Ücretsiz planda depo public olmalı; kod herkese açıktır (gizli bilgi içermediği için sorun değil).

## Açık kararlar (henüz verilmedi)
- Üçüncü deney: serbest düşme mi, eğik düzlem mi?

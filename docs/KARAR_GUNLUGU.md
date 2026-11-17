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

## K-006: Periyot analizi ekseni kendisi seçer ve başlangıcı atlar
- **Tarih:** 2026-11-17
- **Durum:** Kabul edildi (Adım 4'te uygulandı)
- **Karar:** Periyot, 3 dönme ekseninden salınımı en büyük olanında (standart sapması en büyük) aranır.
  Telefon elle bırakılırken oluşan düzensiz başlangıç analize katılmaz: "Başlat"a basınca önce
  **bırakma süresi** (varsayılan 5 s) geri sayılır, kayıt ondan sonra başlar.
- **Neden:** İlk gerçek kayıtta (TEST_SONUCLARI 5.2) salınım tek bir eksende net görüldü ama hangi eksen olduğu
  telefonun ipe nasıl bağlandığına bağlı. Ayrıca eksen adları (alfa/beta/gama) tarayıcılar arasında farklı
  yorumlanabiliyor; adlara güvenmek yerine veriye bakmak daha sağlam. İlk ~4 saniye bırakma hareketi yüzünden düzensizdi.
- **Değerlendirilen alternatifler:** Kullanıcıya ekseni seçtirmek (lise öğrencisi için kafa karıştırıcı),
  sabit bir eksen kullanmak (telefon farklı asılınca çalışmaz). Başlangıç için: kayıttan önce geri sayım
  (kullanıcı sarkacı geri sayım bitmeden bırakır) ya da analizde ilk birkaç saniyeyi atlamak.
- **Sonuçları / bedeli:** Seçilen eksen ekranda gösterilmeli ki öğrenci neyin ölçüldüğünü görsün.

## K-007: Periyot ve belirsizliği, geçiş anlarına doğru uydurarak bulmak
- **Tarih:** 2026-11-17
- **Durum:** Kabul edildi
- **Karar:** Yukarı sıfır geçiş anları sıra numarasına (0, 1, 2, …) karşı alınır ve en küçük kareler ile
  `tₖ = t₀ + k·T` doğrusu uydurulur. Periyot = eğim, ΔT = eğimin standart hatası.
- **Neden:**
  - Lise yöntemi olan "tek tek periyotların ortalaması ± standart sapma/√n", ardışık periyotlar aynı geçiş anını
    paylaştığı için (biri bittiği an diğeri başlar) belirsizliği **olduğundan büyük** gösterir.
    Ayrıca tek tek periyotların ortalaması = (son geçiş − ilk geçiş) / periyot sayısı'dır; aradaki bütün geçişler boşa gider.
  - Doğru uydurma bütün geçiş anlarını kullanır ve belirsizliği noktaların doğrudan sapmasından doğru biçimde hesaplar.
  - Jüriye anlatması kolay: "Geçiş anlarını grafiğe koyduk, en iyi doğruyu çizdik, eğim periyot."
- **Değerlendirilen alternatifler:** Tek tek periyotların ortalaması; Fourier dönüşümü ile frekans bulma
  (doğru ama lise düzeyinde açıklaması zor, çözünürlüğü kayıt süresine bağlı).
- **Sonuçları / bedeli:** Tek tek periyotların yayılımı (%) ayrıca gösteriliyor; öğrenci salınımın ne kadar düzenli
  olduğunu yine görebiliyor.

## K-008: Periyot öncesi yumuşatma, düzensiz bölümleri atma, güvenilmez sonucu işaretleme
- **Tarih:** 2026-11-18
- **Durum:** Kabul edildi
- **Karar:**
  1. Dönme hızı sinyali, sıfır geçişleri aranmadan önce 0,15 s'lik **hareketli ortalama** ile yumuşatılır.
  2. Tek tek periyotlardan, ortancadan en fazla %20 farklı olanların oluşturduğu **en uzun kesintisiz bölüm**
     kullanılır; diğerleri atılır ve ekranda kaç tanesinin atıldığı ve hangi zaman aralığının kullanıldığı gösterilir.
  3. Periyot hesabında herhangi bir uyarı varsa g sonucu **üstü çizili** gösterilir, açıklamanın başında
     "güvenmeyin" yazar ve kabul edilen değerle karşılaştırma "anlamlı değil" olarak verilir.
- **Neden:** Üçüncü gerçek kayıtta (TEST_SONUCLARI 5.4) telefonun ilk saniyelerdeki hızlı titreşimi sahte geçişler
  üretti; periyot 1,50 s yerine 1,09 s hesaplandı ve yanlış L ile birleşince g tesadüfen "uyumlu" göründü.
  Periyot bölümü uyarı veriyordu ama g bölümü bunu bilmiyordu.
- **Neden bu yöntemler:**
  - Hareketli ortalama: lise düzeyinde açıklanabilir ("her noktayı çevresindeki 0,15 s'nin ortalamasıyla değiştir").
    Pencere iki yana eşit uzandığı için yavaş salınımın sıfır geçişlerini kaydırmaz; ≈6–7 Hz titreşimi siler.
  - En uzun düzenli bölüm: gerçek bir sarkaçta ardışık periyotlar %1–2 bile farklı olmaz; %20 sınırı yalnızca
    gerçekten bozuk periyotları ayıklar.
- **Değerlendirilen alternatifler:** Kaydın ilk N saniyesini her zaman atmak (titreşim ne kadar sürer bilinmiyor);
  Fourier dönüşümü / öz-ilinti ile baskın frekansı bulmak (daha sağlam ama açıklaması zor);
  kullanıcıya grafikte bölüm seçtirmek (lise öğrencisi için ek yük).
- **Sonuçları / bedeli:** Düzenli bölüm kısa kalırsa (kaydın yarısından az) uyarı verilir. Yumuşatma, çok kısa
  sarkaçlarda (T < 0,6 s) salınımı da biraz küçültür; ders sarkaçları bundan uzundur.

## Açık kararlar (henüz verilmedi)
- Üçüncü deney: serbest düşme mi, eğik düzlem mi?
- Sarkaç: Telefon burulup hareket düzlemsel olmadığında (TEST_SONUCLARI 5.3) tek eksen yerine 3 eksenin en çok
  salınan **bileşik yönü** (temel bileşen analizi) kullanılmalı mı? Önce V biçiminde (iki ipli) asmanın sorunu
  çözüp çözmediği denenecek; çözerse kod basit kalır.

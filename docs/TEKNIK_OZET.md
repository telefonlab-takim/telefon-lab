# Teknik Özet

Bu dosya uygulamanın **nasıl çalıştığını** anlatır. Kod değiştikçe güncellenir.

## 1. Genel mimari

_(Doldurulacak: sayfalar, modüller ve aralarındaki veri akışı.)_

```
Sensör  →  Kayıt (zaman damgalı örnekler)  →  Analiz (saf fonksiyonlar)  →  Sonuç + belirsizlik + açıklama
```

## 2. Dosya yapısı ve görevleri

| Dosya / klasör | Görevi |
|---|---|
| `index.html` | ✅ Ana menü: deneyler, araçlar, ana ekrana ekleme, internetsiz kullanım durumu |
| `sensor-testi.html` | ✅ Hareket sensörü test sayfası (canlı ham değerler) |
| `sarkac.html` | ✅ Sarkaç deneyi sayfası: L girişi, geri sayım, kayıt, g ± Δg ve açıklama, periyot, grafik, örnekleme raporu |
| `css/stil.css` | ✅ Ortak stil (karanlık mod destekli) |
| `js/sensor/hareket.js` | ✅ Ön kontroller, izin, `devicemotion` dinleme, boş olay filtresi |
| `js/sensor/kayit.js` | ✅ Belirli süre kayıt; kayıt sırasında sayfa arka plana geçti mi? |
| `js/analiz/istatistik.js` | ✅ Ortalama, ortanca, standart sapma, doğru uydurma (en küçük kareler) |
| `js/analiz/ornekleme.js` | ✅ Örnekleme raporu: hız, ortanca aralık, uzun boşluklar, uyarılar |
| `js/analiz/periyot.js` | ✅ Eksen seçimi, yukarı sıfır geçişleri, periyot ± belirsizlik |
| `js/analiz/sarkac-hesap.js` | ✅ g ± Δg, belirsizlik payları, kabul edilen değerle karşılaştırma, bırakma açısı, büyük açı etkisi |
| `js/arayuz/bicim.js` | ✅ Türkçe sayı yazma (1.067,5), virgüllü sayı okuma ("48,7"), belirsizlikle yazma (9,81 ± 0,10) |
| `js/arayuz/grafik.js` | ✅ Canvas üzerine çizgi grafiği (ızgara, eksen yazıları, renk açıklaması) |
| `js/arayuz/olcek.js` | ✅ Eksenler için "güzel" çizgi değerleri (-20, 0, 20, 40 gibi) |
| `js/sayfalar/sensor-testi-sayfa.js` | ✅ Sensör testi sayfasının akışı |
| `js/sayfalar/sarkac-sayfa.js` | ✅ Sarkaç sayfasının akışı ve sonuç açıklamaları |
| `testler/index.html`, `testler/testler.js` | ✅ Analiz fonksiyonlarının testleri (tarayıcıda açılınca çalışır) |
| `manifest.webmanifest` | ✅ Uygulama tanımı: ad, simgeler, renkler, "uygulama gibi aç" (standalone) |
| `sw.js` | ✅ Servis çalışanı: dosyaları saklar, internetsiz açılmayı sağlar (önce ağ, olmazsa önbellek) |
| `js/pwa.js` | ✅ Servis çalışanını kaydetme ve "internetsiz kullanıma hazır" durumu |
| `js/surum.js` | ✅ Kod sürüm etiketi (sayfanın altında görünür) |
| `js/sayfalar/ana-sayfa.js` | ✅ Ana menünün akışı |
| `ikonlar/` | ✅ Uygulama simgeleri (180, 192, 512 piksel PNG) |
| `araclar/ikon_uret.py` | ✅ Simgeleri üreten Python betiği (uygulamanın parçası değil; dış kütüphane yok) |

✅ = yazıldı, 🔶 = kısmen yazıldı. Diğerleri plandaki sonraki adımlar.

## 2.0 Örnekleme raporu (`js/analiz/ornekleme.js`)

Sarkaç periyodunu ölçümlerin zaman damgalarından hesaplayacağımız için önce ölçümlerin
**düzenli** gelip gelmediğini kontrol ediyoruz.

- **Aralık:** Art arda iki ölçüm arasındaki süre (ms). 60 Hz'de ideal değer 1000 / 60 ≈ 16,7 ms.
- **Ortalama hız:** `(ölçüm sayısı − 1) / kayıt süresi`. 5 ölçüm arasında 4 aralık olduğu için 1 çıkarılır.
- **Ortanca aralık:** Aralıklar sıralanınca ortadaki değer. Tek bir uzun boşluk ortalamayı bozar ama ortancayı
  bozmaz; "normalde" kaç ms'de bir ölçüm geldiğini ortanca gösterir.
- **Uzun boşluk:** 50 ms'den uzun aralık (60 Hz'de en az 2 ölçümün kaybolduğu anlamına gelir).
  Her boşluğun kaydın kaçıncı saniyesinde olduğu listelenir.
- **Uyarılar:** Saniyede 30'dan az ölçüm, uzun boşluk, kayıt sırasında sayfanın arka plana geçmesi,
  jiroskop verisinin hiç gelmemesi.

## 2.0.1 Sinyal grafiği (`js/arayuz/grafik.js`)

- Tarayıcının kendi çizim aracı **Canvas 2D** ile çiziliyor; grafik kütüphanesi yok.
- Yatay eksen: kaydın başından itibaren geçen süre (s). Dikey eksen: seçilen sinyal
  (dönme hızı °/s ya da ivme m/s²). Her sinyalin 3 ekseni ayrı renkte çizilir.
- **Veri → piksel dönüşümü:** `x = sol kenar + (t − tMin) / (tMax − tMin) × alan genişliği`.
  Canvas'ta y aşağı doğru arttığı için y ters çevrilir: `y = üst kenar + (yMax − v) / (yMax − yMin) × alan yüksekliği`.
- **Keskinlik:** Telefon ekranlarında 1 CSS pikseli 2–3 gerçek piksel olduğundan tuval `devicePixelRatio` kadar büyütülür.
- **Eksen çizgileri** (`js/arayuz/olcek.js`): Aralık 1, 2 veya 5 × 10ⁿ büyüklüğünde adımlara bölünür
  (ör. −37…42 için −20, 0, 20, 40).
- **Renkler** CSS değişkenlerinden (`--seri-1/2/3`) okunur, karanlık modda kendiliğinden değişir.
  CSS okunamazsa yedek renk kullanılır (bkz. TEST_SONUCLARI, önbellek sorunu).
- Değeri olmayan (null) ölçümlerde çizgi koparılır; olmayan veri uydurulmaz.

## 2.1 Hareket sensörü nasıl okunuyor? (`js/sensor/hareket.js`)

1. **Ön kontrol:** Sayfa güvenli bağlamda mı (`isSecureContext`), tarayıcı `DeviceMotionEvent`'i tanıyor mu?
2. **İzin:** `DeviceMotionEvent.requestPermission` varsa (iPhone) buton tıklamasıyla çağrılır.
   Yoksa (Android) izin gerekmez.
3. **Dinleme:** `window.addEventListener('devicemotion', ...)`. Tarayıcı saniyede onlarca olay gönderir.
   Her olay `{ zaman, ax, ay, az, donmeAlfa, donmeBeta, donmeGama, aralik }` biçiminde bir örneğe çevrilir.
4. **Boş olay filtresi:** Sensörü olmayan cihazlarda tarayıcı, bütün değerleri boş tek bir olay gönderir.
   Bu olay ölçüm sayılmaz.
5. **Ekran:** Sensör olayında ekrana yazılmaz. Ekran `requestAnimationFrame` ile saniyede en fazla ~60 kez güncellenir.
   Bu telefonu yormaz.
6. **Örnekleme hızı:** Tarayıcının bildirdiği `interval` değerine güvenmiyoruz (cihaza göre birimi değişebiliyor).
   Hızı zaman damgalarından kendimiz hesaplıyoruz: `hız = (örnek sayısı − 1) / geçen süre`.

## 2.2 Uygulamayı çalıştırma

- **Bilgisayarda:** ES modülleri `file://` ile açılan sayfada çalışmaz, küçük bir yerel sunucu gerekir.
  Proje klasöründe şu komut çalıştırılır, sonra tarayıcıda `http://localhost:8123/sensor-testi.html` açılır:
  ```
  py -m http.server 8123 --bind 127.0.0.1
  ```
  (Windows'ta `python` komutu Microsoft Store kısayoluna gidebilir; `py` her zaman kurulu Python'u çalıştırır.
  Aynı ayar `.claude/launch.json` içinde de var.) Bilgisayarda hareket sensörü olmadığı için sayfa
  "veri gelmedi" uyarısı verir; bu beklenen davranıştır.
- **Telefonda:** Sayfa HTTPS ile açılmalı. Planlanan yöntem: GitHub Pages
  (depo → Settings → Pages → "Deploy from a branch" → `main` / kök klasör).
  Yayın adresi: **https://telefonlab-takim.github.io/telefon-lab/sensor-testi.html**
  (Ana sayfa `index.html` henüz olmadığı için yalnızca `.../telefon-lab/` adresi 404 verir.)
  Kod değişince GitHub Desktop'ta **Push origin**'e basılır; site 1–2 dakikada güncellenir.

## 3. Kullanılan tarayıcı API'leri

| API | Ne için | Not |
|---|---|---|
| `DeviceMotionEvent` | İvme ve açısal hız | iPhone'da buton ile izin istenir |
| `getUserMedia` (ses) + Web Audio | Ses frekansı | _(doldurulacak)_ |
| `getUserMedia` (görüntü) | Kamera ile ölçüm | _(doldurulacak)_ |
| Service Worker | Çevrimdışı çalışma | HTTPS gerekir |

## 4. Deneyler

### 4.1 Sarkaç
- **Fizik:** Küçük açılı basit sarkaçta `T = 2π·√(L/g)`  →  `g = 4π²·L / T²`
- **Belirsizlik:** `Δg / g = √( (ΔL/L)² + (2·ΔT/T)² )`
- **Deney düzeneği** (TEST_SONUCLARI 5.8'deki deneyimden):
  - İp **sabit** bir noktaya bağlanır (kapı kolu, sopa, masaya bantlanmış taşan cetvel); **elle tutulmaz.**
  - **Esnemeyen ince ip** (ayakkabı bağcığı, olta misinası); şarj kablosu değil (sert ve ağır).
  - Telefon **şarj girişinden asılmaz** (giriş etrafında ayrı salınım, girişe zarar, düşme riski); sıkı kılıf ya da bantla bağlanır.
  - Mümkünse iki iple V biçiminde asılır (telefonun burulmasını önler) ve iplerin düzlemine dik itilir.
  - **L:** metre dönme noktasına dayanıp telefonun ortasına kadar **doğrudan** ölçülür; masa/yer yüksekliğinden hesaplanmaz.
- **Ölçüm akışı:** "Başlat" → bırakma süresi (geri sayım; kullanıcı sarkacı asıp bırakır, el hareketi kayda girmez)
  → kayıt → sonuçlar.
- **Periyot bulma yöntemi** (`js/analiz/periyot.js` → `sarkacPeriyoduBul`):
  0. Her eksen 0,15 s'lik **hareketli ortalama** ile yumuşatılır (telefonun ip ucundaki hızlı titreşimini bastırır; K-008).
  1. Aşağıdaki 2–5. adımlar **her dönme ekseni için ayrı ayrı** yapılır. Tek tek periyotları birbirine en yakın olan
     (**en düzenli**) ve en az 5 düzenli salınımı olan eksen seçilir (K-009). Başka bir eksen de düzenli ama %10'dan fazla
     farklı periyotla salınıyorsa "telefon iki ayrı yönde salınıyor" uyarısı verilir. Ekranda her eksenin periyodu tablo
     olarak görünür; seçilen eksen ✓ ile işaretlidir.
  2. Sinyalin ortalaması çıkarılır (jiroskobun küçük sabit kayması da gider).
  3. **Yukarı sıfır geçişleri** bulunur. Gürültünün sahte geçiş üretmemesi için eşik bandı (histerezis) kullanılır:
     sinyal önce −0,3·s'nin altına inmeli, sonra +0,3·s'nin üstüne çıkmalı (s = standart sapma).
     Geçiş anı, sıfırın iki yanındaki ölçümler arasında **doğrusal ara değer** ile bulunur; böylece ≈17 ms'lik
     ölçüm aralığından çok daha hassas olur.
  4. **Düzensiz kısımlar atılır:** ortanca periyottan %20'den fazla farklı periyotlar "düzensiz" sayılır; düzenli
     periyotların **en uzun kesintisiz bölümü** kullanılır (K-008). Ekranda kullanılan zaman aralığı ve atılan periyot sayısı görünür.
  5. Geçiş anları sıra numarasına karşı bir doğru oluşturur: `tₖ = t₀ + k·T`. **En küçük kareler** ile en uygun doğru
     bulunur; **eğim = T**, eğimin belirsizliği = **ΔT** (bkz. K-007).
- **Kalite kontrolleri:** en az 5 düzenli salınım; tek tek periyotlar arası fark %5'ten az; düzenli bölüm kaydın en az
  yarısı; bırakma açısı 10°'den az. İlk üçünden biri sağlanmazsa periyot "güvenilir değil" sayılır ve g sonucu
  üstü çizili gösterilir.
- **Bırakma açısı tahmini** (`sarkac-hesap.js`): `θ₀ = ω_max · T / (2π)`, `ω_max = √2 · s` (sinüs için tepe = √2 × standart sapma).
- **Büyük açı etkisi:** `T ≈ T₀·(1 + θ₀²/16)` → g yaklaşık `θ₀²/8` oranında küçük çıkar (23° → %2,1).
- **Bilinen hata kaynakları:** ip boyunun (L) ölçümü — özellikle telefonun ağırlık merkezinin tam yeri (baskın);
  büyük bırakma açısı; telefonun ip ucunda burulması; zaman damgası titremesi (ihmal edilebilir, bkz. TEST_SONUCLARI 7).
- **g hesabı** (`sarkac-hesap.js` → `gHesapla`): Kullanıcı L ve ΔL'yi cm olarak girer (virgül ya da nokta kabul edilir);
  kayıttan önce ya da sonra girilebilir, değiştikçe g yeniden hesaplanır. Son girilen değerler yalnızca o telefonun
  tarayıcısında hatırlanır (`localStorage`).
- **Belirsizlik payları:** Toplam (göreli) belirsizliğin karesi, L'den ve T'den gelen kısımlara bölünür:
  `L payı = (ΔL/L)² / (Δg/g)²`, `T payı = (2ΔT/T)² / (Δg/g)²`. Öğrenciye "neyi daha dikkatli ölçmeli" sorusunun cevabını verir.
- **Kabul edilen değerle karşılaştırma:** `fark katı = |g − 9,80| / Δg`. 2 veya altı → "uyumlu";
  2'den büyük → "rastgele hatayla açıklanamaz, sistematik hata olabilir" ve olası nedenler listelenir.
  (2 sınırı: rastgele hatalarda ölçümlerin yaklaşık %95'i ±2 belirsizlik içine düşer.)
- **Büyük açı etkisi belirsizliğe dahil değildir;** ayrı bir cümleyle açıklanır. (Açı tahmini, telefon burulduğunda
  güvenilir olmadığı için otomatik düzeltme yapılmıyor.)
- **Sonucu yazma kuralı** (`bicim.js` → `belirsizlikleYaz`): Belirsizlik 1 anlamlı basamağa yuvarlanır (ilk rakamı 1 ise 2);
  ölçüm aynı ondalık basamağa kadar yazılır. Ör. 9,8093 ± 0,1017 → **9,81 ± 0,10**.

### 4.2 Ses frekansı
_(doldurulacak)_

### 4.3 Serbest düşme / eğik düzlem
_(doldurulacak)_

## 5. Belirsizlik hesabı genel yaklaşımı
_(doldurulacak: ölçüm tekrarından gelen istatistiksel belirsizlik, alet çözünürlüğü, hata yayılımı.)_

## 6. Çevrimdışı çalışma ve gizlilik

**Uygulama (PWA) olarak kurulum:** `manifest.webmanifest` uygulamanın adını, simgesini ve renklerini tanımlar.
Kullanıcı "Ana Ekrana Ekle" deyince Telefon Lab, tarayıcı çubuğu olmadan bir uygulama gibi açılır.

**Servis çalışanı (`sw.js`)** tarayıcı ile internet arasında duran küçük bir koddur:
1. **Kurulum (ilk açılış):** `DOSYALAR` listesindeki bütün dosyalar indirilip telefona kaydedilir.
   Böylece hiç açılmamış bir sayfa bile internetsiz açılır.
2. **Etkinleşme:** Eski sürümlerin kayıtlı kopyaları silinir.
3. **Her istek — "önce ağ, olmazsa önbellek":** İnternet varsa dosya sunucudan **taze** alınır
   (`cache: 'no-cache'` → sunucuya "değişti mi?" diye sorulur) ve kopyası güncellenir. İnternet yoksa
   ya da 4 saniyede cevap gelmezse kayıtlı kopya kullanılır. (Neden bu strateji: KARAR_GUNLUGU K-010.)

**iPhone'a özgü durumlar (önemli):**
- iPhone, **ana ekrana eklenen** uygulamanın kayıtlı dosyalarını **Safari'den ayrı** saklar. Safari'de "hazır" olması,
  ana ekrandaki uygulamanın da hazır olduğu anlamına gelmez. Uygulama ana ekrana eklendikten sonra **internet varken
  simgeden bir kez açılmalı** ve "✓ İnternetsiz kullanıma hazır" yazısı beklenmeli. (Ana menüde de yazıyor.)
- Servis çalışanı yalnızca `.../telefon-lab/` **altındaki** adresleri yönetir. Adres sondaki eğik çizgi olmadan
  (`.../telefon-lab`) yazılırsa bu adres onun alanının **dışında** kalır ve internetsiz açılmaz. Doğru adres:
  `https://telefonlab-takim.github.io/telefon-lab/`
- Alanın içindeki ama kayıtlı olmayan bir adres internetsiz açılırsa hata sayfası yerine ana menü gösterilir.

**Güncelleme:** `sw.js` içindeki `SURUM` değişince tarayıcı yeni servis çalışanını kurar ve dosyaları yeniden indirir.
Sürüm etiketi kuralı için CLAUDE.md kural 8, yeni dosya kuralı için kural 9.

**Gizlilik:**
- Servis çalışanı yalnızca uygulamanın **kendi dosyalarını** saklar (HTML, CSS, JS, simgeler). Ölçüm verisi saklanmaz.
- Ölçüm verisi yalnızca sayfa açıkken telefonun belleğinde durur; hiçbir sunucuya gönderilmez.
- Telefonda kalıcı olarak saklanan tek kullanıcı bilgisi son girilen sarkaç boyu (L, ΔL) — yalnızca o tarayıcıda (`localStorage`).
- GitHub Pages yalnızca dosya sunar; sunucu tarafında çalışan kod yoktur (K-005).

**Nasıl denendi:** Yerel sunucu kapatılınca ana menü, sarkaç, sensör testi ve hesap testleri sayfaları
servis çalışanının kayıtlı kopyalarından açıldı (TEST_SONUCLARI).

## 7. Bilinen sınırlamalar
_(doldurulacak)_

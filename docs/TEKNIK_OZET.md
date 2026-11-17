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
| `index.html` | Ana menü, deney seçimi |
| `sensor-testi.html` | ✅ Hareket sensörü test sayfası (canlı ham değerler) |
| `sarkac.html` | 🔶 Sarkaç deneyi sayfası (şimdilik: kayıt + örnekleme raporu + sinyal grafiği) |
| `css/stil.css` | ✅ Ortak stil (karanlık mod destekli) |
| `js/sensor/hareket.js` | ✅ Ön kontroller, izin, `devicemotion` dinleme, boş olay filtresi |
| `js/sensor/kayit.js` | ✅ Belirli süre kayıt; kayıt sırasında sayfa arka plana geçti mi? |
| `js/analiz/istatistik.js` | 🔶 Ortalama, ortanca (standart sapma sonra eklenecek) |
| `js/analiz/ornekleme.js` | ✅ Örnekleme raporu: hız, ortanca aralık, uzun boşluklar, uyarılar |
| `js/analiz/periyot.js` | Sinyalden periyot bulma |
| `js/analiz/sarkac-hesap.js` | g ve belirsizlik hesabı |
| `js/arayuz/bicim.js` | ✅ Sayıları Türkçe biçimde yazma (1.067,5) |
| `js/arayuz/grafik.js` | ✅ Canvas üzerine çizgi grafiği (ızgara, eksen yazıları, renk açıklaması) |
| `js/arayuz/olcek.js` | ✅ Eksenler için "güzel" çizgi değerleri (-20, 0, 20, 40 gibi) |
| `js/sayfalar/sensor-testi-sayfa.js` | ✅ Sensör testi sayfasının akışı |
| `js/sayfalar/sarkac-sayfa.js` | 🔶 Sarkaç sayfasının akışı |
| `testler/index.html`, `testler/testler.js` | ✅ Analiz fonksiyonlarının testleri (tarayıcıda açılınca çalışır) |
| `manifest.webmanifest`, `sw.js` | PWA ve çevrimdışı çalışma (sonraki aşama) |

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
- **Periyot bulma yöntemi:** _(doldurulacak)_
- **Bilinen hata kaynakları:** _(doldurulacak)_

### 4.2 Ses frekansı
_(doldurulacak)_

### 4.3 Serbest düşme / eğik düzlem
_(doldurulacak)_

## 5. Belirsizlik hesabı genel yaklaşımı
_(doldurulacak: ölçüm tekrarından gelen istatistiksel belirsizlik, alet çözünürlüğü, hata yayılımı.)_

## 6. Çevrimdışı çalışma ve gizlilik
_(doldurulacak)_

## 7. Bilinen sınırlamalar
_(doldurulacak)_

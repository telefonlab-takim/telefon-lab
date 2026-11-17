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
| `sensor-testi.html` | ✅ Hareket sensörü test sayfası (ham değerler + örnekleme hızı) |
| `js/sayfalar/sensor-testi-sayfa.js` | ✅ Sensör testi sayfasının butonları ve ekran güncellemesi |
| `index.html` | Ana menü, deney seçimi |
| `sarkac.html` | Sarkaç deneyi sayfası |
| `css/stil.css` | Tüm sayfaların ortak stili |
| `js/sensor/hareket.js` | ✅ Hareket sensörü izni ve veri toplama |
| `css/stil.css` | ✅ Ortak stil (karanlık mod destekli) |
| `js/analiz/istatistik.js` | Ortalama, standart sapma, standart hata |
| `js/analiz/periyot.js` | Sinyalden periyot bulma |
| `js/analiz/sarkac-hesap.js` | g ve belirsizlik hesabı |
| `js/arayuz/grafik.js` | Canvas üzerine sinyal çizimi |
| `js/sayfalar/sarkac-sayfa.js` | Sarkaç sayfasının düğmeleri ve akışı |
| `testler/index.html` | Analiz fonksiyonlarının testleri |
| `manifest.webmanifest`, `sw.js` | PWA ve çevrimdışı çalışma (sonraki aşama) |

✅ = yazıldı. Diğerleri plandaki sonraki adımlar.

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
  Adres `https://<kullanici-adi>.github.io/<depo-adi>/sensor-testi.html` olur.

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

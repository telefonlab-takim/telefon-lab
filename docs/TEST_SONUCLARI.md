# Test Sonuçları

Burada iki tür test kaydı tutuyoruz:
1. **Yazılım testleri** — analiz fonksiyonları bilinen sahte verilerle doğru sonuç veriyor mu?
2. **Gerçek ölçümler** — telefonla yapılan deneylerde ne ölçtük, bilinen değere ne kadar yakın?

Bir ölçüm kötü çıktıysa onu da yazıyoruz; jüri için başarısız denemeler ve nedenleri de değerlidir.

---

## 1. Test edilen cihazlar

| Kod | Cihaz | İşletim sistemi | Tarayıcı | Örnekleme hızı (Hz) | Not |
|---|---|---|---|---|---|
| C1 | | | | | |

## 2. Yazılım testleri

| Tarih | Test | Girdi | Beklenen | Çıkan | Sonuç |
|---|---|---|---|---|---|
| 2026-11-17 | Sensör testi sayfası masaüstü Chrome'da açılıyor | localhost üzerinden açıldı | Konsolda hata yok | Hata yok | ✅ |
| 2026-11-17 | İzin reddedilince mesaj | Tarayıcı izni reddetti | Kırmızı hata mesajı, Durdur butonu pasif | Beklendiği gibi | ✅ |
| 2026-11-17 | Sensörsüz cihazda uyarı | Masaüstü (yalnızca boş olay geliyor) | 2 sn sonra "veri gelmedi" uyarısı | Beklendiği gibi | ✅ |
| 2026-11-17 | Veri ekrana doğru yazılıyor | Sahte olay: ay = 9,81, beta = −20,25 | "9,81" ve "-20,25" | "9,81" ve "-20,25" | ✅ |
| 2026-11-17 | GitHub Pages yayını | https://telefonlab-takim.github.io/telefon-lab/sensor-testi.html | HTTPS, tüm dosyalar 200, konsolda hata yok | Beklendiği gibi | ✅ |
| 2026-11-17 | Durdur sonrası veri alınmıyor | Durdur'dan sonra olay gönderildi | Örnek sayısı artmaz | Artmadı | ✅ |

> Not: Masaüstü testlerinde örnekleme hızı anlamlı değildir (sahte olaylar). Gerçek hız telefonda ölçülecek.

## 3. Sarkaç ölçümleri

Referans değer: İstanbul civarı için g ≈ 9,80 m/s² (konuma göre küçük farklar olur).

| Tarih | Cihaz | L (m) | ΔL (m) | Salınım sayısı | T (s) | ΔT (s) | g (m/s²) | Δg (m/s²) | Bilinen değerden fark | Not |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | |

## 4. Ses frekansı ölçümleri

| Tarih | Cihaz | Kaynak (ör. ton üreteci) | Gerçek frekans (Hz) | Ölçülen (Hz) | Belirsizlik (Hz) | Not |
|---|---|---|---|---|---|---|
| | | | | | | |

## 5. Serbest düşme / eğik düzlem ölçümleri

_(Deney seçildikten sonra tablo eklenecek.)_

## 6. Sorunlar ve çözümler

| Tarih | Sorun | Neden | Çözüm |
|---|---|---|---|
| 2026-11-17 | Bilgisayarda "veri gelmedi" uyarısı çıkmıyordu | Chrome, sensör yokken de bütün değerleri boş tek bir olay gönderiyor; bu olay "veri geldi" sayılıyordu | `hareket.js` içinde boş olaylar yok sayılıyor |
| 2026-11-17 | Sayfa `file://` ile açılınca çalışmıyor | Tarayıcılar güvenlik nedeniyle `file://` üzerinden ES modülü yüklemez | Sayfa yerel sunucu ya da HTTPS ile açılmalı |

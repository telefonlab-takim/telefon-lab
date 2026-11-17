# Test Sonuçları

Burada iki tür test kaydı tutuyoruz:
1. **Yazılım testleri** — analiz fonksiyonları bilinen sahte verilerle doğru sonuç veriyor mu?
2. **Gerçek ölçümler** — telefonla yapılan deneylerde ne ölçtük, bilinen değere ne kadar yakın?

Bir ölçüm kötü çıktıysa onu da yazıyoruz; jüri için başarısız denemeler ve nedenleri de değerlidir.

---

## 1. Test edilen cihazlar

| Kod | Cihaz | İşletim sistemi | Tarayıcı | Örnekleme hızı (Hz) | Not |
|---|---|---|---|---|---|
| C1 | iPhone 14 | iOS (sürüm yazılmadı) | Safari | 60 | Jiroskop çalışıyor (dönme hızı değerleri geliyor). Masada z ≈ 9,8 m/s² (beklendiği gibi). İlk testte (sensör testi sayfası) en kısa aralık 1,0 ms, en uzun 1.067 ms görüldü. Sarkaç sayfasındaki 20 sn'lik kayıtta (masada, dokunmadan) ise: 1210 ölçüm, 60,0 Hz, ortanca 17,0 ms, en kısa 12,0 / en uzun 21,0 ms, uzun boşluk yok, jiroskop 1210/1210 — bkz. Bölüm 6. |
| C2 | (Android bekleniyor) | | Chrome | | |

## 2. Yazılım testleri

| Tarih | Test | Girdi | Beklenen | Çıkan | Sonuç |
|---|---|---|---|---|---|
| 2026-11-17 | Sensör testi sayfası masaüstü Chrome'da açılıyor | localhost üzerinden açıldı | Konsolda hata yok | Hata yok | ✅ |
| 2026-11-17 | İzin reddedilince mesaj | Tarayıcı izni reddetti | Kırmızı hata mesajı, Durdur butonu pasif | Beklendiği gibi | ✅ |
| 2026-11-17 | Sensörsüz cihazda uyarı | Masaüstü (yalnızca boş olay geliyor) | 2 sn sonra "veri gelmedi" uyarısı | Beklendiği gibi | ✅ |
| 2026-11-17 | Veri ekrana doğru yazılıyor | Sahte olay: ay = 9,81, beta = −20,25 | "9,81" ve "-20,25" | "9,81" ve "-20,25" | ✅ |
| 2026-11-17 | GitHub Pages yayını | https://telefonlab-takim.github.io/telefon-lab/sensor-testi.html | HTTPS, tüm dosyalar 200, konsolda hata yok | Beklendiği gibi | ✅ |
| 2026-11-17 | `testler/index.html` analiz testleri (istatistik + örnekleme) | 14 test, bilinen sahte veriler | Hepsi geçer | 14/14 geçti | ✅ |
| 2026-11-17 | Sarkaç sayfası kayıt + rapor | 10 s sahte veri, 3.–4. saniye arası bilerek veri gönderilmedi | 1 boşluk, ~3. saniyede, ~1000 ms | "2,98. saniyede 1.008,1 ms boşluk", ortanca 16,0 ms | ✅ |
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

## 5.1 Örnekleme kalitesi ölçümleri (sarkac.html raporu)

| Tarih | Cihaz | Koşul | Süre (s) | Ölçüm | Hız (Hz) | Ortanca (ms) | En kısa / en uzun (ms) | Uzun boşluk | Jiroskop |
|---|---|---|---|---|---|---|---|---|---|
| 2026-11-17 | C1 iPhone 14, Safari | Masada, ekrana dokunmadan | 20,2 | 1210 | 60,0 | 17,0 | 12,0 / 21,0 | 0 | 1210/1210 |

## 6. Sorunlar ve çözümler

| Tarih | Sorun | Neden | Çözüm |
|---|---|---|---|
| 2026-11-17 | Bilgisayarda "veri gelmedi" uyarısı çıkmıyordu | Chrome, sensör yokken de bütün değerleri boş tek bir olay gönderiyor; bu olay "veri geldi" sayılıyordu | `hareket.js` içinde boş olaylar yok sayılıyor |
| 2026-11-17 | iPhone 14'te örnekler arası aralık 1,0 ms ile 1.067 ms arasında değişiyor (ortalama 60 Hz olmasına rağmen) | Henüz kesin değil. 1 ms: iOS olayları bazen arka arkaya, yığın hâlinde teslim ediyor olabilir. ~1 sn: tek seferlik bir duraklama olabilir (başlangıç, ekrana dokunma, uygulama değiştirme). En küçük/en büyük değer, durumun bir kez mi yoksa sürekli mi olduğunu göstermiyor. | Sarkaç sayfasının örnekleme raporuyla tekrar ölçüldü (20 sn, masada, dokunmadan): boşluk yok, aralıklar 12–21 ms. Yani normal kayıtta sorun yok; ilk testteki 1 sn'lik boşluk tek seferlikti (muhtemelen ekrana dokunma/kaydırma ya da başlangıç anı, kesin nedeni bilinmiyor). Kayıt sırasında ekrana dokunulmaması önerisi sayfada yazıyor. Aralıkların 12–21 ms arasında oynamasının etkisi için bkz. Bölüm 7. |
| 2026-11-17 | Sayfa `file://` ile açılınca çalışmıyor | Tarayıcılar güvenlik nedeniyle `file://` üzerinden ES modülü yüklemez | Sayfa yerel sunucu ya da HTTPS ile açılmalı |

## 7. Zamanlama titremesi sarkaç sonucunu ne kadar etkiler? (tahmin)

iPhone 14'te ölçümler ortalama 16,7 ms'de bir geliyor ama tek tek aralıklar 12–21 ms arasında oynuyor.
Safari zaman damgalarını 1 ms'ye yuvarlıyor (gizlilik için) ve damga, ölçümün alındığı anı değil
tarayıcıya ulaştığı anı gösteriyor. Bu yüzden her tek ölçümün zamanı yaklaşık ±5 ms belirsiz.

Bunun periyoda etkisi küçük olmalı:
- Periyodu tek bir salınımdan değil, örneğin ilk ve son sıfır geçişi arasındaki ~13 salınımdan buluruz.
- İki uçtaki ±5 ms'lik hatalar 13 salınıma bölünür: ΔT ≈ √(5² + 5²) / 13 ≈ 0,5 ms.
- T ≈ 1,5 s için ΔT/T ≈ %0,04; g'deki etkisi bunun iki katı, ≈ %0,07 (≈ 0,007 m/s²).
- Karşılaştırma: ipin boyunu ±0,5 cm hatayla ölçmek (L ≈ 50 cm) g'de %1 hata yapar.

Sonuç: Zamanlama değil, **ip boyu (L) ölçümü** baskın hata kaynağı olacak. Bu tahmin gerçek sarkaç
ölçümleriyle kontrol edilecek.

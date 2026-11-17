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
| 2026-11-17 | Eksen ölçeği testleri (`olcek.js`) | 7 test | Hepsi geçer | Toplam 21/21 geçti | ✅ |
| 2026-11-17 | Sinyal grafiği | 10 s sahte sarkaç: beta = 45·cos(2πt/1,42 s), yavaş sönümlü + gürültü | ~7 düzgün dalga, renkli 3 seri, telefon genişliğinde (375 px) taşma yok, ivme seçeneği çalışıyor | Beklendiği gibi (masaüstünde) | ✅ |
| 2026-11-17 | Periyot, doğru uydurma, belirsizlikle yazma, açı tahmini testleri | 19 yeni test (sahte sarkaç: gürültü ±3 °/s, kayma +2 °/s, zaman titremesi ±5 ms dahil) | Hepsi geçer | Toplam 40/40 geçti. İlk çalıştırmada 1 test başarısızdı: testteki **elle hesap** yanlıştı (eğim 1,90 yazılmış, doğrusu 1,91); kod doğruydu, test düzeltildi. | ✅ |
| 2026-11-17 | Sarkaç sayfası uçtan uca (masaüstü) | 3 s bırakma (bilerek karışık sinyal) + 10 s kayıt; gama ekseninde 105·cos(2πt/1,40 s) | T ≈ 1,400 s, eksen gama, ~23° uyarısı, karışık başlangıç kayda girmez | T = 1,4000 ± 0,0004 s, eksen gama, 6 salınım, açı 23°, "%2,1" uyarısı | ✅ |
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
| 2026-11-17 | C1 iPhone 14, Safari | İpe asılı, salınırken (ilk gerçek sarkaç) | 20,1 | 1204 | 60,0 | 17,0 | 15,0 / 18,0 | 0 | 1204/1204 |

## 5.2 İlk gerçek sarkaç kaydı — grafikten gözlemler (2026-11-17, iPhone 14)

Henüz otomatik periyot hesabı yok; aşağıdaki değerler ekran görüntüsündeki grafikten piksel ölçerek
**elle tahmin** edilmiştir, kesin ölçüm değildir.

- **Hangi eksen?** Salınım net biçimde tek bir dönme ekseninde (grafikte yeşil, "gama") görülüyor; diğer iki eksende
  aynı frekansta küçük salınımlar ve gürültü var (telefonun hafifçe dönmesi/burulması).
  Baskın eksen telefonun ipe nasıl asıldığına bağlı; bu yüzden periyot kodu ekseni **kendisi seçmeli**.
- **Başlangıç karmaşası:** İlk ~4 saniye düzensiz (telefon elle bırakılırken), sonrası temiz.
  Analiz bu kısmı dışarıda bırakmalı.
- **Periyot (elle tahmin):** 11 periyot ≈ 547 piksel, 5 s ≈ 178 piksel → **T ≈ 1,40 s**.
  Bu, `L = g·T² / (4π²)` ile **L ≈ 0,49 m** demek (ip boyu ölçülüp karşılaştırılacak).
- **Genlik (elle tahmin):** En büyük dönme hızı ≈ 105 °/s. Basit harmonik harekette `ω_max = θ₀ · 2π / T`
  → **θ₀ ≈ 23°**. Bu, küçük açı yaklaşımı için büyük: periyot yaklaşık `T ≈ T₀ · (1 + θ₀²/16)` kadar uzar,
  θ₀ = 0,41 rad için **%1**; g'de bu **≈ %2** hata demek (≈ 0,2 m/s²). Ya daha küçük açıyla (≤ 10°) bırakılmalı
  ya da uygulama bu düzeltmeyi yapmalı.
- **Sönüm:** 16 saniyede genlik gözle görülür biçimde azalmıyor; sarkaç düzgün.

## 5.3 İkinci gerçek sarkaç kaydı — ilk otomatik periyot (2026-11-17, iPhone 14)

- **Sonuç (uygulama):** T = 1,614 ± 0,007 s, eksen gama, 12 salınım, tek tek periyot farkı %4,8, açı ≈ 10°.
- **Kablo boyu:** ölçülmedi / bildirilmedi. T = 1,614 s, `L = g·T²/(4π²)` ile ≈ 0,65 m'ye karşılık gelir
  (ilk kayıtta T ≈ 1,40 s → ≈ 0,49 m idi; kablo boyu değişmiş olmalı).
- **Örnekleme:** 1211 ölçüm, 60,0 Hz, aralık 15–20 ms, boşluk yok.
- **Gözlem — hareket düzlemsel değil:** İlk kayıtta salınım tek eksendeydi (gama). Bu kayıtta üç eksen de
  büyük salınıyor: beta (turuncu) ilk 5 sn büyük, sonra küçülüp 13–16. sn'de yeniden büyüyor (enerji iki salınım
  arasında gidip geliyor), alfa (mavi) gürültülü ve büyük — telefon ip ucunda **burulmuş/sallanma yönü değişmiş**.
  Tek bir eksen hareketin yalnızca bir kısmını gördüğü için:
  - geçiş anları kayıyor → tek tek periyot farkı %4,8 (ilk kayıtta çok daha düzgündü), belirsizlik büyüdü (±0,007 s);
  - açı tahmini de muhtemelen olduğundan küçük çıktı.
- **Sonuç:** Kod beklendiği gibi çalıştı ve bozulmayı belirsizliğe ve "periyot farkı" satırına doğru yansıttı.
  Asıl çözüm **deney düzeneğinde**: telefon iki iple V biçiminde asılırsa (iki asma noktası) yalnızca tek düzlemde
  salınır ve burulamaz.
- **Düzeltilen küçük hata:** Açı "10°" diye yuvarlanıp yanında "10°'den az olmalı" uyarısı çıkıyordu (gerçek değer 10'un
  biraz üstündeydi). Açı artık bir ondalıkla gösteriliyor.

## 6. Sorunlar ve çözümler

| Tarih | Sorun | Neden | Çözüm |
|---|---|---|---|
| 2026-11-17 | Bilgisayarda "veri gelmedi" uyarısı çıkmıyordu | Chrome, sensör yokken de bütün değerleri boş tek bir olay gönderiyor; bu olay "veri geldi" sayılıyordu | `hareket.js` içinde boş olaylar yok sayılıyor |
| 2026-11-17 | iPhone 14'te örnekler arası aralık 1,0 ms ile 1.067 ms arasında değişiyor (ortalama 60 Hz olmasına rağmen) | Henüz kesin değil. 1 ms: iOS olayları bazen arka arkaya, yığın hâlinde teslim ediyor olabilir. ~1 sn: tek seferlik bir duraklama olabilir (başlangıç, ekrana dokunma, uygulama değiştirme). En küçük/en büyük değer, durumun bir kez mi yoksa sürekli mi olduğunu göstermiyor. | Sarkaç sayfasının örnekleme raporuyla tekrar ölçüldü (20 sn, masada, dokunmadan): boşluk yok, aralıklar 12–21 ms. Yani normal kayıtta sorun yok; ilk testteki 1 sn'lik boşluk tek seferlikti (muhtemelen ekrana dokunma/kaydırma ya da başlangıç anı, kesin nedeni bilinmiyor). Kayıt sırasında ekrana dokunulmaması önerisi sayfada yazıyor. Aralıkların 12–21 ms arasında oynamasının etkisi için bkz. Bölüm 7. |
| 2026-11-17 | Grafik çizgileri gri çıktı, grafik yüksekliği yanlıştı | Tarayıcı `stil.css` dosyasının eski hâlini önbellekten kullandı; yeni renk değişkenleri yoktu. GitHub Pages da dosyaları 10 dakikaya kadar önbellekte tutturur, aynı şey telefonda olabilir. | `grafik.js` renk bulamazsa yedek renk kullanıyor. Güncellemeden hemen sonra tuhaf görünüm olursa sayfa yenilenmeli. Kalıcı çözüm: PWA adımında Service Worker ile dosya sürümleri yönetilecek. |
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

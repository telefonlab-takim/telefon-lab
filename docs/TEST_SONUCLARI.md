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
| 2026-11-17 | g hesabı, karşılaştırma, sayı okuma, belirsizlik yazma testleri | 14 yeni test (ör. L = 0,487 ± 0,005 m, T = 1,400 ± 0,001 s → elle hesaplanan g = 9,809, Δg ≈ 0,102) | Hepsi geçer | Toplam 54/54 geçti | ✅ |
| 2026-11-17 | Sarkaç sayfası g bölümü (masaüstü) | L = 48,7 ± 0,5 cm, sahte sarkaç T = 1,40 s, ~7° | g ≈ 9,81 ± 0,10, uyumlu, belirsizlik çoğunlukla L'den | g = 9,82 ± 0,10 m/s², L %99,0 · T %1,0, fark 0,2 kat. L = 40 cm girilince g = 8,1 ve "sistematik hata" açıklaması; "abc" girilince "L'yi girin" mesajı | ✅ |
| 2026-11-18 | İnternetsiz çalışma (masaüstü, yerel sunucu) | Ana menü açıldı → servis çalışanı kuruldu; sonra **sunucu kapatıldı** (curl ile bağlantı yok doğrulandı) | Sayfalar kayıtlı kopyadan açılır | Kurulumda 25 dosya kaydedildi. Sunucu kapalıyken sarkaç (stil + sürüm etiketi doğru), sensör testi ve hesap testleri (62/62 geçti) açıldı | ✅ |
| 2026-11-18 | Taze dosya ("önce ağ") | Servis çalışanı devredeyken index.html'deki başlık geçici olarak değiştirildi, sayfa yenilendi | Yeni başlık hemen görünür | Hemen göründü (değişiklik sonra geri alındı) | ✅ |
| 2026-11-18 | Ana menü telefon genişliğinde | 375 px | Taşma yok, bağlantılar doğru, "İnternetsiz kullanıma hazır" yazısı | Beklendiği gibi | ✅ |
| 2026-11-18 | Eksen seçimi (K-009) testleri | En düzenli seçim; iki yönde salınım (alfa büyük-gürültülü 1,55 s, beta düzgün 1,28 s); gürültü dolu büyük eksen; salınımsız kayıt | Beta seçilir + iki yön uyarısı; düzenli küçük eksen seçilir | Toplam 62/62 geçti (eski "en büyük eksen" testi kaldırıldı) | ✅ |
| 2026-11-18 | Sarkaç sayfası, iki yönde salınım (masaüstü) | L = 40,5 cm, alfa 45·cos(2πt/1,55)+gürültü, beta 30·sin(2πt/1,28) | Beta seçilir, T ≈ 1,28 s, tablo iki periyodu gösterir, g üstü çizili | T = 1,2798 ± 0,0002 s, tablo: alfa 1,550 s %1,6 12 salınım / ✓ beta 1,280 s %0,4 14 salınım / gama 0,421 s %11,5 yalnız 2 salınım (gürültü; aday değil); g = 9,76 ± 0,12 üstü çizili; 375 px'te taşma yok | ✅ |
| 2026-11-18 | Yumuşatma, düzenli bölüm seçimi, başı titreşen sarkaç | 5 yeni test; biri eski yöntemin aynı veride yanıldığını belgeliyor (ham ortalama periyot < 1,4 s) | Hepsi geçer | Toplam 59/59 geçti | ✅ |
| 2026-11-18 | Sarkaç sayfası, gerçek kayda benzeyen veri (masaüstü) | L = 30 cm, ilk 3 s ≈5,5 Hz titreşim, T = 1,50 s | T ≈ 1,50 s, g ≈ 5,3 ve "sistematik hata" açıklaması | T = 1,5002 ± 0,0005 s, g = 5,26 ± 0,09, fark 51,7 kat, sistematik hata açıklaması | ✅ |
| 2026-11-18 | Sarkaç sayfası, periyodu düzensiz salınım (masaüstü) | Periyodu ±%15 oynayan salınım, L = 48,7 cm | Periyot uyarıları, g üstü çizili, "güvenmeyin", karşılaştırma "anlamlı değil" | Beklendiği gibi (3 periyot uyarısı, g = 9,3 ± 1,5 üstü çizili) | ✅ |
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

## 5.4 Üçüncü gerçek kayıt — ilk g ölçümü ve bulunan hata (2026-11-18, iPhone 14)

- **Uygulamanın gösterdiği (eski kod):** L = 30,0 ± 0,5 cm girildi. T = 1,09 ± 0,07 s, eksen alfa, "19 salınım",
  tek tek periyot farkı **%53,9** (uyarı verildi), açı 8,0°. **g = 9,9 ± 1,2 m/s², "kabul edilen değerle uyumlu".**
- **Grafikten görülen gerçek durum:** Kaydın ilk ~3,5 saniyesinde telefon ip ucunda hızlı (≈5 Hz) titreşiyor.
  Bu titreşim, sıfır geçişi sayımına çok sayıda **sahte geçiş** ekledi (grafikte başta sık sık dizilmiş kesikli çizgiler).
  Sonrasında salınım düzenli ve kesikli çizgiler arası ≈ 53,5 piksel ≈ **1,50 s** (grafikten elle tahmin).
- **Sonuç:** Gösterilen T = 1,09 s yanlıştı; doğru periyot ≈ 1,50 s. "Uyumlu" sonucu **tesadüftü**:
  yanlış T ile hatalı L birbirini neredeyse götürdü. Gerçek T ile L = 30 cm, g ≈ 5,3 m/s² verir;
  bu da **L'nin doğru ölçülmediğini** gösterir (T = 1,50 s, L ≈ 56 cm'lik bir sarkaca karşılık gelir).
- **Kodda iki eksik vardı:**
  1. Periyot hesabı, kaydın düzensiz bölümlerini ayıklamıyordu.
  2. Periyot uyarısı (%53,9) g bölümüne taşınmıyordu; g bölümü bozuk periyotla "uyumlu" diyebiliyordu.
     Bu, "ölçüm dürüstlüğü" kuralımıza aykırıydı.
- **Düzeltme:** bkz. KARAR_GUNLUGU K-008 ve aşağıdaki testler. Aynı duruma benzeyen sahte veriyle yeni kod
  T = 1,5002 ± 0,0005 s buluyor ve L = 30 cm ile "belirsizliğin 51,7 katı fark, sistematik hata olabilir" diyor.
- **Açık soru:** L nasıl ölçüldü? Askı düzeni (tek ip / V) neydi? Bir sonraki ölçümde L'nin askı noktasından
  telefonun ortasına kadar **dikey** ölçülmesi gerekiyor.

## 5.5 Dördüncü gerçek kayıt — iki farklı salınım (2026-11-18, iPhone 14)

- **Telefonda çalışan kod eskiydi.** Ekran görüntüsünde K-008 ile eklenen "Hesaba katılan bölüm" satırı yok,
  uyarıda "%33.5" (nokta) yazıyor ve periyot uyarısına rağmen g'nin üstü çizili değil. GitHub'da yeni kod vardı;
  telefon tarayıcısı eski dosyaları önbellekten kullandı. → Sayfaya **sürüm etiketi** eklendi (CLAUDE.md kural 8).
- **Uygulamanın gösterdiği (eski kod):** L = 40,0 ± 0,5 cm. T = 1,28 ± 0,04 s, eksen alfa, 15 salınım,
  periyot farkı **%33,5**, açı 6,7°. g = 9,7 ± 0,6 m/s², "uyumlu".
- **Kullanıcının notu:** L'yi 40–41 cm ölçmüş; 41 cm girilince g = 9,9 çıkıyor.
- **Grafikten görülen (elle tahmin, kesin değil):**
  - **Beta (turuncu)** düzgün salınıyor; tepeler arası ≈ 44 piksel ≈ **1,25 s**.
    L = 40,5 cm için beklenen `T = 2π·√(L/g)` = **1,28 s** → beta, gerçek sarkaç salınımına uyuyor.
  - **Alfa (mavi)** daha büyük ama gürültülü; kesikli çizgiler arası çoğunlukla ≈ 55–57 piksel ≈ **1,55 s**,
    11–13. saniyelerde sık sık sahte geçiş var.
  - Yani telefon **aynı anda iki yönde, iki farklı periyotla** salınıyor. V biçiminde asılan telefonda bu beklenir:
    V'nin düzlemine dik salınım basit sarkaç gibi davranır (L = dikey yükseklik), V'nin düzlemi içindeki hareket ise
    farklı bir periyotla olur.
- **Sorun:** Uygulama ekseni "en büyük salınım" (standart sapma) ile seçiyor (K-006); bu kayıtta yanlış ekseni (alfa) seçti.
  Gösterilen T = 1,28 s, sahte geçişlerin etkisiyle **tesadüfen** doğru değere yakın çıktı. Yeni kod (K-008) aynı veride
  alfanın ≈ 1,55 s'lik bölümünü seçerdi ve g'yi yaklaşık 6,6 m/s² bulurdu — o da yanlış olurdu.
- **Yapılan düzeltme (K-009):** Eksen artık "en düzenli salınan" olarak seçiliyor; her eksenin periyodu tabloda
  gösteriliyor; iki eksen farklı periyotla düzenli salınıyorsa "iki ayrı yönde" uyarısı veriliyor ve g güvenilmez işaretleniyor.
  Aynı duruma benzeyen sahte veride yeni kod beta'yı seçti: T = 1,2798 ± 0,0002 s (alfa 1,550 s tabloda ayrıca görünüyor).
- **L ölçümü (kullanıcıdan):** Masanın kenarından (ipin bağlandığı nokta) telefonun ortasına kadar cetvelle 40–41 cm
  → uygulamaya **L = 40,5 ± 0,5 cm** girilmesi önerildi (aralığın ortası ± yarısı).
- **Deney için:** Telefonu yalnızca V'nin düzlemine dik yönde itmek.

## 5.6 Beşinci gerçek kayıt — yeni kodla ilk ölçüm (2026-11-18, iPhone 14, sürüm 2026-11-18.3)

- **Girilen:** L = 61,0 ± 0,5 cm. **Kullanıcının açıklaması:** Düzenek aynıydı, cetvelle ölçülen L = 40,5 cm.
  40,5 girilince g ≈ 6,5 çıktı; L 61 yapılınca g = 9,92 oldu. Yani **61 cm ölçülmedi, sonuca bakılarak seçildi.**
  Bu nedenle bu kaydın g değeri **geçersizdir** (aşağıdaki "Doğru değerlendirme"ye bakın).
- **Doğru değerlendirme (ölçülen L ile):** L = 40,5 ± 0,5 cm, T = 1,558 ± 0,004 s → **g = 6,59 ± 0,09 m/s²**;
  kabul edilen değerden belirsizliğin ≈ 36 katı uzak → **sistematik hata.** Ölçülen periyot 40,5 cm'lik basit
  sarkaca uymuyor; 1,558 s, ≈ 60 cm'lik bir sarkacın periyodu. Bu, aşağıdaki "iki dönme noktası" açıklamasıyla uyumlu.
- **Uygulama:** T = 1,558 ± 0,004 s, eksen **alfa**, 12 salınım, bölüm 1,4–20,1 s, periyot farkı **%5,6**, açı 3,7°.
  g = 9,92 ± 0,10 m/s² — **üstü çizili** (periyot farkı %5 sınırının üstünde). Uygulama doğru davrandı.
- **Eksen tablosu:** ✓ alfa 1,558 s (%5,6, 12) · beta 1,191 s (%10,1, 6) · gama 0,273 s (%8,3, 8 — gürültü).
- **Dikkat çeken tutarlılık:** Alfa ekseninin periyodu son üç kayıtta hep ≈ 1,50–1,56 s
  (5.4: ≈1,50 s, 5.5: ≈1,55 s, 5.6: 1,558 s), girilen L ise 30, 40,5 ve 61 cm.
  1,558 s'lik bir basit sarkaç ≈ 60 cm boyuna karşılık gelir; 5.5'teki beta (≈1,25–1,28 s) ise ≈ 40 cm'ye.
- **Olası açıklama (doğrulanmadı):** İp masanın üstünde, kenardan biraz geride bağlıysa sarkacın **iki farklı dönme
  noktası** olur: masaya dik yönde salınırken ip **masanın kenarı** etrafında döner (L ≈ kenardan telefona ≈ 40 cm),
  kenara paralel salınırken ise **bağlama noktası** etrafında döner (L ≈ bağlama noktasından telefona ≈ 60 cm).
  Bu, iki yönde iki ayrı periyodu (≈1,25 s ve ≈1,55 s) açıklar.
- **Bu açıklamayı sınamanın dürüst yolu:** İpin masaya **bağlandığı noktadan** telefonun ortasına olan uzaklığı
  cetvelle ölçmek (uygulamaya bakmadan). ≈ 60 cm çıkarsa açıklama doğrulanır.
- **Öneri:** İpin tek bir sabit noktadan sallanmasını sağlamak (ör. masa kenarından taşan bir çubuğa/kancaya bağlamak),
  L'yi o noktadan telefonun ortasına cetvelle ölçmek ve sarkacı tek yönde itmek.
- **Küçük düzeltme:** Eksen tablosunda "1,558 s" gibi değerler dar ekranda iki satıra bölünüyordu; artık bölünmüyor (sürüm 2026-11-18.4).

## 5.7 Altıncı gerçek kayıt — L ölçüldüğü gibi girildi (2026-11-18, iPhone 14)

- **L nasıl bulundu (kullanıcı):** Metreyle masa yüksekliği 74 cm ölçüldü, telefonun ortası için 7 cm eklendi → **L = 81 cm**.
  L bu kez sonuca bakılarak **değiştirilmedi**. ✅
- **Uygulama:** T = 1,744 ± 0,004 s, eksen alfa, 11 salınım, bölüm 0,7–20,0 s, periyot farkı **%2,8**, açı 4,0°,
  **uyarı yok.** g = 10,51 ± 0,08 m/s², kabul edilen değerden belirsizliğin 8,8 katı uzak → uygulama "sistematik hata
  olabilir" dedi. Doğru davranış.
- **Eksen tablosu:** ✓ alfa 1,744 s (%2,8, 11) · beta 1,164 s (%14,5, 6) · gama 0,282 s (%7,2, 12 → ≈ 3,5 Hz).
- **Yorum:**
  - Periyot bu kez düzenli ve güvenilir; sorun **L'nin ne ölçtüğünde**.
  - "Masa yüksekliği + 7 cm" **masadan yere** olan uzaklığı ölçer, **dönme noktasından telefonun ortasına** olan uzaklığı
    değil. Telefon masa kenarından sarkıyorsa ortası yerin üstündedir; L masa yüksekliğinden **kısa** olmalı
    (ör. telefonun ortası yerden 7 cm yüksekteyse L ≈ 74 − 7 = 67 cm).
  - 1,744 s'lik periyot ≈ 75,5 cm'lik basit sarkaca karşılık gelir; ne 81 ne 67 cm ile tam uyuşuyor.
    Düzeneğin fotoğrafı istendi.
  - Gama ekseninde düzenli ≈ 3,5 Hz'lik salınım: telefon ipin ucunda kendi bağlantı noktası etrafında hızlı
    sallanıyor olabilir (iki parçalı sarkaç). Ana salınımı etkilemiyor ama düzeneğin sağlam olmadığını gösteriyor.

## 5.8 Düzenek nasıldı? — 3–6. kayıtlardaki tutarsızlığın büyük ihtimalle asıl nedeni

Kullanıcının açıklaması: **Düzenek "ben + şarj kablosu + telefon".** Yani telefon şarj kablosunun ucuna
(şarj girişinden) takılı, kablonun öbür ucu **elde tutuluyor**.

Bu, 3–6. kayıtlarda gördüğümüz tuhaflıkların hepsini açıklayabilir:

| Gözlem | Olası neden |
|---|---|
| Periyot, ölçülen L ile uyuşmuyor; kayıttan kayda değişiyor | **Dönme noktası el.** El sabit durmaz; sarkaçla birlikte kıpırdar ve etkin boyu değiştirir. |
| İki farklı periyotla iki yönde salınım (5.5) | Elin iki yönde farklı "esnekliği"; kablonun iki yönde farklı bükülme sertliği. |
| Kaydın başında hızlı titreşim (5.4), gamada ≈ 3,5 Hz düzenli salınım (5.7) | Telefon **şarj girişi etrafında** ayrıca sallanıyor (iki parçalı sarkaç). |
| L'yi "masa yüksekliği + 7 cm" ile bulmak | Dönme noktası el olduğu için ölçülecek sabit bir nokta yok. |

Ayrıca **şarj kablosu** basit sarkaç ipi değildir: serttir (bükülmeye direnir) ve kütlesi ihmal edilemez.

**Sonuç:** Uygulamanın ölçümü (periyot) son kayıtlarda düzenli ve güvenilir; sorun **deney düzeneğinde.**
Uygulama bu sorunu doğrudan bilemez, ama "sistematik hata olabilir" uyarısıyla doğru yere işaret etti.

**Önerilen düzenek** (sarkac.html'deki "Düzenek" bölümüne de eklendi, sürüm 2026-11-18.5):
sabit bir noktaya bağlı, esnemeyen ince ip; telefon şarj girişinden değil, sıkı bir kılıf/bantla bağlı;
L metreyle dönme noktasından telefonun ortasına doğrudan ölçülür.

## 5.9 Yedinci gerçek kayıt — kapı koluna asılı (2026-11-18, iPhone 14, sürüm 2026-11-18.5)

- **Düzenek:** Dönme noktası artık **kapı kolu** (sabit). Kullanıcı doğruladı: hâlâ **şarj kablosu** kullanılıyor
  (telefon şarj girişinden asılı). Sonraki adım: ip ile ve L'yi doğrudan ölçerek tekrar.
- **L nasıl bulundu (kullanıcı):** Kapı kolunun yerden yüksekliği 94 cm, telefonun ortası için 6 cm çıkarıldı → **L = 88 cm**
  (yine yüksekliklerden hesap; doğrudan ölçüm değil).
- **Uygulama:** T = **1,7429 ± 0,0018 s**, eksen alfa, 10 salınım, bölüm 1,8–19,2 s, periyot farkı **%1,8**, açı 4,3°,
  **uyarı yok.** g = 11,44 ± 0,07 m/s², kabul edilen değerden 23,7 kat uzak → "sistematik hata" (doğru davranış).
- **Eksen tablosu:** ✓ alfa 1,743 s (%1,8, 10) · beta 1,575 s (%10,5, 5) · gama 0,874 s (%8,5, 4).
- **Önemli gözlem — tekrarlanabilirlik:** Önceki kayıtta (5.7, elde tutulan kablo, "L = 81 cm") T = 1,744 s idi;
  bu kayıtta (kapı kolu, "L = 88 cm") T = 1,7429 s. **İki farklı askıda periyot %0,06 farkla aynı.**
  - Uygulamanın periyot ölçümünün çok tekrarlanabilir olduğunu gösteriyor.
  - Ama girilen L'ler (81 ve 88 cm) farklı olduğu hâlde periyot aynı: salınan sarkacın gerçek boyu iki seferde
    de aynıydı ve yüksekliklerden hesaplanan L'ler onu ölçmüyor. T = 1,743 s, ≈ **75,4 cm**'lik basit sarkaca karşılık gelir.
  - Muhtemel açıklama: iki seferde de **aynı şarj kablosu**, telefon şarj girişinden asılı. L = 88 cm doğruysa
    (T beklenen 1,883 s), periyodun beklenenden kısa olması kablonun **sertliğinin** geri getirici etki eklemesiyle
    açıklanabilir; ya da telefon yerden 6 cm'den daha yüksekte asılıydı. Doğrudan ölçüm ve ip ile deneme istendi.

## 6. Sorunlar ve çözümler

| Tarih | Sorun | Neden | Çözüm |
|---|---|---|---|
| 2026-11-17 | Bilgisayarda "veri gelmedi" uyarısı çıkmıyordu | Chrome, sensör yokken de bütün değerleri boş tek bir olay gönderiyor; bu olay "veri geldi" sayılıyordu | `hareket.js` içinde boş olaylar yok sayılıyor |
| 2026-11-17 | iPhone 14'te örnekler arası aralık 1,0 ms ile 1.067 ms arasında değişiyor (ortalama 60 Hz olmasına rağmen) | Henüz kesin değil. 1 ms: iOS olayları bazen arka arkaya, yığın hâlinde teslim ediyor olabilir. ~1 sn: tek seferlik bir duraklama olabilir (başlangıç, ekrana dokunma, uygulama değiştirme). En küçük/en büyük değer, durumun bir kez mi yoksa sürekli mi olduğunu göstermiyor. | Sarkaç sayfasının örnekleme raporuyla tekrar ölçüldü (20 sn, masada, dokunmadan): boşluk yok, aralıklar 12–21 ms. Yani normal kayıtta sorun yok; ilk testteki 1 sn'lik boşluk tek seferlikti (muhtemelen ekrana dokunma/kaydırma ya da başlangıç anı, kesin nedeni bilinmiyor). Kayıt sırasında ekrana dokunulmaması önerisi sayfada yazıyor. Aralıkların 12–21 ms arasında oynamasının etkisi için bkz. Bölüm 7. |
| 2026-11-18 | iPhone'da uçak modunda "Safari sayfayı açamıyor" hatası (sürüm .6) | Site tarafı sağlam: GitHub Pages'te 25 dosyanın hepsi 200; masaüstü tarayıcıda gerçek sitede servis çalışanı kuruluyor. Olası nedenler: (1) iPhone ana ekran uygulamasının dosyaları Safari'den ayrı saklanır; uygulama simgeden internetle hiç açılmadan uçak moduna geçildiyse kendi kopyası yoktur. (2) Adres sondaki "/" olmadan yazıldıysa servis çalışanının alanı dışında kalır. (3) Telefon henüz eski (.5) sürümü gösteriyordu. | Ana menüye "simgeden internetle bir kez açın" notu eklendi; kayıtlı olmayan sayfa internetsiz açılınca hata yerine ana menü gösteriliyor (sürüm .7, yerelde doğrulandı). iPhone'da yeniden denenecek. |
| 2026-11-18 | Telefonda yeni kod yerine eski kod çalıştı (GitHub güncel olduğu hâlde) | Telefon tarayıcısı dosyaların eski hâlini önbellekte tuttu | Sayfanın altına "Sayfa / Kod sürümü" etiketi eklendi; ikisi beklenen değeri göstermiyorsa sayfa yenilenmeli. Kalıcı çözüm PWA adımında (Service Worker). |
| 2026-11-18 | Gerçek kayıtta uygulama yanlış periyotla (1,09 s yerine ≈1,50 s) "g uyumlu" dedi | Kaydın başındaki hızlı titreşim sahte sıfır geçişleri üretti; periyot uyarısı g bölümüne taşınmıyordu | Sinyal yumuşatılıyor, yalnızca düzenli en uzun bölüm kullanılıyor; periyot güvenilir değilse g üstü çizili gösterilip "güvenmeyin" deniyor (K-008, Bölüm 5.4) |
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

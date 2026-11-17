# Telefon Laboratuvarı — Proje Rehberi

## Proje özeti

**Telefon Laboratuvarı**, telefonun sensörleriyle (ivmeölçer/jiroskop, mikrofon, kamera)
lise fizik deneylerini **gerçek ölçümle** yaptıran, tarayıcıda çalışan bir web uygulamasıdır (PWA).

- Gençbizz Tech yarışması için 4 kişilik lise takımı tarafından geliştiriliyor; kodu 1 kişi yazıyor.
- iPhone (Safari) ve Android (Chrome) üzerinde çalışmalı.
- İnternet olmadan da kullanılabilmeli (ilk açılıştan sonra çevrimdışı).
- **Ölçüm verisi cihazdan çıkmaz.** Sunucuya veri gönderilmez, analiz servisi, reklam ya da dış kütüphane çağrısı yapılmaz.
- Uygulama sonuç vermekle kalmaz; **ölçüm hatasını ve belirsizliği hesaplar ve öğrenciye açıklar.**

### İlk üç deney
1. **Sarkaç** — periyot ölçümü ve yerçekimi ivmesi (g) hesabı
2. **Ses frekansı** — mikrofonla frekans ölçümü
3. **Serbest düşme veya eğik düzlem** — (hangisi olacağı henüz kararlaştırılmadı, bkz. `docs/KARAR_GUNLUGU.md`)

## Çalışma kuralları

1. **Açıklamalar Türkçe.** Kod yorumları, commit mesajları, belgeler ve kullanıcıya gösterilen metinler Türkçe yazılır.
   Dosya ve değişken adları Türkçe karakter içermez (ör. `sarkac.js`, `periyotBul`), böylece her sistemde sorunsuz çalışır.
2. **Küçük adımlarla ilerle.** Her adım tek bir şeyi yapar ve sonunda telefonda denenebilir bir hâl alır.
   Büyük bir değişiklik gerekiyorsa önce parçalara böl ve planı göster.
3. **Kodu jüriye anlatabileceğimiz gibi yaz.** Takım kodu anlayıp jüriye açıklayacak:
   - Kısa, tek işi olan fonksiyonlar; anlamlı isimler.
   - Her fizik formülünün yanında yorum: hangi formül, birimler, nereden geldiği.
   - "Akıllıca" ama okunması zor kısaltmalardan kaçın.
4. **Her önemli değişiklikten sonra `docs/` klasörünü güncelle:**
   - `KARAR_GUNLUGU.md` — neyi neden seçtik (alternatiflerle birlikte)
   - `TEKNIK_OZET.md` — uygulama nasıl çalışıyor, formüller, dosyaların görevi
   - `TEST_SONUCLARI.md` — hangi cihazda, hangi koşulda, ne ölçtük, beklenen değer neydi
   - `JURI_SORULARI.md` — jürinin sorabileceği sorular ve hazır cevaplarımız
5. **Gerekmedikçe ağır framework kullanma.** Düz HTML + CSS + JavaScript (ES modülleri), derleme adımı yok,
   `npm install` gerektiren bağımlılık yok. Bir kütüphane gerçekten gerekirse önce karar günlüğüne gerekçesiyle yazılır
   ve dosyası projenin içine kopyalanır (çevrimdışı çalışma ve gizlilik için CDN kullanılmaz).
6. **Hesaplama ile ekranı ayır.** Fizik/istatistik hesapları DOM'a dokunmayan saf fonksiyonlardır (`js/analiz/`),
   böylece bilinen sahte verilerle test edilebilir.
7. **Ölçüm dürüstlüğü.** Sonuçlar her zaman belirsizlikle birlikte gösterilir (ör. `g = 9,78 ± 0,12 m/s²`).
   Veri kötüyse (çok az salınım, düzensiz örnekleme) uygulama bunu açıkça söyler, sonucu güzel göstermeye çalışmaz.
8. **Sürüm etiketi.** Telefona gidecek her değişiklikte şu üç yer **aynı yeni değerle** güncellenir
   (ör. `2026-11-18.7`): `js/surum.js` → `KOD_SURUMU`, `sw.js` → `SURUM`, ve her sayfanın altındaki
   `<p id="surum">` metni. Ekran görüntüsünden hangi kodun çalıştığı buradan anlaşılır; `sw.js` değişince de
   telefon internetsiz kopyayı yeniler.
9. **Yeni dosya = sw.js listesi.** Uygulamaya yeni bir sayfa, JS, CSS ya da resim dosyası eklenince `sw.js`
   içindeki `DOSYALAR` listesine de eklenir; yoksa o dosya internetsiz açılmaz. Listedeki bir dosya silinirse
   listeden de çıkarılır (listede olmayan dosya, servis çalışanının kurulumunu tamamen bozar).

## Teknik notlar (önemli kısıtlar)

- Sensör API'leri ve Service Worker yalnızca **güvenli bağlamda** (HTTPS veya `localhost`) çalışır.
  Telefonda denemek için uygulama HTTPS üzerinden açılmalı.
- iPhone'da hareket sensörü için `DeviceMotionEvent.requestPermission()` **bir buton tıklamasıyla** çağrılmalı.
- Mikrofon ve kamera için `getUserMedia` izni gerekir; izin reddedilirse anlaşılır bir mesaj gösterilir.
- Sensör örnekleme hızı cihaza göre değişir (genelde 50–100 Hz); hesaplarda sabit hız varsayılmaz, her örneğin zaman damgası kullanılır.

## Klasör yapısı

Ayrıntılı açıklama `docs/TEKNIK_OZET.md` içindedir.

```
index.html                    ana menü
sarkac.html, sensor-testi.html  sayfalar (her deney bir sayfa)
manifest.webmanifest, sw.js   uygulama (PWA) tanımı ve internetsiz çalışma
ikonlar/                      uygulama simgeleri (araclar/ikon_uret.py üretir)
araclar/                      geliştirme yardımcıları (uygulamanın parçası değil)
css/                          stiller
js/sensor/                    sensörlerden veri alma
js/analiz/                    saf hesap fonksiyonları (test edilebilir)
js/arayuz/                    grafik ve ekran yardımcıları
js/sayfalar/                  her sayfanın mantığı
testler/                      tarayıcıda açılan test sayfası
docs/                         proje belgeleri
```

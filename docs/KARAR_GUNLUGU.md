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
- **Durum:** Kabul edildi (Adım 4'te uygulandı). **Eksen seçimi kısmı K-009 ile değişti.**
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

## K-009: Ekseni "en büyük" değil "en düzenli" salınıma göre seçmek; iki salınım uyarısı
- **Tarih:** 2026-11-18
- **Durum:** Kabul edildi (K-006'nın eksen seçimi kısmının yerini alır)
- **Karar:** Periyot her dönme ekseni için ayrı ayrı bulunur. Tek tek periyotları birbirine en yakın olan
  (yayılımı en küçük) ve en az 5 düzenli salınımı olan eksen seçilir. Başka bir eksen de düzenli ama %10'dan fazla
  farklı periyotla salınıyorsa "telefon iki ayrı yönde salınıyor" uyarısı verilir ve sonuç güvenilir sayılmaz.
  Her eksenin periyodu ekranda tablo olarak gösterilir.
- **Neden:** Dördüncü gerçek kayıtta (TEST_SONUCLARI 5.5) V askıdaki telefon iki yönde, iki farklı periyotla salındı:
  düzgün bir 1,25–1,28 s'lik salınım (beklenen sarkaç periyodu) ve daha büyük ama gürültülü ≈1,55 s'lik bir salınım.
  "En büyük standart sapma" kuralı büyük ama yanlış olanı seçti.
- **Neden "kabul edilen g'ye en yakın periyodu veren ekseni seç" değil?** Bu, sonucu bildiğimiz değere doğru itmek olur;
  deney g'yi ölçmez, bildiğimizi geri yazar. Eksen seçimi yalnızca sinyalin kendisine (düzenliliğine) bakar.
- **Değerlendirilen alternatifler:** Kullanıcıya ekseni seçtirmek; üç eksenin bileşik yönünü bulmak (temel bileşen analizi)
  — iki farklı periyotlu salınımı ayıramaz.
- **Sonuçları / bedeli:** İki yönde salınım olduğunda sonuç "güvenilmez" işaretlenir; kullanıcı sarkacı tek yönde itip
  kaydı tekrarlamalı. Bu bilinçli bir seçim: belirsiz durumda sonuç uydurmuyoruz.

## K-010: İnternetsiz çalışma için "önce ağ, olmazsa önbellek" stratejisi
- **Tarih:** 2026-11-18
- **Durum:** Kabul edildi
- **Karar:** Servis çalışanı (`sw.js`) her dosyayı önce sunucudan taze almaya çalışır (en fazla 4 s bekler);
  alamazsa telefona kaydedilmiş kopyayı verir. İlk açılışta bütün uygulama dosyaları kaydedilir.
- **Neden:**
  - Geliştirme sırasında telefonun eski dosyaları göstermesi bizi defalarca yanılttı (TEST_SONUCLARI 5.5).
    "Önce ağ" ile internet varken her zaman en yeni kod çalışır.
  - Okulda / laboratuvarda internet yoksa uygulama yine de açılır (projenin temel hedefi).
  - Açıklaması kolay: "İnternet varsa yenisini al, yoksa sakladığını kullan."
- **Değerlendirilen alternatifler:**
  - "Önce önbellek": daha hızlı açılır, ama yeni sürüm ancak bir sonraki açılışta görünür; geliştirme aşamasında
    hangi kodun çalıştığı karışır.
  - Hazır bir kütüphane (Workbox): güçlü ama dış kütüphane ve derleme gerektirir (K-001'e aykırı).
- **Sonuçları / bedeli:** Zayıf internette sayfa en fazla 4 saniye bekleyip kayıtlı kopyayla açılır.
  Yeni dosya eklenince `DOSYALAR` listesine eklemek unutulmamalı (CLAUDE.md kural 9).

## K-011: Kapsam fizikten fen bilimlerine genişliyor (fizik, kimya, biyoloji)
- **Tarih:** 2026-11-19
- **Durum:** Kabul edildi
- **Karar:** Uygulama yalnızca fizik değil; kimya ve biyoloji deneylerini de kapsayacak. Deneyler MEB öğretim
  programlarının kazanımlarıyla eşleştirilecek. Yeni deneylere başlamadan önce her fikrin **çalışabilirliği**
  gerçek telefonlarda ölçülecek.
- **Neden:**
  - Telefonun kamerası, mikrofonu ve hareket sensörleri yalnızca fizik için değil, kimyada renk/bulanıklık ölçümü,
    biyolojide nabız, tepki süresi, solunum gibi ölçümler için de kullanılabilir.
  - Birden çok fen dersinde kullanılabilen bir araç, okullar için daha değerli ve yarışmada daha güçlü.
  - Ortak altyapı (sensör okuma, belirsizlik hesabı, grafik, internetsiz çalışma) bütün deneylerde yeniden kullanılır.
- **Değerlendirilen alternatifler:** Yalnızca fizikte kalıp daha çok fizik deneyi eklemek (daha dar ama daha kolay).
- **Sonuçları / bedeli:**
  - Bazı fikirler tarayıcı kısıtları yüzünden yapılamayabilir (ör. iPhone'da web'den kamera flaşı, ışık ve sıcaklık
    sensörüne erişilemiyor). Bu yüzden önce çalışabilirlik.
  - Kimya deneylerinde güvenlik önemli: yalnızca evde/okulda güvenle kullanılabilen malzemeler önerilecek.
  - Ana menü derslere göre gruplandı; henüz yapılmayan deneyler "Fikir" rozetiyle gösteriliyor.

## K-012: İkinci fizik deneyi serbest düşme; süre, ivme büyüklüğünün g/2 eşiğinden bulunur
- **Tarih:** 2026-11-19
- **Durum:** Kabul edildi
- **Karar:** İkinci fizik deneyi **serbest düşme** (FİZ.11.1.1–11.1.2). Telefon 40–80 cm yükseklikten yastığa
  bırakılır. Düşme süresi t, yer çekimi dahil ivmenin **büyüklüğünden** (|a| = √(ax² + ay² + az²)) bulunur:
  |a|'nın g/2 ≈ 4,9 m/s² eşiğinin altında kaldığı süre. g = 2h / t². Bir kayıtta birkaç düşüş yapılır ve
  düşme sürelerinin ortalaması kullanılır.
- **Neden:**
  - Serbest düşen telefonda ivmeölçer ≈ 0 gösterir; durgunken ≈ 9,8. Fark çok büyük olduğundan düşüş kolayca ve
    güvenle bulunur. Telefonun hangi yönde durduğu önemli değildir (büyüklük kullanılıyor).
  - Eşik neden g/2? Elin açılması birkaç on milisaniye sürer. Tutan kuvvet düzgünce azalıyorsa, telefonun hareketi
    tam bu geçişin ortasında bırakılmış bir cisimle aynıdır; geçişin ortası da ivmenin yarıya indiği andır.
    Yastığa değme için de aynı düşünce geçerlidir.
  - Eşiğin geçildiği an iki ölçüm arasında doğrusal ara değerle bulunur (ölçüm aralığından daha hassas).
  - Belirsizlik dürüstçe tahmin edilir: her uçta gerçek geçiş iki ölçüm arasının herhangi bir yerinde olabilir
    (uç belirsizliği = aralığın yarısı ≈ 8,3 ms; tek düşüşte Δt ≈ 12 ms). Birkaç düşüşün ortalamasında hem bu
    "çözünürlük" belirsizliği (Δt/√n) hem dağılımdan gelen belirsizlik (s/√n) hesaplanır, **büyük olan** kullanılır.
  - Müfredat "verileri toplayarak kaydeder, veri setleri oluşturur" diyor; düşüşlerin tablosu buna uyar.
- **Değerlendirilen alternatifler:**
  - Eğik düzlem: telefonun kaymasında sürtünme ve dönme sonucu bozar; müfredatla eşleşmesi daha dolaylı.
  - Düşüşü düşük bir eşikle (ör. |a| < 2 m/s²) bulmak: elin açıldığı süreyi keser, t'yi kısa ölçer (g büyük çıkar).
    2 m/s² yalnızca "bu gerçekten serbest düşme mi?" kontrolü olarak kullanılıyor.
  - Tek düşüş: hızlı ama 50 cm'de Δg/g ≈ %8; birkaç düşüşün ortalaması belirsizliği √n kadar küçültür.
- **Sonuçları / bedeli:**
  - Kısa düşüşte (50 cm ≈ 0,32 s) belirsizliğin çoğu süreden gelir (2Δt/t). Uygulama bunu öğrenciye açıklar;
    0,2 s'den kısa düşüşlerde ayrıca uyarır.
  - Yastık telefonu yavaşça durdurduğu için değme anı biraz geç bulunabilir → g biraz küçük çıkabilir (sistematik hata;
    sonuç açıklamasında yazıyor).
  - Telefon düşerken dönerse sensör merkezcil ivme hisseder ve |a| 0'a inmeyebilir; talimatta "düz bırakın" deniyor.
  - Güvenlik: yalnızca yastık/yatak üstüne, en çok 1 m yükseklikten.

## Açık kararlar (henüz verilmedi)
- ~~Üçüncü deney: serbest düşme mi, eğik düzlem mi?~~ → K-012 ile kapandı: **serbest düşme** (FİZ.11.1.1–11.1.2).
- ~~Sarkaç: Telefon burulduğunda bileşik yön (temel bileşen analizi) kullanılmalı mı?~~ → K-009 ile kapandı:
  iki farklı periyotlu salınımı bileşik yön ayıramaz; bunun yerine en düzenli eksen seçiliyor ve iki salınım uyarısı var.

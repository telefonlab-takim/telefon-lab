# Jüri Soruları

Jürinin sorabileceği sorular ve hazırladığımız cevaplar. Her takım üyesi bu cevapları
kendi cümleleriyle anlatabilmeli.

---

## 1. Proje ve amaç
### Bu proje hangi sorunu çözüyor?
_(Cevap yazılacak)_

### Müfredatla nasıl ilişkili?
Deneyleri MEB Türkiye Yüzyılı Maarif Modeli programlarındaki öğrenme çıktılarıyla eşleştirdik; kodları MEB'in
resmî program sayfalarından aldık. Örneğin sarkaç deneyi **FİZ.10.4.1** (10. sınıf, Dalgalar) ile eşleşiyor;
programın kendisi bu kazanım için basit sarkaç ve periyot etkinliği öneriyor. Uygulamada her deney kartında ve
deney sayfasında ilgili kazanım kodu yazıyor. Ayrıntı: docs/MUFREDAT_ARASTIRMASI.md.

### Neden sadece fizik değil?
Telefonun kamerası, mikrofonu ve hareket sensörleri kimya ve biyolojide de ölçüm yapabiliyor: örneğin kamera ile
bir göstergenin rengi (pH) ya da parmaktaki kan akışından nabız. Bütün deneyler aynı altyapıyı (sensör okuma,
belirsizlik hesabı, grafik, internetsiz çalışma) kullanıyor. Her yeni deneyden önce telefonla gerçekten yapılıp
yapılamadığını ölçüyoruz; deneyleri MEB öğretim programlarındaki kazanımlarla eşleştiriyoruz (K-011).
_(Çalışabilirlik sonuçları ve müfredat eşleştirmesi eklenecek.)_

### Hedef kullanıcı kim?
_(Cevap yazılacak)_

### Benzer uygulamalardan (ör. hazır sensör uygulamaları) farkınız ne?
_(Cevap yazılacak — ipucu: belirsizlik hesabı ve açıklaması, kurulum gerektirmemesi, Türkçe ve müfredata uygun deneyler)_

## 2. Fizik ve ölçüm
### Telefonun sensörüne neden güvenelim? Ne kadar doğru?
_(Cevap yazılacak — TEST_SONUCLARI.md'deki gerçek verilere dayanmalı)_

### Telefon saniyede kaç ölçüm alıyor? Ölçümler düzenli mi geliyor?
iPhone 14'te saniyede yaklaşık 60 ölçüm geliyor. Ölçümler her zaman eşit aralıkla gelmiyor; bu yüzden
her kayıttan sonra uygulama bir "örnekleme raporu" gösteriyor: normal aralık (ortanca), uzun boşluklar
ve nerede oldukları. Boşluk varsa kullanıcı uyarılıyor. _(Android sonuçları eklenecek.)_

### Neden ortalama yerine ortanca kullandınız?
_(Cevap yazılacak — ipucu: tek bir 1 saniyelik boşluk ortalamayı çok değiştirir, ortancayı değiştirmez.
`testler/index.html` içinde bunu gösteren bir test var.)_

### Periyodu nasıl buluyorsunuz?
Telefonun jiroskobu sarkacın dönme hızını ölçüyor; bu sinyal sarkaçla aynı periyotla salınıyor. Uygulama, sinyalin
aşağıdan yukarı sıfırı geçtiği anları buluyor (her periyotta bir tane). Bu anları sıra numarasına karşı grafiğe
koyunca bir doğru çıkıyor; doğrunun eğimi periyot. Ayrıntı: KARAR_GUNLUGU K-007.

### Telefonu nasıl asarsanız asın çalışıyor mu?
Evet. Uygulama her dönme ekseninde periyodu ayrı ayrı buluyor ve **en düzenli** salınan ekseni kullanıyor; hepsini
ekranda tablo olarak gösteriyor. İlk sürümde "en büyük salınan" ekseni seçiyorduk; bir denemede telefon iki yönde
farklı periyotlarla sallandı ve büyük ama yanlış olan seçildi. Şimdi böyle bir durumda uygulama "iki yönde salınım var,
tek yönde itin" diye uyarıyor (K-006 → K-009).

### Neden "g'yi 9,8'e en yakın veren ekseni seç" demediniz?
Çünkü o zaman deney g'yi ölçmez, bildiğimiz değeri geri yazardı. Eksen seçimi yalnızca sinyalin ne kadar düzenli
olduğuna bakıyor; g'nin kabul edilen değeri hiçbir seçimde kullanılmıyor, yalnızca en sonda karşılaştırma için.
Aynı nedenle sarkaç boyunu (L) da uygulamaya bakmadan cetvelle ölçüyoruz.

### Küçük açı yaklaşımını nasıl kontrol ediyorsunuz?
Dönme hızının tepe değerinden bırakma açısını tahmin ediyoruz: θ₀ = ω_max·T/(2π). 10°'yi geçerse uygulama uyarıyor ve
g'nin yaklaşık ne kadar hatalı çıkacağını söylüyor (θ₀²/8). İlk gerçek denememizde açı ≈ 23° çıktı → g'de ≈ %2 hata.

### Belirsizliği nasıl hesaplıyorsunuz?
İki ölçümümüz var: sarkaç boyu L (cetvelle, ΔL'yi kullanıcı girer) ve periyot T (telefon, ΔT doğru uydurmadan gelir).
g = 4π²L/T² olduğundan hata yayılımı kuralıyla Δg/g = √((ΔL/L)² + (2ΔT/T)²). T formülde karesiyle geçtiği için
onun payı 2 ile çarpılır. Uygulama ayrıca belirsizliğin yüzde kaçının L'den, yüzde kaçının T'den geldiğini gösteriyor.

### Uygulamanız hiç yanlış sonuç verdi mi?
Evet. Üçüncü gerçek denememizde ekranda "g = 9,9 ± 1,2, kabul edilen değerle uyumlu" yazdı ama grafiğe bakınca
periyodun yanlış hesaplandığını gördük: telefon bırakıldıktan sonra ilk saniyelerde hızlı titreşmiş, bu da sahte
"sıfır geçişleri" üretmişti. Yanlış periyot ile yanlış ölçülmüş ip boyu birbirini tesadüfen götürmüştü.
Düzelttik: sinyali yumuşatıyoruz, düzensiz bölümleri atıyoruz ve periyot şüpheliyse g sonucunun üstünü çizip
"güvenmeyin" diyoruz. Ayrıntı: TEST_SONUCLARI 5.4, KARAR_GUNLUGU K-008.

### Sonuç 9,8 çıkmayınca ne yaptınız?
Bir denemede ölçtüğümüz ip boyuyla (40,5 cm) g = 6,6 çıktı. Önce L'yi 61 cm yapınca 9,9 çıktığını gördük, ama bunun
yanlış olduğunu fark ettik: L'yi sonuca bakarak değiştirmek, deneyi bilinen cevabı geri yazmaya çevirir. Doğru yol,
ölçtüğümüz değeri koruyup farkın **nedenini** aramaktı. Periyodun ≈ 60 cm'lik bir sarkaca uyduğunu gördük ve ipin
masaya bağlanma biçiminin iki ayrı dönme noktası oluşturduğunu düşündük; düzeneği buna göre değiştirdik.
Sonra asıl nedeni bulduk: ilk düzeneğimizde telefonu **şarj kablosunun ucuna takıp kabloyu elimizle tutuyorduk.**
Dönme noktası (el) sabit değildi, kablo sert ve ağırdı, telefon da şarj girişi etrafında ayrıca sallanıyordu.
Uygulama periyodu düzenli ölçtü ama "sistematik hata olabilir" dedi — sorun yazılımda değil düzenekteydi.
_(Düzgün düzenekle alınan sonuç eklenecek.)_

### Sonuç kabul edilen değerden farklı çıkarsa ne oluyor?
Uygulama farkı belirsizliğe bölüyor. Fark belirsizliğin 2 katından küçükse sonuç "uyumlu" sayılıyor. Büyükse bunun rastgele
hatayla açıklanamayacağını, sistematik bir hata olabileceğini söylüyor ve olası nedenleri sıralıyor (L yanlış ölçülmüş,
açı büyük, telefon dönmüş). Sonucu güzel göstermeye çalışmıyoruz.

### Neden "9,81 ± 0,10" yazıyorsunuz da "9,80932 ± 0,10174" yazmıyorsunuz?
Belirsizliğin ötesindeki basamaklar anlamsız; yazmak olduğundan hassas ölçmüşüz gibi gösterir. Belirsizliği 1 anlamlı
basamağa (ilk rakamı 1 ise 2'ye) yuvarlıyoruz, sonucu da o basamağa kadar yazıyoruz.

### Sarkaçta küçük açı yaklaşımı ne demek, ihlal edilirse ne olur?
_(Cevap yazılacak)_

### Sarkacın boyunu (L) nereden nereye ölçüyorsunuz? Telefonun kendi boyu sorun olmuyor mu?
_(Cevap yazılacak)_

### Serbest düşmede düşme süresini nasıl ölçüyorsunuz?
İvmeölçer yer çekimi dahil ivmeyi ölçer: telefon elde dururken büyüklüğü ≈ 9,8 m/s², serbest düşerken ≈ 0 olur
(telefon ve sensör birlikte düştüğü için sensör hiçbir kuvvet hissetmez, "ağırlıksızlık"). İvmenin büyüklüğünün
4,9 m/s²'nin (g'nin yarısının) altına indiği an bırakma, yeniden üstüne çıktığı an yastığa değme anıdır. Büyüklük
kullandığımız için telefonun hangi yönde tutulduğu önemli değil. Ayrıntı: KARAR_GUNLUGU K-012.

### Neden eşik g'nin yarısı? 1 m/s² gibi daha düşük bir eşik daha doğru olmaz mı?
El açılırken telefonu tutan kuvvet bir anda değil, birkaç on milisaniyede sıfıra iner. Kuvvet düzgünce azalıyorsa
telefonun hareketi, bu geçişin tam ortasında bırakılmış bir cisimle aynıdır; geçişin ortası da ivmenin yarıya indiği
andır. Düşük bir eşik bu geçişi kesip süreyi kısa ölçerdi; g olduğundan büyük çıkardı.

### Telefon saniyede 60 ölçüm yapıyorsa 0,3 saniyelik düşüşü nasıl hassas ölçüyorsunuz?
İki ölçüm arası ≈ 17 ms. Eşiğin geçildiği anı iki ölçüm arasına doğru çizerek (ara değer bularak) hesaplıyoruz.
Yine de dürüst olmak için, gerçek geçişin o aralığın herhangi bir yerinde olabileceğini kabul edip her uca yarım aralık
(≈ 8 ms) belirsizlik veriyoruz; tek düşüşte Δt ≈ 12 ms. 50 cm'de t ≈ 0,32 s olduğundan bu, g'de ≈ %7'lik belirsizlik
demek: **belirsizliğin çoğu süreden gelir**, uygulama bunu öğrenciye söyler. Çözüm: birkaç düşüşün ortalaması
(belirsizlik √n kadar küçülür) ya da biraz daha yüksekten bırakmak.

### Birkaç düşüşün belirsizliğini nasıl birleştiriyorsunuz?
İki tahmin hesaplıyoruz: düşme sürelerinin dağılımından (s/√n) ve ölçüm aralığından (tek düşüşün Δt'si/√n).
**Büyük olanı** kullanıyoruz; küçüğünü seçmek sonucu olduğundan iyi gösterirdi. Sonra Δg/g = √((Δh/h)² + (2Δt/t)²).

### Serbest düşmede ilk gerçek sonucunuz neden 9,8 değil 11,9 çıktı?
_(Çalışma sürüyor; cevap gerçek ölçümle güncellenecek.)_ Düşme süreleri birbirine çok yakın (%3) ama hepsi beklenenden
≈ 29 ms kısaydı; yani rastgele değil, sistematik bir hata. h'yi sonuca göre değiştirmek yerine nedenini aradık: yükseklik
ölçümünü, bırakma biçimini, hava direncini ve telefonun dönmesini eledik. En güçlü adayımız telefonun ivme verisini
yumuşatarak vermesi; bu, bırakma anını geç gösterir. Bu varsayımı önce sahte veriyle sınadık (40 ms'lik filtre ölçümümüzü
neredeyse birebir tekrarladı), sonra gerçek kayıtta bırakma ve değme anlarını yakından gösteren bir grafik ekledik.
(TEST_SONUCLARI 5.10–5.11)

### Hava direnci ve yastık sonucu etkilemiyor mu?
Kaba bir hesap: 50 cm'de telefonun en büyük hızı ≈ 3 m/s. Yatay düşen telefonun yüzeyi ≈ 7 × 15 cm; hava direnci
F ≈ ½·ρ·C·A·v² ≈ ½ × 1,2 × 1 × 0,0105 × 9 ≈ 0,06 N, telefonun ağırlığı ise ≈ 1,7 N (≈ 170 g). Yani düşüşün sonunda
bile direnç ağırlığın ≈ %3'ü kadar; düşüş boyunca ortalama etkisi g'yi ≈ %1 küçük gösterir. Bu, bizim ≈ %4'lük
belirsizliğimizden küçük ama sıfır değil; sistematik bir hata olarak açıklıyoruz. Yastık ise telefonu yavaşça durdurduğundan değme anı biraz geç bulunabilir ve g biraz
küçük çıkabilir; bu sistematik bir hatadır ve sonuç açıklamasında yazıyor. Gerçek ölçümlerde farklı yüzeyleri
karşılaştıracağız (TEST_SONUCLARI bölüm 5).

### Telefonu düşürmek güvenli mi?
Uygulama en üstte uyarıyor: yalnızca yastık ya da yatak üstüne, en çok 1 m'den. Önerdiğimiz 40–80 cm, telefonun
cebinden düşmesinden çok daha yumuşak bir düşüş.

## 3. Teknik
### Neden uygulama mağazası yerine web uygulaması (PWA)?
- Tek bir kodla hem iPhone hem Android'de çalışıyor; iki ayrı uygulama yazmadık.
- Mağaza onayı, geliştirici hesabı ücreti yok; öğretmen bir bağlantı paylaşınca bütün sınıf kullanabiliyor.
- Yine de "Ana Ekrana Ekle" ile telefonda uygulama gibi (simgesiyle, tarayıcı çubuğu olmadan) açılıyor ve
  internetsiz çalışıyor.
- Kodu jüri dahil herkes açıp okuyabiliyor.

### Neden framework kullanmadınız?
_(Cevap yazılacak — bkz. KARAR_GUNLUGU.md K-001)_

### İnternet olmadan nasıl çalışıyor?
Uygulama ilk açıldığında "servis çalışanı" adlı küçük bir kod bütün uygulama dosyalarını telefona kaydediyor.
Sonraki açılışlarda internet varsa dosyaların en yenisini alıyor, yoksa kayıtlı kopyayı kullanıyor (KARAR_GUNLUGU K-010).
Bunu bilgisayarda sunucuyu kapatarak denedik: bütün sayfalar açıldı ve testler geçti. Ölçüm ve hesapların hepsi
telefonun içinde yapıldığı için internete hiç ihtiyaç yok.

### iPhone ve Android arasında fark var mı?
_(Cevap yazılacak)_

## 4. Gizlilik ve güvenlik
### Veriler nereye gidiyor?
_(Cevap yazılacak — bkz. KARAR_GUNLUGU.md K-002)_

### Mikrofon ve kamera izinleri neden gerekli?
_(Cevap yazılacak)_

## 5. Takım ve süreç
### Görev dağılımınız nasıldı?
_(Cevap yazılacak)_

### Yapay zekâ kullandınız mı? Kodu siz mi anlıyorsunuz?
_(Cevap yazılacak — dürüst olun: hangi aşamada nasıl kullandığınızı ve kodu nasıl incelediğinizi anlatın)_

### En çok zorlandığınız şey neydi?
_(Cevap yazılacak)_

## 6. Gelecek
### Projeyi nasıl geliştirirsiniz?
_(Cevap yazılacak)_

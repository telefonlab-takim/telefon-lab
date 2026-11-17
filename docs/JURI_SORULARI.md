# Jüri Soruları

Jürinin sorabileceği sorular ve hazırladığımız cevaplar. Her takım üyesi bu cevapları
kendi cümleleriyle anlatabilmeli.

---

## 1. Proje ve amaç
### Bu proje hangi sorunu çözüyor?
_(Cevap yazılacak)_

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

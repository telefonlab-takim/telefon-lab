// js/sensor/kayit.js
// Hareket sensöründen belirli bir süre boyunca ölçüm kaydeder.
// Kayıt bitince bütün örnekler tek bir dizi olarak geri verilir; analiz bu dizi üzerinde yapılır.

import { dinlemeyiBaslat, dinlemeyiDurdur } from './hareket.js';

// sureSn saniye boyunca kayıt yapar.
// Kayıt sırasında kalan saniye değiştikçe ilerleme(kalanSn) çağrılır (geri sayımı ekrana yazmak için).
// Sonuç (Promise ile): { ornekler, kesildiMi }
//   kesildiMi: Kayıt sırasında sayfa arka plana geçtiyse (ekran kilitlendi, başka uygulamaya geçildi) true.
//              Bu durumda tarayıcı sensör göndermeyi durdurur, kayıtta boşluk oluşur.
export function kayitYap(sureSn, ilerleme) {
  return new Promise((sonucuVer) => {
    const ornekler = [];
    let kesildiMi = false;
    let sonKalan = null;

    function gorunurlukDegisti() {
      if (document.hidden) kesildiMi = true;
    }

    function bitir() {
      clearInterval(zamanlayici);
      dinlemeyiDurdur();
      document.removeEventListener('visibilitychange', gorunurlukDegisti);
      sonucuVer({ ornekler, kesildiMi });
    }

    document.addEventListener('visibilitychange', gorunurlukDegisti);
    dinlemeyiBaslat((ornek) => ornekler.push(ornek));
    const baslangic = performance.now();

    // Saniyede 5 kez süreyi kontrol et. (Sensör olaylarından bağımsız; sensör hiç veri
    // göndermese bile kayıt zamanında biter.)
    const zamanlayici = setInterval(() => {
      const gecenSn = (performance.now() - baslangic) / 1000;
      const kalanSn = Math.max(0, Math.ceil(sureSn - gecenSn));
      if (kalanSn !== sonKalan) {
        sonKalan = kalanSn;
        ilerleme(kalanSn);
      }
      if (gecenSn >= sureSn) bitir();
    }, 200);
  });
}

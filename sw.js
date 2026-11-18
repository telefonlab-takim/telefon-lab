// sw.js — Servis çalışanı (Service Worker)
//
// Ne işe yarar? Tarayıcı ile internet arasında duran küçük bir aracıdır. Sayfa bir dosya istediğinde
// önce buradaki 'fetch' olayı çalışır ve dosyanın nereden geleceğine bu kod karar verir.
//
// Stratejimiz: "önce ağ, olmazsa önbellek" (bkz. KARAR_GUNLUGU K-010)
//   - İnternet varsa dosya her zaman sunucudan TAZE alınır ve bir kopyası telefona kaydedilir.
//     Böylece telefon eski dosyaları gösterme sorunu (TEST_SONUCLARI 5.5) yaşanmaz.
//   - İnternet yoksa (ya da birkaç saniyede cevap gelmezse) telefona kaydedilmiş kopya kullanılır.
//
// Gizlilik: Bu dosya yalnızca uygulamanın KENDİ dosyalarını (HTML, CSS, JS, simgeler) saklar.
// Ölçüm verisi hiçbir yere gönderilmez ve burada saklanmaz.
//
// ÖNEMLİ: Yeni bir dosya eklendiğinde DOSYALAR listesine de eklenmeli; sürüm her yayında değiştirilmeli
// (CLAUDE.md kural 8). Sürüm değişince tarayıcı bu dosyanın değiştiğini anlar ve listeyi yeniden indirir.

const SURUM = '2026-11-19.1';
const ONBELLEK_ADI = 'telefon-lab-' + SURUM;

// İlk açılışta hepsi indirilip saklanır; böylece hiç açılmamış bir sayfa da internetsiz çalışır.
const DOSYALAR = [
  './',
  'index.html',
  'sarkac.html',
  'sensor-testi.html',
  'manifest.webmanifest',
  'css/stil.css',
  'ikonlar/ikon-180.png',
  'ikonlar/ikon-192.png',
  'ikonlar/ikon-512.png',
  'js/surum.js',
  'js/pwa.js',
  'js/sensor/hareket.js',
  'js/sensor/kayit.js',
  'js/analiz/istatistik.js',
  'js/analiz/ornekleme.js',
  'js/analiz/periyot.js',
  'js/analiz/sarkac-hesap.js',
  'js/arayuz/bicim.js',
  'js/arayuz/grafik.js',
  'js/arayuz/olcek.js',
  'js/sayfalar/ana-sayfa.js',
  'js/sayfalar/sarkac-sayfa.js',
  'js/sayfalar/sensor-testi-sayfa.js',
  'testler/index.html',
  'testler/testler.js',
];

// İnternet bu kadar sürede cevap vermezse kayıtlı kopya kullanılır (zayıf okul ağı için).
const AG_ZAMAN_ASIMI_MS = 4000;

// 1) Kurulum: dosyaları indir ve sakla. cache: 'reload' → tarayıcının kendi (eski olabilecek) önbelleğini atla.
self.addEventListener('install', (olay) => {
  olay.waitUntil(
    caches
      .open(ONBELLEK_ADI)
      .then((onbellek) => onbellek.addAll(DOSYALAR.map((yol) => new Request(yol, { cache: 'reload' }))))
      .then(() => self.skipWaiting()) // yeni sürüm beklemeden devreye girsin
  );
});

// 2) Etkinleşme: eski sürümlerin sakladığı kopyaları sil.
self.addEventListener('activate', (olay) => {
  olay.waitUntil(
    caches
      .keys()
      .then((adlar) =>
        Promise.all(
          adlar
            .filter((ad) => ad.startsWith('telefon-lab-') && ad !== ONBELLEK_ADI)
            .map((ad) => caches.delete(ad))
        )
      )
      .then(() => self.clients.claim()) // açık sayfaları hemen bu sürüm yönetsin
  );
});

// 3) Her dosya isteği: önce ağ, olmazsa önbellek.
self.addEventListener('fetch', (olay) => {
  const istek = olay.request;
  // Yalnızca kendi sitemizden yapılan okuma (GET) isteklerine karışıyoruz.
  if (istek.method !== 'GET' || new URL(istek.url).origin !== self.location.origin) return;
  olay.respondWith(onceAgSonraOnbellek(istek));
});

async function onceAgSonraOnbellek(istek) {
  const onbellek = await caches.open(ONBELLEK_ADI);
  try {
    // cache: 'no-cache' → sunucuya "bu dosya değişti mi?" diye mutlaka sor (değişmediyse sunucu kısa bir cevap döner).
    const cevap = await zamanAsimiyla(fetch(istek.url, { cache: 'no-cache' }), AG_ZAMAN_ASIMI_MS);
    if (cevap.ok) onbellek.put(istek.url, cevap.clone()); // internetsiz kullanım için en yeni kopyayı sakla
    return cevap;
  } catch (hata) {
    // İnternet yok ya da çok yavaş: kayıtlı kopyayı ver
    const kayitli = await onbellek.match(istek.url, { ignoreSearch: true });
    if (kayitli) return kayitli;
    // Bir SAYFA isteniyor ama kayıtlı kopyası yoksa (ör. adres farklı yazıldı): tarayıcının hata sayfası yerine
    // ana menüyü göster; kullanıcı oradan istediği deneye geçebilir.
    if (istek.mode === 'navigate') {
      const anaMenu = await onbellek.match('index.html');
      if (anaMenu) return anaMenu;
    }
    throw hata; // kayıtlı kopya da yoksa yapacak bir şey yok
  }
}

// Bir isteği en fazla sureMs kadar bekler; süre dolarsa hata verir.
function zamanAsimiyla(soz, sureMs) {
  return new Promise((coz, reddet) => {
    const zamanlayici = setTimeout(() => reddet(new Error('Ağ zaman aşımı')), sureMs);
    soz.then(
      (deger) => { clearTimeout(zamanlayici); coz(deger); },
      (hata) => { clearTimeout(zamanlayici); reddet(hata); }
    );
  });
}

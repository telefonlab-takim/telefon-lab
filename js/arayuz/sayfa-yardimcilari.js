// js/arayuz/sayfa-yardimcilari.js
// Deney sayfalarının (sarkaç, serbest düşme, …) ortak kullandığı ekran yardımcıları.
// Bir şeyi bir kez yazıp iki sayfada kullanmak, bir hatayı da tek yerde düzeltmemizi sağlar.

import { orneklemeRaporu, BOSLUK_ESIGI_MS } from '../analiz/ornekleme.js';
import { sayiYaz } from './bicim.js';

const el = (id) => document.getElementById(id);

// Bir <ul> listesini verilen metinlerle doldurur. Liste boşsa bosMetin yazılır.
export function listeyiDoldur(liste, metinler, bosMetin) {
  liste.replaceChildren();
  const satirlar = metinler.length > 0 ? metinler : [bosMetin];
  for (const metin of satirlar) {
    const li = document.createElement('li');
    li.textContent = metin;
    liste.appendChild(li);
  }
}

// Zamanları kaydın başından itibaren saniyeye çevirir (ilk ölçüm = 0 s)
export function goreliZamanlarSn(ornekler) {
  const ilkZaman = ornekler[0].zaman;
  return ornekler.map((o) => (o.zaman - ilkZaman) / 1000);
}

// sureSn saniyeden geriye sayar; her saniye ilerleme(kalanSn) çağrılır.
export function geriSay(sureSn, ilerleme) {
  return new Promise((bitti) => {
    let kalan = sureSn;
    ilerleme(kalan);
    const zamanlayici = setInterval(() => {
      kalan--;
      if (kalan <= 0) {
        clearInterval(zamanlayici);
        bitti();
      } else {
        ilerleme(kalan);
      }
    }, 1000);
  });
}

// Sonucun üstündeki renkli rozet. Rengi ve yazısı sonucun durumuna göre değişir.
// (Açıklama cümleleri ayrıntıyı verir; rozet ilk bakışta durumu anlatır.)
// durum: 'uyumlu' | 'sistematik' | 'guvenilmez' | null (rozeti gizle)
const DURUM_ROZETLERI = {
  uyumlu: { metin: '✓ Kabul edilen değerle uyumlu', sinif: 'rozet-hazir' },
  sistematik: { metin: '! Sistematik hata olabilir', sinif: 'rozet-dikkat' },
  guvenilmez: { metin: '⚠ Ölçüm güvenilir değil', sinif: 'rozet-hata' },
};
export function durumRozetiniGoster(rozet, durum) {
  rozet.classList.remove('rozet-hazir', 'rozet-dikkat', 'rozet-hata');
  if (!durum) {
    rozet.hidden = true;
    return;
  }
  rozet.textContent = DURUM_ROZETLERI[durum].metin;
  rozet.classList.add(DURUM_ROZETLERI[durum].sinif);
  rozet.hidden = false;
}

// "Örnekleme raporu" bölümünü doldurur. Sayfada şu kimlikli (id) elemanlar olmalı:
//   raporBolumu, rOrnekSayisi, rSure, rHiz, rOrtanca, rEnKisaUzun, rBoslukSayisi, rUyarilar, rBosluklar
// ekUyarilar: sayfanın kendi eklediği uyarılar (ör. sarkaçta "jiroskop verisi gelmedi")
export function orneklemeRaporunuGoster(ornekler, kesildiMi, ekUyarilar = []) {
  const rapor = orneklemeRaporu(ornekler.map((o) => o.zaman));
  const uyarilar = [...rapor.uyarilar, ...ekUyarilar];
  if (kesildiMi) {
    uyarilar.unshift('Kayıt sırasında sayfa arka plana geçti (ekran kilidi veya uygulama değişimi). Kaydı tekrarlayın.');
  }

  el('rOrnekSayisi').textContent = rapor.ornekSayisi;

  if (rapor.yeterliVeriVar) {
    el('rSure').textContent = sayiYaz(rapor.sureSn, 1) + ' s';
    el('rHiz').textContent = sayiYaz(rapor.ortalamaHz, 1) + ' Hz';
    el('rOrtanca').textContent = sayiYaz(rapor.ortancaAralikMs, 1) + ' ms';
    el('rEnKisaUzun').textContent =
      sayiYaz(rapor.enKisaAralikMs, 1) + ' ms / ' + sayiYaz(rapor.enUzunAralikMs, 1) + ' ms';
    el('rBoslukSayisi').textContent = `${rapor.bosluklar.length} (eşik: ${BOSLUK_ESIGI_MS} ms)`;
  } else {
    for (const id of ['rSure', 'rHiz', 'rOrtanca', 'rEnKisaUzun', 'rBoslukSayisi']) el(id).textContent = '–';
  }

  // Boşlukları "3,2. saniyede 1.067,0 ms" biçiminde listele
  const boslukMetinleri = (rapor.bosluklar || []).map(
    (b) => `${sayiYaz(b.baslangicSn, 2)}. saniyede ${sayiYaz(b.sureMs, 1)} ms boşluk`
  );

  listeyiDoldur(el('rUyarilar'), uyarilar, 'Uyarı yok. Örnekleme düzenli görünüyor.');
  // Rapor normalde kapalı durur; uyarı varsa kendiliğinden açılsın ki gözden kaçmasın.
  el('raporBolumu').querySelector('details').open = uyarilar.length > 0;
  listeyiDoldur(el('rBosluklar'), boslukMetinleri, 'Uzun boşluk yok.');
  el('raporBolumu').hidden = false;
  return rapor;
}

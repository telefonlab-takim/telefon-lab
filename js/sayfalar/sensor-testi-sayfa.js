// js/sayfalar/sensor-testi-sayfa.js
// Sensör testi sayfasının mantığı: butonlar, gelen verinin ekrana yazılması,
// örnekleme hızının hesaplanması.

import { hareketSensorunuHazirla, dinlemeyiBaslat, dinlemeyiDurdur } from '../sensor/hareket.js';
import { sayiYaz } from '../arayuz/bicim.js';
import { surumuGoster } from '../surum.js';
import { servisCalisaniniKaydet } from '../pwa.js';

surumuGoster();
servisCalisaniniKaydet();

// Sayfadaki elemanları kısa bir yardımcıyla buluyoruz.
const el = (id) => document.getElementById(id);

const baslatButonu = el('baslatButonu');
const durdurButonu = el('durdurButonu');

// Ölçüm boyunca tuttuğumuz bilgiler
let sonOrnek = null;        // ekrana yazılacak en son örnek
let ornekSayisi = 0;
let ilkZaman = null;        // ilk örneğin zamanı (ms)
let oncekiZaman = null;     // bir önceki örneğin zamanı (ms)
let enKisaAralik = Infinity;
let enUzunAralik = 0;
let ekranGuncellemeNo = null;  // requestAnimationFrame kimliği
let olayKontrolZamanlayici = null;

el('cihazBilgisi').textContent = navigator.userAgent;

function durumYaz(metin, hataMi = false) {
  const p = el('durumMesaji');
  p.textContent = metin;
  p.classList.toggle('hata', hataMi);
}

// Sensörden her örnek geldiğinde çalışır (saniyede onlarca kez).
// Burada ekrana yazmıyoruz, sadece hesap yapıyoruz; ekran ayrı bir döngüde güncelleniyor.
function ornekGeldi(ornek) {
  ornekSayisi++;
  sonOrnek = ornek;

  if (ilkZaman === null) ilkZaman = ornek.zaman;
  if (oncekiZaman !== null) {
    const aralik = ornek.zaman - oncekiZaman; // ms
    enKisaAralik = Math.min(enKisaAralik, aralik);
    enUzunAralik = Math.max(enUzunAralik, aralik);
  }
  oncekiZaman = ornek.zaman;
}

// Ekranı her karede (yaklaşık saniyede 60 kez) bir kez günceller.
// Her sensör olayında ekrana yazmak telefonu gereksiz yorardı.
function ekraniGuncelle() {
  if (sonOrnek) {
    el('ax').textContent = sayiYaz(sonOrnek.ax);
    el('ay').textContent = sayiYaz(sonOrnek.ay);
    el('az').textContent = sayiYaz(sonOrnek.az);
    el('donmeAlfa').textContent = sayiYaz(sonOrnek.donmeAlfa);
    el('donmeBeta').textContent = sayiYaz(sonOrnek.donmeBeta);
    el('donmeGama').textContent = sayiYaz(sonOrnek.donmeGama);
    el('bildirilenAralik').textContent = sayiYaz(sonOrnek.aralik, 3);
  }

  el('ornekSayisi').textContent = ornekSayisi;

  // Ortalama örnekleme hızı = (örnek sayısı - 1) / geçen süre
  // (5 örnek arasında 4 aralık vardır, bu yüzden 1 çıkarıyoruz.)
  if (ornekSayisi >= 2) {
    const gecenSureSn = (oncekiZaman - ilkZaman) / 1000;
    const hizHz = (ornekSayisi - 1) / gecenSureSn;
    el('ortalamaHiz').textContent = sayiYaz(hizHz, 1) + ' Hz';
    el('aralikler').textContent =
      sayiYaz(enKisaAralik, 1) + ' ms / ' + sayiYaz(enUzunAralik, 1) + ' ms';
  }

  ekranGuncellemeNo = requestAnimationFrame(ekraniGuncelle);
}

function sayaclariSifirla() {
  sonOrnek = null;
  ornekSayisi = 0;
  ilkZaman = null;
  oncekiZaman = null;
  enKisaAralik = Infinity;
  enUzunAralik = 0;
}

baslatButonu.addEventListener('click', async () => {
  // 1) Ön kontroller ve izin (izin penceresi yalnızca iPhone'da açılır)
  const hazirlik = await hareketSensorunuHazirla();
  if (!hazirlik.tamam) {
    durumYaz(hazirlik.mesaj, true);
    return;
  }

  // 2) Dinlemeye başla
  sayaclariSifirla();
  dinlemeyiBaslat(ornekGeldi);
  ekranGuncellemeNo = requestAnimationFrame(ekraniGuncelle);
  baslatButonu.disabled = true;
  durdurButonu.disabled = false;
  durumYaz('Dinleniyor… Telefonu hafifçe hareket ettirin.');

  // 3) 2 saniye içinde hiç veri gelmezse kullanıcıyı uyar
  olayKontrolZamanlayici = setTimeout(() => {
    if (ornekSayisi === 0) {
      durumYaz('2 saniyedir hiç sensör verisi gelmedi. Bu cihazda hareket sensörü olmayabilir (ör. bilgisayar).', true);
    }
  }, 2000);
});

durdurButonu.addEventListener('click', () => {
  dinlemeyiDurdur();
  cancelAnimationFrame(ekranGuncellemeNo);
  clearTimeout(olayKontrolZamanlayici);
  baslatButonu.disabled = false;
  durdurButonu.disabled = true;
  durumYaz('Durduruldu. Son değerler ekranda duruyor.');
});

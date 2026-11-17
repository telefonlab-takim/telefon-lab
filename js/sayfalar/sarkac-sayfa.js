// js/sayfalar/sarkac-sayfa.js
// Sarkaç sayfasının mantığı.
// Şu anki hâli (Adım 3): kayıt yapar, örneklemenin ne kadar düzenli olduğunu raporlar
// ve kaydedilen sinyali grafik olarak çizer.

import { hareketSensorunuHazirla } from '../sensor/hareket.js';
import { kayitYap } from '../sensor/kayit.js';
import { orneklemeRaporu, BOSLUK_ESIGI_MS } from '../analiz/ornekleme.js';
import { sayiYaz } from '../arayuz/bicim.js';
import { grafikCiz, aciklamaYaz } from '../arayuz/grafik.js';

const el = (id) => document.getElementById(id);
const kayitButonu = el('kayitButonu');

// Son kaydın örnekleri. Grafik yeniden çizilirken (sinyal değişimi, ekran döndürme) kullanılır.
let sonOrnekler = [];

// Grafikte gösterilebilecek sinyaller: her biri 3 eksenden oluşur.
const SINYALLER = {
  donme: {
    birim: '°/s',
    seriler: [
      { ad: 'alfa (z ekseni)', alan: 'donmeAlfa', renkDegiskeni: '--seri-1' },
      { ad: 'beta (x ekseni)', alan: 'donmeBeta', renkDegiskeni: '--seri-2' },
      { ad: 'gama (y ekseni)', alan: 'donmeGama', renkDegiskeni: '--seri-3' },
    ],
  },
  ivme: {
    birim: 'm/s²',
    seriler: [
      { ad: 'x', alan: 'ax', renkDegiskeni: '--seri-1' },
      { ad: 'y', alan: 'ay', renkDegiskeni: '--seri-2' },
      { ad: 'z', alan: 'az', renkDegiskeni: '--seri-3' },
    ],
  },
};

function grafigiGuncelle() {
  if (sonOrnekler.length === 0) return;
  const sinyal = SINYALLER[el('sinyalSecimi').value];

  // Zamanı kaydın başından itibaren saniye olarak göster (ilk ölçüm = 0 s)
  const ilkZaman = sonOrnekler[0].zaman;
  const zamanlarSn = sonOrnekler.map((o) => (o.zaman - ilkZaman) / 1000);

  // Her eksen için değer listesini örneklerden çıkar
  const seriler = sinyal.seriler.map((s) => ({
    ad: s.ad,
    renkDegiskeni: s.renkDegiskeni,
    degerler: sonOrnekler.map((o) => o[s.alan]),
  }));

  grafikCiz(el('grafik'), { zamanlarSn, seriler, birim: sinyal.birim });
  aciklamaYaz(el('grafikAciklamasi'), seriler);
}

el('sinyalSecimi').addEventListener('change', grafigiGuncelle);
// Telefon yan çevrilince grafik genişliği değişir; yeniden çiz
window.addEventListener('resize', grafigiGuncelle);

function durumYaz(metin, hataMi = false) {
  const p = el('durumMesaji');
  p.textContent = metin;
  p.classList.toggle('hata', hataMi);
}

// Bir <ul> listesini verilen metinlerle doldurur. Liste boşsa bosMetin yazılır.
function listeyiDoldur(liste, metinler, bosMetin) {
  liste.replaceChildren();
  const satirlar = metinler.length > 0 ? metinler : [bosMetin];
  for (const metin of satirlar) {
    const li = document.createElement('li');
    li.textContent = metin;
    liste.appendChild(li);
  }
}

// Kayıttaki örneklerin kaçında jiroskop (dönme hızı) değeri var?
function jiroskopluOrnekSayisi(ornekler) {
  return ornekler.filter((o) => o.donmeAlfa !== null).length;
}

function raporuGoster(ornekler, kesildiMi) {
  const rapor = orneklemeRaporu(ornekler.map((o) => o.zaman));
  const uyarilar = [...rapor.uyarilar];
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

    const jiroskoplu = jiroskopluOrnekSayisi(ornekler);
    el('rJiroskop').textContent = `${jiroskoplu} / ${ornekler.length} ölçümde var`;
    if (jiroskoplu === 0) uyarilar.push('Jiroskop verisi gelmedi; sarkaç için ivmeölçer yöntemine geçmek gerekecek.');
  } else {
    for (const id of ['rSure', 'rHiz', 'rOrtanca', 'rEnKisaUzun', 'rBoslukSayisi', 'rJiroskop']) {
      el(id).textContent = '–';
    }
  }

  // Boşlukları "3,2. saniyede 1.067,0 ms" biçiminde listele
  const boslukMetinleri = (rapor.bosluklar || []).map(
    (b) => `${sayiYaz(b.baslangicSn, 2)}. saniyede ${sayiYaz(b.sureMs, 1)} ms boşluk`
  );

  listeyiDoldur(el('rUyarilar'), uyarilar, 'Uyarı yok. Örnekleme düzenli görünüyor.');
  listeyiDoldur(el('rBosluklar'), boslukMetinleri, 'Uzun boşluk yok.');
  el('raporBolumu').hidden = false;
}

kayitButonu.addEventListener('click', async () => {
  const hazirlik = await hareketSensorunuHazirla();
  if (!hazirlik.tamam) {
    durumYaz(hazirlik.mesaj, true);
    return;
  }

  const sureSn = Number(el('sureSecimi').value);
  kayitButonu.disabled = true;
  el('raporBolumu').hidden = true;
  el('grafikBolumu').hidden = true;

  const { ornekler, kesildiMi } = await kayitYap(sureSn, (kalanSn) => {
    durumYaz(`Kayıt yapılıyor… ${kalanSn} saniye kaldı.`);
  });

  durumYaz('Kayıt bitti.');
  raporuGoster(ornekler, kesildiMi);

  sonOrnekler = ornekler;
  if (ornekler.length >= 2) {
    el('grafikBolumu').hidden = false; // önce görünür olmalı, yoksa tuvalin genişliği 0 olur
    grafigiGuncelle();
  }
  kayitButonu.disabled = false;
});

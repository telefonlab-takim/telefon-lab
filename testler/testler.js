// testler/testler.js
// js/analiz/ içindeki saf fonksiyonların testleri.
// Her test, cevabını önceden bildiğimiz bir girdi verir ve sonucu kontrol eder.
// Bu sayfayı tarayıcıda açmak testleri çalıştırır.

import { ortalama, ortanca } from '../js/analiz/istatistik.js';
import { araliklariHesapla, orneklemeRaporu } from '../js/analiz/ornekleme.js';
import { guzelAdim, eksenCizgileri } from '../js/arayuz/olcek.js';

// ---- Küçük test aracı ----------------------------------------------------

const sonuclar = []; // { ad, basarili, mesaj }

function test(ad, fonksiyon) {
  try {
    fonksiyon();
    sonuclar.push({ ad, basarili: true });
  } catch (hata) {
    sonuclar.push({ ad, basarili: false, mesaj: hata.message });
  }
}

// İki sayı, tolerans kadar farkla eşit mi? (Ondalıklı hesaplarda tam eşitlik beklenmez.)
function yakinMi(gercek, beklenen, tolerans = 1e-9) {
  if (!(Math.abs(gercek - beklenen) <= tolerans)) {
    throw new Error(`beklenen ${beklenen}, çıkan ${gercek}`);
  }
}

function esitMi(gercek, beklenen) {
  const g = JSON.stringify(gercek);
  const b = JSON.stringify(beklenen);
  if (g !== b) throw new Error(`beklenen ${b}, çıkan ${g}`);
}

// Sahte zaman damgaları üretir: hz frekansında, sureSn boyunca (ms cinsinden)
function duzenliZamanlar(hz, sureSn) {
  const zamanlar = [];
  const adet = Math.round(hz * sureSn) + 1;
  for (let i = 0; i < adet; i++) zamanlar.push((i * 1000) / hz);
  return zamanlar;
}

// ---- istatistik.js --------------------------------------------------------

test('ortalama: [1, 2, 3, 4] → 2,5', () => yakinMi(ortalama([1, 2, 3, 4]), 2.5));
test('ortalama: boş dizi → NaN', () => esitMi(Number.isNaN(ortalama([])), true));
test('ortanca: tek sayıda değer [5, 1, 3] → 3', () => yakinMi(ortanca([5, 1, 3]), 3));
test('ortanca: çift sayıda değer [4, 1, 3, 2] → 2,5', () => yakinMi(ortanca([4, 1, 3, 2]), 2.5));
test('ortanca: tek aşırı değerden etkilenmez [16, 17, 16, 1000, 17] → 17', () =>
  yakinMi(ortanca([16, 17, 16, 1000, 17]), 17));
test('ortanca: verilen diziyi değiştirmez', () => {
  const dizi = [3, 1, 2];
  ortanca(dizi);
  esitMi(dizi, [3, 1, 2]);
});

// ---- ornekleme.js ---------------------------------------------------------

test('araliklariHesapla: [0, 10, 30] → [10, 20]', () => esitMi(araliklariHesapla([0, 10, 30]), [10, 20]));

test('rapor: düzenli 60 Hz, 10 s → 60 Hz, ortanca 16,67 ms, boşluk yok, uyarı yok', () => {
  const r = orneklemeRaporu(duzenliZamanlar(60, 10));
  yakinMi(r.ortalamaHz, 60, 1e-6);
  yakinMi(r.ortancaAralikMs, 1000 / 60, 1e-6);
  yakinMi(r.sureSn, 10, 1e-6);
  esitMi(r.bosluklar.length, 0);
  esitMi(r.uyarilar.length, 0);
});

test('rapor: 2. ve 3. saniye arası veri yok → 1 boşluk, 2. saniyede, ~1000 ms', () => {
  const zamanlar = duzenliZamanlar(60, 10).filter((t) => t <= 2000 || t >= 3000);
  const r = orneklemeRaporu(zamanlar);
  esitMi(r.bosluklar.length, 1);
  yakinMi(r.bosluklar[0].baslangicSn, 2, 1e-6);
  yakinMi(r.bosluklar[0].sureMs, 1000, 1e-6);
  esitMi(r.uyarilar.length, 1);
});

test('rapor: tek boşluk ortancayı bozmaz (hâlâ ~16,67 ms)', () => {
  const zamanlar = duzenliZamanlar(60, 10).filter((t) => t <= 2000 || t >= 3000);
  yakinMi(orneklemeRaporu(zamanlar).ortancaAralikMs, 1000 / 60, 1e-6);
});

test('rapor: 20 Hz → düşük hız uyarısı', () => {
  const r = orneklemeRaporu(duzenliZamanlar(20, 10));
  yakinMi(r.ortalamaHz, 20, 1e-6);
  esitMi(r.uyarilar.length, 1);
});

test('rapor: tek ölçüm → yeterli veri yok', () => esitMi(orneklemeRaporu([5]).yeterliVeriVar, false));
test('rapor: hiç ölçüm yok → yeterli veri yok', () => esitMi(orneklemeRaporu([]).yeterliVeriVar, false));
test('rapor: bütün zamanlar aynı → yeterli veri yok', () =>
  esitMi(orneklemeRaporu([7, 7, 7]).yeterliVeriVar, false));

// ---- olcek.js (grafik eksenleri) -------------------------------------------

test('guzelAdim: aralık 79, 5 parça → 20', () => yakinMi(guzelAdim(79, 5), 20));
test('guzelAdim: aralık 20, 5 parça → 5', () => yakinMi(guzelAdim(20, 5), 5));
test('guzelAdim: aralık 0,9, 5 parça → 0,2', () => yakinMi(guzelAdim(0.9, 5), 0.2));
test('eksenCizgileri: -37 ile 42 → [-20, 0, 20, 40]', () => esitMi(eksenCizgileri(-37, 42), [-20, 0, 20, 40]));
test('eksenCizgileri: 0 ile 20 → [0, 5, 10, 15, 20]', () => esitMi(eksenCizgileri(0, 20), [0, 5, 10, 15, 20]));
test('eksenCizgileri: ondalık kırıntısı yok (0 ile 1)', () =>
  esitMi(eksenCizgileri(0, 1), [0, 0.2, 0.4, 0.6, 0.8, 1]));
test('eksenCizgileri: min = max → tek değer', () => esitMi(eksenCizgileri(3, 3), [3]));

// ---- Sonuçları ekrana yaz -------------------------------------------------

const liste = document.getElementById('sonuclar');
for (const s of sonuclar) {
  const li = document.createElement('li');
  li.className = s.basarili ? 'basarili' : 'basarisiz';
  li.textContent = (s.basarili ? '✅ ' : '❌ ') + s.ad + (s.mesaj ? ` — ${s.mesaj}` : '');
  liste.appendChild(li);
}
const basarisizSayisi = sonuclar.filter((s) => !s.basarili).length;
document.getElementById('ozet').textContent =
  basarisizSayisi === 0
    ? `${sonuclar.length} testin hepsi geçti.`
    : `${basarisizSayisi} / ${sonuclar.length} test başarısız.`;

// testler/testler.js
// js/analiz/ içindeki saf fonksiyonların testleri.
// Her test, cevabını önceden bildiğimiz bir girdi verir ve sonucu kontrol eder.
// Bu sayfayı tarayıcıda açmak testleri çalıştırır.

import { ortalama, ortanca } from '../js/analiz/istatistik.js';
import { araliklariHesapla, orneklemeRaporu } from '../js/analiz/ornekleme.js';
import { guzelAdim, eksenCizgileri } from '../js/arayuz/olcek.js';
import { standartSapma, dogruUydur } from '../js/analiz/istatistik.js';
import {
  periyotBul,
  enDuzenliSonuc,
  yukariSifirGecisleri,
  enUzunTutarliBolum,
  hareketliOrtalama,
  sarkacPeriyoduBul,
} from '../js/analiz/periyot.js';
import { genlikAcisiTahmini, buyukAciGHatasi, gHesapla, kabulEdilenleKarsilastir } from '../js/analiz/sarkac-hesap.js';
import { belirsizlikleYaz, sayiOku } from '../js/arayuz/bicim.js';

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

// Her çalıştırmada aynı "rastgele" sayıları veren basit üreteç (testler hep aynı sonucu versin diye).
// Doğrusal eşlik üreteci: sonraki = (a × önceki + c) mod m
function tohumluRastgele(tohum) {
  let durum = tohum;
  return () => {
    durum = (1664525 * durum + 1013904223) % 4294967296;
    return durum / 4294967296; // 0 ile 1 arası
  };
}

// Sahte sarkaç sinyali üretir: dönme hızı = genlik · cos(2πt/T) + sabit kayma + gürültü
// Zaman damgaları da iPhone'daki gibi titreşimli (± zamanTitremesiMs) olabilir.
function sahteSarkac({ periyotSn, genlik, sureSn, hz = 60, gurultu = 0, kayma = 0, zamanTitremesiMs = 0, tohum = 1 }) {
  const rastgele = tohumluRastgele(tohum);
  const zamanlarSn = [];
  const degerler = [];
  for (let i = 0; i <= sureSn * hz; i++) {
    const gercekZaman = i / hz;
    // Ölçüm doğru anda alınır ama zaman damgası titreşimli kaydedilir
    const damga = gercekZaman + ((rastgele() - 0.5) * 2 * zamanTitremesiMs) / 1000;
    zamanlarSn.push(damga);
    degerler.push(genlik * Math.cos((2 * Math.PI * gercekZaman) / periyotSn) + kayma + (rastgele() - 0.5) * 2 * gurultu);
  }
  return { zamanlarSn, degerler };
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

// ---- istatistik.js: standart sapma ve doğru uydurma ---------------------------

test('standartSapma: [2, 4, 4, 4, 5, 5, 7, 9] → 2,138 (n−1 ile)', () =>
  yakinMi(standartSapma([2, 4, 4, 4, 5, 5, 7, 9]), Math.sqrt(32 / 7), 1e-12));
test('dogruUydur: tam doğru y = 3 + 2x → eğim 2, kesişim 3, belirsizlik 0', () => {
  const r = dogruUydur([0, 1, 2, 3], [3, 5, 7, 9]);
  yakinMi(r.egim, 2);
  yakinMi(r.kesisim, 3);
  yakinMi(r.egimBelirsizligi, 0);
});
test('dogruUydur: sapmalı noktalar → elle hesaplanan eğim 1,91, kesişim 0,06, Δeğim 0,052', () => {
  // Elle hesap:  x = 0, 1, 2, 3   y = 0, 2, 4, 5,7
  //   x̄ = 1,5   ȳ = 2,925
  //   Σ(x−x̄)² = 2,25 + 0,25 + 0,25 + 2,25 = 5
  //   Σ(x−x̄)(y−ȳ) = 4,3875 + 0,4625 + 0,5375 + 4,1625 = 9,55
  //   eğim = 9,55 / 5 = 1,91      kesişim = 2,925 − 1,91 × 1,5 = 0,06
  //   artıklar: −0,06 ; 0,03 ; 0,12 ; −0,09 → kareler toplamı 0,027 → s² = 0,027 / 2 = 0,0135
  //   Δeğim = √(0,0135 / 5) ≈ 0,052
  const r = dogruUydur([0, 1, 2, 3], [0, 2, 4, 5.7]);
  yakinMi(r.egim, 1.91, 1e-12);
  yakinMi(r.kesisim, 0.06, 1e-12);
  yakinMi(r.egimBelirsizligi, Math.sqrt(0.0135 / 5), 1e-12);
});

// ---- periyot.js -----------------------------------------------------------

test('yukariSifirGecisleri: sin(2πt), t = 0…3,5 s → geçişler 1, 2, 3 s', () => {
  const t = [];
  const v = [];
  for (let i = 0; i <= 350; i++) { t.push(i / 100); v.push(Math.sin(2 * Math.PI * i / 100)); }
  const g = yukariSifirGecisleri(t, v, 0.3);
  esitMi(g.length, 3); // t=0'daki ilk geçiş sayılmaz: sinyal önce bandın altına inmemişti
  g.forEach((gt, k) => yakinMi(gt, k + 1, 1e-3));
});

test('periyotBul: kusursuz sinüs, T = 1,400 s → 1,400 s (±0,1 ms)', () => {
  const { zamanlarSn, degerler } = sahteSarkac({ periyotSn: 1.4, genlik: 50, sureSn: 20 });
  const r = periyotBul(zamanlarSn, degerler);
  esitMi(r.gecerliMi, true);
  yakinMi(r.periyotSn, 1.4, 1e-4);
  esitMi(r.uyarilar.length, 0);
});

test('periyotBul: iPhone benzeri (gürültü ±3 °/s, kayma +2 °/s, zaman titremesi ±5 ms) → 1,400 s (±2 ms)', () => {
  const { zamanlarSn, degerler } = sahteSarkac({
    periyotSn: 1.4, genlik: 50, sureSn: 20, gurultu: 3, kayma: 2, zamanTitremesiMs: 5, tohum: 42,
  });
  const r = periyotBul(zamanlarSn, degerler);
  yakinMi(r.periyotSn, 1.4, 0.002);
  esitMi(r.salinimSayisi, 13); // 20 s / 1,4 s ≈ 14,3 → 14 geçiş → 13 periyot
});

test('periyotBul: gerçek periyot, hesaplanan belirsizliğin 3 katı içinde', () => {
  const { zamanlarSn, degerler } = sahteSarkac({
    periyotSn: 1.4, genlik: 50, sureSn: 20, gurultu: 3, zamanTitremesiMs: 5, tohum: 7,
  });
  const r = periyotBul(zamanlarSn, degerler);
  if (!(Math.abs(r.periyotSn - 1.4) <= 3 * r.periyotBelirsizligiSn)) {
    throw new Error(`T = ${r.periyotSn}, ΔT = ${r.periyotBelirsizligiSn}`);
  }
});

test('periyotBul: gürültü sahte geçiş üretmez (zayıf sinyal + güçlü gürültü)', () => {
  const { zamanlarSn, degerler } = sahteSarkac({ periyotSn: 2, genlik: 10, sureSn: 20, gurultu: 2, tohum: 3 });
  const r = periyotBul(zamanlarSn, degerler);
  esitMi(r.salinimSayisi, 9); // 20 s / 2 s = 10 geçiş → 9 periyot
});

test('periyotBul: 3 salınımlık kısa kayıt → "en az 5" uyarısı', () => {
  const { zamanlarSn, degerler } = sahteSarkac({ periyotSn: 1.4, genlik: 50, sureSn: 5 });
  const r = periyotBul(zamanlarSn, degerler);
  esitMi(r.gecerliMi, true);
  esitMi(r.uyarilar.length, 1);
});

test('periyotBul: salınım yok (yalnız gürültü değil, düz sinyal) → geçersiz', () => {
  const r = periyotBul([0, 1, 2, 3, 4], [5, 5, 5, 5, 5]);
  esitMi(r.gecerliMi, false);
});

test('periyotBul: null değerler atlanır', () => {
  const { zamanlarSn, degerler } = sahteSarkac({ periyotSn: 1.4, genlik: 50, sureSn: 20 });
  degerler[100] = null;
  degerler[500] = null;
  yakinMi(periyotBul(zamanlarSn, degerler).periyotSn, 1.4, 1e-3);
});

// ---- periyot.js: düzensiz kısımları ayıklama ve yumuşatma ---------------------

test('enUzunTutarliBolum: bozuk periyotlar arasından en uzun düzenli bölümü seçer', () => {
  //              0    1    2    3     4     5     6    7    8
  const p = [0.3, 0.2, 1.5, 1.5, 1.49, 1.51, 0.4, 1.5, 1.5];
  // ortanca = 1,5 ; düzenli bölümler: 2–5 (4 tane) ve 7–8 (2 tane) → 2'den başlayan 4'lü bölüm
  const b = enUzunTutarliBolum(p);
  esitMi([b.baslangic, b.adet], [2, 4]);
  yakinMi(b.ortancaSn, 1.5);
});

test('hareketliOrtalama: sabit sinyal değişmez', () => {
  const t = [0, 0.02, 0.04, 0.06, 0.08, 0.1];
  esitMi(hareketliOrtalama(t, [3, 3, 3, 3, 3, 3]), [3, 3, 3, 3, 3, 3]);
});

test('hareketliOrtalama: 6,67 Hz titreşimi bastırır, 0,7 Hz salınımı korur', () => {
  const t = [];
  const hizli = [];
  const yavas = [];
  for (let i = 0; i <= 600; i++) {
    t.push(i / 60);
    hizli.push(50 * Math.sin(2 * Math.PI * 6.667 * i / 60));
    yavas.push(50 * Math.sin(2 * Math.PI * 0.7 * i / 60));
  }
  const tepe = (dizi) => Math.max(...dizi.slice(30, -30).map(Math.abs)); // kenarlar hariç
  const hizliSonra = tepe(hareketliOrtalama(t, hizli));
  const yavasSonra = tepe(hareketliOrtalama(t, yavas));
  if (!(hizliSonra < 10)) throw new Error(`hızlı titreşim tepe ${hizliSonra} (50'den 10'un altına inmeliydi)`);
  if (!(yavasSonra > 48)) throw new Error(`yavaş salınım tepe ${yavasSonra} (50'ye yakın kalmalıydı)`);
});

// Gerçek kayıttaki (TEST_SONUCLARI 5.4) duruma benzeyen sahte veri:
// ilk ~3 saniye telefon ip ucunda hızlı titreşiyor (≈5,5 Hz, sönümlü), sarkacın kendisi T = 1,50 s ile salınıyor.
function baslangiciTitresenSarkac(tohum) {
  const rastgele = tohumluRastgele(tohum);
  const zamanlarSn = [];
  const alfa = [];
  const beta = [];
  const gama = [];
  for (let i = 0; i <= 20 * 60; i++) {
    const t = i / 60;
    const titresim = Math.exp(-t / 1.2);
    zamanlarSn.push(t + (rastgele() - 0.5) * 0.006);
    alfa.push(40 * Math.cos((2 * Math.PI * t) / 1.5) + 60 * titresim * Math.sin(2 * Math.PI * 5.5 * t) + (rastgele() - 0.5) * 8);
    beta.push(10 * Math.sin((2 * Math.PI * t) / 1.5) + (rastgele() - 0.5) * 6);
    gama.push(110 * titresim * Math.sin(2 * Math.PI * 5.5 * t + 1) + (rastgele() - 0.5) * 6);
  }
  return {
    zamanlarSn,
    seriler: [
      { ad: 'alfa', degerler: alfa },
      { ad: 'beta', degerler: beta },
      { ad: 'gama', degerler: gama },
    ],
  };
}

test('sarkacPeriyoduBul: başı titreşen kayıt → T = 1,50 s (±0,01), titreşimli baş atılır, uyarı yok', () => {
  // Burada alfa ve beta aynı salınımı (aynı periyotla) görüyor; hangisi seçilirse seçilsin T = 1,50 s olmalı.
  const { zamanlarSn, seriler } = baslangiciTitresenSarkac(11);
  const r = sarkacPeriyoduBul(zamanlarSn, seriler);
  yakinMi(r.periyotSn, 1.5, 0.01);
  if (!(r.salinimSayisi >= 10)) throw new Error(`yalnızca ${r.salinimSayisi} salınım kullanıldı`);
  esitMi(r.uyarilar, []);
});

// ---- periyot.js: eksen seçimi (K-009) ---------------------------------------------

test('enDuzenliSonuc: en küçük yayılımlıyı seçer; az salınımlıyı ancak başka aday yoksa', () => {
  const a = { eksen: 'a', gecerliMi: true, salinimSayisi: 12, yayilimOrani: 0.04 };
  const b = { eksen: 'b', gecerliMi: true, salinimSayisi: 14, yayilimOrani: 0.01 };
  const c = { eksen: 'c', gecerliMi: true, salinimSayisi: 2, yayilimOrani: 0.001 }; // çok düzenli ama yalnız 2 salınım
  const d = { eksen: 'd', gecerliMi: false };
  esitMi(enDuzenliSonuc([a, b, c, d]).eksen, 'b');
  esitMi(enDuzenliSonuc([c, d]).eksen, 'c');
  esitMi(enDuzenliSonuc([d]), null);
});

// Gerçek kayıttaki (TEST_SONUCLARI 5.5) duruma benzeyen sahte veri:
// beta = asıl sarkaç (T = 1,28 s, düzgün), alfa = daha BÜYÜK ama gürültülü ikinci salınım (T = 1,55 s).
function ikiYondeSalinan(tohum) {
  const rastgele = tohumluRastgele(tohum);
  const zamanlarSn = [];
  const alfa = [];
  const beta = [];
  const gama = [];
  for (let i = 0; i <= 20 * 60; i++) {
    const t = i / 60;
    zamanlarSn.push(t + (rastgele() - 0.5) * 0.006);
    alfa.push(45 * Math.cos((2 * Math.PI * t) / 1.55) + (rastgele() - 0.5) * 30);
    beta.push(30 * Math.sin((2 * Math.PI * t) / 1.28) + (rastgele() - 0.5) * 6);
    gama.push((rastgele() - 0.5) * 12);
  }
  return {
    zamanlarSn,
    seriler: [
      { ad: 'alfa', degerler: alfa },
      { ad: 'beta', degerler: beta },
      { ad: 'gama', degerler: gama },
    ],
  };
}

test('sarkacPeriyoduBul: iki yönde salınım → daha düzenli olan beta seçilir (T = 1,28 s), "iki ayrı yönde" uyarısı', () => {
  const { zamanlarSn, seriler } = ikiYondeSalinan(5);
  const r = sarkacPeriyoduBul(zamanlarSn, seriler);
  esitMi(r.secilenEksen, 'beta');
  yakinMi(r.periyotSn, 1.28, 0.01);
  esitMi(r.guvenilirMi, false);
  if (!r.uyarilar.some((u) => u.includes('iki ayrı yönde'))) throw new Error('iki yön uyarısı yok: ' + r.uyarilar.join(' | '));
  esitMi(r.eksenler.map((e) => e.ad), ['alfa', 'beta', 'gama']);
});

test('sarkacPeriyoduBul: büyük ama gürültü dolu eksen yerine küçük ama düzenli eksen seçilir', () => {
  // alfa yalnızca gürültü (standart sapması en büyük!), gama düzenli 1,40 s salınım
  const rastgele = tohumluRastgele(9);
  const zamanlarSn = [];
  const alfa = [];
  const gama = [];
  for (let i = 0; i <= 20 * 60; i++) {
    const t = i / 60;
    zamanlarSn.push(t);
    alfa.push((rastgele() - 0.5) * 120);
    gama.push(25 * Math.cos((2 * Math.PI * t) / 1.4) + (rastgele() - 0.5) * 4);
  }
  const r = sarkacPeriyoduBul(zamanlarSn, [
    { ad: 'alfa', degerler: alfa },
    { ad: 'gama', degerler: gama },
  ]);
  esitMi(r.secilenEksen, 'gama');
  yakinMi(r.periyotSn, 1.4, 0.005);
});

test('sarkacPeriyoduBul: hiçbir eksende salınım yok → geçersiz, eksen yok', () => {
  const r = sarkacPeriyoduBul([0, 1, 2, 3], [{ ad: 'a', degerler: [1, 1, 1, 1] }]);
  esitMi(r.gecerliMi, false);
  esitMi(r.secilenEksen, null);
});

test('Eski yöntem (yumuşatma ve ayıklama yok) aynı kayıtta yanılıyordu: sahte geçişler sayılıyor', () => {
  // Bu test, düzeltmenin neden gerektiğini belgeler: ham sinyalde düzensiz baştaki sahte geçişler
  // tüm periyotlara katılırsa ortalama periyot 1,50 s'den belirgin biçimde küçük çıkar.
  const { zamanlarSn, seriler } = baslangiciTitresenSarkac(11);
  const ham = seriler[0].degerler.map((v) => v - ortalama(seriler[0].degerler));
  const gecisler = yukariSifirGecisleri(zamanlarSn, ham, 0.3 * standartSapma(ham));
  const hamOrtalamaPeriyot = (gecisler[gecisler.length - 1] - gecisler[0]) / (gecisler.length - 1);
  if (!(hamOrtalamaPeriyot < 1.4)) throw new Error(`ham ortalama periyot ${hamOrtalamaPeriyot}; sahte geçiş beklenirdi`);
});

// ---- sarkac-hesap.js ------------------------------------------------------

test('genlikAcisiTahmini: ω_max = 105 °/s, T = 1,4 s → θ₀ ≈ 23,4°', () =>
  yakinMi(genlikAcisiTahmini(105, 1.4), (105 * 1.4) / (2 * Math.PI), 1e-12));

test('buyukAciGHatasi: 23° → yaklaşık %2', () => {
  // 23° = 0,4014 rad → 0,4014² / 8 = 0,02014
  yakinMi(buyukAciGHatasi(23), 0.02014, 1e-4);
});
test('buyukAciGHatasi: 5° → %0,1 (ihmal edilebilir)', () => yakinMi(buyukAciGHatasi(5), 0.00095, 1e-5));

test('periyotBul + genlik: genliği 50 °/s olan sinüsün tepe değeri ≈ 50', () => {
  const { zamanlarSn, degerler } = sahteSarkac({ periyotSn: 1.4, genlik: 50, sureSn: 14 });
  yakinMi(periyotBul(zamanlarSn, degerler).tepeDegeri, 50, 0.5);
});

// ---- sarkac-hesap.js: g hesabı ------------------------------------------------

test('gHesapla: L = 1 m, T = 2π/√9,81 s → g = 9,81 m/s² (formülün tersi)', () => {
  const T = (2 * Math.PI) / Math.sqrt(9.81);
  yakinMi(gHesapla({ uzunlukM: 1, uzunlukBelirsizligiM: 0, periyotSn: T, periyotBelirsizligiSn: 0 }).g, 9.81, 1e-12);
});

test('gHesapla: L = 0,487 ± 0,005 m, T = 1,400 ± 0,001 s → elle hesap ile aynı', () => {
  // Elle:  g = 4π² × 0,487 / 1,4² = 9,8093...
  //        ΔL/L = 0,005/0,487 = 0,01027      2ΔT/T = 0,002/1,4 = 0,00143
  //        Δg/g = √(0,01027² + 0,00143²) = 0,01037   →   Δg ≈ 0,1017
  const r = gHesapla({ uzunlukM: 0.487, uzunlukBelirsizligiM: 0.005, periyotSn: 1.4, periyotBelirsizligiSn: 0.001 });
  yakinMi(r.g, (4 * Math.PI ** 2 * 0.487) / 1.96, 1e-12);
  yakinMi(r.gBelirsizligi, 0.1017, 2e-4);
  // Belirsizliğin neredeyse tamamı L'den geliyor: 0,01027² / 0,01037² ≈ %98
  yakinMi(r.uzunlukPayi, 0.98, 0.01);
  yakinMi(r.uzunlukPayi + r.periyotPayi, 1, 1e-12);
});

test('gHesapla: periyot iki katına çıkınca g dörtte birine iner', () => {
  const a = gHesapla({ uzunlukM: 1, uzunlukBelirsizligiM: 0, periyotSn: 1, periyotBelirsizligiSn: 0 }).g;
  const b = gHesapla({ uzunlukM: 1, uzunlukBelirsizligiM: 0, periyotSn: 2, periyotBelirsizligiSn: 0 }).g;
  yakinMi(a / b, 4, 1e-12);
});

test('kabulEdilenleKarsilastir: 9,75 ± 0,10 → fark 0,5 kat, uyumlu', () => {
  const r = kabulEdilenleKarsilastir(9.75, 0.1, 9.8);
  yakinMi(r.farkKati, 0.5, 1e-9);
  esitMi(r.uyumluMu, true);
});
test('kabulEdilenleKarsilastir: 9,40 ± 0,10 → fark 4 kat, uyumsuz', () => {
  const r = kabulEdilenleKarsilastir(9.4, 0.1, 9.8);
  yakinMi(r.farkKati, 4, 1e-9);
  esitMi(r.uyumluMu, false);
});

// ---- bicim.js: kullanıcı girdisini okuma ----------------------------------------

test('sayiOku: "48,7" → 48,7 (virgül)', () => yakinMi(sayiOku('48,7'), 48.7));
test('sayiOku: "48.7" → 48,7 (nokta)', () => yakinMi(sayiOku('48.7'), 48.7));
test('sayiOku: " 50 " → 50 (boşluklar)', () => yakinMi(sayiOku(' 50 '), 50));
test('sayiOku: "" → NaN', () => esitMi(Number.isNaN(sayiOku('')), true));
test('sayiOku: "abc" → NaN', () => esitMi(Number.isNaN(sayiOku('abc')), true));
test('sayiOku: "4,8,7" → NaN', () => esitMi(Number.isNaN(sayiOku('4,8,7')), true));

// ---- bicim.js: belirsizlikle yazma -----------------------------------------

test('belirsizlikleYaz: 1,40023 ± 0,0023 s → "1,400 ± 0,002 s"', () =>
  esitMi(belirsizlikleYaz(1.40023, 0.0023, 's'), '1,400 ± 0,002 s'));
test('belirsizlikleYaz: ilk rakam 1 ise 2 basamak: 9,8123 ± 0,15 → "9,81 ± 0,15"', () =>
  esitMi(belirsizlikleYaz(9.8123, 0.15), '9,81 ± 0,15'));
test('belirsizlikleYaz: 9,8093 ± 0,1017 → "9,81 ± 0,10"', () =>
  esitMi(belirsizlikleYaz(9.8093, 0.1017), '9,81 ± 0,10'));
test('belirsizlikleYaz: ilk rakam 1 değilse 1 basamak: 9,8123 ± 0,25 → "9,8 ± 0,3"', () =>
  esitMi(belirsizlikleYaz(9.8123, 0.25), '9,8 ± 0,3'));
test('belirsizlikleYaz: 48,7 ± 0,5 cm → "48,7 ± 0,5 cm"', () =>
  esitMi(belirsizlikleYaz(48.7, 0.5, 'cm'), '48,7 ± 0,5 cm'));
test('belirsizlikleYaz: belirsizlik bilinmiyor → "± ?"', () =>
  esitMi(belirsizlikleYaz(1.4, NaN, 's'), '1,400 ± ? s'));

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

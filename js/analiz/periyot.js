// js/analiz/periyot.js
// Salınan bir sinyalden periyodu bulur.
//
// Yöntem (adım adım):
//   1. Sinyalin ortalamasını çıkar → sinyal sıfır etrafında salınır.
//   2. Sinyalin aşağıdan yukarı doğru sıfırı geçtiği anları bul ("yukarı sıfır geçişleri").
//      Bir periyotta tam bir tane yukarı geçiş olur.
//   3. Geçiş anlarını sıra numarasına (0, 1, 2, ...) karşı düşün: tₖ = t₀ + k · T
//      Bu bir doğrudur ve eğimi periyottur (T). En uygun doğruyu çizip eğimi okuruz.
//
// Saf fonksiyonlardır; ekrana ve sensöre dokunmazlar.

import { ortalama, standartSapma, dogruUydur } from './istatistik.js';

// En az bu kadar periyot sayılmazsa sonuç güvenilir sayılmaz (uyarı verilir).
export const EN_AZ_SALINIM = 5;

// Gürültü yüzünden sıfır çevresinde titreyen sinyal, sahte geçişler üretir.
// Bunu önlemek için bir "eşik bandı" kullanıyoruz: sinyal önce -esik'in altına inmeli, sonra +esik'in
// üstüne çıkmalı; ancak o zaman bir yukarı geçiş sayılır. (Bu yönteme histerezis denir.)
// Eşik = HISTEREZIS_ORANI × sinyalin standart sapması
export const HISTEREZIS_ORANI = 0.3;

// Tek tek periyotlar ortalamadan bundan fazla (oran olarak) saparsa "düzensiz salınım" uyarısı verilir.
export const EN_FAZLA_PERIYOT_YAYILIMI = 0.05; // %5

// Verilen seriler arasından salınımı en büyük olanı (standart sapması en büyük) seçer.
// seriler: [{ ad, degerler }]  (degerler içinde null olabilir, yok sayılır)
export function enCokSalinanSeri(seriler) {
  let enIyi = null;
  let enIyiSapma = -Infinity;
  for (const seri of seriler) {
    const sapma = standartSapma(seri.degerler.filter((v) => v !== null));
    if (sapma > enIyiSapma) {
      enIyiSapma = sapma;
      enIyi = seri;
    }
  }
  return enIyi;
}

// Sinyalin aşağıdan yukarı sıfırı geçtiği anları (saniye) döndürür.
// Geçiş anı, sıfırın iki yanındaki iki ölçüm arasında doğrusal ara değer bulmayla (interpolasyon) hesaplanır;
// böylece sonuç ölçüm aralığından (≈17 ms) daha hassas olur.
export function yukariSifirGecisleri(zamanlarSn, degerler, esik) {
  const gecisler = [];
  let alttaMi = false; // sinyal -esik'in altına indi mi?

  for (let i = 1; i < degerler.length; i++) {
    if (degerler[i] < -esik) {
      alttaMi = true;
    } else if (alttaMi && degerler[i] > esik) {
      // Sinyal bandın altından üstüne çıktı. Gerçek geçiş, bu noktadan geriye doğru
      // değerin ≤ 0'dan > 0'a geçtiği son yerdir.
      let j = i;
      while (j > 0 && !(degerler[j - 1] <= 0 && degerler[j] > 0)) j--;
      if (j > 0) {
        // İki nokta arasında doğru çizip sıfırı kestiği zamanı bul
        const t1 = zamanlarSn[j - 1];
        const t2 = zamanlarSn[j];
        const v1 = degerler[j - 1];
        const v2 = degerler[j];
        gecisler.push(t1 + ((0 - v1) * (t2 - t1)) / (v2 - v1));
      }
      alttaMi = false;
    }
  }
  return gecisler;
}

// Ana fonksiyon: zaman (s) ve değer listesinden periyodu bulur.
export function periyotBul(zamanlarSn, degerler) {
  const uyarilar = [];

  // Değeri olmayan ölçümleri çıkar
  const t = [];
  const d = [];
  for (let i = 0; i < degerler.length; i++) {
    if (degerler[i] !== null) {
      t.push(zamanlarSn[i]);
      d.push(degerler[i]);
    }
  }

  // 1. Ortalamayı çıkar (jiroskobun küçük sabit kayması da böylece gider)
  const ort = ortalama(d);
  const merkezli = d.map((v) => v - ort);
  const sapma = standartSapma(merkezli);

  // 2. Yukarı sıfır geçişleri
  const gecisler = yukariSifirGecisleri(t, merkezli, HISTEREZIS_ORANI * sapma);

  if (gecisler.length < 3) {
    uyarilar.push('Yeterli salınım bulunamadı. Sarkaç salınırken kayıt yapıldığından emin olun.');
    return { gecerliMi: false, gecisler, uyarilar };
  }

  // Tek tek periyotlar: ardışık geçişler arasındaki süreler
  const periyotlar = [];
  for (let k = 1; k < gecisler.length; k++) periyotlar.push(gecisler[k] - gecisler[k - 1]);

  // 3. Geçiş anlarına doğru uydur: eğim = periyot
  const siraNumaralari = gecisler.map((_, k) => k);
  const dogru = dogruUydur(siraNumaralari, gecisler);
  const periyotSn = dogru.egim;
  const periyotBelirsizligiSn = dogru.egimBelirsizligi;

  // Tek tek periyotların ne kadar dağınık olduğu (oran)
  const yayilimOrani = standartSapma(periyotlar) / periyotSn;

  if (periyotlar.length < EN_AZ_SALINIM) {
    uyarilar.push(`Yalnızca ${periyotlar.length} salınım sayıldı; güvenilir sonuç için en az ${EN_AZ_SALINIM} gerekir. Kaydı uzatın.`);
  }
  if (yayilimOrani > EN_FAZLA_PERIYOT_YAYILIMI) {
    uyarilar.push(`Tek tek periyotlar birbirinden %${(yayilimOrani * 100).toFixed(1)} kadar farklı; salınım düzensiz olabilir (sarkaç çarptı mı, telefon döndü mü?).`);
  }

  return {
    gecerliMi: true,
    gecisler,
    periyotlar,
    salinimSayisi: periyotlar.length,
    periyotSn,
    periyotBelirsizligiSn,
    yayilimOrani,
    // Sinüs biçimli bir sinyalde tepe değeri = √2 × standart sapma
    tepeDegeri: Math.SQRT2 * sapma,
    uyarilar,
  };
}

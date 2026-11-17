// js/analiz/ornekleme.js
// Sensörden gelen örneklerin zamanlamasını inceler: saniyede kaç ölçüm geldi, aralarında boşluk var mı?
// Sarkaç periyodunu örneklerin zaman damgalarından hesaplayacağımız için, zamanlama düzensizse
// bunu önceden bilmemiz gerekir.

import { ortalama, ortanca } from './istatistik.js';

// Bu süreden uzun aralıklar "boşluk" sayılır.
// Neden 50 ms? 60 Hz'de iki ölçüm arası normalde ~16,7 ms'dir. 50 ms'lik bir aralık,
// arada en az 2 ölçümün kaybolduğu anlamına gelir.
export const BOSLUK_ESIGI_MS = 50;

// Saniyede bundan az ölçüm gelirse uyarı verilir.
// Neden 30 Hz? Lisede kullanılan sarkaçların periyodu yaklaşık 1–2 saniyedir;
// 30 Hz ile bir salınımda en az 30 ölçüm olur, salınımın şekli rahatça görülür.
export const EN_DUSUK_HZ = 30;

// Ardışık zaman damgaları arasındaki farkları (ms) döndürür.
// Örnek: [0, 10, 30] → [10, 20]
export function araliklariHesapla(zamanlar) {
  const araliklar = [];
  for (let i = 1; i < zamanlar.length; i++) {
    araliklar.push(zamanlar[i] - zamanlar[i - 1]);
  }
  return araliklar;
}

// Zaman damgası listesinden (ms) bir örnekleme raporu hazırlar.
export function orneklemeRaporu(zamanlar) {
  const uyarilar = [];

  if (zamanlar.length < 2) {
    uyarilar.push('Yeterli veri gelmedi (en az 2 ölçüm gerekir).');
    return { yeterliVeriVar: false, ornekSayisi: zamanlar.length, uyarilar };
  }

  const araliklar = araliklariHesapla(zamanlar);
  const ilkZaman = zamanlar[0];
  const sureSn = (zamanlar[zamanlar.length - 1] - ilkZaman) / 1000;

  if (sureSn <= 0) {
    uyarilar.push('Bütün ölçümler aynı anda gelmiş görünüyor; zaman bilgisi kullanılamaz.');
    return { yeterliVeriVar: false, ornekSayisi: zamanlar.length, uyarilar };
  }

  // Ortalama hız: (ölçüm sayısı - 1) aralık, sureSn saniyeye yayılmış.
  const ortalamaHz = (zamanlar.length - 1) / sureSn;

  // Uzun boşlukları, kaydın başından kaçıncı saniyede olduklarıyla birlikte listele.
  const bosluklar = [];
  araliklar.forEach((aralik, i) => {
    if (aralik > BOSLUK_ESIGI_MS) {
      bosluklar.push({
        baslangicSn: (zamanlar[i] - ilkZaman) / 1000, // boşluktan önceki son ölçümün zamanı
        sureMs: aralik,
      });
    }
  });

  if (ortalamaHz < EN_DUSUK_HZ) {
    uyarilar.push(`Saniyede ortalama ${ortalamaHz.toFixed(1)} ölçüm geldi; en az ${EN_DUSUK_HZ} gerekir.`);
  }
  if (bosluklar.length > 0) {
    uyarilar.push(`${bosluklar.length} kez ${BOSLUK_ESIGI_MS} ms'den uzun boşluk oldu. Bu anlarda ölçüm yok.`);
  }

  return {
    yeterliVeriVar: true,
    ornekSayisi: zamanlar.length,
    sureSn,
    ortalamaHz,
    ortalamaAralikMs: ortalama(araliklar),
    ortancaAralikMs: ortanca(araliklar),
    enKisaAralikMs: Math.min(...araliklar),
    enUzunAralikMs: Math.max(...araliklar),
    bosluklar,
    uyarilar,
  };
}

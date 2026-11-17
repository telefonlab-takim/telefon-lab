// js/analiz/periyot.js
// Salınan bir sinyalden periyodu bulur.
//
// Yöntem (adım adım):
//   0. (sarkacPeriyoduBul) Sinyali hareketli ortalamayla yumuşat, en çok salınan ekseni seç.
//   1. Sinyalin ortalamasını çıkar → sinyal sıfır etrafında salınır.
//   2. Sinyalin aşağıdan yukarı doğru sıfırı geçtiği anları bul ("yukarı sıfır geçişleri").
//      Bir periyotta tam bir tane yukarı geçiş olur.
//   3. Birbirine benzeyen periyotların en uzun kesintisiz bölümünü seç; düzensiz kısımları at.
//   4. Geçiş anlarını sıra numarasına (0, 1, 2, ...) karşı düşün: tₖ = t₀ + k · T
//      Bu bir doğrudur ve eğimi periyottur (T). En uygun doğruyu çizip eğimi okuruz.
//
// Saf fonksiyonlardır; ekrana ve sensöre dokunmazlar.

import { ortalama, ortanca, standartSapma, dogruUydur } from './istatistik.js';

// En az bu kadar periyot sayılmazsa sonuç güvenilir sayılmaz (uyarı verilir).
export const EN_AZ_SALINIM = 5;

// Gürültü yüzünden sıfır çevresinde titreyen sinyal, sahte geçişler üretir.
// Bunu önlemek için bir "eşik bandı" kullanıyoruz: sinyal önce -esik'in altına inmeli, sonra +esik'in
// üstüne çıkmalı; ancak o zaman bir yukarı geçiş sayılır. (Bu yönteme histerezis denir.)
// Eşik = HISTEREZIS_ORANI × sinyalin standart sapması
export const HISTEREZIS_ORANI = 0.3;

// Tek tek periyotlar ortalamadan bundan fazla (oran olarak) saparsa "düzensiz salınım" uyarısı verilir.
export const EN_FAZLA_PERIYOT_YAYILIMI = 0.05; // %5

// Bir periyot, ortanca periyottan bundan fazla (oran olarak) farklıysa "düzensiz" sayılır ve
// hesaba katılmaz. %20: gerçek sarkaçta ardışık periyotlar %1–2 bile farklı olmaz; %20 yalnızca
// gerçekten bozuk (sahte geçişten doğan) periyotları ayıklar.
export const TUTARLILIK_PAYI = 0.2;

// Düzenli bölüm kaydın bu oranından kısaysa uyarı verilir.
export const EN_AZ_KULLANILAN_ORAN = 0.5;

// Hareketli ortalama penceresi (s). Sarkaç periyotları 0,6 s'den uzun olduğundan 0,15 s'lik pencere
// salınımı neredeyse hiç küçültmez, ama telefonun ip ucundaki hızlı titreşimlerini (≥ 5 Hz) bastırır.
export const YUMUSATMA_PENCERESI_SN = 0.15;

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
  const tumGecisler = yukariSifirGecisleri(t, merkezli, HISTEREZIS_ORANI * sapma);

  if (tumGecisler.length < 3) {
    uyarilar.push('Yeterli salınım bulunamadı. Sarkaç salınırken kayıt yapıldığından emin olun.');
    return { gecerliMi: false, gecisler: tumGecisler, uyarilar };
  }

  // Tek tek periyotlar: ardışık geçişler arasındaki süreler
  const tumPeriyotlar = [];
  for (let k = 1; k < tumGecisler.length; k++) tumPeriyotlar.push(tumGecisler[k] - tumGecisler[k - 1]);

  // 3. Düzensiz kısımları ayıkla: birbirine benzeyen periyotların oluşturduğu en uzun kesintisiz bölümü kullan.
  //    (Ör. telefon bırakıldıktan sonra ilk saniyelerde hızlı titreşirse sahte geçişler oluşur; bunlar atılır.)
  const bolum = enUzunTutarliBolum(tumPeriyotlar);
  if (bolum.adet < 2) {
    uyarilar.push('Düzenli bir salınım bulunamadı. Telefonun dönmeden, tek düzlemde salındığından emin olun.');
    return { gecerliMi: false, gecisler: tumGecisler, uyarilar };
  }
  const periyotlar = tumPeriyotlar.slice(bolum.baslangic, bolum.baslangic + bolum.adet);
  const gecisler = tumGecisler.slice(bolum.baslangic, bolum.baslangic + bolum.adet + 1);
  const atilanPeriyotSayisi = tumPeriyotlar.length - bolum.adet;

  // 4. Geçiş anlarına doğru uydur: eğim = periyot
  const siraNumaralari = gecisler.map((_, k) => k);
  const dogru = dogruUydur(siraNumaralari, gecisler);
  const periyotSn = dogru.egim;
  const periyotBelirsizligiSn = dogru.egimBelirsizligi;

  // Tek tek periyotların ne kadar dağınık olduğu (oran)
  const yayilimOrani = standartSapma(periyotlar) / periyotSn;

  // Kullanılan bölümün kaydın ne kadarını kapladığı
  const kullanilanBaslangicSn = gecisler[0];
  const kullanilanBitisSn = gecisler[gecisler.length - 1];
  const kullanilanOran = (kullanilanBitisSn - kullanilanBaslangicSn) / (t[t.length - 1] - t[0]);

  if (periyotlar.length < EN_AZ_SALINIM) {
    uyarilar.push(`Yalnızca ${periyotlar.length} düzenli salınım sayıldı; güvenilir sonuç için en az ${EN_AZ_SALINIM} gerekir. Kaydı uzatın.`);
  }
  if (yayilimOrani > EN_FAZLA_PERIYOT_YAYILIMI) {
    uyarilar.push(`Tek tek periyotlar birbirinden %${yuzdeYaz(yayilimOrani)} kadar farklı; salınım düzensiz olabilir (sarkaç çarptı mı, telefon döndü mü?).`);
  }
  if (kullanilanOran < EN_AZ_KULLANILAN_ORAN) {
    uyarilar.push(`Kaydın yalnızca %${yuzdeYaz(kullanilanOran)} kadarı düzenli salınım içeriyor; geri kalanı hesaba katılmadı. Salınım çoğunlukla düzensizdi.`);
  }

  // Bırakma açısı tahmini için tepe değeri: yalnızca kullanılan bölümdeki sinyalden
  // (düzensiz başlangıç sinyali büyütüp açıyı olduğundan büyük gösterebilir).
  // Sinüs biçimli bir sinyalde tepe değeri = √2 × standart sapma
  const bolumDegerleri = merkezli.filter((_, i) => t[i] >= kullanilanBaslangicSn && t[i] <= kullanilanBitisSn);

  return {
    gecerliMi: true,
    gecisler,
    periyotlar,
    salinimSayisi: periyotlar.length,
    atilanPeriyotSayisi,
    kullanilanBaslangicSn,
    kullanilanBitisSn,
    periyotSn,
    periyotBelirsizligiSn,
    yayilimOrani,
    tepeDegeri: Math.SQRT2 * standartSapma(bolumDegerleri),
    uyarilar,
    // Sonuç güvenilir mi? (g hesabı bu bilgiyi kullanıcıya iletir)
    guvenilirMi: uyarilar.length === 0,
  };
}

// Oranı yüzde olarak Türkçe yazar: 0,539 → "53,9"
function yuzdeYaz(oran) {
  return (oran * 100).toFixed(1).replace('.', ',');
}

// Birbirine benzeyen periyotların oluşturduğu en uzun kesintisiz bölümü bulur.
// "Benzer": ortanca periyottan en fazla TUTARLILIK_PAYI (ör. %20) farklı.
// Dönen değer: { baslangic, adet, ortancaSn }  → periyotlar[baslangic … baslangic+adet-1]
export function enUzunTutarliBolum(periyotlar, pay = TUTARLILIK_PAYI) {
  const ortancaSn = ortanca(periyotlar);
  let enIyiBaslangic = 0;
  let enIyiAdet = 0;
  let baslangic = 0; // şu anki kesintisiz bölümün başı

  for (let i = 0; i <= periyotlar.length; i++) {
    const benzerMi = i < periyotlar.length && Math.abs(periyotlar[i] - ortancaSn) <= pay * ortancaSn;
    if (!benzerMi) {
      // Bölüm burada bitti; şimdiye kadarkilerin en uzunu mu?
      if (i - baslangic > enIyiAdet) {
        enIyiAdet = i - baslangic;
        enIyiBaslangic = baslangic;
      }
      baslangic = i + 1;
    }
  }
  return { baslangic: enIyiBaslangic, adet: enIyiAdet, ortancaSn };
}

// Hareketli ortalama: her noktayı, zamanı kendisinden en fazla pencereSn/2 uzak olan noktaların
// ortalamasıyla değiştirir. Hızlı titreşimleri (gürültü, telefonun ip ucunda titremesi) bastırır.
// Pencere noktanın iki yanına eşit uzandığı için sarkacın yavaş salınımının sıfır geçiş anları kaymaz.
export function hareketliOrtalama(zamanlarSn, degerler, pencereSn = YUMUSATMA_PENCERESI_SN) {
  const yarim = pencereSn / 2;
  const sonuc = [];
  for (let i = 0; i < degerler.length; i++) {
    if (degerler[i] === null) {
      sonuc.push(null);
      continue;
    }
    let toplam = 0;
    let adet = 0;
    // Geriye doğru
    for (let j = i; j >= 0 && zamanlarSn[i] - zamanlarSn[j] <= yarim; j--) {
      if (degerler[j] !== null) { toplam += degerler[j]; adet++; }
    }
    // İleriye doğru (i'yi ikinci kez saymamak için i+1'den başla)
    for (let j = i + 1; j < degerler.length && zamanlarSn[j] - zamanlarSn[i] <= yarim; j++) {
      if (degerler[j] !== null) { toplam += degerler[j]; adet++; }
    }
    sonuc.push(toplam / adet);
  }
  return sonuc;
}

// Sarkaç için tam akış: 3 ekseni yumuşat → en çok salınanı seç → periyodu bul.
// seriler: [{ ad, degerler }]  Dönen değer: periyotBul sonucu + secilenEksen (ad) ; eksen yoksa null.
export function sarkacPeriyoduBul(zamanlarSn, seriler) {
  const yumusak = seriler.map((s) => ({ ad: s.ad, degerler: hareketliOrtalama(zamanlarSn, s.degerler) }));
  const secilen = enCokSalinanSeri(yumusak);
  if (!secilen) return null;
  return { ...periyotBul(zamanlarSn, secilen.degerler), secilenEksen: secilen.ad };
}

// js/analiz/serbest-dusme.js
// Serbest düşme deneyinin hesapları: ivmeölçer verisinden düşüşleri bulmak, düşme süresini ve
// yer çekimi ivmesini (g) belirsizliğiyle hesaplamak.
//
// Fikir (bkz. KARAR_GUNLUGU K-012):
//   İvmeölçer "yer çekimi dahil ivmeyi" ölçer. Telefon elde ya da masada dururken büyüklüğü ≈ 9,8 m/s²'dir.
//   Serbest düşerken telefon ve içindeki sensör birlikte düşer, sensör hiçbir kuvvet hissetmez:
//   ölçülen ivmenin büyüklüğü ≈ 0 olur ("ağırlıksızlık"). Yastığa değince büyüklük birden artar.
//   Büyüklüğün düşük kaldığı sürenin başı bırakma, sonu yastığa değme anıdır. Aradaki süre düşme süresidir (t).
//
//   Hareket denklemi (ilk hız 0):  h = ½·g·t²   →   g = 2h / t²
//
// Saf fonksiyonlardır; ekrana ve sensöre dokunmazlar.

import { ortalama, standartSapma } from './istatistik.js';
import { KABUL_EDILEN_G } from './sarkac-hesap.js';

// Düşüşün başı ve sonu, ivme büyüklüğünün bu eşiği geçtiği an sayılır: g'nin yarısı ≈ 4,9 m/s².
// Neden yarısı? El açılırken telefonu tutan kuvvet bir anda değil, birkaç on milisaniyede sıfıra iner.
// Bu kuvvet düzgünce azalıyorsa, telefonun hareketi tam bu geçişin ORTASINDA bırakılmış bir cisimle aynıdır;
// geçişin ortası da ivmenin yarıya indiği andır. Yastığa değme için de aynı düşünce geçerlidir.
export const DUSUS_ESIGI = KABUL_EDILEN_G / 2; // m/s²

// Gerçek bir serbest düşmede ivme 0'a çok yaklaşır. Düşük bölümün en küçük değeri bunun altına inmemişse
// bu bir düşüş değil, büyük olasılıkla elin hızlı bir aşağı hareketidir; sayılmaz.
export const DERIN_ESIK = 2; // m/s²

// Bundan kısa "düşüşler" sayılmaz (0,1 s ≈ 5 cm'lik düşüş; elin titremesi bu kadar sürebilir).
export const EN_KISA_DUSUS_SN = 0.1;

// Bundan uzun düşük bölümler serbest düşme sayılmaz (0,8 s ≈ 3 m): ya telefon havaya atıldı
// ya da başka bir şey oldu. Bu deneyde 1 m'den yüksekten bırakmak zaten önerilmiyor.
export const EN_UZUN_DUSUS_SN = 0.8;

// Düşme süresi bundan kısaysa uyarılır (0,2 s ≈ 20 cm): süre çok kısa olduğundan
// ölçüm aralığından (≈17 ms) gelen belirsizlik sonucu çok büyütür.
export const KISA_DUSUS_UYARI_SN = 0.2;

// Güvenilir ortalama için önerilen en az düşüş sayısı
export const EN_AZ_DUSUS = 3;

// Tek tek düşme süreleri ortalamadan bundan fazla (oran olarak) dağınıksa uyarı verilir.
// Aynı yükseklikten bırakılan telefonun süreleri birbirine çok yakın olmalıdır.
export const EN_FAZLA_SURE_YAYILIMI = 0.05; // %5

// Her örnek için ivmenin büyüklüğü: |a| = √(ax² + ay² + az²)   (m/s²)
// Telefonun nasıl durduğundan bağımsızdır; bu yüzden telefonun yönü önemli değil.
// Eksenlerden biri yoksa o örnek için null döner.
export function ivmeBuyuklukleri(ornekler) {
  return ornekler.map((o) => {
    if (o.ax === null || o.ay === null || o.az === null) return null;
    return Math.sqrt(o.ax ** 2 + o.ay ** 2 + o.az ** 2);
  });
}

// İki ölçüm arasında değerin eşiği geçtiği anı doğrusal ara değer bulmayla (interpolasyon) hesaplar.
// (t1, v1) ve (t2, v2) arasına bir doğru çizilir; doğrunun eşiği kestiği zaman döner.
// Böylece geçiş anı, ölçüm aralığından (≈17 ms) daha hassas bulunur.
export function esikGecisZamani(t1, v1, t2, v2, esik) {
  return t1 + ((esik - v1) * (t2 - t1)) / (v2 - v1);
}

// Kayıttaki düşüşleri bulur.
//   zamanlarSn : her ölçümün zamanı (s)
//   buyuklukler: her ölçümdeki ivme büyüklüğü (m/s², null olabilir)
// Dönen değer: { dususler, uyarilar }
//   dususler: [{ baslangicSn, bitisSn, sureSn, sureBelirsizligiSn, enDusukIvme }]
export function dususleriBul(zamanlarSn, buyuklukler) {
  const uyarilar = [];

  // Değeri olmayan ölçümleri çıkar
  const t = [];
  const a = [];
  for (let i = 0; i < buyuklukler.length; i++) {
    if (buyuklukler[i] !== null) {
      t.push(zamanlarSn[i]);
      a.push(buyuklukler[i]);
    }
  }

  // 1. İvmenin eşiğin altında kaldığı kesintisiz bölümleri bul: [ilk, son] (ölçüm sıra numaraları)
  const bolumler = [];
  let ilk = null;
  for (let i = 0; i < a.length; i++) {
    if (a[i] < DUSUS_ESIGI) {
      if (ilk === null) ilk = i;
    } else if (ilk !== null) {
      bolumler.push({ ilk, son: i - 1 });
      ilk = null;
    }
  }
  if (ilk !== null) bolumler.push({ ilk, son: a.length - 1 });

  // 2. Her bölümü incele
  const dususler = [];
  let kesikSayisi = 0;
  let uzunSayisi = 0;
  for (const { ilk: i, son: j } of bolumler) {
    // Kaydın en başında ya da en sonunda kesilen bölümün başı/sonu bilinmiyor
    if (i === 0 || j === a.length - 1) {
      kesikSayisi++;
      continue;
    }

    // Bölümün en düşük ivmesi: gerçekten serbest düşme mi?
    let enDusukIvme = Infinity;
    for (let k = i; k <= j; k++) enDusukIvme = Math.min(enDusukIvme, a[k]);
    if (enDusukIvme >= DERIN_ESIK) continue;

    // Başlangıç: (i-1) eşiğin üstünde, i altında. Bitiş: j altında, (j+1) üstünde.
    const baslangicSn = esikGecisZamani(t[i - 1], a[i - 1], t[i], a[i], DUSUS_ESIGI);
    const bitisSn = esikGecisZamani(t[j], a[j], t[j + 1], a[j + 1], DUSUS_ESIGI);
    const sureSn = bitisSn - baslangicSn;

    if (sureSn < EN_KISA_DUSUS_SN) continue; // elin titremesi
    if (sureSn > EN_UZUN_DUSUS_SN) {
      uzunSayisi++;
      continue;
    }

    // Süre belirsizliği: Ara değer bulma hassastır ama ivmenin iki ölçüm arasında nasıl değiştiğini
    // bilemeyiz. Bu yüzden her uçta, gerçek geçişin o aralığın herhangi bir yerinde olabileceğini kabul
    // ediyoruz: uç belirsizliği = aralığın yarısı (60 Hz'de ≈ 8,3 ms).
    // İki uç birbirinden bağımsız olduğundan kareleri toplanır: Δt = √(Δbaş² + Δson²)  (60 Hz'de ≈ 12 ms)
    const basBelirsizligi = (t[i] - t[i - 1]) / 2;
    const sonBelirsizligi = (t[j + 1] - t[j]) / 2;
    const sureBelirsizligiSn = Math.sqrt(basBelirsizligi ** 2 + sonBelirsizligi ** 2);

    dususler.push({ baslangicSn, bitisSn, sureSn, sureBelirsizligiSn, enDusukIvme });
  }

  if (kesikSayisi > 0) {
    uyarilar.push(`${kesikSayisi} düşüş kaydın başında ya da sonunda kesildiği için sayılmadı. Kayıt sürerken bırakın.`);
  }
  if (uzunSayisi > 0) {
    uyarilar.push(
      `${uzunSayisi} kez ivme ${sayi1(EN_UZUN_DUSUS_SN)} saniyeden uzun süre düşük kaldı; serbest düşme sayılmadı ` +
        '(telefon havaya mı atıldı?).'
    );
  }
  if (dususler.length === 0) {
    uyarilar.push('Hiç düşüş bulunamadı. Telefonu kayıt sürerken, elinizden doğrudan bırakın.');
  }

  return { dususler, uyarilar };
}

// Bütün düşüşlerden ortalama düşme süresini ve belirsizliğini hesaplar.
// Dönen değer: { gecerliMi, dususSayisi, sureSn, sureBelirsizligiSn, yayilimOrani, uyarilar, guvenilirMi }
//
// Belirsizlik iki yoldan tahmin edilir; BÜYÜK olan kullanılır (küçüğünü seçmek sonucu olduğundan iyi gösterir):
//   a) Dağılımdan:      s / √n          (s: tek tek sürelerin standart sapması)
//   b) Ölçüm aralığından: Δt_ort / √n   (Δt_ort: tek düşüşün ortalama süre belirsizliği)
// n düşüşün ortalaması alındığında rastgele hatalar kısmen birbirini götürür; bu yüzden √n'e bölünür.
export function dususSuresiOzeti(dususler) {
  const uyarilar = [];
  const n = dususler.length;
  if (n === 0) {
    return { gecerliMi: false, dususSayisi: 0, uyarilar: ['Düşüş olmadığı için süre hesaplanamadı.'], guvenilirMi: false };
  }

  const sureler = dususler.map((d) => d.sureSn);
  const sureSn = ortalama(sureler);
  const cozunurlukBelirsizligi = ortalama(dususler.map((d) => d.sureBelirsizligiSn)) / Math.sqrt(n);
  const sapma = n >= 2 ? standartSapma(sureler) : NaN;
  const dagilimBelirsizligi = n >= 2 ? sapma / Math.sqrt(n) : 0;
  const sureBelirsizligiSn = Math.max(cozunurlukBelirsizligi, dagilimBelirsizligi);
  const yayilimOrani = n >= 2 ? sapma / sureSn : NaN;

  if (n < EN_AZ_DUSUS) {
    uyarilar.push(`Yalnızca ${n} düşüş bulundu; güvenilir ortalama için en az ${EN_AZ_DUSUS} düşüş yapın.`);
  }
  if (yayilimOrani > EN_FAZLA_SURE_YAYILIMI) {
    uyarilar.push(
      `Tek tek düşme süreleri birbirinden %${sayi1(yayilimOrani * 100)} kadar farklı. ` +
        'Telefon her seferinde aynı yükseklikten mi bırakıldı? Elle itildi ya da döndü mü?'
    );
  }
  if (sureSn < KISA_DUSUS_UYARI_SN) {
    uyarilar.push(
      `Düşme süresi çok kısa (${sayi3(sureSn)} s). Ölçüm aralığından gelen belirsizlik sonucu çok büyütür; ` +
        'yüksekliği biraz artırın (ör. 50–80 cm).'
    );
  }

  return {
    gecerliMi: true,
    dususSayisi: n,
    sureSn,
    sureBelirsizligiSn,
    yayilimOrani,
    uyarilar,
    guvenilirMi: uyarilar.length === 0,
  };
}

// Yer çekimi ivmesini ve belirsizliğini hesaplar.
//
// Fizik:  h = ½·g·t²   →   g = 2h / t²
//
// Belirsizlik (hata yayılımı): göreli belirsizliklerin kareleri toplanır. t formülde karesiyle geçtiği için
// onun göreli belirsizliği 2 ile çarpılır:
//   Δg / g = √( (Δh/h)² + (2·Δt/t)² )
//
// Girdi birimleri: metre ve saniye. Sonuç: m/s².
export function serbestDusmeG({ yukseklikM, yukseklikBelirsizligiM, sureSn, sureBelirsizligiSn }) {
  const g = (2 * yukseklikM) / sureSn ** 2;

  const yukseklikGoreli = yukseklikBelirsizligiM / yukseklikM; // Δh / h
  const sureGoreli = (2 * sureBelirsizligiSn) / sureSn;        // 2·Δt / t
  const toplamGoreli = Math.sqrt(yukseklikGoreli ** 2 + sureGoreli ** 2);

  // Belirsizliğin (karesinin) yüzde kaçı hangi ölçümden geliyor?
  const toplamKare = toplamGoreli ** 2;
  return {
    g,
    gBelirsizligi: g * toplamGoreli,
    yukseklikGoreli,
    sureGoreli,
    yukseklikPayi: toplamKare > 0 ? yukseklikGoreli ** 2 / toplamKare : 0,
    surePayi: toplamKare > 0 ? sureGoreli ** 2 / toplamKare : 0,
  };
}

// Bir yükseklikten düşmenin beklenen süresi:  t = √(2h / g)   (h: m, sonuç: s)
// Öğrenciye "50 cm'den düşüş yaklaşık 0,32 s sürer" gibi bilgi vermek için.
export function beklenenSure(yukseklikM, g = KABUL_EDILEN_G) {
  return Math.sqrt((2 * yukseklikM) / g);
}

// Sayıyı Türkçe ondalıkla yazar: 0,8 → "0,8"
function sayi1(deger) {
  return deger.toFixed(1).replace('.', ',');
}
function sayi3(deger) {
  return deger.toFixed(3).replace('.', ',');
}

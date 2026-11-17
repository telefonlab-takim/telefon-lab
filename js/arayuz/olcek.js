// js/arayuz/olcek.js
// Grafik eksenlerine konacak "güzel" çizgi değerlerini hesaplar.
// Örnek: -37 ile 42 arası için -20, 0, 20, 40 (−37,1  −21,3 ... gibi okunması zor değerler yerine).
// Saf fonksiyonlardır; ekrana dokunmazlar, test edilebilirler.

// Aralığı yaklaşık hedefAdet parçaya bölen, 1, 2 veya 5 × 10ⁿ biçiminde bir adım seçer.
// Örnek: aralik 79, hedefAdet 5 → kaba adım 15,8 → 20
export function guzelAdim(aralik, hedefAdet) {
  const kabaAdim = aralik / hedefAdet;
  const onunKuvveti = Math.pow(10, Math.floor(Math.log10(kabaAdim))); // ör. 15,8 → 10
  const oran = kabaAdim / onunKuvveti; // 1 ile 10 arasında bir sayı
  let carpan;
  if (oran <= 1) carpan = 1;
  else if (oran <= 2) carpan = 2;
  else if (oran <= 5) carpan = 5;
  else carpan = 10;
  return carpan * onunKuvveti;
}

// min ile max arasına düşen güzel çizgi değerlerinin listesini verir.
export function eksenCizgileri(min, max, hedefAdet = 5) {
  if (!(max > min)) return [min];
  const adim = guzelAdim(max - min, hedefAdet);
  const ilk = Math.ceil(min / adim) * adim;
  const cizgiler = [];
  for (let i = 0; ilk + i * adim <= max + adim * 1e-9; i++) {
    // toPrecision: 0,1 + 0,2 = 0,30000000000000004 gibi ondalık kırıntılarını temizler
    cizgiler.push(Number((ilk + i * adim).toPrecision(12)));
  }
  return cizgiler;
}

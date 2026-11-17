// js/arayuz/bicim.js
// Sayıları ekranda Türkçe biçimde göstermek için yardımcılar.
// Türkçede ondalık ayracı virgül, binlik ayracı noktadır: 1067,5 → "1.067,5"

// Kullanıcının yazdığı sayıyı okur. Türkçe klavyede ondalık ayracı virgül olduğu için
// hem "48,7" hem "48.7" kabul edilir. Sayı değilse NaN döner.
export function sayiOku(metin) {
  const temiz = String(metin).trim().replace(',', '.');
  if (temiz === '' || !/^[-+]?\d*\.?\d+$/.test(temiz)) return NaN;
  return Number(temiz);
}

// Bir ölçümü belirsizliğiyle birlikte yazar: "1,400 ± 0,002 s"
// Kural: Belirsizlik 1 anlamlı basamağa yuvarlanır, ölçüm de aynı ondalık basamağa kadar yazılır.
// İstisna: Belirsizliğin ilk rakamı 1 ise 2 anlamlı basamak tutulur (0,10 ile 0,15 farkı büyüktür;
// 1 basamakta ikisi de "0,1" olurdu).
// (Belirsizliğin ötesindeki basamaklar anlamsızdır; yazmak, olduğundan hassas ölçmüşüz gibi gösterir.)
export function belirsizlikleYaz(deger, belirsizlik, birim = '') {
  const sonEk = birim ? ' ' + birim : '';
  if (!Number.isFinite(belirsizlik) || belirsizlik <= 0) {
    return sayiYaz(deger, 3) + ' ± ?' + sonEk;
  }
  // Ör. belirsizlik 0,0023 → log10 ≈ -2,6 → aşağı yuvarla: -3 → 3 ondalık basamak
  const us = Math.floor(Math.log10(belirsizlik));
  const ilkRakam = Math.floor(belirsizlik / 10 ** us); // 0,0023 → 2 ; 0,15 → 1
  let basamak = -us + (ilkRakam === 1 ? 1 : 0);
  basamak = Math.min(6, Math.max(0, basamak));
  return sayiYaz(deger, basamak) + ' ± ' + sayiYaz(belirsizlik, basamak) + sonEk;
}

// Sayıyı sabit basamakla yazar. Değer yoksa (null) "yok" yazar.
export function sayiYaz(deger, basamak = 2) {
  if (deger === null || deger === undefined || Number.isNaN(deger)) return 'yok';
  return deger.toLocaleString('tr-TR', {
    minimumFractionDigits: basamak,
    maximumFractionDigits: basamak,
  });
}

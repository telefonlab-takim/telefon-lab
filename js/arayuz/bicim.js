// js/arayuz/bicim.js
// Sayıları ekranda Türkçe biçimde göstermek için yardımcılar.
// Türkçede ondalık ayracı virgül, binlik ayracı noktadır: 1067,5 → "1.067,5"

// Bir ölçümü belirsizliğiyle birlikte yazar: "1,400 ± 0,002 s"
// Kural: Belirsizlik 1 anlamlı basamağa yuvarlanır, ölçüm de aynı ondalık basamağa kadar yazılır.
// (Belirsizliğin ötesindeki basamaklar anlamsızdır; yazmak, olduğundan hassas ölçmüşüz gibi gösterir.)
export function belirsizlikleYaz(deger, belirsizlik, birim = '') {
  const sonEk = birim ? ' ' + birim : '';
  if (!Number.isFinite(belirsizlik) || belirsizlik <= 0) {
    return sayiYaz(deger, 3) + ' ± ?' + sonEk;
  }
  // Ör. belirsizlik 0,0023 → log10 ≈ -2,6 → aşağı yuvarla -3 → 3 ondalık basamak
  const basamak = Math.min(6, Math.max(0, -Math.floor(Math.log10(belirsizlik))));
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

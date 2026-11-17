// js/arayuz/bicim.js
// Sayıları ekranda Türkçe biçimde göstermek için yardımcılar.
// Türkçede ondalık ayracı virgül, binlik ayracı noktadır: 1067,5 → "1.067,5"

// Sayıyı sabit basamakla yazar. Değer yoksa (null) "yok" yazar.
export function sayiYaz(deger, basamak = 2) {
  if (deger === null || deger === undefined || Number.isNaN(deger)) return 'yok';
  return deger.toLocaleString('tr-TR', {
    minimumFractionDigits: basamak,
    maximumFractionDigits: basamak,
  });
}

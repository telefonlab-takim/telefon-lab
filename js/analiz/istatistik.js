// js/analiz/istatistik.js
// Temel istatistik fonksiyonları. Hepsi "saf" fonksiyondur:
// sadece aldıkları diziye bakarlar, ekrana ya da sensöre dokunmazlar, diziyi değiştirmezler.

// Aritmetik ortalama: değerlerin toplamı / değer sayısı
export function ortalama(degerler) {
  if (degerler.length === 0) return NaN;
  let toplam = 0;
  for (const deger of degerler) toplam += deger;
  return toplam / degerler.length;
}

// Ortanca (medyan): değerler küçükten büyüğe sıralanınca tam ortadaki değer.
// Değer sayısı çiftse ortadaki iki değerin ortalaması alınır.
// Ortalamadan farkı: tek bir aşırı değer (ör. 1 saniyelik boşluk) ortancayı neredeyse hiç etkilemez.
export function ortanca(degerler) {
  if (degerler.length === 0) return NaN;
  const sirali = [...degerler].sort((a, b) => a - b); // kopyası sıralanır, asıl dizi bozulmaz
  const orta = Math.floor(sirali.length / 2);
  if (sirali.length % 2 === 1) return sirali[orta];
  return (sirali[orta - 1] + sirali[orta]) / 2;
}

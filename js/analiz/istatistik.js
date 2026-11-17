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

// Standart sapma: değerlerin ortalamadan ortalama ne kadar uzaklaştığının ölçüsü.
//   s = √( Σ(xᵢ − x̄)² / (n − 1) )
// (n − 1) ile bölmek, örneklemden hesaplanan standart sapmanın olağan biçimidir.
export function standartSapma(degerler) {
  const n = degerler.length;
  if (n < 2) return NaN;
  const ort = ortalama(degerler);
  let kareToplami = 0;
  for (const deger of degerler) kareToplami += (deger - ort) ** 2;
  return Math.sqrt(kareToplami / (n - 1));
}

// En küçük kareler yöntemiyle (x, y) noktalarına en uygun doğruyu bulur: y = kesisim + egim · x
// Ayrıca eğimin belirsizliğini verir: noktalar doğrudan ne kadar saparsa eğim o kadar belirsizdir.
//   egim  = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²
//   s²    = Σ(artık²) / (n − 2)          (artık = noktanın doğrudan dikey uzaklığı)
//   Δegim = √( s² / Σ(x − x̄)² )
// En az 3 nokta gerekir (2 noktadan her zaman tam bir doğru geçer, sapma ölçülemez).
export function dogruUydur(x, y) {
  const n = x.length;
  const xOrt = ortalama(x);
  const yOrt = ortalama(y);
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (x[i] - xOrt) ** 2;
    sxy += (x[i] - xOrt) * (y[i] - yOrt);
  }
  const egim = sxy / sxx;
  const kesisim = yOrt - egim * xOrt;

  let artikKareToplami = 0;
  for (let i = 0; i < n; i++) {
    artikKareToplami += (y[i] - (kesisim + egim * x[i])) ** 2;
  }
  const egimBelirsizligi = n >= 3 ? Math.sqrt(artikKareToplami / (n - 2) / sxx) : NaN;

  return { egim, kesisim, egimBelirsizligi };
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

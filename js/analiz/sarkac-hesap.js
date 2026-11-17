// js/analiz/sarkac-hesap.js
// Sarkaca özel fizik hesapları: g ve belirsizliği, bırakma açısı, kabul edilen değerle karşılaştırma.

// Karşılaştırma için kabul edilen yer çekimi ivmesi (m/s²).
// Türkiye'de enlem ve yüksekliğe göre yaklaşık 9,79 – 9,81 arasındadır (İstanbul ≈ 9,80).
export const KABUL_EDILEN_G = 9.8;

// Ölçülen g, kabul edilen değerden belirsizliğinin bu katından fazla uzaksa "uyumsuz" sayılır.
// Neden 2? Rastgele hatalar için ölçümlerin yaklaşık %95'i ±2 belirsizlik içine düşer.
export const UYUM_SINIRI_KAT = 2;

// Yer çekimi ivmesini ve belirsizliğini hesaplar.
//
// Fizik:  T = 2π·√(L/g)   →  her iki taraf karesi alınıp g yalnız bırakılırsa  →   g = 4π²·L / T²
//
// Belirsizlik (hata yayılımı): Bağımsız ölçümlerin göreli belirsizlikleri kareleri toplanarak birleşir.
// T formülde karesiyle geçtiği için onun göreli belirsizliği 2 ile çarpılır:
//   Δg / g = √( (ΔL/L)² + (2·ΔT/T)² )
//
// Girdi birimleri: metre ve saniye. Sonuç: m/s².
export function gHesapla({ uzunlukM, uzunlukBelirsizligiM, periyotSn, periyotBelirsizligiSn }) {
  const g = (4 * Math.PI ** 2 * uzunlukM) / periyotSn ** 2;

  const uzunlukGoreli = uzunlukBelirsizligiM / uzunlukM;            // ΔL / L
  const periyotGoreli = (2 * periyotBelirsizligiSn) / periyotSn;     // 2·ΔT / T
  const toplamGoreli = Math.sqrt(uzunlukGoreli ** 2 + periyotGoreli ** 2);

  // Toplam belirsizliğin (karesinin) yüzde kaçı hangi ölçümden geliyor?
  // Öğrenciye "neyi daha dikkatli ölçmeliyim?" sorusunun cevabını verir.
  const toplamKare = toplamGoreli ** 2;
  const uzunlukPayi = toplamKare > 0 ? uzunlukGoreli ** 2 / toplamKare : 0;
  const periyotPayi = toplamKare > 0 ? periyotGoreli ** 2 / toplamKare : 0;

  return {
    g,
    gBelirsizligi: g * toplamGoreli,
    uzunlukGoreli,
    periyotGoreli,
    uzunlukPayi,
    periyotPayi,
  };
}

// Ölçülen değeri kabul edilen değerle karşılaştırır.
// farkKati: fark, belirsizliğin kaç katı?  (ör. 0,5 → çok iyi uyum; 3 → uyumsuz, sistematik hata olabilir)
export function kabulEdilenleKarsilastir(olculen, belirsizlik, kabulEdilen = KABUL_EDILEN_G) {
  const fark = olculen - kabulEdilen;
  const farkKati = belirsizlik > 0 ? Math.abs(fark) / belirsizlik : Infinity;
  return { fark, farkKati, uyumluMu: farkKati <= UYUM_SINIRI_KAT };
}

// Basit sarkaç formülü T = 2π·√(L/g) yalnızca küçük açılarda geçerlidir.
// Bu sınırın üstünde kullanıcıyı uyarıyoruz.
export const KUCUK_ACI_SINIRI_DERECE = 10;

// Sarkacın bırakıldığı açıyı (genlik, θ₀) jiroskop verisinden tahmin eder.
// Basit harmonik harekette açı θ(t) = θ₀ · sin(2πt / T) olduğundan,
// açısal hızın en büyük değeri  ω_max = θ₀ · 2π / T  olur. Buradan:
//   θ₀ = ω_max · T / (2π)
// tepeDonmeHizi: °/s, periyotSn: s  →  sonuç: derece
// Not: Telefon salınım düzlemine tam dik dönmüyorsa seçilen eksen hareketin bir kısmını görür;
// bu durumda açı biraz küçük tahmin edilir.
export function genlikAcisiTahmini(tepeDonmeHizi, periyotSn) {
  return (tepeDonmeHizi * periyotSn) / (2 * Math.PI);
}

// Büyük açıyla bırakılan sarkacın periyodu, küçük açı formülünün verdiğinden biraz uzundur:
//   T ≈ T₀ · (1 + θ₀² / 16)      (θ₀ radyan cinsinden)
// g = 4π²L / T² olduğundan, uzun ölçülen T, g'yi yaklaşık  θ₀² / 8  oranında KÜÇÜK hesaplatır.
// Dönen değer: g'deki göreli hata (ör. 0,02 = %2)
export function buyukAciGHatasi(aciDerece) {
  const aciRadyan = (aciDerece * Math.PI) / 180;
  return (aciRadyan * aciRadyan) / 8;
}

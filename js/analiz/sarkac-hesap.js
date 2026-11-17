// js/analiz/sarkac-hesap.js
// Sarkaca özel fizik hesapları. (g ve belirsizliği bir sonraki adımda buraya eklenecek.)

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

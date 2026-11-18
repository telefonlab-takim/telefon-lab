// js/surum.js
// Kodun sürüm etiketi. Her yayından önce değiştirilir (CLAUDE.md kuralı).
//
// Neden gerekli? Telefonun tarayıcısı dosyaların eski hâlini bir süre önbellekte tutabiliyor.
// Sayfanın altında "Sayfa" ve "Kod" sürümü yazdığı için, ekran görüntüsünden hangi kodun
// çalıştığını ve ikisinin uyuşup uyuşmadığını görebiliyoruz.
export const KOD_SURUMU = '2026-11-19.1';

// Sayfadaki <p id="surum"> elemanına kod sürümünü ekler.
export function surumuGoster() {
  const p = document.getElementById('surum');
  if (p) p.textContent += ` · Kod: ${KOD_SURUMU}`;
}

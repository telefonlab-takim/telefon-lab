// js/arayuz/grafik.js
// Zamana bağlı sinyalleri <canvas> üzerine çizgi grafiği olarak çizer.
// Dış kütüphane kullanmıyoruz: tarayıcının kendi 2B çizim aracı (Canvas 2D) yeterli.

import { eksenCizgileri } from './olcek.js';
import { sayiYaz } from './bicim.js';

// Çizim alanının kenarlarında eksen yazıları için bırakılan boşluk (piksel)
const KENAR = { sol: 44, sag: 10, ust: 10, alt: 26 };

// Renkleri CSS'ten okuyoruz; böylece karanlık modda renkler kendiliğinden değişir.
// CSS'te bulunamazsa (ör. tarayıcı stil dosyasının eski hâlini önbellekten kullanıyorsa) yedek renk kullanılır.
const YEDEK_RENKLER = {
  '--seri-1': '#1e88e5',
  '--seri-2': '#fb8c00',
  '--seri-3': '#43a047',
  '--cizgi': '#888888',
  '--soluk-yazi': '#888888',
  '--vurgu': '#1e88e5',
};
function cssRengi(degiskenAdi) {
  const renk = getComputedStyle(document.documentElement).getPropertyValue(degiskenAdi).trim();
  return renk || YEDEK_RENKLER[degiskenAdi] || '#888888';
}

// Grafiği çizer.
//   canvas    : <canvas> elemanı
//   zamanlarSn: her ölçümün zamanı (saniye), artan sırada
//   seriler   : [{ ad, degerler, renkDegiskeni }]  (degerler zamanlarSn ile aynı uzunlukta; null = ölçüm yok)
//   birim     : y ekseninin birimi (ör. '°/s')
//   isaretler : (isteğe bağlı) dikey kesikli çizgiyle işaretlenecek zamanlar (s), ör. sıfır geçişleri
export function grafikCiz(canvas, { zamanlarSn, seriler, birim, isaretler = [] }) {
  // 1) Tuvali hazırla. Telefon ekranlarında 1 CSS pikseli 2–3 gerçek piksel olduğundan,
  //    tuvali o oranda büyük tutuyoruz; yoksa çizgiler bulanık görünür.
  const oran = window.devicePixelRatio || 1;
  const genislik = canvas.clientWidth;
  const yukseklik = canvas.clientHeight;
  canvas.width = Math.round(genislik * oran);
  canvas.height = Math.round(yukseklik * oran);
  const c = canvas.getContext('2d');
  c.setTransform(oran, 0, 0, oran, 0, 0);
  c.clearRect(0, 0, genislik, yukseklik);
  c.font = '12px system-ui, sans-serif';

  // 2) Verinin aralığını bul
  const tMin = zamanlarSn[0];
  const tMax = zamanlarSn[zamanlarSn.length - 1];
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const seri of seriler) {
    for (const deger of seri.degerler) {
      if (deger === null) continue;
      if (deger < yMin) yMin = deger;
      if (deger > yMax) yMax = deger;
    }
  }
  if (yMin === Infinity || !(tMax > tMin)) {
    c.fillStyle = cssRengi('--soluk-yazi');
    c.fillText('Gösterilecek veri yok.', KENAR.sol, yukseklik / 2);
    return;
  }
  if (yMin === yMax) { yMin -= 1; yMax += 1; } // düz çizgi ise biraz aralık aç
  const pay = (yMax - yMin) * 0.05; // çizgiler kenara yapışmasın
  yMin -= pay;
  yMax += pay;

  // 3) Veri değerini ekrandaki piksel konumuna çeviren fonksiyonlar
  const alanGenislik = genislik - KENAR.sol - KENAR.sag;
  const alanYukseklik = yukseklik - KENAR.ust - KENAR.alt;
  const xPiksel = (t) => KENAR.sol + ((t - tMin) / (tMax - tMin)) * alanGenislik;
  // Canvas'ta y aşağı doğru artar; büyük değerler üstte olsun diye ters çeviriyoruz.
  const yPiksel = (v) => KENAR.ust + ((yMax - v) / (yMax - yMin)) * alanYukseklik;

  // 4) Izgara çizgileri ve eksen yazıları
  c.lineWidth = 1;
  c.strokeStyle = cssRengi('--cizgi');
  c.fillStyle = cssRengi('--soluk-yazi');

  c.textAlign = 'right';
  c.textBaseline = 'middle';
  for (const v of eksenCizgileri(yMin, yMax, 5)) {
    const y = yPiksel(v);
    c.beginPath();
    c.moveTo(KENAR.sol, y);
    c.lineTo(genislik - KENAR.sag, y);
    c.stroke();
    c.fillText(sayiYaz(v, v % 1 === 0 ? 0 : 1), KENAR.sol - 4, y);
  }

  c.textAlign = 'center';
  c.textBaseline = 'top';
  for (const t of eksenCizgileri(tMin, tMax, 6)) {
    const x = xPiksel(t);
    c.beginPath();
    c.moveTo(x, KENAR.ust);
    c.lineTo(x, yukseklik - KENAR.alt);
    c.stroke();
    c.fillText(sayiYaz(t, t % 1 === 0 ? 0 : 1) + ' s', x, yukseklik - KENAR.alt + 6);
  }

  // Birim yazısı (sol üst köşe)
  c.textAlign = 'left';
  c.fillText(birim, KENAR.sol + 4, KENAR.ust + 2);

  // İşaretler: kesikli dikey çizgiler
  if (isaretler.length > 0) {
    c.strokeStyle = cssRengi('--vurgu');
    c.setLineDash([4, 4]);
    for (const t of isaretler) {
      const x = xPiksel(t);
      c.beginPath();
      c.moveTo(x, KENAR.ust);
      c.lineTo(x, yukseklik - KENAR.alt);
      c.stroke();
    }
    c.setLineDash([]); // sonraki çizgiler düz olsun
  }

  // 5) Seriler: değerleri çizgiyle birleştir. Değer yoksa (null) çizgiyi kopar.
  c.lineWidth = 1.5;
  for (const seri of seriler) {
    c.strokeStyle = cssRengi(seri.renkDegiskeni);
    c.beginPath();
    let kalemKagitta = false;
    seri.degerler.forEach((deger, i) => {
      if (deger === null) {
        kalemKagitta = false;
        return;
      }
      const x = xPiksel(zamanlarSn[i]);
      const y = yPiksel(deger);
      if (kalemKagitta) c.lineTo(x, y);
      else c.moveTo(x, y);
      kalemKagitta = true;
    });
    c.stroke();
  }
}

// Grafiğin altına hangi rengin hangi seri olduğunu gösteren açıklama yazar.
export function aciklamaYaz(kutu, seriler) {
  kutu.replaceChildren();
  for (const seri of seriler) {
    const etiket = document.createElement('span');
    etiket.className = 'aciklama-etiketi';
    const nokta = document.createElement('span');
    nokta.className = 'aciklama-noktasi';
    nokta.style.background = `var(${seri.renkDegiskeni})`;
    etiket.append(nokta, seri.ad);
    kutu.appendChild(etiket);
  }
}

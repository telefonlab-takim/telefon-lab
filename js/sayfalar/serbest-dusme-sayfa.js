// js/sayfalar/serbest-dusme-sayfa.js
// Serbest düşme sayfasının mantığı.
// Akış: geri sayım → kayıt (bu sırada öğrenci telefonu birkaç kez yastığa bırakır) → düşüşleri bul →
//       ortalama düşme süresi → g ± Δg ve açıklama → grafik → örnekleme raporu.
// Hesapların hepsi js/analiz/serbest-dusme.js içinde (bkz. KARAR_GUNLUGU K-012).

import { hareketSensorunuHazirla } from '../sensor/hareket.js';
import { kayitYap } from '../sensor/kayit.js';
import {
  ivmeBuyuklukleri,
  dususleriBul,
  dususSuresiOzeti,
  serbestDusmeG,
} from '../analiz/serbest-dusme.js';
import { kabulEdilenleKarsilastir, KABUL_EDILEN_G } from '../analiz/sarkac-hesap.js';
import { sayiYaz, sayiOku, belirsizlikleYaz } from '../arayuz/bicim.js';
import { grafikCiz, aciklamaYaz } from '../arayuz/grafik.js';
import {
  listeyiDoldur,
  goreliZamanlarSn,
  geriSay,
  durumRozetiniGoster,
  orneklemeRaporunuGoster,
} from '../arayuz/sayfa-yardimcilari.js';
import { surumuGoster } from '../surum.js';
import { servisCalisaniniKaydet } from '../pwa.js';

const el = (id) => document.getElementById(id);
surumuGoster();
servisCalisaniniKaydet();
const kayitButonu = el('kayitButonu');

// Son kaydın örnekleri ve bulunan düşüşler (grafik yeniden çizilirken kullanılır)
let sonOrnekler = [];
let sonDususler = [];
// Son ortalama düşme süresi. h değiştirilince g yeniden hesaplanırken kullanılır.
let sonSure = null; // dususSuresiOzeti sonucu ya da null
// Kayıttaki ortanca ölçüm aralığı (ms); açıklamada "iki ölçüm arası ≈ 17 ms" demek için
let sonOrtancaAralikMs = null;

function durumYaz(metin, hataMi = false) {
  const p = el('durumMesaji');
  p.textContent = metin;
  p.classList.toggle('hata', hataMi);
}

// ---- 3. Düşüşler -------------------------------------------------------------------

// Her düşüş için bir tablo satırı: sıra, bırakma anı, düşme süresi ± belirsizlik, en düşük ivme
function dususTablosunuDoldur(dususler) {
  const govde = el('dTablo');
  govde.replaceChildren();
  dususler.forEach((d, i) => {
    const satir = document.createElement('tr');
    const hucreler = [
      String(i + 1),
      sayiYaz(d.baslangicSn, 2) + ' s',
      belirsizlikleYaz(d.sureSn * 1000, d.sureBelirsizligiSn * 1000, 'ms'),
      sayiYaz(d.enDusukIvme, 1) + ' m/s²',
    ];
    for (const metin of hucreler) {
      const td = document.createElement('td');
      td.textContent = metin;
      satir.appendChild(td);
    }
    govde.appendChild(satir);
  });
}

function dususleriHesaplaVeGoster(ornekler) {
  const zamanlarSn = goreliZamanlarSn(ornekler);
  const bulunan = dususleriBul(zamanlarSn, ivmeBuyuklukleri(ornekler));
  sonDususler = bulunan.dususler;

  const ozet = dususSuresiOzeti(bulunan.dususler);
  sonSure = ozet.gecerliMi ? ozet : null;

  // Düşüş bulunamadıysa özetin "süre hesaplanamadı" uyarısı tekrar olur; yalnızca bulma uyarıları yeter.
  // Not: "kaydın başında kesildi, sayılmadı" gibi bulma uyarıları bilgi içindir; sayılan düşüşleri bozmaz.
  // Sonucun güvenilirliğine yalnızca sayılan düşüşlerle ilgili uyarılar (özet uyarıları) karar verir.
  const uyarilar = ozet.gecerliMi ? [...bulunan.uyarilar, ...ozet.uyarilar] : bulunan.uyarilar;

  el('dSonuc').textContent = ozet.gecerliMi
    ? `${ozet.dususSayisi} düşüş · ortalama t = ${belirsizlikleYaz(ozet.sureSn, ozet.sureBelirsizligiSn, 's')}`
    : 'Düşüş bulunamadı';
  dususTablosunuDoldur(bulunan.dususler);
  listeyiDoldur(el('dUyarilar'), uyarilar, 'Uyarı yok.');
  el('dususBolumu').hidden = false;
}

// ---- 2. Yer çekimi ivmesi (g) ----------------------------------------------------

// Kullanıcının yazdığı h ve Δh'yi okur (cm → m). Hatalıysa { hata: 'mesaj' } döner.
function yuksekligiOku() {
  const yukseklikCm = sayiOku(el('yukseklikGirisi').value);
  const belirsizlikCm = sayiOku(el('yukseklikBelirsizligiGirisi').value);
  if (Number.isNaN(yukseklikCm)) return { hata: "g'yi hesaplamak için yukarıya düşme yüksekliğini (h, cm) girin." };
  if (yukseklikCm <= 0) return { hata: "Yükseklik 0'dan büyük olmalı." };
  if (Number.isNaN(belirsizlikCm) || belirsizlikCm < 0) return { hata: 'Δh için geçerli bir sayı girin (ör. 0,5).' };
  return { yukseklikM: yukseklikCm / 100, yukseklikBelirsizligiM: belirsizlikCm / 100 };
}

// Sonucu öğrenciye açıklayan cümleleri hazırlar.
function gAciklamalari(sonuc, karsilastirma, girdi, sure) {
  const cumleler = [];

  // Düşüş ölçümünde uyarı varsa en başta söyle: kötü veriden çıkan sonucu "güzel" göstermiyoruz.
  if (!sure.guvenilirMi) {
    cumleler.push(
      '⚠ Düşme süresi ölçümü güvenilir değil (bkz. "3. Düşüşler" bölümündeki uyarılar). ' +
        'Bu g değerine güvenmeyin; uyarılara göre düzeltip kaydı tekrarlayın.'
    );
  }

  cumleler.push(
    `g = 2h / t² formülüyle hesaplandı (h = ½·g·t² formülünden g çekilerek). ` +
      `t, ${sure.dususSayisi} düşüşün ortalama süresidir.`
  );

  // Hangi ölçüm belirsizliğe daha çok katkı yapıyor?
  if (girdi.yukseklikBelirsizligiM === 0) {
    cumleler.push('Δh = 0 girdiniz. Hiçbir ölçüm kusursuz değildir; belirsizlik olduğundan küçük görünüyor.');
  }
  if (sonuc.surePayi >= sonuc.yukseklikPayi) {
    const aralik = sonOrtancaAralikMs ? `≈ ${sayiYaz(sonOrtancaAralikMs, 0)} ms` : 'birkaç milisaniye';
    cumleler.push(
      `Belirsizliğin yaklaşık %${sayiYaz(sonuc.surePayi * 100, 0)} kadarı düşme süresinin (t) ölçümünden geliyor. ` +
        `Telefonun iki ölçümü arasında ${aralik} var, düşüş ise yalnızca ≈ ${sayiYaz(sure.sureSn * 1000, 0)} ms sürüyor. ` +
        'Ayrıca t formülde karesiyle geçtiği için hatası iki katına çıkar. ' +
        'Daha çok düşüş yapın (belirsizlik düşüş sayısının karekökü kadar küçülür) ya da biraz daha yüksekten bırakın.'
    );
  } else {
    cumleler.push(
      `Belirsizliğin yaklaşık %${sayiYaz(sonuc.yukseklikPayi * 100, 0)} kadarı yüksekliğin (h) ölçümünden geliyor. ` +
        'Sonucu iyileştirmenin yolu h\'yi daha dikkatli ölçmek ve telefonu her seferinde tam aynı yükseklikten bırakmak.'
    );
  }

  // Kabul edilen değerle karşılaştırma
  const kat = sayiYaz(karsilastirma.farkKati, 1);
  if (!sure.guvenilirMi) {
    cumleler.push(
      `Kabul edilen değer (≈ ${sayiYaz(KABUL_EDILEN_G, 2)} m/s²) ile karşılaştırma bu ölçümde anlamlı değil: ` +
        'süre güvenilir olmadığı için değerler tesadüfen yakın ya da uzak çıkabilir.'
    );
  } else if (karsilastirma.uyumluMu) {
    cumleler.push(
      `Kabul edilen değer (≈ ${sayiYaz(KABUL_EDILEN_G, 2)} m/s²) ile fark, belirsizliğin ${kat} katı. ` +
        'Bu, ölçümün kabul edilen değerle uyumlu olduğu anlamına gelir.'
    );
  } else {
    cumleler.push(
      `Kabul edilen değer (≈ ${sayiYaz(KABUL_EDILEN_G, 2)} m/s²) ile fark, belirsizliğin ${kat} katı. ` +
        'Bu kadar büyük fark rastgele hatayla açıklanamaz; sistematik bir hata olabilir: ' +
        'h telefonun alt yüzünden yastığın üst yüzüne mi ölçüldü? Telefon bırakılırken itildi ya da döndü mü? ' +
        'Yastık çok yumuşaksa telefonu yavaşça durdurur, değme anı geç bulunur ve g küçük çıkar. ' +
        'h\'yi sonuca göre değiştirmeyin; gerekiyorsa yeniden ölçüp kaydı tekrarlayın.'
    );
  }

  return cumleler;
}

// h değiştiğinde ya da yeni kayıt bittiğinde g bölümünü yeniden hesaplar.
function gHesabiniGuncelle() {
  if (sonOrnekler.length === 0) return; // henüz kayıt yok

  const girdi = yuksekligiOku();
  const satirIdleri = ['gYukseklik', 'gSure', 'gKaynak', 'gFark'];

  if (!sonSure || girdi.hata) {
    el('gSonuc').textContent = 'g = ?';
    el('gSonuc').classList.remove('guvenilmez');
    durumRozetiniGoster(el('gDurum'), null);
    for (const id of satirIdleri) el(id).textContent = '–';
    const mesaj = !sonSure ? 'Düşüş bulunamadığı için g hesaplanamadı.' : girdi.hata;
    listeyiDoldur(el('gAciklama'), [mesaj], '');
    el('gBolumu').hidden = false;
    return;
  }

  const sonuc = serbestDusmeG({
    ...girdi,
    sureSn: sonSure.sureSn,
    sureBelirsizligiSn: sonSure.sureBelirsizligiSn,
  });
  const karsilastirma = kabulEdilenleKarsilastir(sonuc.g, sonuc.gBelirsizligi);

  el('gSonuc').textContent = 'g = ' + belirsizlikleYaz(sonuc.g, sonuc.gBelirsizligi, 'm/s²');
  el('gYukseklik').textContent = belirsizlikleYaz(girdi.yukseklikM * 100, girdi.yukseklikBelirsizligiM * 100, 'cm');
  el('gSure').textContent = belirsizlikleYaz(sonSure.sureSn, sonSure.sureBelirsizligiSn, 's');
  el('gKaynak').textContent =
    `h: %${sayiYaz(sonuc.yukseklikPayi * 100, 1)} · t: %${sayiYaz(sonuc.surePayi * 100, 1)}`;
  el('gFark').textContent =
    `${sayiYaz(karsilastirma.fark, 2)} m/s² (belirsizliğin ${sayiYaz(karsilastirma.farkKati, 1)} katı)`;
  listeyiDoldur(el('gAciklama'), gAciklamalari(sonuc, karsilastirma, girdi, sonSure), '');
  // Güvenilmez sonucu görsel olarak da soluk göster
  el('gSonuc').classList.toggle('guvenilmez', !sonSure.guvenilirMi);
  if (!sonSure.guvenilirMi) durumRozetiniGoster(el('gDurum'), 'guvenilmez');
  else if (karsilastirma.uyumluMu) durumRozetiniGoster(el('gDurum'), 'uyumlu');
  else durumRozetiniGoster(el('gDurum'), 'sistematik');
  el('gBolumu').hidden = false;
}

// h ve Δh yazıldıkça g'yi güncelle, ve son girilen değerleri telefonda hatırla
// (yalnızca bu tarayıcıda saklanır, hiçbir yere gönderilmez).
for (const id of ['yukseklikGirisi', 'yukseklikBelirsizligiGirisi']) {
  try {
    const kayitli = localStorage.getItem('serbestDusme.' + id);
    if (kayitli !== null) el(id).value = kayitli;
  } catch (e) { /* tarayıcı depolamaya izin vermiyorsa hatırlamadan devam et */ }

  el(id).addEventListener('input', () => {
    try { localStorage.setItem('serbestDusme.' + id, el(id).value); } catch (e) { /* önemli değil */ }
    gHesabiniGuncelle();
  });
}

// ---- 4. Grafik ------------------------------------------------------------------

// Grafikte gösterilecek seriler
function grafikSerileri(ornekler, secim) {
  if (secim === 'buyukluk') {
    return {
      birim: 'm/s²',
      seriler: [{ ad: '|a| (ivmenin büyüklüğü)', renkDegiskeni: '--seri-1', degerler: ivmeBuyuklukleri(ornekler) }],
    };
  }
  return {
    birim: 'm/s²',
    seriler: [
      { ad: 'x', renkDegiskeni: '--seri-1', degerler: ornekler.map((o) => o.ax) },
      { ad: 'y', renkDegiskeni: '--seri-2', degerler: ornekler.map((o) => o.ay) },
      { ad: 'z', renkDegiskeni: '--seri-3', degerler: ornekler.map((o) => o.az) },
    ],
  };
}

function grafigiGuncelle() {
  if (sonOrnekler.length < 2) return;
  const { birim, seriler } = grafikSerileri(sonOrnekler, el('sinyalSecimi').value);
  // Her düşüşün başı ve sonu kesikli çizgiyle işaretlenir
  const isaretler = sonDususler.flatMap((d) => [d.baslangicSn, d.bitisSn]);
  grafikCiz(el('grafik'), { zamanlarSn: goreliZamanlarSn(sonOrnekler), seriler, birim, isaretler });
  aciklamaYaz(el('grafikAciklamasi'), seriler);
}

el('sinyalSecimi').addEventListener('change', grafigiGuncelle);
// Telefon yan çevrilince grafik genişliği değişir; yeniden çiz
window.addEventListener('resize', grafigiGuncelle);

// ---- Ana akış: Başlat butonu -------------------------------------------------

kayitButonu.addEventListener('click', async () => {
  // İzin, buton tıklamasının hemen içinde istenmeli (iPhone kuralı); geri sayımdan önce yapıyoruz.
  const hazirlik = await hareketSensorunuHazirla();
  if (!hazirlik.tamam) {
    durumYaz(hazirlik.mesaj, true);
    return;
  }

  const hazirlikSn = Number(el('hazirlikSecimi').value);
  const sureSn = Number(el('sureSecimi').value);
  kayitButonu.disabled = true;
  for (const id of ['gBolumu', 'dususBolumu', 'grafikBolumu', 'raporBolumu']) el(id).hidden = true;

  // 1) Hazırlanma: öğrenci telefonu ölçtüğü yüksekliğe getirir
  await geriSay(hazirlikSn, (kalanSn) => {
    durumYaz(`Telefonu ölçtüğünüz yükseklikte, düz tutun. Kayıt ${kalanSn} saniye sonra başlayacak.`);
  });

  // 2) Kayıt: bu sürede telefon birkaç kez bırakılır
  const { ornekler, kesildiMi } = await kayitYap(sureSn, (kalanSn) => {
    durumYaz(`Kayıt yapılıyor… Bırakın, yastıktan alın, tekrar bırakın. ${kalanSn} saniye kaldı.`);
  });
  durumYaz('Kayıt bitti.');
  sonOrnekler = ornekler;
  sonDususler = [];
  sonSure = null;

  // 3) Sonuçlar
  const rapor = orneklemeRaporunuGoster(ornekler, kesildiMi);
  sonOrtancaAralikMs = rapor.yeterliVeriVar ? rapor.ortancaAralikMs : null;
  if (ornekler.length >= 2) {
    dususleriHesaplaVeGoster(ornekler);
    gHesabiniGuncelle();
    el('grafikBolumu').hidden = false; // önce görünür olmalı, yoksa tuvalin genişliği 0 olur
    grafigiGuncelle();
  }
  kayitButonu.disabled = false;
});

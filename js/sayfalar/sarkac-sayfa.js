// js/sayfalar/sarkac-sayfa.js
// Sarkaç sayfasının mantığı.
// Şu anki hâli (Adım 5): geri sayım → kayıt → periyot → g ± Δg ve açıklama → grafik → örnekleme raporu.

import { hareketSensorunuHazirla } from '../sensor/hareket.js';
import { kayitYap } from '../sensor/kayit.js';
import { orneklemeRaporu, BOSLUK_ESIGI_MS } from '../analiz/ornekleme.js';
import { sarkacPeriyoduBul } from '../analiz/periyot.js';
import {
  genlikAcisiTahmini,
  buyukAciGHatasi,
  gHesapla,
  kabulEdilenleKarsilastir,
  KUCUK_ACI_SINIRI_DERECE,
  KABUL_EDILEN_G,
} from '../analiz/sarkac-hesap.js';
import { sayiYaz, sayiOku, belirsizlikleYaz } from '../arayuz/bicim.js';
import { grafikCiz, aciklamaYaz } from '../arayuz/grafik.js';
import { surumuGoster } from '../surum.js';

const el = (id) => document.getElementById(id);
surumuGoster();
const kayitButonu = el('kayitButonu');

// Son kaydın örnekleri ve sıfır geçişleri. Grafik yeniden çizilirken
// (sinyal değişimi, ekran döndürme) kullanılır.
let sonOrnekler = [];
let sonGecisler = [];
// Son periyot sonucu ve açı tahmini. L değiştirilince g yeniden hesaplanırken kullanılır.
let sonPeriyot = null; // { periyotSn, periyotBelirsizligiSn, aciDerece } ya da null

// Grafikte gösterilebilecek sinyaller: her biri 3 eksenden oluşur.
const SINYALLER = {
  donme: {
    birim: '°/s',
    seriler: [
      { ad: 'alfa (z ekseni)', alan: 'donmeAlfa', renkDegiskeni: '--seri-1' },
      { ad: 'beta (x ekseni)', alan: 'donmeBeta', renkDegiskeni: '--seri-2' },
      { ad: 'gama (y ekseni)', alan: 'donmeGama', renkDegiskeni: '--seri-3' },
    ],
  },
  ivme: {
    birim: 'm/s²',
    seriler: [
      { ad: 'x', alan: 'ax', renkDegiskeni: '--seri-1' },
      { ad: 'y', alan: 'ay', renkDegiskeni: '--seri-2' },
      { ad: 'z', alan: 'az', renkDegiskeni: '--seri-3' },
    ],
  },
};

// ---- Yardımcılar -----------------------------------------------------------

function durumYaz(metin, hataMi = false) {
  const p = el('durumMesaji');
  p.textContent = metin;
  p.classList.toggle('hata', hataMi);
}

// Bir <ul> listesini verilen metinlerle doldurur. Liste boşsa bosMetin yazılır.
function listeyiDoldur(liste, metinler, bosMetin) {
  liste.replaceChildren();
  const satirlar = metinler.length > 0 ? metinler : [bosMetin];
  for (const metin of satirlar) {
    const li = document.createElement('li');
    li.textContent = metin;
    liste.appendChild(li);
  }
}

// Zamanları kaydın başından itibaren saniyeye çevirir (ilk ölçüm = 0 s)
function goreliZamanlarSn(ornekler) {
  const ilkZaman = ornekler[0].zaman;
  return ornekler.map((o) => (o.zaman - ilkZaman) / 1000);
}

// Seçilen sinyalin 3 eksenini { ad, renkDegiskeni, degerler } listesine çevirir
function serileriCikar(ornekler, sinyal) {
  return sinyal.seriler.map((s) => ({
    ad: s.ad,
    renkDegiskeni: s.renkDegiskeni,
    degerler: ornekler.map((o) => o[s.alan]),
  }));
}

// sureSn saniyeden geriye sayar; her saniye ilerleme(kalanSn) çağrılır.
function geriSay(sureSn, ilerleme) {
  return new Promise((bitti) => {
    let kalan = sureSn;
    ilerleme(kalan);
    const zamanlayici = setInterval(() => {
      kalan--;
      if (kalan <= 0) {
        clearInterval(zamanlayici);
        bitti();
      } else {
        ilerleme(kalan);
      }
    }, 1000);
  });
}

// ---- 3. Periyot ---------------------------------------------------------------

function periyoduHesaplaVeGoster(ornekler) {
  sonPeriyot = null; // geçerli periyot bulunursa aşağıda doldurulur
  const zamanlarSn = goreliZamanlarSn(ornekler);
  const seriler = serileriCikar(ornekler, SINYALLER.donme);

  // Yumuşat → en çok salınan dönme eksenini seç → periyodu bul (bkz. KARAR_GUNLUGU K-006, K-008)
  const sonuc = sarkacPeriyoduBul(zamanlarSn, seriler);
  if (!sonuc) {
    // Hiçbir eksende yeterli jiroskop verisi yok
    el('pSonuc').textContent = 'Periyot bulunamadı';
    for (const id of ['pEksen', 'pSalinim', 'pBolum', 'pYayilim', 'pAci']) el(id).textContent = '–';
    listeyiDoldur(el('pUyarilar'), ['Jiroskop verisi gelmedi; periyot hesaplanamadı.'], '');
    el('periyotBolumu').hidden = false;
    return;
  }
  const uyarilar = [...sonuc.uyarilar];

  el('pEksen').textContent = sonuc.secilenEksen;
  sonGecisler = sonuc.gecisler || [];

  if (sonuc.gecerliMi) {
    el('pSonuc').textContent = 'T = ' + belirsizlikleYaz(sonuc.periyotSn, sonuc.periyotBelirsizligiSn, 's');
    el('pSalinim').textContent =
      sonuc.salinimSayisi + (sonuc.atilanPeriyotSayisi > 0 ? ` (düzensiz ${sonuc.atilanPeriyotSayisi} tanesi atıldı)` : '');
    el('pBolum').textContent =
      `${sayiYaz(sonuc.kullanilanBaslangicSn, 1)} – ${sayiYaz(sonuc.kullanilanBitisSn, 1)} s`;
    el('pYayilim').textContent = '%' + sayiYaz(sonuc.yayilimOrani * 100, 1);

    const aci = genlikAcisiTahmini(sonuc.tepeDegeri, sonuc.periyotSn);
    sonPeriyot = {
      periyotSn: sonuc.periyotSn,
      periyotBelirsizligiSn: sonuc.periyotBelirsizligiSn,
      aciDerece: aci,
      guvenilirMi: sonuc.guvenilirMi,
    };
    // Bir ondalıkla gösteriyoruz: 10,3° yuvarlanıp "10°" yazılırsa "10°'den az olmalı" uyarısıyla çelişir.
    el('pAci').textContent = sayiYaz(aci, 1) + '°';
    if (aci > KUCUK_ACI_SINIRI_DERECE) {
      const hataYuzde = buyukAciGHatasi(aci) * 100;
      uyarilar.push(
        `Sarkaç yaklaşık ${sayiYaz(aci, 1)}° ile salınmış. Sarkaç formülü küçük açılar (${KUCUK_ACI_SINIRI_DERECE}°'den az) için geçerlidir; ` +
          `bu açıda g yaklaşık %${sayiYaz(hataYuzde, 1)} küçük hesaplanır. Daha küçük açıyla tekrar deneyin.`
      );
    }
  } else {
    el('pSonuc').textContent = 'Periyot bulunamadı';
    for (const id of ['pSalinim', 'pBolum', 'pYayilim', 'pAci']) el(id).textContent = '–';
  }

  listeyiDoldur(el('pUyarilar'), uyarilar, 'Uyarı yok.');
  el('periyotBolumu').hidden = false;
}

// ---- 2. Yer çekimi ivmesi (g) ----------------------------------------------------

// Kullanıcının yazdığı L ve ΔL'yi okur (cm → m). Hatalıysa { hata: 'mesaj' } döner.
function uzunluguOku() {
  const uzunlukCm = sayiOku(el('uzunlukGirisi').value);
  const belirsizlikCm = sayiOku(el('uzunlukBelirsizligiGirisi').value);
  if (Number.isNaN(uzunlukCm)) return { hata: "g'yi hesaplamak için yukarıya sarkaç boyunu (L, cm) girin." };
  if (uzunlukCm <= 0) return { hata: "Sarkaç boyu 0'dan büyük olmalı." };
  if (Number.isNaN(belirsizlikCm) || belirsizlikCm < 0) return { hata: 'ΔL için geçerli bir sayı girin (ör. 0,5).' };
  return { uzunlukM: uzunlukCm / 100, uzunlukBelirsizligiM: belirsizlikCm / 100 };
}

// Sonucu öğrenciye açıklayan cümleleri hazırlar.
function gAciklamalari(sonuc, karsilastirma, girdi, periyotBilgisi) {
  const { aciDerece, guvenilirMi } = periyotBilgisi;
  const cumleler = [];

  // Periyot ölçümünde uyarı varsa bunu en başta söyle: kötü veriden çıkan sonucu "güzel" göstermiyoruz.
  if (!guvenilirMi) {
    cumleler.push(
      '⚠ Periyot ölçümü güvenilir değil (bkz. "3. Periyot" bölümündeki uyarılar). ' +
        'Bu g değerine güvenmeyin; düzeneği düzeltip kaydı tekrarlayın.'
    );
  }

  cumleler.push(`g = 4π²·L / T² formülüyle hesaplandı (T = 2π·√(L/g) formülünden g çekilerek).`);

  // Hangi ölçüm belirsizliğe daha çok katkı yapıyor?
  if (girdi.uzunlukBelirsizligiM === 0) {
    cumleler.push('ΔL = 0 girdiniz. Hiçbir ölçüm kusursuz değildir; belirsizlik olduğundan küçük görünüyor.');
  } else if (sonuc.uzunlukPayi >= sonuc.periyotPayi) {
    cumleler.push(
      `Belirsizliğin yaklaşık %${sayiYaz(sonuc.uzunlukPayi * 100, 0)} kadarı sarkaç boyunun (L) ölçümünden geliyor. ` +
        'Sonucu iyileştirmenin yolu L\'yi daha dikkatli ölçmek; telefonun saati (periyot) zaten çok hassas.'
    );
  } else {
    cumleler.push(
      `Belirsizliğin yaklaşık %${sayiYaz(sonuc.periyotPayi * 100, 0)} kadarı periyot ölçümünden geliyor. ` +
        'Daha uzun kayıt yapın ve telefonun dönmeden, tek düzlemde salınmasını sağlayın.'
    );
  }

  // Kabul edilen değerle karşılaştırma
  const kat = sayiYaz(karsilastirma.farkKati, 1);
  if (!guvenilirMi) {
    cumleler.push(
      `Kabul edilen değer (≈ ${sayiYaz(KABUL_EDILEN_G, 2)} m/s²) ile karşılaştırma bu ölçümde anlamlı değil: ` +
        'periyot güvenilir olmadığı için değerler tesadüfen yakın ya da uzak çıkabilir.'
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
        'L telefonun ortasına kadar mı ölçüldü? Sarkaç büyük açıyla mı bırakıldı? Telefon ipin ucunda döndü mü?'
    );
  }

  // Büyük açı etkisi
  if (aciDerece > KUCUK_ACI_SINIRI_DERECE) {
    cumleler.push(
      `Sarkaç yaklaşık ${sayiYaz(aciDerece, 1)}° ile salındı; bu yüzden g yaklaşık ` +
        `%${sayiYaz(buyukAciGHatasi(aciDerece) * 100, 1)} küçük çıkmış olabilir (bu etki belirsizliğe dahil değildir).`
    );
  }

  return cumleler;
}

// L değiştiğinde ya da yeni kayıt bittiğinde g bölümünü yeniden hesaplar.
function gHesabiniGuncelle() {
  if (sonOrnekler.length === 0) return; // henüz kayıt yok

  const girdi = uzunluguOku();
  const satirIdleri = ['gUzunluk', 'gPeriyot', 'gKaynak', 'gFark'];

  if (!sonPeriyot || girdi.hata) {
    el('gSonuc').textContent = 'g = ?';
    el('gSonuc').classList.remove('guvenilmez');
    for (const id of satirIdleri) el(id).textContent = '–';
    const mesaj = !sonPeriyot ? 'Periyot bulunamadığı için g hesaplanamadı.' : girdi.hata;
    listeyiDoldur(el('gAciklama'), [mesaj], '');
    el('gBolumu').hidden = false;
    return;
  }

  const sonuc = gHesapla({ ...girdi, ...sonPeriyot });
  const karsilastirma = kabulEdilenleKarsilastir(sonuc.g, sonuc.gBelirsizligi);

  el('gSonuc').textContent = 'g = ' + belirsizlikleYaz(sonuc.g, sonuc.gBelirsizligi, 'm/s²');
  el('gUzunluk').textContent = belirsizlikleYaz(girdi.uzunlukM * 100, girdi.uzunlukBelirsizligiM * 100, 'cm');
  el('gPeriyot').textContent = belirsizlikleYaz(sonPeriyot.periyotSn, sonPeriyot.periyotBelirsizligiSn, 's');
  el('gKaynak').textContent =
    `L: %${sayiYaz(sonuc.uzunlukPayi * 100, 1)} · T: %${sayiYaz(sonuc.periyotPayi * 100, 1)}`;
  el('gFark').textContent =
    `${sayiYaz(karsilastirma.fark, 2)} m/s² (belirsizliğin ${sayiYaz(karsilastirma.farkKati, 1)} katı)`;
  listeyiDoldur(el('gAciklama'), gAciklamalari(sonuc, karsilastirma, girdi, sonPeriyot), '');
  // Güvenilmez sonucu görsel olarak da soluk göster
  el('gSonuc').classList.toggle('guvenilmez', !sonPeriyot.guvenilirMi);
  el('gBolumu').hidden = false;
}

// L ve ΔL yazıldıkça g'yi güncelle, ve son girilen değerleri telefonda hatırla
// (yalnızca bu tarayıcıda saklanır, hiçbir yere gönderilmez).
for (const id of ['uzunlukGirisi', 'uzunlukBelirsizligiGirisi']) {
  try {
    const kayitli = localStorage.getItem('sarkac.' + id);
    if (kayitli !== null) el(id).value = kayitli;
  } catch (e) { /* tarayıcı depolamaya izin vermiyorsa hatırlamadan devam et */ }

  el(id).addEventListener('input', () => {
    try { localStorage.setItem('sarkac.' + id, el(id).value); } catch (e) { /* önemli değil */ }
    gHesabiniGuncelle();
  });
}

// ---- 4. Grafik ------------------------------------------------------------------

function grafigiGuncelle() {
  if (sonOrnekler.length < 2) return;
  const sinyal = SINYALLER[el('sinyalSecimi').value];
  const seriler = serileriCikar(sonOrnekler, sinyal);
  grafikCiz(el('grafik'), {
    zamanlarSn: goreliZamanlarSn(sonOrnekler),
    seriler,
    birim: sinyal.birim,
    isaretler: sonGecisler,
  });
  aciklamaYaz(el('grafikAciklamasi'), seriler);
}

el('sinyalSecimi').addEventListener('change', grafigiGuncelle);
// Telefon yan çevrilince grafik genişliği değişir; yeniden çiz
window.addEventListener('resize', grafigiGuncelle);

// ---- 5. Örnekleme raporu ------------------------------------------------------

// Kayıttaki örneklerin kaçında jiroskop (dönme hızı) değeri var?
function jiroskopluOrnekSayisi(ornekler) {
  return ornekler.filter((o) => o.donmeAlfa !== null).length;
}

function raporuGoster(ornekler, kesildiMi) {
  const rapor = orneklemeRaporu(ornekler.map((o) => o.zaman));
  const uyarilar = [...rapor.uyarilar];
  if (kesildiMi) {
    uyarilar.unshift('Kayıt sırasında sayfa arka plana geçti (ekran kilidi veya uygulama değişimi). Kaydı tekrarlayın.');
  }

  el('rOrnekSayisi').textContent = rapor.ornekSayisi;

  if (rapor.yeterliVeriVar) {
    el('rSure').textContent = sayiYaz(rapor.sureSn, 1) + ' s';
    el('rHiz').textContent = sayiYaz(rapor.ortalamaHz, 1) + ' Hz';
    el('rOrtanca').textContent = sayiYaz(rapor.ortancaAralikMs, 1) + ' ms';
    el('rEnKisaUzun').textContent =
      sayiYaz(rapor.enKisaAralikMs, 1) + ' ms / ' + sayiYaz(rapor.enUzunAralikMs, 1) + ' ms';
    el('rBoslukSayisi').textContent = `${rapor.bosluklar.length} (eşik: ${BOSLUK_ESIGI_MS} ms)`;

    const jiroskoplu = jiroskopluOrnekSayisi(ornekler);
    el('rJiroskop').textContent = `${jiroskoplu} / ${ornekler.length} ölçümde var`;
    if (jiroskoplu === 0) uyarilar.push('Jiroskop verisi gelmedi; sarkaç için ivmeölçer yöntemine geçmek gerekecek.');
  } else {
    for (const id of ['rSure', 'rHiz', 'rOrtanca', 'rEnKisaUzun', 'rBoslukSayisi', 'rJiroskop']) {
      el(id).textContent = '–';
    }
  }

  // Boşlukları "3,2. saniyede 1.067,0 ms" biçiminde listele
  const boslukMetinleri = (rapor.bosluklar || []).map(
    (b) => `${sayiYaz(b.baslangicSn, 2)}. saniyede ${sayiYaz(b.sureMs, 1)} ms boşluk`
  );

  listeyiDoldur(el('rUyarilar'), uyarilar, 'Uyarı yok. Örnekleme düzenli görünüyor.');
  listeyiDoldur(el('rBosluklar'), boslukMetinleri, 'Uzun boşluk yok.');
  el('raporBolumu').hidden = false;
}

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
  for (const id of ['gBolumu', 'periyotBolumu', 'grafikBolumu', 'raporBolumu']) el(id).hidden = true;

  // 1) Bırakma süresi: kullanıcı sarkacı bu sürede asıp bırakır
  await geriSay(hazirlikSn, (kalanSn) => {
    durumYaz(`Sarkacı şimdi bırakın. Kayıt ${kalanSn} saniye sonra başlayacak.`);
  });

  // 2) Kayıt
  const { ornekler, kesildiMi } = await kayitYap(sureSn, (kalanSn) => {
    durumYaz(`Kayıt yapılıyor… ${kalanSn} saniye kaldı.`);
  });
  durumYaz('Kayıt bitti.');
  sonOrnekler = ornekler;
  sonGecisler = [];

  // 3) Sonuçlar
  if (ornekler.length >= 2) {
    periyoduHesaplaVeGoster(ornekler);
    gHesabiniGuncelle();
    el('grafikBolumu').hidden = false; // önce görünür olmalı, yoksa tuvalin genişliği 0 olur
    grafigiGuncelle();
  }
  raporuGoster(ornekler, kesildiMi);
  kayitButonu.disabled = false;
});

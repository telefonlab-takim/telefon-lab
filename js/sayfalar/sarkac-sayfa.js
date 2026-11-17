// js/sayfalar/sarkac-sayfa.js
// Sarkaç sayfasının mantığı.
// Şu anki hâli (Adım 4): geri sayım → kayıt → periyot hesabı → grafik → örnekleme raporu.

import { hareketSensorunuHazirla } from '../sensor/hareket.js';
import { kayitYap } from '../sensor/kayit.js';
import { orneklemeRaporu, BOSLUK_ESIGI_MS } from '../analiz/ornekleme.js';
import { periyotBul, enCokSalinanSeri } from '../analiz/periyot.js';
import { genlikAcisiTahmini, buyukAciGHatasi, KUCUK_ACI_SINIRI_DERECE } from '../analiz/sarkac-hesap.js';
import { sayiYaz, belirsizlikleYaz } from '../arayuz/bicim.js';
import { grafikCiz, aciklamaYaz } from '../arayuz/grafik.js';

const el = (id) => document.getElementById(id);
const kayitButonu = el('kayitButonu');

// Son kaydın örnekleri ve sıfır geçişleri. Grafik yeniden çizilirken
// (sinyal değişimi, ekran döndürme) kullanılır.
let sonOrnekler = [];
let sonGecisler = [];

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

// ---- 2. Periyot ---------------------------------------------------------------

function periyoduHesaplaVeGoster(ornekler) {
  const zamanlarSn = goreliZamanlarSn(ornekler);
  const seriler = serileriCikar(ornekler, SINYALLER.donme);

  // En çok salınan dönme eksenini seç (bkz. KARAR_GUNLUGU K-006)
  const secilen = enCokSalinanSeri(seriler);
  if (!secilen) {
    // Hiçbir eksende yeterli jiroskop verisi yok
    el('pSonuc').textContent = 'Periyot bulunamadı';
    for (const id of ['pEksen', 'pSalinim', 'pYayilim', 'pAci']) el(id).textContent = '–';
    listeyiDoldur(el('pUyarilar'), ['Jiroskop verisi gelmedi; periyot hesaplanamadı.'], '');
    el('periyotBolumu').hidden = false;
    return;
  }
  const sonuc = periyotBul(zamanlarSn, secilen.degerler);
  const uyarilar = [...sonuc.uyarilar];

  el('pEksen').textContent = secilen.ad;
  sonGecisler = sonuc.gecisler || [];

  if (sonuc.gecerliMi) {
    el('pSonuc').textContent = 'T = ' + belirsizlikleYaz(sonuc.periyotSn, sonuc.periyotBelirsizligiSn, 's');
    el('pSalinim').textContent = sonuc.salinimSayisi;
    el('pYayilim').textContent = '%' + sayiYaz(sonuc.yayilimOrani * 100, 1);

    const aci = genlikAcisiTahmini(sonuc.tepeDegeri, sonuc.periyotSn);
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
    for (const id of ['pSalinim', 'pYayilim', 'pAci']) el(id).textContent = '–';
  }

  listeyiDoldur(el('pUyarilar'), uyarilar, 'Uyarı yok.');
  el('periyotBolumu').hidden = false;
}

// ---- 3. Grafik ------------------------------------------------------------------

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

// ---- 4. Örnekleme raporu ------------------------------------------------------

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
  for (const id of ['periyotBolumu', 'grafikBolumu', 'raporBolumu']) el(id).hidden = true;

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
    el('grafikBolumu').hidden = false; // önce görünür olmalı, yoksa tuvalin genişliği 0 olur
    grafigiGuncelle();
  }
  raporuGoster(ornekler, kesildiMi);
  kayitButonu.disabled = false;
});

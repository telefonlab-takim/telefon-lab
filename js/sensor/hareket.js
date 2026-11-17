// js/sensor/hareket.js
// Telefonun hareket sensörlerinden (ivmeölçer + jiroskop) veri alan modül.
//
// Tarayıcı bu verileri "devicemotion" adlı bir olayla, saniyede onlarca kez gönderir.
// Bu modül o olayı dinler ve her olayı sade bir "örnek" nesnesine çevirir.
// Ekrana hiçbir şey yazmaz; ekran işi sayfa dosyalarının görevidir.

// Tarayıcı hareket sensörü özelliğini tanıyor mu?
// (Tanıması, cihazda gerçekten sensör olduğu anlamına gelmez: masaüstü tarayıcılar da tanır
// ama hiç olay göndermez.)
export function hareketDestegiVarMi() {
  return typeof window.DeviceMotionEvent !== 'undefined';
}

// Sensörler yalnızca "güvenli bağlamda" çalışır: HTTPS ile ya da localhost'tan açılan sayfa.
export function guvenliBaglamMi() {
  return window.isSecureContext === true;
}

// iPhone (iOS 13 ve sonrası) hareket verisi için kullanıcıdan izin ister.
// Bu fonksiyon mutlaka bir buton tıklamasının içinden çağrılmalıdır, yoksa iPhone izin penceresini açmaz.
// Android'de izin fonksiyonu yoktur, veri doğrudan gelir.
// Dönen değer: 'gerekmiyor' | 'verildi' | 'reddedildi' | 'hata'
export async function izinIste() {
  if (typeof DeviceMotionEvent.requestPermission !== 'function') {
    return 'gerekmiyor';
  }
  try {
    const cevap = await DeviceMotionEvent.requestPermission(); // 'granted' veya 'denied'
    return cevap === 'granted' ? 'verildi' : 'reddedildi';
  } catch (hata) {
    console.error('Hareket izni istenirken hata:', hata);
    return 'hata';
  }
}

// Şu anda dinlemede olan fonksiyon (aynı anda tek dinleyici olsun diye saklıyoruz).
let aktifDinleyici = null;

// Sensörü dinlemeye başlar. Her yeni ölçümde ornekGeldi(ornek) çağrılır.
export function dinlemeyiBaslat(ornekGeldi) {
  dinlemeyiDurdur();
  aktifDinleyici = (olay) => {
    const ornek = olayiOrnegeCevir(olay);
    // Sensörü olmayan cihazlarda (ör. masaüstü Chrome) tarayıcı, bütün değerleri boş
    // tek bir olay gönderir. Bu gerçek bir ölçüm değildir, yok sayıyoruz.
    if (bosOrnekMi(ornek)) return;
    ornekGeldi(ornek);
  };
  window.addEventListener('devicemotion', aktifDinleyici);
}

export function dinlemeyiDurdur() {
  if (aktifDinleyici) {
    window.removeEventListener('devicemotion', aktifDinleyici);
    aktifDinleyici = null;
  }
}

// İvme ve dönme değerlerinin hepsi null ise örnek boştur.
function bosOrnekMi(ornek) {
  return [ornek.ax, ornek.ay, ornek.az, ornek.donmeAlfa, ornek.donmeBeta, ornek.donmeGama]
    .every((deger) => deger === null);
}

// Tarayıcının gönderdiği olayı bizim kullanacağımız sade nesneye çevirir.
// Birimler:
//   zaman            : milisaniye (sayfa açıldığından beri)
//   ax, ay, az       : m/s²  (yer çekimi DAHİL ivme; telefon masada dururken yaklaşık 9,8 görünür)
//   donmeAlfa/Beta/Gama : derece/saniye (jiroskop, telefonun eksenleri etrafında dönme hızı)
//   aralik           : tarayıcının bildirdiği örnekler arası süre (cihaza göre ms ya da s olabilir,
//                      bu yüzden örnekleme hızını kendimiz zaman damgalarından hesaplıyoruz)
// Sensör bir değeri vermiyorsa o alan null olur.
function olayiOrnegeCevir(olay) {
  const ivme = olay.accelerationIncludingGravity || {};
  const donme = olay.rotationRate || {};
  return {
    zaman: olay.timeStamp,
    ax: ivme.x ?? null,
    ay: ivme.y ?? null,
    az: ivme.z ?? null,
    donmeAlfa: donme.alpha ?? null,
    donmeBeta: donme.beta ?? null,
    donmeGama: donme.gamma ?? null,
    aralik: olay.interval ?? null,
  };
}

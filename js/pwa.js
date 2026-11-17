// js/pwa.js
// Uygulamayı internetsiz çalışabilir hâle getiren servis çalışanını (sw.js) tarayıcıya tanıtır.
// Her sayfa açılışta bunu çağırır. Ayrıntı: sw.js ve KARAR_GUNLUGU K-010.

// Servis çalışanını kaydeder. Tarayıcı desteklemiyorsa sessizce geçer (uygulama yine internetle çalışır).
// Dönen değer: kayıt tamamlanınca biten bir Promise (desteklenmiyorsa null).
export function servisCalisaniniKaydet() {
  if (!('serviceWorker' in navigator)) return null;
  // Yol, sayfaya göre değil sitenin köküne göre: sw.js kök klasörde.
  // Not: yalnızca kök klasördeki sayfalar bu fonksiyonu çağırıyor.
  return navigator.serviceWorker.register('sw.js').catch((hata) => {
    console.warn('Servis çalışanı kaydedilemedi; uygulama yalnızca internetle çalışır.', hata);
  });
}

// Servis çalışanı hazır olunca verilen elemana "internetsiz kullanıma hazır" yazar.
export function cevrimdisiDurumunuGoster(elemanId) {
  const eleman = document.getElementById(elemanId);
  if (!eleman) return;
  if (!('serviceWorker' in navigator)) {
    eleman.textContent = 'Bu tarayıcı internetsiz kullanımı desteklemiyor.';
    return;
  }
  eleman.textContent = 'İnternetsiz kullanım hazırlanıyor…';
  navigator.serviceWorker.ready.then(() => {
    eleman.textContent = '✓ İnternetsiz kullanıma hazır';
  });
}

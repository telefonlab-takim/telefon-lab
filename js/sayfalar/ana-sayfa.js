// js/sayfalar/ana-sayfa.js
// Ana menü sayfasının mantığı: sürümü göster, internetsiz çalışmayı hazırla.

import { surumuGoster } from '../surum.js';
import { servisCalisaniniKaydet, cevrimdisiDurumunuGoster } from '../pwa.js';

surumuGoster();
servisCalisaniniKaydet();
cevrimdisiDurumunuGoster('cevrimdisiDurum');

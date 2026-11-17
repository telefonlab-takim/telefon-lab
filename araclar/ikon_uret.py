# araclar/ikon_uret.py
# Uygulama simgelerini (PNG) üretir. Uygulamanın parçası değildir; simge değişirse bir kez çalıştırılır:
#
#     py araclar/ikon_uret.py
#
# Dış kütüphane kullanmaz (yalnızca Python'un kendi zlib ve struct modülleri).
# Çizim: mavi zemin üzerinde beyaz bir sarkaç (askı çubuğu, eğik ip, top).
# Kenarları yumuşak görünsün diye her piksel 4x4 alt noktadan örneklenir (kenar yumuşatma).

import os
import struct
import zlib

ZEMIN = (21, 101, 192)    # #1565c0 (stil.css'teki vurgu rengi)
CIZIM = (255, 255, 255)   # beyaz

# Şekiller 512x512'lik bir tuvale göre tanımlı; diğer boyutlar orantılı küçültülür.
# Hepsi "maskable" güvenli bölgesinin (merkezden %40 yarıçap) içinde kalır.
CUBUK = (176, 84, 336, 108)        # askı çubuğu: sol, üst, sağ, alt
IP_BAS = (256, 104)                # ipin üst ucu
IP_SON = (326, 330)                # ipin alt ucu (topun merkezi)
IP_KALINLIK = 14
TOP_MERKEZ = (326, 336)
TOP_YARICAP = 58


def segmente_uzaklik(px, py, ax, ay, bx, by):
    """(px, py) noktasının AB doğru parçasına en kısa uzaklığı."""
    abx, aby = bx - ax, by - ay
    t = ((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby)
    t = max(0.0, min(1.0, t))
    yx, yy = ax + t * abx, ay + t * aby
    return ((px - yx) ** 2 + (py - yy) ** 2) ** 0.5


def cizim_icinde_mi(x, y):
    """512'lik koordinatlarda (x, y) noktası beyaz çizimin içinde mi?"""
    sol, ust, sag, alt = CUBUK
    if sol <= x <= sag and ust <= y <= alt:
        return True
    if segmente_uzaklik(x, y, *IP_BAS, *IP_SON) <= IP_KALINLIK / 2:
        return True
    mx, my = TOP_MERKEZ
    return (x - mx) ** 2 + (y - my) ** 2 <= TOP_YARICAP ** 2


def resim_uret(boyut):
    """boyut x boyut piksellik resmi satır satır RGB bayt dizisi olarak döndürür."""
    olcek = 512 / boyut
    alt_ornek = 4
    satirlar = []
    for py in range(boyut):
        satir = bytearray([0])  # her PNG satırı bir "filtre türü" baytıyla başlar (0 = filtresiz)
        for px in range(boyut):
            icerde = 0
            for i in range(alt_ornek):
                for j in range(alt_ornek):
                    x = (px + (i + 0.5) / alt_ornek) * olcek
                    y = (py + (j + 0.5) / alt_ornek) * olcek
                    if cizim_icinde_mi(x, y):
                        icerde += 1
            oran = icerde / (alt_ornek * alt_ornek)  # bu pikselin ne kadarı beyaz
            for k in range(3):
                satir.append(round(ZEMIN[k] * (1 - oran) + CIZIM[k] * oran))
        satirlar.append(bytes(satir))
    return b"".join(satirlar)


def png_yaz(dosya_yolu, boyut):
    """PNG dosya biçimi: imza + IHDR (boyutlar) + IDAT (sıkıştırılmış pikseller) + IEND."""
    def parca(tur, veri):
        return struct.pack(">I", len(veri)) + tur + veri + struct.pack(">I", zlib.crc32(tur + veri) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", boyut, boyut, 8, 2, 0, 0, 0)  # 8 bit, RGB
    icerik = b"\x89PNG\r\n\x1a\n" + parca(b"IHDR", ihdr) + parca(b"IDAT", zlib.compress(resim_uret(boyut), 9)) + parca(b"IEND", b"")
    with open(dosya_yolu, "wb") as f:
        f.write(icerik)
    print(f"yazıldı: {dosya_yolu} ({len(icerik)} bayt)")


if __name__ == "__main__":
    klasor = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ikonlar")
    os.makedirs(klasor, exist_ok=True)
    for boyut in (512, 192, 180):  # 180: iPhone ana ekran simgesi (apple-touch-icon)
        png_yaz(os.path.join(klasor, f"ikon-{boyut}.png"), boyut)

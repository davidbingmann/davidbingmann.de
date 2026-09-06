# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Derive the dark-mode logo files from the light ones.

Every mark in src/assets/logos ships as opaque ink over a white rectangle. On a
dark page that rectangle has to go, so each pixel is read as `ink over white`
and solved back into the ink's own colour and its coverage:

    observed = a * ink + (1 - a) * white

Two ways out of that, one per mark, picked by whether the mark's own colour
survives the move to a dark page:

  keep  The mark IS its colour (Tesla red, the Trier blue). Coverage comes from
        how far the pixel is from white, and the ink colour is recovered, so the
        brand colour carries over untouched.

  tint  The mark is drawn too dark to read against the dark page — near-black
        for dfki and Hochschule Trier, navy for the Eifelgymnasium crest.
        Coverage comes from luminance and every pixel is painted in one light
        ink, which is the negative version brand guides ask for on dark
        backgrounds. It does discard the mark's colour; that is the point.

Which mark gets which is a judgement about the mark, not something to measure,
so it is written out below. Run after changing anything in src/assets/logos:

    uv run scripts/make_dark_logos.py

Needs dwebp and cwebp (brew install webp). Writes <name>-dark.webp next to each
source; those files are committed, so this script does not run at build time.
"""

import subprocess
from pathlib import Path

LOGOS = Path(__file__).resolve().parent.parent / "src" / "assets" / "logos"

MODES = {
    "dfki": "tint",
    "eifelgymnasium": "tint",
    "hs-trier": "tint",
    "tesla": "keep",
    "uni-trier": "keep",
}

# The light ink for `tint`, matching --ink in the dark half of styles.css.
INK = (232, 229, 223)

# Below this coverage a pixel is background, not mark. The lossy source
# (Eifelgymnasium) carries speckle in its white, which would otherwise settle
# on the dark tile as grey dust.
FLOOR = 0.03


def read_pam(path):
    """dwebp's P7 output: a header block, then raw RGBA bytes. The header goes
    straight back out again unchanged, so it is carried whole, not parsed."""
    head, body = path.read_bytes().split(b"ENDHDR\n", 1)
    assert b"DEPTH 4\n" in head, path
    return head + b"ENDHDR\n", bytearray(body)


def unmix(px, mode):
    for i in range(0, len(px), 4):
        r, g, b = px[i], px[i + 1], px[i + 2]
        if mode == "tint":
            a = 1 - (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
            px[i], px[i + 1], px[i + 2] = INK
        else:
            a = 1 - min(r, g, b) / 255
            # Every channel is at least the minimum, so this lands in 0..255
            # on its own; the floor below is what keeps the divisor off zero.
            if a >= FLOOR:
                for c in range(3):
                    px[i + c] = round((px[i + c] - (1 - a) * 255) / a)
        px[i + 3] = 0 if a < FLOOR else round(a * 255)


def main():
    tmp = LOGOS / ".tmp.pam"
    try:
        for src in sorted(LOGOS.glob("*.webp")):
            if src.stem.endswith("-dark"):
                continue
            # A mark with no entry stops the run here, rather than quietly
            # leaving the page without a dark file for it.
            mode = MODES[src.stem]
            subprocess.run(["dwebp", "-quiet", "-pam", src, "-o", tmp], check=True)
            head, px = read_pam(tmp)
            unmix(px, mode)
            tmp.write_bytes(head + px)
            out = LOGOS / f"{src.stem}-dark.webp"
            # Lossless: these are flat marks, and lossy alpha frays their
            # edges. -z 9 is the slowest, smallest setting of the same.
            subprocess.run(["cwebp", "-quiet", "-z", "9", tmp, "-o", out], check=True)
            print(f"{out.name:28} {mode:5} {out.stat().st_size / 1024:6.1f} kB")
    finally:
        tmp.unlink(missing_ok=True)


if __name__ == "__main__":
    main()

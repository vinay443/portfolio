"""Regenerates public/images/headshot-cutout.webp, the hero headshot, from
assets/headshot-original.png.

The original photo is not in the repository, because assets/ is gitignored. To
regenerate, place it at assets/headshot-original.png locally first.

rembg is not a project dependency. Run this from the repository root, in a
throwaway virtualenv that lives outside the repository:

    python -m venv ~/.venvs/headshot
    ~/.venvs/headshot/bin/pip install "rembg[cpu]==2.0.85" "pillow==12.3.0"
    ~/.venvs/headshot/bin/python scripts/headshot.py

On Windows the venv's executables are in Scripts/ rather than bin/. Both packages
are pinned to the versions that produced the current file. The first run downloads
rembg's birefnet-portrait model (973 MB) into ~/.rembg, or into $REMBG_HOME when
that is set. Delete the venv and the model afterwards.

The output is 928x1160 (4:5): the subject on a transparent background, WebP q85
with a lossless alpha channel. It is the only headshot file the site uses, in both
themes; next/image re-encodes it per request, as AVIF where the browser accepts
that. The bottom fade is CSS (.headshot-fade in globals.css), not part of the file.
"""

from pathlib import Path

from PIL import Image
from rembg import new_session, remove
from rembg.bg import alpha_matting_cutout

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets" / "headshot-original.png"
OUT = ROOT / "public" / "images" / "headshot-cutout.webp"

# Measured on the 1776x1175 original. The box runs to the original's bottom row so
# the frame has chest below the tie knot for the CSS fade to dissolve: the knot
# sits at 72-78% of the frame height and the collar points end by 81%, which is
# why .headshot-fade starts at 80%. The top keeps 31px above the highest strands
# of hair (y=46), and the height is the largest multiple of 5 that fits, for an
# exact 4:5. It is centred on the face (x=840) rather than on the hair, which
# sweeps right, and it stays clear of the original's dark border on its left
# edge (x=0-2) and top edge (y=0).
CROP = (376, 15, 1304, 1175)


def main() -> None:
    # The original's alpha channel is fully opaque, so dropping it loses nothing.
    photo = Image.open(SOURCE).convert("RGB").crop(CROP)
    matte = remove(photo, session=new_session("birefnet-portrait"), only_mask=True)

    # The model's matte alone leaves the backdrop's white in the last pixels of
    # every soft edge, which draws a pale outline on the dark theme. rembg's alpha
    # matting re-solves the alpha in a band around the edge and re-estimates the
    # colour under it; these are its defaults. It is called directly rather than
    # through remove(alpha_matting=True), which falls back to a plainer cutout
    # without saying so if the solve fails.
    cutout = alpha_matting_cutout(
        photo, matte, foreground_threshold=240, background_threshold=10, erode_structure_size=10
    )
    OUT.parent.mkdir(parents=True, exist_ok=True)
    cutout.save(OUT, quality=85, method=6)


if __name__ == "__main__":
    main()

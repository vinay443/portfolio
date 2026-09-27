import Image from "next/image";

/**
 * The cutout in both themes: the opaque photo's white backdrop would read as a box
 * on the light --bg. next.config.ts has the optimizer serve it as AVIF where the
 * browser accepts that and as WebP otherwise.
 *
 * `preload` is Next 16's replacement for the deprecated `priority`. The photo is
 * above the fold on every viewport, so it skips lazy loading and its srcset is
 * preloaded from the <head>.
 *
 * `sizes` is in rem because the width is: a reader who raises their browser font
 * size gets a wider image and a correspondingly wider candidate. Its first query is
 * the `short` variant from globals.css, where the photo drops to 128px so the search
 * field clears the fold; 48rem is `md`. The width and height attributes reserve the
 * 4:5 box before the file arrives.
 *
 * The entrance (`.hero-reveal`) runs on the wrapper and the bottom fade
 * (`.headshot-fade`) masks the image; globals.css has why they are split. Both are
 * CSS, so this component needs no client code, and a bundle that never hydrates
 * still shows the photo.
 */
export function Headshot() {
  return (
    <div className="hero-reveal short:w-32 w-28 md:w-38">
      <Image
        src="/images/headshot-cutout.webp"
        alt="Headshot of Vinay Warrier"
        width={928}
        height={1160}
        sizes="(min-width: 48rem) and (max-height: 43.125rem) 8rem, (min-width: 48rem) 9.5rem, 7rem"
        preload
        className="headshot-fade h-auto w-full"
      />
    </div>
  );
}

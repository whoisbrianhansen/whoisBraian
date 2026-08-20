import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";

const requiredHtml = [
  'href="#film"',
  'id="film"',
  "FILM",
  'href="#photography"',
  'id="photography"',
  "STILL PHOTO",
  'href="#memento"',
  'id="memento"',
  "MEMENTO",
  'href="#ambulante"',
  'id="ambulante"',
  "TALLER<br />DE&nbsp;CINE",
  'href="#actor"',
  'id="actor"',
  "SELECTED ACTING WORK",
  'href="#bio"',
  'id="bio"',
  "BIO",
  'href="#contact"',
  'id="contact"',
  "CONTACT",
  "assets/memento/memento-cover.jpg",
  "assets/actor/PLACEBO-COVER-web.jpg",
  "assets/actor/PLACEBO-web.m4v",
  "Writer &amp; Director: Sage Bennett",
  "Starring: Sage Bennett &amp; Brian Hansen",
  "I wanted to transform those painpoints into art.",
  '<p class="actor-quote-author">SAGE BENNETT</p>',
  "Between old movies<br />and motorcycle trips",
  '["Written and Directed by", "Brian Hansen"]',
  '["Starring", "Camila Araiza"]',
  '["Original Score by", "Agustín Ayala"]',
  '["Sound Production by", "Miguel Cham"]',
  '["Voice-over and Cinematography by", "Brian Hansen"]',
  '["Super 8mm Film Processing and Scanning by", "LAB TANK"]',
  "Official Music Video by Coco Rodriguez",
  "Art Direction & Wardrobe: Pangea",
  "A night at a rave in Patagonia. VHS diaries.\nShot & edited by Brian Hansen",
  "moments captured<br />with a Handycam",
  "durante<br />la etapa de su duelo",
  "el duelo.<br />Un recordatorio",
  "player.vimeo.com/video/1038807040",
  "player.vimeo.com/video/1160375315",
  "player.vimeo.com/video/1160387061",
  "player.vimeo.com/video/1160390224",
  "player.vimeo.com/video/1163724360",
  "player.vimeo.com/video/1160381965",
];

for (const snippet of requiredHtml) {
  assert.ok(html.includes(snippet), `Expected index.html to include ${snippet}`);
}

for (const asset of [
  "../assets/memento/memento-cover.jpg",
  "../assets/actor/PLACEBO-COVER-web.jpg",
  "../assets/actor/PLACEBO-web.m4v",
]) {
  assert.ok(existsSync(new URL(asset, import.meta.url)), `Expected local asset ${asset}`);
}

const filmItems = html.match(/const filmItems = \[([\s\S]*?)\n\s*\];/)?.[1] ?? "";
const photographyItems = html.match(/const photographyItems = \[([\s\S]*?)\n\s*\];/)?.[1] ?? "";
const ambulanteItems = html.match(/const ambulanteItems = \[([\s\S]*?)\n\s*\];/)?.[1] ?? "";

assert.equal((filmItems.match(/player\.vimeo\.com\/video/g) ?? []).length, 6, "Expected six FILM projects");
assert.equal((photographyItems.match(/\{ file:/g) ?? []).length, 23, "Expected 23 STILL PHOTO images");
assert.equal((ambulanteItems.match(/player\.vimeo\.com\/video/g) ?? []).length, 7, "Expected seven TALLER DE CINE projects");

for (const [, filename] of photographyItems.matchAll(/file: "([^"]+)"/g)) {
  assert.ok(
    existsSync(new URL(`../assets/photography/${filename}`, import.meta.url)),
    `Expected photography asset ${filename}`,
  );
  const smallPhoto = new URL(`../assets/photography/web-1200/${filename}`, import.meta.url);
  const largePhoto = new URL(`../assets/photography/web-2000/${filename}`, import.meta.url);
  assert.ok(existsSync(smallPhoto), `Expected 1200px photography asset ${filename}`);
  assert.ok(existsSync(largePhoto), `Expected 2000px photography asset ${filename}`);
  assert.ok(statSync(smallPhoto).size < 650_000, `Expected lightweight 1200px asset ${filename}`);
  assert.ok(statSync(largePhoto).size < 1_600_000, `Expected lightweight 2000px asset ${filename}`);
}

assert.match(html, /function attachLoopCarousel\(/, "Expected a shared carousel controller");
assert.match(html, /playButton\.disabled = !isActive/, "Expected only the centered video play button to be enabled");
assert.match(css, /\.video-track \.video-slide:not\(\.is-active\) \.play-toggle/, "Expected side video controls to be hidden");
assert.match(html, /function resetLoop\(\)/, "Expected circular carousel navigation");
assert.match(html, /track\.style\.transform = `translateX/, "Expected centered horizontal tracks");
assert.match(html, /video\.play\(\)\.catch/, "Expected local video playback support");
assert.match(html, /iframe\.removeAttribute\("src"\)/, "Expected inactive Vimeo players to stop cleanly");
assert.match(html, /!iframe\.getAttribute\("src"\)/, "Expected stopped Vimeo players to restart");
assert.match(html, /function hydrateSlidesAround\(\)/, "Expected nearby-only carousel image loading");
assert.match(html, /deferImages: true/, "Expected below-the-fold carousel loading to be deferred");
assert.match(html, /data-srcset="assets\/photography\/web-1200/, "Expected responsive photography assets");
assert.match(html, /class="description project-credits"/, "Expected film credits to match carousel descriptions");
assert.match(html, /\.map\(\(\[role, name\]\) => `\$\{role\} \$\{name\}`\)/, "Expected roles and names on one line");
assert.doesNotMatch(css, /\.project-credits dt/, "Expected regular-weight No More Movies credits");
assert.match(html, /preload="none"/, "Expected local video loading to be deferred until playback");
assert.match(html, /actorVideo\.pause\(\)/, "Expected PLACEBO pause support");
assert.match(html, /Pausar PLACEBO/, "Expected an accessible PLACEBO pause control");
assert.doesNotMatch(html, /assets\/actor\/PLACEBO\.mp4/, "Expected the GitHub-compatible PLACEBO video");
assert.doesNotMatch(html, /assets\/actor\/PLACEBO%20COVER\.png/, "Expected the optimized PLACEBO cover");

assert.match(css, /--paper:\s*#f7f5ef/, "Expected the off-white site palette");
assert.match(css, /\.video-track,[\s\S]*?gap:\s*0;/, "Expected flush carousel tracks");
assert.match(css, /\.slider-controls \{[\s\S]*?position:\s*absolute;/, "Expected overlaid carousel controls");
assert.match(css, /\.slide-caption \.credits-columns \{[\s\S]*?column-count:\s*2;/, "Expected two-column Chevrolet credits");
assert.match(css, /opacity:\s*0\.32;/, "Expected subdued captions on adjacent slides");

console.log("Portfolio checks passed");

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
  'href="#faces"',
  'id="faces"',
  "FACES",
  'href="#memento"',
  'id="memento"',
  "MEMENTO",
  'href="#ambulante"',
  'id="ambulante"',
  "FILM<br />WORKSHOP",
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
  "assets/bio/BRIAN-HANSEN-PORTRAIT-web.jpg",
  "<strong>Brian Alex Hansen</strong> is an actor",
  "assets/faces/faces-collage.jpg",
  'width="1140"',
  'height="11250"',
  "In 2018, he co-founded the <em>Taller Ambulante de Fotografía</em>",
  "<em>Taller Ambulante de Cine Documental</em>",
  "Writer &amp; Director: Sage Bennett",
  "Starring: Sage Bennett &amp; Brian Hansen",
  '<span class="actor-quote-line">"Short love affairs can leave you feeling less justified in your grief because it was never supposed</span>',
  '<span class="actor-quote-line">to be serious. I wanted to transform those painpoints into art."</span>',
  '<p class="actor-quote-author">SAGE BENNETT</p>',
  "Between old movies<br />and motorcycle trips",
  '["Written and directed by", "Brian Hansen"]',
  '["Starring", "Camila Araiza"]',
  "Written and directed by Brian Hansen",
  "DoP: Mauricio Padilla",
  "Executive Producer: Coco Rodriguez",
  "Production Company: Stink Mexico",
  "DoP: MacGregor & Josep Pardo",
  "MD: Vanessa Hernández",
  "A night at a rave in Patagonia. VHS diaries.\nShot & edited by Brian Hansen",
  '<span class="synopsis-line">A montage exercise that becomes a portrait of a community. Intimate, behind-the-scenes moments captured</span>',
  '<span class="synopsis-line">with a Handycam during a film workshop in a town in northern Mexico.</span>',
  '<span class="credit-line">Shot & edited by Brian Hansen</span>',
  '{ file: "Placebo.jpeg", label: "Placebo" }',
  '{ file: "Out of the blue and into the black.jpeg", label: "Out of the blue and into the black" }',
  '{ file: "Nubes Madrileñas.jpeg", label: "Nubes Madrileñas" }',
  '{ file: "Real de Catorce.jpeg", label: "Real de Catorce" }',
  '{ file: "Tren de Buenos Aires.jpeg", label: "Tren de Buenos Aires" }',
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
  "../assets/bio/BRIAN-HANSEN-PORTRAIT-web.jpg",
  "../assets/faces/faces-collage.jpg",
]) {
  assert.ok(existsSync(new URL(asset, import.meta.url)), `Expected local asset ${asset}`);
}

const filmItems = html.match(/const filmItems = \[([\s\S]*?)\n\s*\];/)?.[1] ?? "";
const photographyItems = html.match(/const photographyItems = \[([\s\S]*?)\n\s*\];/)?.[1] ?? "";
const ambulanteItems = html.match(/const ambulanteItems = \[([\s\S]*?)\n\s*\];/)?.[1] ?? "";

assert.equal((filmItems.match(/player\.vimeo\.com\/video/g) ?? []).length, 6, "Expected six FILM projects");
assert.equal((photographyItems.match(/\{ file:/g) ?? []).length, 21, "Expected 21 STILL PHOTO images");
assert.equal((ambulanteItems.match(/player\.vimeo\.com\/video/g) ?? []).length, 7, "Expected seven FILM WORKSHOP projects");
assert.equal((ambulanteItems.match(/meta: "Film workshop \/ 20\d{2}"/g) ?? []).length, 7, "Expected FILM WORKSHOP metadata on every project");
assert.doesNotMatch(
  photographyItems,
  /file: "(?:!\.jpeg|Frisco\.jpeg|Quote\.jpeg)"/,
  "Expected removed photographs to stay out of the carousel",
);
assert.doesNotMatch(photographyItems, /Real de Catoce|Tren Porteño/, "Expected old photography names to stay removed");
assert.doesNotMatch(photographyItems, /Out of the blue, and into the black/, "Expected the old comma to stay removed");
assert.doesNotMatch(photographyItems, /Hey you! Get of my cloud!/, "Expected the replaced photography title to stay removed");

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
assert.doesNotMatch(filmItems, /Original Score by|Sound Production by|LAB TANK/, "Expected shortened No More Movies credits");
assert.doesNotMatch(filmItems, /Produced by Pangea|Art Direction & Wardrobe/, "Expected shortened Bonita credits");
assert.doesNotMatch(filmItems, /Executive Producer: Daniela Bonilla|Account Manager: Vanessa/, "Expected shortened Chevrolet credits");
assert.doesNotMatch(css, /\.project-credits dt/, "Expected regular-weight No More Movies credits");
assert.match(html, /preload="none"/, "Expected local video loading to be deferred until playback");
assert.match(html, /actorVideo\.pause\(\)/, "Expected PLACEBO pause support");
assert.match(html, /Pausar PLACEBO/, "Expected an accessible PLACEBO pause control");
assert.doesNotMatch(html, /Colorist: Nadia Khairat/, "Expected the PLACEBO colorist line to be removed");
assert.doesNotMatch(html, /serious\.<br \/>I wanted/, "Expected the PLACEBO quote to remain one paragraph");
assert.match(css, /\.actor-quote-line \{[\s\S]*?white-space:\s*nowrap;/, "Expected the PLACEBO quote to use two desktop lines");
assert.doesNotMatch(html, /assets\/actor\/PLACEBO\.mp4/, "Expected the GitHub-compatible PLACEBO video");
assert.doesNotMatch(html, /assets\/actor\/PLACEBO%20COVER\.png/, "Expected the optimized PLACEBO cover");

assert.match(css, /--paper:\s*#f7f5ef/, "Expected the off-white site palette");
assert.match(css, /\.video-track,[\s\S]*?gap:\s*0;/, "Expected flush carousel tracks");
assert.match(css, /\.slider-controls \{[\s\S]*?position:\s*absolute;/, "Expected overlaid carousel controls");
assert.doesNotMatch(filmItems, /creditsColumns:\s*true/, "Expected Chevrolet credits to use the standard single-column layout");
assert.match(css, /\.video-slide:not\(\.is-active\) \{[\s\S]*?opacity:\s*0;/, "Expected side videos to remain fully transparent");
assert.match(css, /\.video-slide \.slide-caption \{[\s\S]*?opacity:\s*0;/, "Expected side video captions to remain fully transparent");
assert.match(css, /\.photography-slide:not\(\.is-active\) \{[\s\S]*?opacity:\s*0;/, "Expected side photographs to remain fully transparent");
assert.match(css, /\.photography-slide \.photography-caption \{[\s\S]*?opacity:\s*0;/, "Expected side photography captions to remain fully transparent");
assert.match(css, /\.bio-layout \{[\s\S]*?grid-template-columns:/, "Expected the BIO portrait beside the copy");
assert.match(css, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/, "Expected equal-width BIO columns");
assert.match(css, /\.bio-portrait img \{[\s\S]*?width:\s*100%;[\s\S]*?height:\s*auto;/, "Expected the complete BIO portrait to remain visible");
assert.match(css, /\.bio-copy \{[\s\S]*?font-size:\s*13px;[\s\S]*?line-height:\s*1\.48;/, "Expected compact BIO copy beside the portrait");
assert.match(css, /\.description \.synopsis-line \{[\s\S]*?white-space:\s*nowrap;/, "Expected the Nacozari synopsis to hold its two-line layout on desktop");
assert.match(css, /\.faces-scroll \{[\s\S]*?overflow-y:\s*auto;/, "Expected the FACES archive to scroll inside its window");
assert.match(css, /\.faces-window::before,[\s\S]*?\.faces-window::after/, "Expected matching FACES fades above and below the window");
assert.match(css, /\.faces-window \{[\s\S]*?width:\s*100%;/, "Expected FACES to use the full page width");
assert.ok(statSync(new URL("../assets/faces/faces-collage.jpg", import.meta.url)).size < 1_500_000, "Expected an optimized FACES collage");
assert.match(css, /scroll-padding-top:\s*calc\(var\(--mobile-header-height, 143px\) \+ 8px\)/, "Expected mobile anchors to clear the fixed header");
assert.match(html, /function syncMobileHeaderHeight\(\)/, "Expected the mobile anchor offset to follow the real header height");
assert.doesNotMatch(html, /Alongside his artistic work|A native Spanish speaker/, "Expected the removed BIO paragraphs to stay removed");

console.log("Portfolio checks passed");

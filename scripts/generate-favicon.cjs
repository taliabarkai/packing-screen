/**
 * Builds `public/favicon.ico` and `src/assets/favicon.ico` from `src/assets/favicon.png`.
 * Source may be PNG or JPEG (some editors save JPEG with a `.png` extension).
 */
const pngToIco = require("png-to-ico");
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const input = path.join(root, "src", "assets", "favicon.png");
const outPublic = path.join(root, "public", "favicon.ico");
const outAssets = path.join(root, "src", "assets", "favicon.ico");

if (!fs.existsSync(input)) {
  console.error("Missing source:", input);
  process.exit(1);
}

(async () => {
  try {
    const image = await Jimp.read(input);
    const w = image.getWidth();
    const h = image.getHeight();
    if (w !== h) {
      console.error("Favicon source must be square (got %dx%d).", w, h);
      process.exit(1);
    }
    const pngBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
    const buf = await pngToIco([pngBuffer]);
    fs.writeFileSync(outPublic, buf);
    fs.writeFileSync(outAssets, buf);
    console.log("Wrote", outPublic, "and", outAssets);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

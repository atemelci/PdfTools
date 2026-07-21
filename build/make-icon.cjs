/*
 * Generates build/icon.ico (and icon.png) with no external dependencies.
 * Draws a flat "PDF download" glyph: a light blue-grey document with a folded
 * top-right corner, a red circle holding a white down-arrow, and a red band
 * with white "PDF" text at the bottom — matching the app's chosen icon.
 * The .ico embeds a single 256x256 PNG image (Vista+ format), which is the
 * size electron-builder needs for Windows packaging.
 */
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const S = 256;
const buf = Buffer.alloc(S * S * 4); // RGBA, transparent by default

const BODY = [230, 236, 240]; // light blue-grey page
const FOLD = [196, 209, 218]; // darker folded corner
const RED = [233, 70, 84]; // coral red circle + band
const WHITE = [255, 255, 255];

function px(x, y, c, a = 255) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= S || y >= S) return;
  const i = (y * S + x) * 4;
  buf[i] = c[0];
  buf[i + 1] = c[1];
  buf[i + 2] = c[2];
  buf[i + 3] = a;
}

function dist(x, y, cx, cy) {
  return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
}

function circle(cx, cy, r, c) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++)
      if (dist(x, y, cx, cy) <= r) px(x, y, c);
}

function rect(x0, y0, x1, y1, c) {
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) px(x, y, c);
}

// Downward triangle: wide base at yTop, apex at (cx, yApex)
function triDown(cx, yTop, halfW, yApex, c) {
  for (let y = yTop; y <= yApex; y++) {
    const hw = halfW * (1 - (y - yTop) / (yApex - yTop));
    for (let x = cx - hw; x <= cx + hw; x++) px(x, y, c);
  }
}

// ---- Document page (rounded TL/BL/BR corners, folded TR corner) ----
const PX0 = 34, PY0 = 12, PX1 = 222, PY1 = 244, R = 12, FOLDSZ = 50;

function pageInside(x, y) {
  if (x < PX0 || x >= PX1 || y < PY0 || y >= PY1) return false;
  if (x < PX0 + R && y < PY0 + R) return dist(x, y, PX0 + R, PY0 + R) <= R; // TL
  if (x < PX0 + R && y > PY1 - R - 1) return dist(x, y, PX0 + R, PY1 - R - 1) <= R; // BL
  if (x > PX1 - R - 1 && y > PY1 - R - 1) return dist(x, y, PX1 - R - 1, PY1 - R - 1) <= R; // BR
  return true;
}

for (let y = PY0; y < PY1; y++) {
  for (let x = PX0; x < PX1; x++) {
    if (!pageInside(x, y)) continue;
    const inCorner = x >= PX1 - FOLDSZ && y <= PY0 + FOLDSZ;
    if (inCorner) {
      // diagonal from (PX1-FOLDSZ,PY0) to (PX1,PY0+FOLDSZ)
      const d = (y - PY0) - (x - (PX1 - FOLDSZ));
      if (d < 0) continue; // cut-away corner (transparent)
      px(x, y, FOLD); // folded flap (darker)
    } else {
      px(x, y, BODY);
    }
  }
}

// ---- Bottom red band (straight top, rounded bottom corners) ----
const BANDTOP = 190;
for (let y = BANDTOP; y < PY1; y++)
  for (let x = PX0; x < PX1; x++) if (pageInside(x, y)) px(x, y, RED);

// ---- Red circle + white down arrow ----
const CX = 128, CY = 106, CR = 62;
circle(CX, CY, CR, RED);
// arrow stem
rect(CX - 11, 66, CX + 11, 116, WHITE);
// arrow head
triDown(CX, 100, 34, 152, WHITE);

// ---- "PDF" text in the band (blocky vector letters) ----
function glyphP(gx, gy, w, h, t) {
  rect(gx, gy, gx + t, gy + h, WHITE); // stem
  rect(gx, gy, gx + w, gy + t, WHITE); // top bar
  rect(gx, gy + h / 2 - t, gx + w, gy + h / 2, WHITE); // middle bar
  rect(gx + w - t, gy, gx + w, gy + h / 2, WHITE); // right upper
}
function glyphD(gx, gy, w, h, t) {
  // Flat on the left, rounded on the right, with a hollow counter — a true "D".
  const rr = h / 2;
  const ccx = gx + w - rr; // centre of the right semicircle
  const ccy = gy + h / 2;
  for (let y = gy; y < gy + h; y++) {
    for (let x = gx; x < gx + w; x++) {
      const outer = x <= ccx ? true : dist(x, y, ccx, ccy) <= rr;
      if (!outer) continue;
      let inner = false;
      if (x >= gx + t && y >= gy + t && y <= gy + h - t) {
        inner = x <= ccx ? true : dist(x, y, ccx, ccy) <= rr - t;
      }
      px(x, y, inner ? RED : WHITE);
    }
  }
}
function glyphF(gx, gy, w, h, t) {
  rect(gx, gy, gx + t, gy + h, WHITE); // stem
  rect(gx, gy, gx + w, gy + t, WHITE); // top bar
  rect(gx, gy + h / 2 - t / 2, gx + w - 4, gy + h / 2 + t / 2, WHITE); // middle bar
}

const GW = 26, GH = 32, GT = 7, GAP = 11;
const totalW = GW * 3 + GAP * 2;
let gx = Math.round(CX - totalW / 2);
const gy = Math.round((BANDTOP + PY1) / 2 - GH / 2);
glyphP(gx, gy, GW, GH, GT);
gx += GW + GAP;
glyphD(gx, gy, GW, GH, GT);
gx += GW + GAP;
glyphF(gx, gy, GW, GH, GT);

// ---- PNG encode ----
function crc32(bufData) {
  const table = crc32.table || (crc32.table = (() => {
    const t = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < bufData.length; i++) crc = table[(crc ^ bufData[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const raw = Buffer.alloc(S * (S * 4 + 1));
for (let y = 0; y < S; y++) {
  raw[y * (S * 4 + 1)] = 0;
  buf.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4);
}
const idat = zlib.deflateSync(raw, { level: 9 });

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0);
ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // color type RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", idat),
  chunk("IEND", Buffer.alloc(0)),
]);

fs.writeFileSync(path.join(__dirname, "icon.png"), png);

// ---- ICO wrapper (single 256x256 PNG entry) ----
const icondir = Buffer.alloc(6);
icondir.writeUInt16LE(0, 0);
icondir.writeUInt16LE(1, 2);
icondir.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry[0] = 0; // width 256 -> 0
entry[1] = 0; // height 256 -> 0
entry.writeUInt16LE(1, 4); // planes
entry.writeUInt16LE(32, 6); // bit count
entry.writeUInt32LE(png.length, 8);
entry.writeUInt32LE(6 + 16, 12);
fs.writeFileSync(path.join(__dirname, "icon.ico"), Buffer.concat([icondir, entry, png]));

console.log("icon.ico + icon.png written (" + png.length + " byte PNG)");

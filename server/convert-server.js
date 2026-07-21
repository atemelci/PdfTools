/*
 * convert-server.js — LibreOffice document conversion server for PDF Tools.
 *
 * The "Word → PDF" and "PDF → Word" tools cannot run inside the browser
 * because they need LibreOffice, so the front-end POSTs the file here and
 * this tiny server shells out to `soffice --headless --convert-to`.
 *
 * It has ZERO npm dependencies — it only needs Node.js 18+ and LibreOffice.
 * Multipart parsing, CORS and file handling are all done with Node built-ins,
 * so there is nothing to `npm install`; just run it and point the app at it.
 *
 *   Requirements:
 *     • Node.js 18 or newer
 *     • LibreOffice (provides the `soffice` command)
 *         - Windows: https://www.libreoffice.org/download
 *         - macOS:   brew install --cask libreoffice
 *         - Linux:   sudo apt install libreoffice   (or your distro's package)
 *
 *   Run it:
 *     node server/convert-server.js
 *     node server/convert-server.js --port 4000        (custom port)
 *     SOFFICE_BIN="/path/to/soffice" node server/convert-server.js
 *
 *   Then in the PDF Tools app, open "Word → PDF" or "PDF → Word" and set the
 *   conversion server URL to match (default http://localhost:3000).
 */

const http = require("http");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { randomUUID } = require("crypto");

// ── Configuration ──────────────────────────────────────────────────────────
function readPort() {
  const argIdx = process.argv.indexOf("--port");
  if (argIdx !== -1 && process.argv[argIdx + 1]) return parseInt(process.argv[argIdx + 1], 10);
  if (process.env.PORT) return parseInt(process.env.PORT, 10);
  return 3000;
}
const PORT = readPort();
const HOST = process.env.HOST || "127.0.0.1";
const MAX_BYTES = 100 * 1024 * 1024; // 100 MB upload cap

// Locate the LibreOffice binary. Allow an override, otherwise try the usual names.
function findSoffice() {
  if (process.env.SOFFICE_BIN) return process.env.SOFFICE_BIN;
  const candidates =
    process.platform === "win32"
      ? [
          "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
          "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
          "soffice.exe",
          "soffice",
        ]
      : process.platform === "darwin"
      ? ["/Applications/LibreOffice.app/Contents/MacOS/soffice", "soffice"]
      : ["soffice", "libreoffice"];
  for (const c of candidates) {
    // Absolute paths: check existence. Bare command names: assume it's on PATH.
    if (path.isAbsolute(c)) {
      if (fs.existsSync(c)) return c;
    } else {
      return c;
    }
  }
  return candidates[candidates.length - 1];
}
const SOFFICE = findSoffice();

// Map the requested target to a LibreOffice filter + response content-type.
const TARGETS = {
  pdf:  { convert: "pdf",  ext: "pdf",  mime: "application/pdf" },
  docx: { convert: "docx:MS Word 2007 XML", ext: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
};

// ── Minimal multipart/form-data parser (single file + text fields) ──────────
function parseMultipart(buffer, boundary) {
  const parts = [];
  const delimiter = Buffer.from(`--${boundary}`);
  const segments = splitBuffer(buffer, delimiter);
  for (const seg of segments) {
    // Ignore the preamble, the closing "--" marker and empty chunks.
    if (seg.length < 4) continue;
    // Each real part begins with CRLF after the boundary.
    let body = seg;
    if (body[0] === 0x0d && body[1] === 0x0a) body = body.slice(2);
    const headerEnd = indexOfBuffer(body, Buffer.from("\r\n\r\n"));
    if (headerEnd === -1) continue;
    const rawHeaders = body.slice(0, headerEnd).toString("utf8");
    let content = body.slice(headerEnd + 4);
    // Strip the trailing CRLF that precedes the next boundary.
    if (content.length >= 2 && content[content.length - 2] === 0x0d && content[content.length - 1] === 0x0a) {
      content = content.slice(0, content.length - 2);
    }
    const disposition = /content-disposition:[^\n]*/i.exec(rawHeaders);
    if (!disposition) continue;
    const nameMatch = /name="([^"]*)"/i.exec(disposition[0]);
    const fileMatch = /filename="([^"]*)"/i.exec(disposition[0]);
    parts.push({
      name: nameMatch ? nameMatch[1] : "",
      filename: fileMatch ? fileMatch[1] : null,
      content,
    });
  }
  return parts;
}

function splitBuffer(buffer, delimiter) {
  const out = [];
  let start = 0;
  let idx;
  while ((idx = indexOfBuffer(buffer, delimiter, start)) !== -1) {
    out.push(buffer.slice(start, idx));
    start = idx + delimiter.length;
  }
  out.push(buffer.slice(start));
  return out;
}

function indexOfBuffer(buffer, search, from = 0) {
  return buffer.indexOf(search, from);
}

// ── CORS ────────────────────────────────────────────────────────────────────
// The app runs from file:// (Electron) or a dev server, so allow any origin.
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ── Request handling ────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "pdf-tools convert-server", soffice: SOFFICE }));
    return;
  }

  if (req.method !== "POST" || !req.url.startsWith("/convert")) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found. POST a file to /convert.");
    return;
  }

  const contentType = req.headers["content-type"] || "";
  const boundaryMatch = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
  if (!contentType.startsWith("multipart/form-data") || !boundaryMatch) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Expected multipart/form-data with a file field.");
    return;
  }
  const boundary = boundaryMatch[1] || boundaryMatch[2];

  const chunks = [];
  let received = 0;
  let aborted = false;
  req.on("data", (c) => {
    received += c.length;
    if (received > MAX_BYTES) {
      aborted = true;
      res.writeHead(413, { "Content-Type": "text/plain" });
      res.end("File too large (100 MB limit).");
      req.destroy();
      return;
    }
    chunks.push(c);
  });
  req.on("end", () => {
    if (aborted) return;
    handleConvert(Buffer.concat(chunks), boundary, res);
  });
  req.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Upload error.");
    }
  });
});

function handleConvert(body, boundary, res) {
  let parts;
  try {
    parts = parseMultipart(body, boundary);
  } catch (e) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Could not parse the uploaded form data.");
    return;
  }

  const filePart = parts.find((p) => p.name === "file" && p.filename);
  const targetPart = parts.find((p) => p.name === "target");
  const targetKey = (targetPart ? targetPart.content.toString("utf8").trim() : "pdf") || "pdf";
  const target = TARGETS[targetKey];

  if (!filePart) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("No file field found in the request.");
    return;
  }
  if (!target) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end(`Unsupported target "${targetKey}". Use "pdf" or "docx".`);
    return;
  }

  // Work inside a throwaway temp directory so parallel requests never collide.
  const workDir = path.join(os.tmpdir(), `pdftools-${randomUUID()}`);
  fs.mkdirSync(workDir, { recursive: true });

  const safeName = path.basename(filePart.filename).replace(/[^\w.\- ]+/g, "_") || "input";
  const inputPath = path.join(workDir, safeName);
  fs.writeFileSync(inputPath, filePart.content);

  const cleanup = () => {
    try { fs.rmSync(workDir, { recursive: true, force: true }); } catch (_) {}
  };

  // Give this conversion its own throwaway LibreOffice profile. Without it, a
  // headless run fails whenever the user already has LibreOffice open, because
  // the default profile is locked by that first instance.
  const profileDir = path.join(workDir, "profile");
  const profileUrl = "file://" + profileDir.replace(/\\/g, "/").replace(/^([A-Za-z]):/, "/$1:");

  // `--convert-to <filter>` writes <basename>.<ext> into --outdir.
  const args = [
    "--headless",
    "--norestore",
    `-env:UserInstallation=${profileUrl}`,
    "--convert-to", target.convert,
    "--outdir", workDir,
    inputPath,
  ];
  const proc = spawn(SOFFICE, args, { windowsHide: true });

  let stderr = "";
  proc.stderr.on("data", (d) => { stderr += d.toString(); });
  proc.on("error", (err) => {
    cleanup();
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(
      `Could not launch LibreOffice (${SOFFICE}). Make sure LibreOffice is installed and on your PATH, ` +
      `or set SOFFICE_BIN to its full path. Details: ${err.message}`
    );
  });
  proc.on("close", (code) => {
    const outName = safeName.replace(/\.[^.]+$/, "") + "." + target.ext;
    const outPath = path.join(workDir, outName);
    if (code !== 0 || !fs.existsSync(outPath)) {
      cleanup();
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(`Conversion failed (exit ${code}). ${stderr.trim().slice(0, 400)}`);
      return;
    }
    const out = fs.readFileSync(outPath);
    cleanup();
    res.writeHead(200, {
      "Content-Type": target.mime,
      "Content-Disposition": `attachment; filename="${outName}"`,
      "Content-Length": out.length,
    });
    res.end(out);
  });
}

// ── Startup ─────────────────────────────────────────────────────────────────
// Warn early (but don't refuse to start) if LibreOffice can't be found.
function checkSoffice() {
  try {
    const probe = spawnSync(SOFFICE, ["--version"], { windowsHide: true });
    if (probe.error) throw probe.error;
    const v = (probe.stdout || probe.stderr || "").toString().trim().split("\n")[0];
    console.log(`LibreOffice detected: ${v || SOFFICE}`);
  } catch (_) {
    console.warn(
      `⚠  Could not verify LibreOffice at "${SOFFICE}". Conversions will fail until it is installed ` +
      `and on your PATH (or SOFFICE_BIN points to it).`
    );
  }
}

server.listen(PORT, HOST, () => {
  checkSoffice();
  console.log(`PDF Tools convert-server listening on http://${HOST}:${PORT}`);
  console.log(`Set this URL in the app's "Word → PDF" / "PDF → Word" options.`);
});

# PDF Tools

**EN** — A standalone, offline PDF toolkit for Windows. Merge, split, rotate, edit, extract, and convert PDFs. Just double-click one `.exe` — no install, no browser, no internet needed for the core tools.

**TR** — Bağımsız, çevrimdışı çalışan bir PDF aracı. PDF birleştir, böl, döndür, düzenle, metin çıkar ve dönüştür. Tek bir `.exe`'ye çift tıkla — kurulum yok, tarayıcı yok, çekirdek araçlar için internet gerekmez.

## Download for Windows

Download the ready-to-run Windows application:

[Download PDF Tools for Windows](https://github.com/atemelci/PdfTools/releases/latest/download/PDF-Tools.zip)

**EN** — Download the ZIP file, extract it, and double-click the `.exe` file.

**TR** — ZIP dosyasını indirin, klasöre çıkarın ve `.exe` dosyasına çift tıklayın.

### Microsoft Defender SmartScreen Warning

**EN** — When you run the application for the first time, Microsoft Defender SmartScreen may display an **“Unrecognized app”** warning. This warning may appear because the application is not digitally signed.

To continue:

1. Click **More info**.
2. Click **Run anyway**.

**TR** — Uygulamayı ilk kez çalıştırdığınızda Microsoft Defender SmartScreen tarafından **“Tanınmayan uygulama”** uyarısı görüntülenebilir. Bu uyarı, uygulamanın dijital olarak imzalanmamış olmasından kaynaklanabilir.

Devam etmek için:

1. **Ek bilgi** seçeneğine tıklayın.
2. **Yine de çalıştır** seçeneğine tıklayın.

## Features

**Offline :** PDF Editor · Merge · Split · Rotate · Extract Text · Images ⇄ PDF

**Online :** AI Translate (needs internet + API key) · Word ⇄ PDF (needs a local LibreOffice server)

## Word ⇄ PDF conversion server

**EN** — The **Word → PDF** and **PDF → Word** tools rely on LibreOffice, which cannot run inside the browser. A small helper — `server/convert-server.js` — bridges the app to LibreOffice. It has **no npm dependencies**; it only needs Node.js 18+ and LibreOffice installed.

**TR** — **Word → PDF** ve **PDF → Word** araçları, tarayıcıda çalışamayan LibreOffice'e ihtiyaç duyar. `server/convert-server.js` yardımcısı uygulamayı LibreOffice'e bağlar. **npm bağımlılığı yoktur**; yalnızca Node.js 18+ ve kurulu LibreOffice gerekir.

1. Install LibreOffice — [Windows/macOS/Linux download](https://www.libreoffice.org/download).
2. Start the server:

   ```bash
   npm run server        # defaults to http://localhost:3000
   # or: node server/convert-server.js --port 4000
   ```

3. In the app, open **Word → PDF** or **PDF → Word** and set the conversion server URL to match. Then upload a file and convert.

The server auto-detects the `soffice` binary; if it lives somewhere unusual, point at it with `SOFFICE_BIN="/full/path/to/soffice"`.

## Build it with

**EN** — Requires [Node.js 18+](https://nodejs.org) on Windows:

**TR** — Windows'ta [Node.js 18+](https://nodejs.org) gerekir:

```bash
npm install      
npm run dist:win     # -> release/PDF-Tools-1.0.0.exe
```

Built with React + Vite + Electron. Core PDF libraries (`pdf-lib`, `pdf.js`) are bundled locally under `public/vendor/`, so the app works fully offline.

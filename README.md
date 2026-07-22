# PDF Tools

**EN** — A standalone, offline PDF toolkit for Windows. Merge, split, rotate, edit, extract, and convert PDFs. Just double-click one `.exe` — no install, no browser, no internet needed for the core tools.

**TR** — Bağımsız, çevrimdışı çalışan bir PDF aracı. PDF birleştir, böl, döndür, düzenle, metin çıkar ve dönüştür. Tek bir `.exe`'ye çift tıkla — kurulum yok, tarayıcı yok, çekirdek araçlar için internet gerekmez.

## Use in your browser — Linux, macOS & Windows (no install)

**EN** — Not on Windows? Use the web version in any modern browser (Chrome, Firefox, Edge, Safari). Nothing to install:

**➡️ [Open PDF Tools in your browser](https://atemelci.github.io/PdfTools/)**

The core tools (PDF Editor, Merge, Split, Rotate, Extract Text, Images ⇄ PDF) run entirely in your browser — your files never leave your computer. AI Translate needs an API key, and Word ⇄ PDF needs the local conversion server (see below).

**TR** — Windows kullanmıyor musunuz? Web sürümünü herhangi bir modern tarayıcıda (Chrome, Firefox, Edge, Safari) kullanın. Kurulum gerekmez:

**➡️ [PDF Tools'u tarayıcınızda açın](https://atemelci.github.io/PdfTools/)**

Çekirdek araçlar (PDF Düzenleyici, Birleştir, Böl, Döndür, Metin Çıkar, Görsel ⇄ PDF) tamamen tarayıcınızda çalışır — dosyalarınız bilgisayarınızdan çıkmaz. AI Çeviri için bir API anahtarı, Word ⇄ PDF için ise yerel dönüştürme sunucusu (aşağıya bakın) gerekir.

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

**Online :** AI Translate (needs internet + API key)

## Build it with

**EN** — Requires [Node.js 18+](https://nodejs.org) on Windows:

**TR** — Windows'ta [Node.js 18+](https://nodejs.org) gerekir:

```bash
npm install      
npm run dist:win     # -> release/PDF-Tools-1.0.0.exe
```

Built with React + Vite + Electron. Core PDF libraries (`pdf-lib`, `pdf.js`) are bundled locally under `public/vendor/`, so the app works fully offline.

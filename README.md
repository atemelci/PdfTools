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

[Download PDF Tools for Windows](https://github.com/atemelci/PdfTools/releases/latest/download/PDF-Tools.exe)

**EN** — Download the `.exe` file and double-click it. It is a single portable file — no installation, nothing to extract.

**TR** — `.exe` dosyasını indirin ve çift tıklayın. Tek, taşınabilir bir dosyadır — kurulum yok, çıkarma yok.

### Microsoft Defender SmartScreen Warning

**EN** — When you run the application for the first time, Microsoft Defender SmartScreen may display an **“Unrecognized app”** warning. This warning may appear because the application is not digitally signed.

To continue:

1. Click **More info**.
2. Click **Run anyway**.

**TR** — Uygulamayı ilk kez çalıştırdığınızda Microsoft Defender SmartScreen tarafından **“Tanınmayan uygulama”** uyarısı görüntülenebilir. Bu uyarı, uygulamanın dijital olarak imzalanmamış olmasından kaynaklanabilir.

Devam etmek için:

1. **Ek bilgi** seçeneğine tıklayın.
2. **Yine de çalıştır** seçeneğine tıklayın.

## Download for Linux

Two ways to run PDF Tools on Linux — pick whichever you prefer:

### Option 1 — AppImage (no install, one click)

[Download the AppImage](https://github.com/atemelci/PdfTools/releases/latest/download/PDF-Tools.AppImage)

**EN** — A single portable file, just like the Windows `.exe`. After downloading, make it executable and run it:

```bash
chmod +x PDF-Tools.AppImage
./PDF-Tools.AppImage
```

Or right-click the file → **Properties → Permissions → Allow executing**, then double-click it. If it doesn't start, install FUSE (`sudo apt install libfuse2`) or run it with `./PDF-Tools.AppImage --appimage-extract-and-run`.

**TR** — Windows'taki `.exe` gibi tek taşınabilir dosya. İndirdikten sonra çalıştırılabilir yapıp açın:

```bash
chmod +x PDF-Tools.AppImage
./PDF-Tools.AppImage
```

Ya da dosyaya sağ tıklayın → **Özellikler → İzinler → Çalıştırılmasına izin ver**, sonra çift tıklayın. Açılmazsa FUSE kurun (`sudo apt install libfuse2`) veya `./PDF-Tools.AppImage --appimage-extract-and-run` ile çalıştırın.

### Option 2 — .deb (install on Debian/Ubuntu)

[Download the .deb package](https://github.com/atemelci/PdfTools/releases/latest/download/PDF-Tools.deb)

```bash
sudo apt install ./PDF-Tools.deb
```

**EN** — Installs "PDF Tools" into your applications menu. Launch it like any other app.

**TR** — "PDF Tools"u uygulama menünüze kurar. Diğer uygulamalar gibi başlatabilirsiniz.

## Features

**Offline :** PDF Editor · Merge · Split · Rotate · Extract Text · Images ⇄ PDF

**Online :** AI Translate (needs internet + API key)

## Build it with

**EN** — Requires [Node.js 18+](https://nodejs.org):

**TR** — [Node.js 18+](https://nodejs.org) gerekir:

```bash
npm install

# Windows (build on Windows):
npm run dist:win       # -> release/PDF-Tools.exe

# Linux (build on Linux):
npm run dist:linux     # -> release/PDF-Tools.AppImage  +  PDF-Tools.deb
```

Each platform's package must be built on that platform. Built with React + Vite + Electron. Core PDF libraries (`pdf-lib`, `pdf.js`) are bundled locally under `public/vendor/`, so the app works fully offline.

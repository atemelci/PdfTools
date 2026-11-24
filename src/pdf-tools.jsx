import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";

const SIDEBAR_TOOLS = [
  { id: "editor",    label: "PDF Editor",   icon: "editor",    section: "Tools", desc: "Add text, shapes & redact visually" },
  { id: "merge",     label: "Merge PDFs",   icon: "merge",     section: "Tools", desc: "Combine multiple PDFs into one" },
  { id: "split",     label: "Split PDF",    icon: "split",     section: "Tools", desc: "Extract pages or split into parts" },
  { id: "rotate",    label: "Rotate Pages", icon: "rotate",    section: "Tools", desc: "Rotate specific pages" },
  { id: "translate", label: "Translate PDF",icon: "translate", section: "Tools", desc: "Translate PDF text between languages" },
  { id: "extract",   label: "Extract Text", icon: "extract",   section: "Tools", desc: "Pull text content from PDF" },
  { id: "img2pdf",   label: "Images → PDF", icon: "img2pdf",   section: "Image Conversion", desc: "Convert/merge JPG, PNG, JPEG into one PDF" },
  { id: "pdf2img",   label: "PDF → Images", icon: "pdf2img",   section: "Image Conversion", desc: "Export PDF pages as JPG or PNG images" },
  { id: "word2pdf",  label: "Word → PDF",   icon: "word",      section: "Document Conversion", desc: "Convert DOCX/DOC/ODT to PDF (LibreOffice)" },
  { id: "pdf2word",  label: "PDF → Word",   icon: "swap",      section: "Document Conversion", desc: "Convert PDF to editable DOCX (LibreOffice)" },
];

const EDIT_MODES = [
  { id: "addText",   label: "Add Text",    icon: "type"   },
  { id: "image",     label: "Add Image",   icon: "image"  },
  { id: "redact",    label: "Wipe (Out)",  icon: "square" },
  { id: "highlight", label: "Highlight",   icon: "marker" },
  { id: "rect",      label: "Markers",     icon: "square" },
  { id: "sign",      label: "Signature",   icon: "pen"    },
  { id: "select",    label: "Select/Move", icon: "cursor" },
];

const FONT_OPTIONS = [
  // ── Standard (built into PDF — exact match on export) ──
  { label: "Aptos",          group: "Standard",   value: "'Plus Jakarta Sans', sans-serif",   pdfLib: "Helvetica",  googleFont: "Plus+Jakarta+Sans:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Helvetica",      group: "Standard",   value: "Helvetica, Arial, sans-serif",      pdfLib: "Helvetica"  },
  { label: "Times New Roman",group: "Standard",   value: "'Times New Roman', serif",          pdfLib: "TimesRoman" },
  { label: "Courier",        group: "Standard",   value: "'Courier New', Courier, monospace", pdfLib: "Courier"    },
  { label: "Georgia",        group: "Standard",   value: "Georgia, serif",                    pdfLib: "TimesRoman" },
  { label: "Verdana",        group: "Standard",   value: "Verdana, sans-serif",               pdfLib: "Helvetica"  },

  // ── Sans Serif ──
  { label: "Roboto",         group: "Sans Serif", value: "'Roboto', sans-serif",              pdfLib: "Helvetica",  googleFont: "Roboto:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Open Sans",      group: "Sans Serif", value: "'Open Sans', sans-serif",           pdfLib: "Helvetica",  googleFont: "Open+Sans:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Lato",           group: "Sans Serif", value: "'Lato', sans-serif",                pdfLib: "Helvetica",  googleFont: "Lato:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Montserrat",     group: "Sans Serif", value: "'Montserrat', sans-serif",          pdfLib: "Helvetica",  googleFont: "Montserrat:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Poppins",        group: "Sans Serif", value: "'Poppins', sans-serif",             pdfLib: "Helvetica",  googleFont: "Poppins:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Inter",          group: "Sans Serif", value: "'Inter', sans-serif",               pdfLib: "Helvetica",  googleFont: "Inter:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Raleway",        group: "Sans Serif", value: "'Raleway', sans-serif",             pdfLib: "Helvetica",  googleFont: "Raleway:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Nunito",         group: "Sans Serif", value: "'Nunito', sans-serif",              pdfLib: "Helvetica",  googleFont: "Nunito:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Oswald",         group: "Sans Serif", value: "'Oswald', sans-serif",              pdfLib: "Helvetica",  googleFont: "Oswald:wght@400;700" },
  { label: "Noto Sans",      group: "Sans Serif", value: "'Noto Sans', sans-serif",           pdfLib: "Helvetica",  googleFont: "Noto+Sans:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Source Sans 3",  group: "Sans Serif", value: "'Source Sans 3', sans-serif",       pdfLib: "Helvetica",  googleFont: "Source+Sans+3:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Work Sans",      group: "Sans Serif", value: "'Work Sans', sans-serif",           pdfLib: "Helvetica",  googleFont: "Work+Sans:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Rubik",          group: "Sans Serif", value: "'Rubik', sans-serif",               pdfLib: "Helvetica",  googleFont: "Rubik:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "DM Sans",        group: "Sans Serif", value: "'DM Sans', sans-serif",             pdfLib: "Helvetica",  googleFont: "DM+Sans:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Ubuntu",         group: "Sans Serif", value: "'Ubuntu', sans-serif",              pdfLib: "Helvetica",  googleFont: "Ubuntu:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Mulish",         group: "Sans Serif", value: "'Mulish', sans-serif",              pdfLib: "Helvetica",  googleFont: "Mulish:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Barlow",         group: "Sans Serif", value: "'Barlow', sans-serif",              pdfLib: "Helvetica",  googleFont: "Barlow:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Fira Sans",      group: "Sans Serif", value: "'Fira Sans', sans-serif",           pdfLib: "Helvetica",  googleFont: "Fira+Sans:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Quicksand",      group: "Sans Serif", value: "'Quicksand', sans-serif",           pdfLib: "Helvetica",  googleFont: "Quicksand:wght@400;700" },

  // ── Serif ──
  { label: "Merriweather",   group: "Serif",      value: "'Merriweather', serif",             pdfLib: "TimesRoman", googleFont: "Merriweather:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Playfair Display",group:"Serif",      value: "'Playfair Display', serif",         pdfLib: "TimesRoman", googleFont: "Playfair+Display:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "PT Serif",       group: "Serif",      value: "'PT Serif', serif",                 pdfLib: "TimesRoman", googleFont: "PT+Serif:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Roboto Slab",    group: "Serif",      value: "'Roboto Slab', serif",              pdfLib: "TimesRoman", googleFont: "Roboto+Slab:wght@400;700" },
  { label: "Lora",           group: "Serif",      value: "'Lora', serif",                     pdfLib: "TimesRoman", googleFont: "Lora:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Bitter",         group: "Serif",      value: "'Bitter', serif",                   pdfLib: "TimesRoman", googleFont: "Bitter:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "EB Garamond",    group: "Serif",      value: "'EB Garamond', serif",              pdfLib: "TimesRoman", googleFont: "EB+Garamond:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Cormorant Garamond", group: "Serif",  value: "'Cormorant Garamond', serif",       pdfLib: "TimesRoman", googleFont: "Cormorant+Garamond:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Crimson Text",   group: "Serif",      value: "'Crimson Text', serif",             pdfLib: "TimesRoman", googleFont: "Crimson+Text:ital,wght@0,400;0,700;1,400;1,700" },

  // ── Monospace ──
  { label: "Source Code Pro",group: "Monospace",  value: "'Source Code Pro', monospace",      pdfLib: "Courier",    googleFont: "Source+Code+Pro:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "JetBrains Mono", group: "Monospace",  value: "'JetBrains Mono', monospace",       pdfLib: "Courier",    googleFont: "JetBrains+Mono:ital,wght@0,400;0,700;1,400;1,700" },
  { label: "Roboto Mono",    group: "Monospace",  value: "'Roboto Mono', monospace",          pdfLib: "Courier",    googleFont: "Roboto+Mono:ital,wght@0,400;0,700;1,400;1,700" },

  // ── Display & Handwriting ──
  { label: "Pacifico",       group: "Display & Handwriting", value: "'Pacifico', cursive",     pdfLib: "Helvetica",  googleFont: "Pacifico" },
  { label: "Dancing Script", group: "Display & Handwriting", value: "'Dancing Script', cursive",pdfLib:"Helvetica",  googleFont: "Dancing+Script:wght@400;700" },
  { label: "Bebas Neue",     group: "Display & Handwriting", value: "'Bebas Neue', sans-serif", pdfLib: "Helvetica",  googleFont: "Bebas+Neue" },
  { label: "Caveat",         group: "Display & Handwriting", value: "'Caveat', cursive",       pdfLib: "Helvetica",  googleFont: "Caveat:wght@400;700" },
  { label: "Lobster",        group: "Display & Handwriting", value: "'Lobster', cursive",      pdfLib: "Helvetica",  googleFont: "Lobster" },
  { label: "Anton",          group: "Display & Handwriting", value: "'Anton', sans-serif",     pdfLib: "Helvetica",  googleFont: "Anton" },
  { label: "Satisfy",        group: "Display & Handwriting", value: "'Satisfy', cursive",      pdfLib: "Helvetica",  googleFont: "Satisfy" },
  { label: "Comfortaa",      group: "Display & Handwriting", value: "'Comfortaa', cursive",    pdfLib: "Helvetica",  googleFont: "Comfortaa:wght@400;700" },
  { label: "Abril Fatface",  group: "Display & Handwriting", value: "'Abril Fatface', serif",  pdfLib: "TimesRoman", googleFont: "Abril+Fatface" },
];

const FONT_SIZES = [8,10,12,14,16,18,20,24,28,32,36,42,48,60,72];

/* ──────────────────────────────────────────────
   THEME — light "editorial" palette.
   Paper-white surfaces, ink black, one striking red.
─────────────────────────────────────────────── */
const T = {
  bg:        "#F4F3EF",   // warm paper workspace
  surface:   "#FFFFFF",   // white panels / sidebar / cards
  surface2:  "#F2F1EC",   // raised / inputs (off-white)
  ink:       "#18181A",   // bold near-black accent element
  border:    "rgba(0,0,0,.10)",
  borderUp:  "rgba(0,0,0,.16)",
  text:      "#1A1A1C",   // primary ink
  dim:       "#5C5C5A",   // secondary
  faint:     "#8C8C88",   // tertiary
  faintest:  "#B6B5B0",   // caption / disabled
  accent:    "#D81F3F",   // striking crimson red
  accentHi:  "#B0182F",   // hover (darker on light)
  accentBg:  "rgba(216,31,63,.09)",
  onAccent:  "#FFFFFF",   // text/icons on a filled red surface
  good:      "#1F8A53",   // success (deep green, legible on white)
  goodBg:    "rgba(31,138,83,.09)",
  bad:       "#B01E2E",   // error (deep red, distinct from accent)
  ui:        "'IBM Plex Sans','Segoe UI',system-ui,sans-serif",
  mono:      "'IBM Plex Mono','SF Mono',ui-monospace,monospace",
};

/* ──────────────────────────────────────────────
   ICON — monoline SVG set (currentColor, no fill).
   Replaces emoji so the toolbar reads as one family.
─────────────────────────────────────────────── */
const ICON_PATHS = {
  editor:    '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="M14 6l4 4"/>',
  merge:     '<rect x="8" y="8" width="12" height="12" rx="1.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
  split:     '<circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><path d="M8.2 7.4 20 16.6M8.2 16.6 20 7.4"/>',
  rotate:    '<path d="M20.5 12a8.5 8.5 0 1 1-2.4-5.9"/><path d="M20.5 4v4h-4"/>',
  img2pdf:   '<rect x="3" y="4" width="18" height="14" rx="2"/><circle cx="8.2" cy="9" r="1.4"/><path d="M21 14.5 16 10 6.5 18.5"/><path d="M12 21h0"/>',
  pdf2img:   '<path d="M13 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V9Z"/><path d="M13 3v6h6"/><path d="M9 17l2-2.2 1.6 1.6L15 13"/>',
  translate: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>',
  extract:   '<path d="M13 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V9Z"/><path d="M13 3v6h6"/><path d="M9 13h6M9 16.5h4"/>',
  chevL:     '<path d="M14.5 18 8.5 12l6-6"/>',
  chevR:     '<path d="M9.5 6 15.5 12l-6 6"/>',
  chevD:     '<path d="M6 9.5 12 15.5l6-6"/>',
  download:  '<path d="M12 4v11"/><path d="M7.5 10.5 12 15l4.5-4.5"/><path d="M5 20h14"/>',
  close:     '<path d="M6 6l12 12M18 6 6 18"/>',
  alert:     '<path d="M12 4 21 19H3Z"/><path d="M12 10v4"/><path d="M12 17h0"/>',
  plus:      '<path d="M12 5v14M5 12h14"/>',
  image:     '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  file:      '<path d="M13 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V9Z"/><path d="M13 3v6h6"/>',
  trash:     '<path d="M4 7h16"/><path d="M9 7V4.5A.5.5 0 0 1 9.5 4h5a.5.5 0 0 1 .5.5V7"/><path d="M6.5 7 7.5 20h9l1-13"/>',
  undo:      '<path d="M9 7 4 12l5 5"/><path d="M4 12h11a4.5 4.5 0 0 1 0 9h-2"/>',
  redo:      '<path d="M15 7l5 5-5 5"/><path d="M20 12H9a4.5 4.5 0 0 0 0 9h2"/>',
  pen:       '<path d="M3 21c3.2 0 5.2-1 7-3l8.5-8.5-4-4L6 14c-2 1.8-3 3.8-3 7Z"/><path d="M14.5 5.5l4 4"/>',
  lock:      '<rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
  check:     '<path d="M5 12.5 10 17l9-10"/>',
  spinner:   '<path d="M12 3a9 9 0 1 0 9 9" />',
  zoomIn:    '<circle cx="11" cy="11" r="7"/><path d="M16 16l4 4M11 8v6M8 11h6"/>',
  zoomOut:   '<circle cx="11" cy="11" r="7"/><path d="M16 16l4 4M8 11h6"/>',
  type:      '<path d="M4 6V4.5h16V6"/><path d="M12 4.5v15"/><path d="M9 19.5h6"/>',
  square:    '<rect x="4" y="4" width="16" height="16" rx="2"/>',
  cursor:    '<path d="M5 3l5.5 16.5 2.6-6.8 6.9-2.6Z"/>',
  marker:    '<path d="M4 20h16"/><path d="M14.5 5.5l4 4-8.5 8.5-5 1 1-5Z"/>',
  word:      '<path d="M13 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V9Z"/><path d="M13 3v6h6"/><path d="M8.3 12.5l1.1 4 1.3-3 1.3 3 1.1-4"/>',
  swap:      '<path d="M7 4 3.5 7.5 7 11"/><path d="M3.5 7.5H16"/><path d="M17 20l3.5-3.5L17 13"/><path d="M20.5 16.5H8"/>',
};
function Icon({ name, size = 18, stroke = 1.75, style }) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ display:"block", flexShrink:0, ...style }}
      dangerouslySetInnerHTML={{ __html: d }} />
  );
}

const SHAPES = [
  { id:"rect",      label:"Rectangle",    icon:"▭"         },
  { id:"circle",    label:"Circle",       icon:"○"            },
  { id:"triangle",  label:"Triangle",     icon:"△"          },
  { id:"arrow",     label:"Arrow →",      icon:"→"       },
  { id:"arrowUp",   label:"Arrow ↑",      icon:"↑"         },
  { id:"star",      label:"Star",         icon:"★"              },
  { id:"diamond",   label:"Diamond",      icon:"◇"           },
  { id:"line",      label:"Line",         icon:"╱"              },
  { id:"dblArrow",  label:"Double Arrow", icon:"↔" },
  { id:"callout",   label:"Callout",      icon:"❝"           },
  { id:"checkmark", label:"Checkmark",    icon:"✓"             },
  { id:"cross",     label:"Cross",        icon:"✕"                 },
];

/* Greek letters & common science/math symbols, for the Markers symbol picker.
   Inserted as rendered images so they export to PDF regardless of font. */
const SCIENCE_SYMBOLS = [
  "α","β","γ","δ","ε","ζ","η","θ","ι","κ","λ","μ",
  "ν","ξ","ο","π","ρ","σ","τ","υ","φ","χ","ψ","ω",
  "Γ","Δ","Θ","Λ","Ξ","Π","Σ","Φ","Ψ","Ω",
  "∑","∏","∫","√","∞","∂","∇","±","×","÷","·","≈",
  "≤","≥","≠","≡","→","←","⇒","⇌","°","′","″","ℏ",
];

function parsePageRanges(input, totalPages) {
  if (!input || !input.trim()) return Array.from({ length: totalPages }, (_, i) => i);
  const pages = new Set();
  input.split(",").forEach(part => {
    part = part.trim();
    if (part.includes("-")) {
      const [s, e] = part.split("-").map(Number);
      for (let i = s; i <= Math.min(e, totalPages); i++) pages.add(i - 1);
    } else {
      const n = parseInt(part);
      if (!isNaN(n) && n >= 1 && n <= totalPages) pages.add(n - 1);
    }
  });
  return [...pages].sort((a, b) => a - b);
}

function FileChip({ file, index, total, onRemove, onDragStart, onDragOver, onDrop, isDragOver }) {
  const isImage = file.type?.startsWith("image/") || /\.(jpe?g|png|gif|webp|bmp)$/i.test(file.name);
  const [thumb, setThumb] = useState(null);
  useEffect(() => {
    if (!isImage) return;
    const url = URL.createObjectURL(file);
    setThumb(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  return (
    <div draggable={true}
      onDragStart={() => onDragStart(index)}
      onDragOver={e => { e.preventDefault(); onDragOver(index); }}
      onDrop={() => onDrop(index)}
      style={{
        display:"flex", alignItems:"center", gap:"10px",
        background: isDragOver ? "rgba(216,31,63,.12)" : "rgba(0,0,0,.05)",
        border:`1px solid ${isDragOver ? "#D81F3F" : "rgba(0,0,0,.12)"}`,
        borderRadius:"10px", padding:"10px 14px", cursor:"grab", transition:"all .15s", userSelect:"none",
      }}>
      <span style={{ color:T.faintest, fontSize:"15px", letterSpacing:"-2px", lineHeight:1 }}>⋮⋮</span>
      {isImage && thumb
        ? <img src={thumb} alt="" style={{ width:"30px", height:"30px", objectFit:"cover", borderRadius:"5px", border:`1px solid ${T.borderUp}` }}/>
        : <span style={{ color:T.faint, display:"flex" }}><Icon name="file" size={18}/></span>}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color:T.text, fontSize:"13px", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.name}</div>
        <div style={{ color:T.dim, fontSize:"11px", fontFamily:T.mono }}>{(file.size/1024).toFixed(1)} KB</div>
      </div>
      <span style={{ color:T.dim, fontSize:"11px", background:"rgba(0,0,0,.05)", padding:"2px 8px", borderRadius:"6px", fontFamily:T.mono }}>{index+1}/{total}</span>
      <button onClick={() => onRemove(index)} onMouseDown={e => e.stopPropagation()}
        style={{ display:"flex", background:"none", border:"none", color:T.faint, cursor:"pointer", padding:"2px" }}
        onMouseEnter={e=>e.currentTarget.style.color=T.bad} onMouseLeave={e=>e.currentTarget.style.color=T.faint}><Icon name="close" size={15}/></button>
    </div>
  );
}

/* ══════════════════════════════════════════
   TEXT INPUT MODAL — rendered outside canvas
══════════════════════════════════════════ */
function TextInputModal({ ann, textInput, setTextInput, onConfirm, onCancel }) {
  const inputRef = useRef();
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 30); }, []);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(0,0,0,.55)", backdropFilter:"blur(2px)",
    }} onMouseDown={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div style={{
        background:"#FFFFFF", border:"1px solid rgba(216,31,63,.4)",
        borderRadius:"14px", padding:"24px", width:"420px", boxShadow:"0 24px 60px rgba(0,0,0,.6)",
      }}>
        <div style={{ fontSize:"13px", color:"#D81F3F", fontWeight:700, letterSpacing:".06em", marginBottom:"16px" }}>
          ADD TEXT
        </div>

        {/* Live preview */}
        <div style={{
          background:"rgba(0,0,0,.035)", border:"1px solid rgba(0,0,0,.07)",
          borderRadius:"8px", padding:"12px 14px", marginBottom:"14px", minHeight:"48px",
          fontFamily: ann.fontFamily, fontSize: ann.fontSize+"px",
          color: ann.color, fontWeight: ann.bold?"bold":"normal",
          fontStyle: ann.italic?"italic":"normal",
          textDecoration: ann.underline?"underline":"none",
          wordBreak:"break-word",
        }}>
          {textInput || <span style={{ color:"#B6B5B0", fontStyle:"italic", fontSize:"13px", fontFamily:"inherit" }}>Preview…</span>}
        </div>

        <textarea
          ref={inputRef}
          value={textInput}
          onChange={e => setTextInput(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); onConfirm(); } if (e.key==="Escape") onCancel(); }}
          rows={3}
          placeholder="Type your text here… (Enter to confirm, Shift+Enter for new line)"
          style={{
            width:"100%", padding:"10px 12px", borderRadius:"8px",
            background:"rgba(0,0,0,.05)", border:"1px solid rgba(0,0,0,.16)",
            color:"#1A1A1C", fontSize:"14px", fontFamily:"inherit", outline:"none",
            resize:"vertical", lineHeight:1.5, marginBottom:"14px",
          }}
        />

        <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={{
            padding:"8px 18px", borderRadius:"8px", border:"1px solid rgba(0,0,0,.12)",
            background:"transparent", color:"#8C8C88", cursor:"pointer", fontSize:"13px", fontFamily:"inherit",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding:"8px 20px", borderRadius:"8px", border:"none",
            background:"#D81F3F",
            color:"#FFFFFF", cursor:"pointer", fontSize:"13px", fontWeight:700, fontFamily:"inherit",
          }}>Add Text ↵</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SIGNATURE MODAL
══════════════════════════════════════════ */
/* Cursive fonts offered for auto-generated (typed) signatures */
const SIG_FONTS = [
  { label: "Flowing",   value: "'Dancing Script', cursive", gf: "Dancing+Script:wght@600" },
  { label: "Elegant",   value: "'Great Vibes', cursive",    gf: "Great+Vibes" },
  { label: "Casual",    value: "'Sacramento', cursive",     gf: "Sacramento" },
  { label: "Formal",    value: "'Allura', cursive",         gf: "Allura" },
  { label: "Brush",     value: "'Alex Brush', cursive",     gf: "Alex+Brush" },
  { label: "Relaxed",   value: "'Satisfy', cursive",        gf: "Satisfy" },
  { label: "Note",      value: "'Caveat', cursive",         gf: "Caveat:wght@600" },
  { label: "Round",     value: "'Pacifico', cursive",       gf: "Pacifico" },
];

function SignatureModal({ onConfirm, onCancel }) {
  const canvasRef  = useRef();
  const strokesRef = useRef([]);        // array of strokes; each stroke = array of {x,y} in CSS px
  const curRef     = useRef(null);      // stroke currently being drawn
  const dprRef     = useRef(1);
  const sizeRef    = useRef({ w: 400, h: 180 });
  const drawingRef = useRef(false);
  const [inkColor, setInkColor] = useState("#101a4a");
  const [inkWidth, setInkWidth] = useState(2.5);
  const [hasStrokes, setHasStrokes] = useState(false);

  // ── Auto-generated (typed) signature ──
  const [mode, setMode]         = useState("draw");   // "draw" | "type"
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [sigFont, setSigFont]     = useState(SIG_FONTS[0].value);
  const [fontsReady, setFontsReady] = useState(false);
  const fullName = `${firstName} ${lastName}`.trim();

  // Load the cursive fonts once
  useEffect(() => {
    const id = "sig-fonts-link";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id; link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?" +
        SIG_FONTS.map(f => `family=${f.gf}`).join("&") + "&display=swap";
      document.head.appendChild(link);
    }
    if (document.fonts?.ready) document.fonts.ready.then(() => setFontsReady(true));
    else setFontsReady(true);
  }, []);

  // Render the typed name in the chosen cursive font -> transparent, cropped, hi-res PNG
  const exportTyped = async () => {
    if (!fullName) return;
    const famName = sigFont.split(",")[0].replace(/'/g, "");  // e.g. Great Vibes
    const fontSize = 130;
    try { if (document.fonts?.load) await document.fonts.load(`${fontSize}px "${famName}"`); } catch (_) {}

    const meas = document.createElement("canvas").getContext("2d");
    meas.font = `${fontSize}px ${sigFont}`;
    const m = meas.measureText(fullName);
    const asc = m.actualBoundingBoxAscent  || fontSize * 0.75;
    const desc = m.actualBoundingBoxDescent || fontSize * 0.35;
    const padX = fontSize * 0.25, padY = fontSize * 0.2;
    const w = Math.ceil(m.width + padX * 2);
    const h = Math.ceil(asc + desc + padY * 2);

    const EXPORT = 3;
    const off = document.createElement("canvas");
    off.width = Math.round(w * EXPORT); off.height = Math.round(h * EXPORT);
    const ctx = off.getContext("2d");
    ctx.scale(EXPORT, EXPORT);
    ctx.fillStyle = inkColor;
    ctx.font = `${fontSize}px ${sigFont}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(fullName, padX, padY + asc);
    onConfirm({ dataUrl: off.toDataURL("image/png"), ratio: w / h });
  };

  // Draw the white board + baseline guide (display only — never exported)
  const paintBackground = (ctx, w, h) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(0,0,0,.07)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(24, h * 0.72); ctx.lineTo(w - 24, h * 0.72); ctx.stroke();
    // small "×" hint at the left of the baseline
    ctx.strokeStyle = "rgba(0,0,0,.14)";
    ctx.beginPath();
    ctx.moveTo(30, h * 0.72 - 5); ctx.lineTo(36, h * 0.72 + 1);
    ctx.moveTo(36, h * 0.72 - 5); ctx.lineTo(30, h * 0.72 + 1);
    ctx.stroke();
  };

  // Smooth a single stroke with quadratic curves through the midpoints
  const strokePath = (ctx, pts, width, color) => {
    if (!pts.length) return;
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = width; ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (pts.length === 1) {
      ctx.beginPath(); ctx.arc(pts[0].x, pts[0].y, width / 2, 0, Math.PI * 2); ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const midX = (pts[i].x + pts[i + 1].x) / 2;
      const midY = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  };

  // Repaint everything
  const redraw = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { w, h } = sizeRef.current;
    paintBackground(ctx, w, h);
    strokesRef.current.forEach(s => strokePath(ctx, s.pts, s.width, s.color));
    if (curRef.current) strokePath(ctx, curRef.current.pts, curRef.current.width, curRef.current.color);
  };

  // High-DPI setup: match the backing store to the displayed size × devicePixelRatio
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const setup = () => {
      const rect = cvs.getBoundingClientRect();
      const dpr = Math.max(window.devicePixelRatio || 1, 2);  // at least 2× for crispness
      dprRef.current = dpr;
      sizeRef.current = { w: rect.width, h: rect.height };
      cvs.width  = Math.round(rect.width  * dpr);
      cvs.height = Math.round(rect.height * dpr);
      const ctx = cvs.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);  // draw in CSS px, render at device res
      redraw();
    };
    setup();
    window.addEventListener("resize", setup);
    return () => window.removeEventListener("resize", setup);
  }, []);

  const getPos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    curRef.current = { pts: [getPos(e)], width: inkWidth, color: inkColor };
    setHasStrokes(true);
    redraw();
  };

  const draw = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const p = getPos(e);
    const cur = curRef.current;
    const last = cur.pts[cur.pts.length - 1];
    // ignore micro-jitter for a cleaner line
    if (last && Math.hypot(p.x - last.x, p.y - last.y) < 1.1) return;
    cur.pts.push(p);
    redraw();
  };

  const endDraw = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    drawingRef.current = false;
    if (curRef.current && curRef.current.pts.length) strokesRef.current.push(curRef.current);
    curRef.current = null;
    redraw();
  };

  const clear = () => {
    strokesRef.current = [];
    curRef.current = null;
    setHasStrokes(false);
    redraw();
  };

  const undoStroke = () => {
    strokesRef.current.pop();
    setHasStrokes(strokesRef.current.length > 0);
    redraw();
  };

  // Export: transparent, cropped tight to the ink, rendered at high resolution
  const confirm = () => {
    const all = strokesRef.current.flatMap(s => s.pts);
    if (!all.length) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, maxW = 0;
    strokesRef.current.forEach(s => s.pts.forEach(p => {
      minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
      maxW = Math.max(maxW, s.width);
    }));
    const pad = maxW + 6;
    minX -= pad; minY -= pad; maxX += pad; maxY += pad;
    const bw = Math.max(1, maxX - minX), bh = Math.max(1, maxY - minY);

    const EXPORT = 4;  // 4× for crisp placement/zoom in the PDF
    const off = document.createElement("canvas");
    off.width = Math.round(bw * EXPORT);
    off.height = Math.round(bh * EXPORT);
    const octx = off.getContext("2d");
    octx.setTransform(EXPORT, 0, 0, EXPORT, -minX * EXPORT, -minY * EXPORT);
    strokesRef.current.forEach(s => strokePath(octx, s.pts, s.width, s.color));

    onConfirm({ dataUrl: off.toDataURL("image/png"), ratio: bw / bh });
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(0,0,0,.6)", backdropFilter:"blur(2px)",
    }} onMouseDown={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div style={{
        background:"#FFFFFF", border:"1px solid rgba(0,0,0,.12)",
        borderRadius:"14px", padding:"22px", width:"460px",
        boxShadow:"0 24px 60px rgba(0,0,0,.7)",
      }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"12px", color:T.accent, fontWeight:600, letterSpacing:".08em" }}><Icon name="pen" size={15}/>SIGNATURE</div>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <label style={{ fontSize:"11px", color:T.faint }}>Ink</label>
            <input type="color" value={inkColor} onChange={e => setInkColor(e.target.value)}
              style={{ width:"26px", height:"26px", border:`1px solid ${T.borderUp}`, borderRadius:"5px", background:"none", cursor:"pointer", padding:"2px" }}/>
            {mode === "draw" && <>
              <label style={{ fontSize:"11px", color:T.faint }}>Width</label>
              <input type="range" min={1} max={7} step={0.5} value={inkWidth} onChange={e => setInkWidth(+e.target.value)}
                style={{ width:"70px", accentColor:T.accent }}/>
              <span style={{ fontSize:"11px", color:T.dim, minWidth:"22px", fontFamily:T.mono }}>{inkWidth}px</span>
            </>}
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{ display:"flex", gap:"4px", padding:"3px", background:"rgba(0,0,0,.04)", borderRadius:"9px", marginBottom:"12px" }}>
          {[{id:"draw",label:"Draw",icon:"pen"},{id:"type",label:"Type name",icon:"type"}].map(t => (
            <button key={t.id} onClick={() => setMode(t.id)} style={{
              flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"7px",
              padding:"8px", borderRadius:"7px", border:"none", cursor:"pointer",
              background: mode===t.id ? "#FFFFFF" : "transparent",
              color: mode===t.id ? T.text : T.faint,
              fontSize:"12.5px", fontWeight:600, fontFamily:T.ui,
              boxShadow: mode===t.id ? "0 1px 2px rgba(0,0,0,.10)" : "none", transition:"all .15s",
            }}><Icon name={t.icon} size={14}/>{t.label}</button>
          ))}
        </div>

        {/* DRAW mode */}
        {mode === "draw" && (
          <div style={{ position:"relative", borderRadius:"10px", overflow:"hidden", border:`1.5px solid ${T.border}`, marginBottom:"12px", cursor:"crosshair", background:"#fff" }}>
            <canvas ref={canvasRef}
              style={{ display:"block", width:"100%", height:"190px", touchAction:"none" }}
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}/>
            {!hasStrokes && (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                <span style={{ fontSize:"13px", color:"rgba(0,0,0,.25)" }}>Draw your signature here</span>
              </div>
            )}
          </div>
        )}

        {/* TYPE mode — auto-generate from name */}
        {mode === "type" && (
          <div style={{ marginBottom:"12px" }}>
            <div style={{ display:"flex", gap:"8px", marginBottom:"12px" }}>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Name"
                style={{ flex:1, padding:"9px 12px", borderRadius:"8px", background:"rgba(0,0,0,.04)", border:`1px solid ${T.border}`, color:T.text, fontSize:"13px", fontFamily:T.ui, outline:"none" }}/>
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Surname"
                style={{ flex:1, padding:"9px 12px", borderRadius:"8px", background:"rgba(0,0,0,.04)", border:`1px solid ${T.border}`, color:T.text, fontSize:"13px", fontFamily:T.ui, outline:"none" }}/>
            </div>

            {/* Live preview of the selected style */}
            <div style={{ height:"96px", borderRadius:"10px", border:`1.5px solid ${T.border}`, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", marginBottom:"12px" }}>
              <span style={{ fontFamily:sigFont, fontSize:"46px", color:inkColor, lineHeight:1, padding:"0 16px", whiteSpace:"nowrap" }}>
                {fullName || <span style={{ color:"rgba(0,0,0,.22)" }}>Your signature</span>}
              </span>
            </div>

            {/* Style picker */}
            <div style={{ fontSize:"10px", letterSpacing:".12em", color:T.faint, textTransform:"uppercase", marginBottom:"7px" }}>Signature style</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px", maxHeight:"150px", overflowY:"auto" }}>
              {SIG_FONTS.map(f => (
                <button key={f.value} onClick={() => setSigFont(f.value)} style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px",
                  padding:"8px 12px", borderRadius:"8px", cursor:"pointer", textAlign:"left",
                  border:`1px solid ${sigFont===f.value ? T.accent : T.border}`,
                  background: sigFont===f.value ? T.accentBg : "rgba(0,0,0,.02)",
                  transition:"all .12s", overflow:"hidden",
                }}>
                  <span style={{ fontFamily:f.value, fontSize:"22px", color:inkColor, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {fullName || "Signature"}
                  </span>
                  <span style={{ fontSize:"9px", letterSpacing:".08em", color:T.faint, textTransform:"uppercase", flexShrink:0 }}>{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display:"flex", gap:"8px", justifyContent:"space-between" }}>
          <div style={{ display:"flex", gap:"8px" }}>
            {mode === "draw" ? <>
              <button onClick={clear} style={{
                padding:"8px 16px", borderRadius:"8px",
                border:"1px solid rgba(176,30,46,.3)", background:"rgba(176,30,46,.08)",
                color:T.bad, cursor:"pointer", fontSize:"13px", fontFamily:T.ui,
              }}>Clear</button>
              <button onClick={undoStroke} disabled={!hasStrokes} style={{
                display:"flex", alignItems:"center", gap:"6px",
                padding:"8px 14px", borderRadius:"8px", border:`1px solid ${T.border}`,
                background:"transparent", color: hasStrokes ? T.dim : T.faintest,
                cursor: hasStrokes ? "pointer" : "not-allowed", fontSize:"13px", fontFamily:T.ui,
              }}><Icon name="undo" size={14}/>Undo</button>
            </> : (
              <button onClick={() => { setFirstName(""); setLastName(""); }} disabled={!fullName} style={{
                padding:"8px 16px", borderRadius:"8px",
                border:"1px solid rgba(176,30,46,.3)", background: fullName ? "rgba(176,30,46,.08)" : "transparent",
                color: fullName ? T.bad : T.faintest, cursor: fullName ? "pointer" : "not-allowed", fontSize:"13px", fontFamily:T.ui,
              }}>Clear</button>
            )}
          </div>
          <div style={{ display:"flex", gap:"8px" }}>
            <button onClick={onCancel} style={{
              padding:"8px 16px", borderRadius:"8px", border:`1px solid ${T.border}`,
              background:"transparent", color:T.faint, cursor:"pointer", fontSize:"13px", fontFamily:T.ui,
            }}>Cancel</button>
            {(() => {
              const ready = mode === "draw" ? hasStrokes : !!fullName;
              return (
                <button onClick={mode === "draw" ? confirm : exportTyped} disabled={!ready} style={{
                  display:"flex", alignItems:"center", gap:"7px",
                  padding:"8px 18px", borderRadius:"8px", border:"none",
                  background: ready ? T.accent : "rgba(0,0,0,.07)",
                  color: ready ? "#FFFFFF" : T.faintest, cursor: ready ? "pointer" : "not-allowed",
                  fontSize:"13px", fontWeight:600, fontFamily:T.ui,
                }}><Icon name="check" size={15}/>Place signature</button>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SMALL SHARED HELPERS
══════════════════════════════════════════ */
// Readable error for the common "protected PDF" case instead of pdf-lib's internals.
function friendlyPdfError(e, prefix = "Error: ") {
  const m = (e && e.message) || String(e);
  if (/encrypt/i.test(m)) return "This PDF is protected (encrypted). Remove the protection first (e.g. print it to a new PDF, or use \"Save as\" without security in your PDF reader), then try again.";
  if (/password/i.test(m)) return "This PDF needs a password to open. Remove the password first, then try again.";
  return prefix + m;
}
// EXIF orientation (1–8) of a JPEG, or 1 when absent.
function jpegOrientation(bytes) {
  try {
    const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (v.getUint16(0) !== 0xFFD8) return 1;
    let off = 2;
    while (off + 4 < v.byteLength) {
      const marker = v.getUint16(off), len = v.getUint16(off + 2);
      if (marker === 0xFFE1 && v.getUint32(off + 4) === 0x45786966) {        // "Exif"
        const t = off + 10, le = v.getUint16(t) === 0x4949;
        const ifd = t + v.getUint32(t + 4, le), n = v.getUint16(ifd, le);
        for (let i = 0; i < n; i++) {
          const e = ifd + 2 + i * 12;
          if (v.getUint16(e, le) === 0x0112) return v.getUint16(e + 8, le);
        }
        return 1;
      }
      if ((marker & 0xFF00) !== 0xFF00 || marker === 0xFFDA) break;           // start of scan: no EXIF
      off += 2 + len;
    }
  } catch (_) {}
  return 1;
}

/* ══════════════════════════════════════════
   PDF ANNOTATION (COMMENT) HELPERS
══════════════════════════════════════════ */
// "D:20240115103000+03'00'" → Date (or null)
function parsePdfDate(s) {
  const m = /D?:?(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?/.exec(s || "");
  if (!m || +m[1] < 1980 || +m[1] > 2200) return null;   // ignore malformed dates
  const d = new Date(+m[1], (+m[2] || 1) - 1, +m[3] || 1, +m[4] || 0, +m[5] || 0, +m[6] || 0);
  return isNaN(d) ? null : d;
}
function pdfDateNow() {
  const d = new Date(), p = (n) => String(n).padStart(2, "0");
  return `D:${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}
function formatNoteDate(d) {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt)) return "";
  return dt.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
const MARKUP_SUBTYPES = ["Highlight", "Underline", "StrikeOut", "Squiggly"];
const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4];   // Acrobat-like
const ZOOM_MIN = 0.25, ZOOM_MAX = 4;
const BADGE_DX = 18;   // comment marker: on-screen px to the right of the highlighted line's end

// Read every annotation that carries a note (or has replies) from a pdf-lib
// document. Geometry goes through the pdf.js viewport at scale 1, so the
// result is in "page units" (top-left origin, CropBox + /Rotate applied).
async function readPdfNotes(pdfLib, doc, pdfJsDoc) {
  const { PDFName, PDFDict, PDFArray, PDFRef } = pdfLib;
  const out = [];
  const pages = doc.getPages();
  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const annots = pages[pageIdx].node.Annots && pages[pageIdx].node.Annots();
    if (!annots || !annots.size()) continue;
    let vp1 = null;
    try { vp1 = (await pdfJsDoc.getPage(pageIdx + 1)).getViewport({ scale: 1 }); } catch (_) {}
    const pageH = pages[pageIdx].getSize().height;
    const toView = (x, y) => vp1 ? vp1.convertToViewportPoint(x, y) : [x, pageH - y];
    const rot = (((vp1 ? vp1.rotation : 0) % 360) + 360) % 360;
    const textDir = { 0: [1, 0], 90: [0, 1], 180: [-1, 0], 270: [0, -1] }[rot] || [1, 0];   // on-screen reading direction

    const raw = [];
    const byRef = new Map();     // "12 0 R" → raw index
    for (let i = 0; i < annots.size(); i++) {
      let d; try { d = annots.lookup(i, PDFDict); } catch (_) { continue; }
      if (!d) continue;
      const ref = annots.get(i);
      const key = ref instanceof PDFRef ? ref.toString() : null;
      const str = (name) => { try { const v = d.lookup(PDFName.of(name)); return v && v.decodeText ? v.decodeText() : ""; } catch (_) { return ""; } };
      const num = (name) => { try { const v = d.lookup(PDFName.of(name)); return v && v.asNumber ? v.asNumber() : null; } catch (_) { return null; } };
      const refKey = (name) => { const v = d.get(PDFName.of(name)); return v instanceof PDFRef ? v.toString() : null; };
      const sub = String(d.get(PDFName.of("Subtype")) || "").replace(/^\//, "");

      // Geometry: Rect, plus one box per QuadPoints quad (one per highlighted line)
      let box = null;
      try {
        const r = d.lookup(PDFName.of("Rect"), PDFArray);
        if (r && r.size() >= 4) {
          const [x1, y1] = toView(r.lookup(0).asNumber(), r.lookup(1).asNumber());
          const [x2, y2] = toView(r.lookup(2).asNumber(), r.lookup(3).asNumber());
          box = { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
        }
      } catch (_) {}
      const quads = [];
      try {
        const q = d.lookup(PDFName.of("QuadPoints"), PDFArray);
        if (q) for (let k = 0; k + 7 < q.size(); k += 8) {
          const xs = [], ys = [];
          for (let m = 0; m < 8; m += 2) { const [vx, vy] = toView(q.lookup(k + m).asNumber(), q.lookup(k + m + 1).asNumber()); xs.push(vx); ys.push(vy); }
          const bx = Math.min(...xs), by = Math.min(...ys);
          quads.push({ x: bx, y: by, w: Math.max(...xs) - bx, h: Math.max(...ys) - by });
        }
      } catch (_) {}
      let color = null;
      try {
        const c = d.lookup(PDFName.of("C"), PDFArray);
        if (c && c.size() === 3) color = `rgba(${[0, 1, 2].map(k => Math.round(c.lookup(k).asNumber() * 255)).join(",")},0.45)`;
      } catch (_) {}

      raw.push({
        i, key, sub, box, quads, color,
        text: (str("Contents") || "").replace(/\r\n?/g, "\n").trim(),
        author: str("T"), date: parsePdfDate(str("M") || str("CreationDate")),
        irt: refKey("IRT"), popup: refKey("Popup"), flags: num("F") || 0,
        pdfjsId: ref instanceof PDFRef ? (ref.generationNumber ? `${ref.objectNumber}R${ref.generationNumber}` : `${ref.objectNumber}R`) : null,
      });
      if (key) byRef.set(key, raw.length - 1);
    }

    const skip = (a) => a.sub === "Popup" || a.sub === "Link" || a.sub === "Widget" || (a.flags & 2);   // 2 = Hidden
    // A reply (/IRT) belongs to the root of its thread.
    const rootOf = (a) => { let cur = a, guard = 0; while (cur.irt && byRef.has(cur.irt) && guard++ < 50) cur = raw[byRef.get(cur.irt)]; return cur; };
    const replies = new Map();   // root raw idx → [raw]
    for (const a of raw) {
      if (skip(a) || !a.irt || !byRef.has(a.irt)) continue;
      const root = rootOf(a);
      if (root === a || skip(root)) continue;
      const ri = raw.indexOf(root);
      if (!replies.has(ri)) replies.set(ri, []);
      replies.get(ri).push(a);
    }
    const isReply = (a) => a.irt && byRef.has(a.irt) && rootOf(a) !== a && !skip(rootOf(a));
    const popupIdx = (a) => (a.popup && byRef.has(a.popup) ? raw[byRef.get(a.popup)].i : null);

    raw.forEach((a, ri) => {
      if (skip(a) || isReply(a)) return;
      const thread = replies.get(ri) || [];
      if (!a.text && !thread.length) return;           // nothing to show
      const g = a.box || (a.quads[0]) || { x: 0, y: 0, w: 0, h: 0 };
      const isMarkup = MARKUP_SUBTYPES.includes(a.sub) && a.quads.length;
      // Union of the quads (markup) or the Rect.
      let x = g.x, y = g.y, w = g.w, h = g.h;
      if (isMarkup) {
        const x1 = Math.min(...a.quads.map(q => q.x)), y1 = Math.min(...a.quads.map(q => q.y));
        const x2 = Math.max(...a.quads.map(q => q.x + q.w)), y2 = Math.max(...a.quads.map(q => q.y + q.h));
        x = x1; y = y1; w = x2 - x1; h = y2 - y1;
      }
      // Marker: end of the FIRST highlighted line (Acrobat's comment anchor),
      // the icon itself for sticky notes, top-right corner for anything else.
      // On rotated pages "past the end of the line" follows the text direction.
      let bx, by, bdx = 0, bdy = 0;
      if (isMarkup) {
        const q = a.quads[0], [ux, uy] = textDir;
        bx = q.x + q.w / 2 + ux * q.w / 2; by = q.y + q.h / 2 + uy * q.h / 2;
        bdx = ux * BADGE_DX; bdy = uy * BADGE_DX;
      }
      else if (a.sub === "Text") { bx = x + Math.min(w, 20) / 2; by = y + Math.min(h, 20) / 2; }
      else { bx = x + w; by = y; }
      const id = `pdfnote-${pageIdx}-${a.i}`;
      out.push({
        id, page: pageIdx, type: "note", existing: true, annotIndex: a.i, popupIndex: popupIdx(a), pdfjsId: a.pdfjsId,
        subtype: a.sub, x, y, w: Math.max(w, 4), h: Math.max(h, 4), quads: isMarkup ? a.quads : null, bx, by, bdx, bdy,
        color: a.color, author: a.author, date: a.date ? a.date.getTime() : null,
        comment: a.text, origComment: a.text, readOnly: a.sub === "FreeText",
      });
      thread
        .sort((p, q) => (p.date ? p.date.getTime() : 0) - (q.date ? q.date.getTime() : 0))
        .forEach(r => out.push({
          id: `pdfnote-${pageIdx}-${r.i}`, page: pageIdx, type: "reply", parentId: id, existing: true,
          annotIndex: r.i, popupIndex: popupIdx(r), pdfjsId: r.pdfjsId,
          author: r.author, date: r.date ? r.date.getTime() : null, comment: r.text, origComment: r.text,
        }));
    });
  }
  return out;
}

/* ══════════════════════════════════════════
   PDF EDITOR
══════════════════════════════════════════ */
function PDFEditor({ pdfLib }) {
  const [file, setFile]               = useState(null);
  const [pdfDoc, setPdfDoc]           = useState(null);
  const [pageCount, setPageCount]     = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [docVersion, setDocVersion]   = useState(0);   // bumped each time a new PDF is loaded, forces a re-render of the canvas
  const [scale, setScale]             = useState(1.25);
  const [zoomMode, setZoomMode]       = useState("custom");   // "custom" | "fitWidth" | "fitPage"
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const [zoomText, setZoomText]       = useState(null);       // zoom % being typed, or null
  const [editMode, setEditMode]       = useState("addText");
  const [annotations, setAnnotations] = useState([]);
  const [history, setHistory]         = useState([[]]); // stack of annotation snapshots
  const [historyIdx, setHistoryIdx]   = useState(0);
  const historyIdxRef                 = useRef(0);      // mirror of historyIdx for use in closures
  const [selected, setSelected]       = useState(null);
  const [drawing, setDrawing]         = useState(false);
  const [drawStart, setDrawStart]     = useState(null);
  const [tempRect, setTempRect]       = useState(null);
  const [sigPoints, setSigPoints]     = useState([]);
  const [showSigModal, setShowSigModal] = useState(false);   // signature drawing pad
  const [pendingSigPos, setPendingSigPos] = useState(null);  // where to place after draw

  // Text tool state
  const [showTextModal, setShowTextModal] = useState(false);
  const [pendingPos, setPendingPos]       = useState(null);
  const [textInput, setTextInput]         = useState("");
  const [fontSize, setFontSize]           = useState(14);   // pt (page units)
  const [fontColor, setFontColor]         = useState("#000000");
  const [fontFamily, setFontFamily]       = useState(FONT_OPTIONS[0].value);
  const [bold, setBold]                   = useState(false);
  const [italic, setItalic]               = useState(false);
  const [underline, setUnderline]         = useState(false);

  const [redactColor, setRedactColor]     = useState("black");
  const [shapeType, setShapeType]         = useState("rect");
  const [strokeWidth, setStrokeWidth]     = useState(2);
  const [fillShape, setFillShape]         = useState(false);
  const [highlightColor, setHighlightColor] = useState("rgba(255,230,0,0.45)");
  const [showSymbols, setShowSymbols]       = useState(false);   // Markers symbol popover

  // Image tool state
  const [imageDataUrl, setImageDataUrl]     = useState(null);
  const [imageFile, setImageFile]           = useState(null);
  const [imageNatSize, setImageNatSize]     = useState(null); // {w, h} natural px
  const [lockAspect, setLockAspect]         = useState(true);
  const [imagePlacedPos, setImagePlacedPos] = useState(null); // {x, y} in canvas px — set on first click
  const [imageDispW, setImageDispW]         = useState(200);  // display width in canvas px
  const [imageDispH, setImageDispH]         = useState(150);  // display height in canvas px
  const imageInputRef                       = useRef();
  const [outputName, setOutputName] = useState("edited");
  const [saving, setSaving]         = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  
  // Resize functionality states
  const [isResizing, setIsResizing] = useState(false);
  const [resizeData, setResizeData] = useState(null);

  // Comments / annotation panel + floating note popup (Adobe-style)
  const [showComments, setShowComments] = useState(true);
  const [commentSearch, setCommentSearch] = useState("");
  const [activeComment, setActiveComment] = useState(null);   // ann id whose note popup is open
  const [commentPos, setCommentPos]       = useState({ left: 0, top: 0 });
  const commentInputRef = useRef(null);
  const panelListRef    = useRef(null);

  // ── Coordinate model ──
  // Every annotation is stored in PAGE units: the pdf.js viewport at scale 1
  // (1 unit = 1 PDF point, top-left origin, CropBox offset and /Rotate already
  // applied). The overlay SVG maps those units onto the canvas via its viewBox,
  // so markers stay glued to the text at every zoom level, and import/export go
  // through the same pdf.js viewport — exactly how Acrobat/pdf.js position them.
  const [pageBase, setPageBase] = useState(null);           // {w,h} of the current page in page units
  const importedRef  = useRef([]);                           // notes read from the file: [{id, page, annotIndex, popupIndex, pdfjsId}]
  const hiddenRef    = useRef(new Set());                    // pdf.js ids currently hidden on the canvas (deleted imported notes)
  const renderTaskRef = useRef(null);
  const [storageVersion, setStorageVersion] = useState(0);  // bumped when the canvas must re-render (note deleted/restored)

  // Where a note's marker sits, in page units.
  // dx = on-screen offset in px (marker drawn just right of the line end).
  const noteAnchor = (ann) => ann.type === "note"
    ? { x: ann.bx ?? ann.x, y: ann.by ?? ann.y, dx: ann.bdx || 0, dy: ann.bdy || 0 }
    : { x: (ann.x || 0) + (ann.w || 0), y: (ann.y || 0) + Math.min((ann.h || 0) / 2, 9), dx: BADGE_DX, dy: 0 };

  // Nearest scrollable ancestor (the app's main content pane), or null for the window.
  const getScrollParent = (el) => {
    for (let p = el?.parentElement; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (/(auto|scroll)/.test(s.overflowY) && p.scrollHeight > p.clientHeight + 1) return p;
    }
    return null;
  };

  // Place the floating note editor next to an annotation's marker — a fixed,
  // high-z-index card, so it is always on top of the PDF, never behind it.
  const placeCommentPopup = (ann) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    const POPW = 300, POPH = 240, M = 12;
    let left, top;
    if (rect && rect.width) {
      const k = pageBase ? rect.width / pageBase.w : scale;  // page units → screen px
      const a = noteAnchor(ann);
      const boxL = rect.left + (ann.x || a.x) * k;
      left = rect.left + a.x * k + (a.dx || 0) + 16;
      top  = rect.top + a.y * k + (a.dy || 0) - 14;
      if (left + POPW > window.innerWidth - M) left = boxL - POPW - 16;
      if (left < M) left = Math.max(M, window.innerWidth - POPW - M);
      if (top + POPH > window.innerHeight - M) top = window.innerHeight - POPH - M;
      if (top < M) top = M;
    } else { left = window.innerWidth - POPW - M; top = 120; }
    setCommentPos({ left, top });
  };
  // Scroll the page so the annotation is on screen (like clicking a comment in Acrobat).
  const scrollAnnotationIntoView = (ann) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect || !rect.width) return;
    const k = pageBase ? rect.width / pageBase.w : scale;
    const ay = rect.top + noteAnchor(ann).y * k + (noteAnchor(ann).dy || 0);
    if (ay > 90 && ay < window.innerHeight - 120) return;
    const delta = ay - window.innerHeight / 2.6;
    const sp = getScrollParent(overlayRef.current);
    if (sp) sp.scrollTop += delta; else window.scrollBy(0, delta);
  };
  const openCommentPopup = (ann) => {
    if (ann.type === "reply") ann = annotations.find(a => a.id === ann.parentId) || ann;
    if (ann.page !== currentPage) setCurrentPage(ann.page);
    setSelected(ann.id);
    placeCommentPopup(ann);
    setActiveComment(ann.id);
    setTimeout(() => {
      scrollAnnotationIntoView(ann);
      placeCommentPopup(ann);
      const el = commentInputRef.current;
      if (el) { el.focus(); try { el.setSelectionRange(el.value.length, el.value.length); } catch (_) {} }
    }, ann.page !== currentPage ? 160 : 30);
  };
  const closeCommentPopup = () => {
    setActiveComment(null);
    // snapshot so the note is part of undo history
    if (JSON.stringify(annotations) !== JSON.stringify(history[historyIdx])) pushHistory(annotations);
  };

  // Panel click → navigate to the annotation and open its note.
  const goToAnnotation = (ann) => openCommentPopup(ann);

  // Delete an annotation together with its replies.
  const removeAnnotation = (id) => {
    pushHistory(annotations.filter(a => a.id !== id && a.parentId !== id));
    if (selected === id) setSelected(null);
    if (activeComment === id) setActiveComment(null);
  };

  // Keep the selected comment's card visible in the panel (like Acrobat).
  useEffect(() => {
    const id = activeComment ?? selected;
    const list = panelListRef.current;
    if (id == null || !list) return;
    const card = [...list.querySelectorAll("[data-ann]")].find(el => el.dataset.ann === String(id));
    if (!card) return;
    const lb = list.getBoundingClientRect(), cb = card.getBoundingClientRect();
    if (cb.top < lb.top + 4 || cb.bottom > lb.bottom - 4) list.scrollTop += cb.top - lb.top - lb.height / 3;
  }, [activeComment, selected]);

  // Keep the popup glued to its marker while the page scrolls or the window resizes.
  useEffect(() => {
    if (activeComment == null) return;
    const onMove = () => {
      const a = annotations.find(x => x.id === activeComment);
      if (a) placeCommentPopup(a);
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => { window.removeEventListener("scroll", onMove, true); window.removeEventListener("resize", onMove); };
  }, [activeComment, annotations, pageBase, scale]);

  // Imported notes that were deleted are hidden on the canvas immediately
  // (pdf.js annotation storage `noView`), not only after saving.
  useEffect(() => {
    const doc = pdfJsDocRef.current;
    if (!doc || !doc.annotationStorage) return;
    const present = new Set(annotations.map(a => a.id));
    let changed = false;
    for (const imp of importedRef.current) {
      if (!imp.pdfjsId) continue;
      const hide = !present.has(imp.id);
      if (hide !== hiddenRef.current.has(imp.pdfjsId)) {
        changed = true;
        if (hide) hiddenRef.current.add(imp.pdfjsId); else hiddenRef.current.delete(imp.pdfjsId);
        try { doc.annotationStorage.setValue(imp.pdfjsId, { noView: hide }); } catch (_) {}
      }
    }
    if (changed) setStorageVersion(v => v + 1);
  }, [annotations]);

  const canvasRef    = useRef();
  const overlayRef   = useRef();
  const fileInputRef = useRef();
  const pdfJsRef     = useRef(null);
  const pdfJsDocRef  = useRef(null);
  const dragAnnRef   = useRef(null);
  const dragOffRef   = useRef({ x:0, y:0 });

  // ── Undo / Redo helpers ──
  const pushHistory = (newAnns) => {
    const currentIdx = historyIdxRef.current;
    setHistory(prev => {
      const trimmed = prev.slice(0, currentIdx + 1); // use ref value — never stale
      return [...trimmed, newAnns].slice(-50);        // keep max 50 snapshots
    });
    const nextIdx = Math.min(currentIdx + 1, 49);
    historyIdxRef.current = nextIdx;
    setHistoryIdx(nextIdx);
    setAnnotations(newAnns);
  };

  const undo = () => {
    if (historyIdx <= 0) return;
    const newIdx = historyIdx - 1;
    historyIdxRef.current = newIdx;
    setHistoryIdx(newIdx);
    setAnnotations(history[newIdx]);
    setSelected(null);
  };

  const redo = () => {
    if (historyIdx >= history.length - 1) return;
    const newIdx = historyIdx + 1;
    historyIdxRef.current = newIdx;
    setHistoryIdx(newIdx);
    setAnnotations(history[newIdx]);
    setSelected(null);
  };

  // Handle resize start when dragging resize handles
  const handleResizeStart = useCallback((e, position) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selected) return;
    
    const ann = annotations.find(a => a.id === selected);
    if (!ann) return;
    
    setIsResizing(true);
    setResizeData({
      handle: position,
      startX: e.clientX,
      startY: e.clientY,
      startRect: {
        x: ann.x,
        y: ann.y,
        w: ann.w,
        h: ann.h,
      },
    });
  }, [selected, annotations]);

  // Keyboard shortcuts: Ctrl+Z undo, Ctrl+Y / Ctrl+Shift+Z redo, Delete key
  useEffect(() => {
    const handleKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return; // don't intercept typing
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      // Acrobat zoom shortcuts: Ctrl +/-, Ctrl+0 fit page, Ctrl+1 actual size, Ctrl+2 fit width
      if (pdfJsDocRef.current && mod && (e.key === "=" || e.key === "+")) { e.preventDefault(); zoomStep(1); }
      if (pdfJsDocRef.current && mod && e.key === "-") { e.preventDefault(); zoomStep(-1); }
      if (pdfJsDocRef.current && mod && e.key === "0") { e.preventDefault(); applyFit("fitPage"); }
      if (pdfJsDocRef.current && mod && e.key === "1") { e.preventDefault(); setZoomMode("custom"); zoomTo(1); }
      if (pdfJsDocRef.current && mod && e.key === "2") { e.preventDefault(); applyFit("fitWidth"); }
      if (e.key === "Escape" && activeComment != null) { closeCommentPopup(); return; }
      if ((e.key === "Delete" || e.key === "Backspace") && activeComment == null) { deleteSelected(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [historyIdx, history, selected, annotations, activeComment, scale, pageBase]);

  // Handle resize mouse movements
  useEffect(() => {
    if (!isResizing || !resizeData || !selected) return;

    let finalAnns = null;

    const handleMouseMove = (e) => {
      // Mouse deltas are screen px; annotations live in page units.
      const deltaX = (e.clientX - resizeData.startX) / scale;
      const deltaY = (e.clientY - resizeData.startY) / scale;

      const { handle, startRect } = resizeData;
      let newX = startRect.x;
      let newY = startRect.y;
      let newW = startRect.w;
      let newH = startRect.h;

      switch(handle) {
        // CORNERS - resize both axes
        case 'br': newW += deltaX; newH += deltaY; break;
        case 'bl': newX += deltaX; newW -= deltaX; newH += deltaY; break;
        case 'tr': newY += deltaY; newW += deltaX; newH -= deltaY; break;
        case 'tl': newX += deltaX; newY += deltaY; newW -= deltaX; newH -= deltaY; break;
        // EDGES - resize single axis
        case 't': newY += deltaY; newH -= deltaY; break;
        case 'b': newH += deltaY; break;
        case 'l': newX += deltaX; newW -= deltaX; break;
        case 'r': newW += deltaX; break;
      }

      // Enforce minimum size
      const minSize = 6;
      if (newW < minSize) {
        if (['l', 'tl', 'bl'].includes(handle)) newX = startRect.x + startRect.w - minSize;
        newW = minSize;
      }
      if (newH < minSize) {
        if (['t', 'tl', 'tr'].includes(handle)) newY = startRect.y + startRect.h - minSize;
        newH = minSize;
      }

      const r2 = (v) => Math.round(v * 100) / 100;
      newX = r2(newX); newY = r2(newY);
      newW = r2(newW); newH = r2(newH);

      // Live update without recording history on every frame
      setAnnotations(prev => {
        const updated = prev.map(a =>
          a.id === selected ? { ...a, x: newX, y: newY, w: newW, h: newH } : a
        );
        finalAnns = updated;
        return updated;
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeData(null);
      // Record a single history entry for the whole resize gesture
      if (finalAnns) pushHistory(finalAnns);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeData, selected, scale]);

  useEffect(() => {
    if (window.pdfjsLib) { pdfJsRef.current = window.pdfjsLib; return; }
    const s = document.createElement("script");
    s.src = "./vendor/pdf.min.js";
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "./vendor/pdf.worker.min.js";
      pdfJsRef.current = window.pdfjsLib;
    };
    document.head.appendChild(s);
  }, []);


  // Preload every web font once (single combined request) so the dropdown,
  // previews, and canvas all render in the real typefaces immediately.
  useEffect(() => {
    const families = FONT_OPTIONS.filter(f => f.googleFont).map(f => f.googleFont);
    if (!families.length) return;
    const id = "gfont-all";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?" + families.map(f => "family=" + f).join("&") + "&display=swap";
    document.head.appendChild(link);
  }, []);

  const loadPDF = async (f) => {
    setLoading(true); setError(""); setAnnotations([]); setHistory([[]]); setHistoryIdx(0); setSaveResult(null);
    historyIdxRef.current = 0; setSelected(null); setActiveComment(null);
    importedRef.current = []; hiddenRef.current = new Set();
    setFile(f);
    try {
      const ab = await f.arrayBuffer();
      const arrForPdfJs  = new Uint8Array(ab.slice(0));
      const arrForPdfLib = new Uint8Array(ab.slice(0));
      if (!pdfJsRef.current) throw new Error("pdf.js not loaded yet — please wait and try again.");
      pdfJsDocRef.current = await pdfJsRef.current.getDocument({ data: arrForPdfJs }).promise;
      setPageCount(pdfJsDocRef.current.numPages);

      const doc = await pdfLib.PDFDocument.load(arrForPdfLib);
      setPdfDoc(doc);

      // Read notes already embedded in the PDF (Acrobat highlights with notes,
      // sticky notes, replies …). pdf-lib gives each one's exact index in the
      // page's /Annots (so it can be edited/removed in place on save); the
      // pdf.js viewport converts its geometry to page units, honouring the
      // CropBox offset and page rotation, so markers land on the right words.
      const existingNotes = [];
      try {
        existingNotes.push(...await readPdfNotes(pdfLib, doc, pdfJsDocRef.current));
      } catch (_) { /* annotations are optional — ignore read errors */ }
      importedRef.current = existingNotes.map(n => ({ id:n.id, page:n.page, annotIndex:n.annotIndex, popupIndex:n.popupIndex, pdfjsId:n.pdfjsId }));
      if (existingNotes.length) {
        setAnnotations(existingNotes);
        setHistory([existingNotes]);
        setHistoryIdx(0);
        historyIdxRef.current = 0;
      }

      setCurrentPage(0);
      setDocVersion(v => v + 1);   // guarantees the render effect runs even if currentPage was already 0
    } catch (e) { setError(friendlyPdfError(e, "Could not load PDF: ")); }
    setLoading(false);
  };

  const renderPage = useCallback(async (pageIdx) => {
    if (!pdfJsDocRef.current || !canvasRef.current) return;
    const page   = await pdfJsDocRef.current.getPage(pageIdx + 1);
    const vp     = page.getViewport({ scale });
    const vp1    = page.getViewport({ scale: 1 });
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Only one render may draw into the canvas at a time (fast zoom/page clicks).
    if (renderTaskRef.current) { try { renderTaskRef.current.cancel(); } catch (_) {} }
    // Render at device-pixel resolution for crisp, Adobe-quality text and
    // highlights on HiDPI/Retina screens; the CSS size stays in logical px.
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width  = Math.round(vp.width  * dpr);
    canvas.height = Math.round(vp.height * dpr);
    // CSS size = exactly the backing store in device pixels (no resampling blur)
    canvas.style.width  = canvas.width  / dpr + "px";
    canvas.style.height = canvas.height / dpr + "px";
    setPageBase({ w: vp1.width, h: vp1.height });
    applyZoomAnchor(canvas, vp1.width);
    snapPage();
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const AM = pdfJsRef.current?.AnnotationMode;
    const task = page.render({
      canvasContext: ctx,
      viewport: vp,
      transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
      // ENABLE_STORAGE lets deleted imported notes be hidden before saving.
      ...(AM ? { annotationMode: AM.ENABLE_STORAGE } : {}),
    });
    renderTaskRef.current = task;
    try { await task.promise; } catch (_) { /* cancelled by a newer render */ }
    if (renderTaskRef.current === task) renderTaskRef.current = null;
  }, [scale]);

  useEffect(() => { renderPage(currentPage); }, [currentPage, scale, renderPage, docVersion, storageVersion]);

  // ── Crisp rendering: keep the page on whole DEVICE pixels ──
  // With Windows display scaling (125 %, 150 %…) the page often lands between
  // two physical pixels (after a toolbar row changes height, or a scroll by a
  // fractional amount) and the browser then resamples the canvas — the whole
  // PDF looks blurry. Nudge the page box by the sub-pixel remainder instead.
  const pageBoxRef  = useRef(null);
  const leftColRef  = useRef(null);
  const snapOffRef  = useRef({ x: 0, y: 0 });
  const snapPage = useCallback(() => {
    const box = pageBoxRef.current, cv = canvasRef.current;
    if (!box || !cv) return;
    const dpr = window.devicePixelRatio || 1;
    const r = cv.getBoundingClientRect();
    const bx = r.left - snapOffRef.current.x, by = r.top - snapOffRef.current.y;   // position without our nudge
    const nx = (Math.round(bx * dpr) - bx * dpr) / dpr, ny = (Math.round(by * dpr) - by * dpr) / dpr;
    if (Math.abs(nx - snapOffRef.current.x) < 0.002 && Math.abs(ny - snapOffRef.current.y) < 0.002) return;
    snapOffRef.current = { x: nx, y: ny };
    box.style.transform = (Math.abs(nx) > 0.001 || Math.abs(ny) > 0.001) ? `translate(${nx}px, ${ny}px)` : "";
  }, []);
  // Re-snap after every render, scroll and resize.
  useLayoutEffect(() => { snapPage(); });
  useEffect(() => {
    let raf = 0;
    const onMove = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(snapPage); };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onMove, true); window.removeEventListener("resize", onMove); };
  }, [snapPage]);

  // ── Zoom (Acrobat-style: −/+ magnifiers, % field, presets, fit width/page) ──
  const zoomAnchorRef = useRef(null);
  const lastWheelRef  = useRef(0);
  const zoomTo = (s, anchor) => {
    s = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(s * 1000) / 1000));
    if (Math.abs(s - scale) < 1e-4) return;
    // Keep the point under the cursor (or the centre of the visible page) in place.
    const ov = overlayRef.current?.getBoundingClientRect();
    if (ov && ov.width && pageBase) {
      let cx = anchor?.clientX, cy = anchor?.clientY;
      if (cx == null) {
        cx = (Math.max(ov.left, 0) + Math.min(ov.right, window.innerWidth)) / 2;
        cy = (Math.max(ov.top, 0) + Math.min(ov.bottom, window.innerHeight)) / 2;
      }
      const k = ov.width / pageBase.w;
      zoomAnchorRef.current = { px: (cx - ov.left) / k, py: (cy - ov.top) / k, cx, cy };
    }
    setScale(s);
  };
  const applyZoomAnchor = (canvas, baseW) => {
    const a = zoomAnchorRef.current;
    if (!a) return;
    zoomAnchorRef.current = null;
    const r = canvas.getBoundingClientRect(), k = r.width / baseW;
    const dx = r.left + a.px * k - a.cx, dy = r.top + a.py * k - a.cy;
    if (leftColRef.current && Math.abs(dx) > 0.5) leftColRef.current.scrollLeft += dx;
    const sp = getScrollParent(canvas);
    if (Math.abs(dy) > 0.5) { if (sp) sp.scrollTop += dy; else window.scrollBy(0, dy); }
  };
  const zoomStep = (dir, anchor) => {
    const next = dir > 0 ? ZOOM_STEPS.find(z => z > scale + 1e-3) : [...ZOOM_STEPS].reverse().find(z => z < scale - 1e-3);
    setZoomMode("custom");
    if (next) zoomTo(next, anchor);
  };
  const fitScale = (mode) => {
    const col = leftColRef.current;
    if (!pageBase || !col) return null;
    const fw = (col.clientWidth - 8) / pageBase.w;
    if (mode === "fitWidth") return fw;
    const sp = getScrollParent(col);
    const availH = (sp ? sp.clientHeight : window.innerHeight) - 56;
    return Math.min(fw, availH / pageBase.h);
  };
  const applyFit = (mode) => {
    const s = fitScale(mode);
    if (!s) return;
    setZoomMode(mode);
    zoomTo(s);
    if (mode === "fitPage") setTimeout(() => pageBoxRef.current?.scrollIntoView({ block: "start" }), 80);
  };
  // Fit modes follow window resizes and pages of a different size.
  useEffect(() => {
    if (zoomMode === "custom") return;
    const refit = () => { const s = fitScale(zoomMode); if (s && Math.abs(s - scale) > 0.004) zoomTo(s); };
    refit();
    window.addEventListener("resize", refit);
    return () => window.removeEventListener("resize", refit);
  }, [zoomMode, pageBase, scale]);
  // Ctrl + mouse wheel zooms around the cursor.
  useEffect(() => {
    const el = leftColRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelRef.current < 90) return;
      lastWheelRef.current = now;
      zoomStep(e.deltaY < 0 ? 1 : -1, { clientX: e.clientX, clientY: e.clientY });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  // Mouse position in PAGE units (independent of zoom).
  const getCanvasPos = (e) => {
    const rect = overlayRef.current.getBoundingClientRect();
    const k = pageBase && rect.width ? pageBase.w / rect.width : 1 / scale;
    return { x: (e.clientX - rect.left) * k, y: (e.clientY - rect.top) * k };
  };

  const pageAnnotations = annotations.filter(a => a.page === currentPage && a.type !== "reply");

  const onMouseDown = (e) => {
    const pos = getCanvasPos(e);

    if (editMode === "select") {
      const hit = [...pageAnnotations].reverse().find(a => {
        if (a.type === "text") return pos.x >= a.x && pos.x <= a.x + 300 && pos.y >= a.y - a.fontSize - 4 && pos.y <= a.y + 8;
        if (a.type === "sign") return pos.x >= a.x - 10 && pos.x <= a.x + 100 && pos.y >= a.y - 10 && pos.y <= a.y + 60;
        return pos.x >= a.x && pos.x <= a.x + a.w && pos.y >= a.y && pos.y <= a.y + a.h;
      });
      if (hit) {
        setSelected(hit.id);
        if (!hit.existing) {                 // imported PDF notes are fixed to their text
          dragAnnRef.current = hit.id;
          dragOffRef.current = { x: pos.x - hit.x, y: pos.y - hit.y };
        }
      } else setSelected(null);
      return;
    }

    if (editMode === "addText") {
      setPendingPos(pos);
      setTextInput("");
      setShowTextModal(true);
      return;
    }

    if (editMode === "image") {
      // Step 1 — click to mark placement position, then immediately open file picker
      setImagePlacedPos(pos);
      setImageDataUrl(null);
      setImageFile(null);
      setImageNatSize(null);
      setImageDispW(200);
      setImageDispH(150);
      // Auto-open file picker right after position is set
      setTimeout(() => imageInputRef.current?.click(), 50);
      return;
    }

    if (editMode === "sign") {
      // Click sets placement position, then open the drawing pad modal
      setPendingSigPos(pos);
      setShowSigModal(true);
      return;
    }

    setDrawing(true); setDrawStart(pos); setTempRect(null);
  };

  const onMouseMove = (e) => {
    const pos = getCanvasPos(e);
    // dragAnnRef works across mode changes (image placement auto-switches to select)
    if (dragAnnRef.current) {
      setAnnotations(prev => prev.map(a =>
        a.id === dragAnnRef.current ? { ...a, x: pos.x - dragOffRef.current.x, y: pos.y - dragOffRef.current.y } : a
      ));
      return;
    }
    if (drawing && drawStart) {
      let rawW = Math.abs(pos.x - drawStart.x);
      let rawH = Math.abs(pos.y - drawStart.y);
      if (editMode === "image" && lockAspect && imageNatSize && rawW > 0) {
        rawH = rawW * (imageNatSize.h / imageNatSize.w);
      }
      setTempRect({ x: Math.min(pos.x, drawStart.x), y: Math.min(pos.y, drawStart.y), w: rawW, h: rawH });
    }
  };

  const onMouseUp = () => {
    // Always clear drag ref regardless of mode
    if (dragAnnRef.current) {
      pushHistory([...annotations]);
      dragAnnRef.current = null;
      return;
    }
    if (drawing && tempRect && tempRect.w > 4 && tempRect.h > 4) {
      if (editMode === "image" && imageDataUrl) {
        pushHistory([...annotations, {
          id: Date.now(), page: currentPage, type: "image",
          ...tempRect, src: imageDataUrl, mimeType: imageFile?.type || "image/png",
        }]);
      } else {
        const newAnn = {
          id: Date.now(), page: currentPage,
          type: editMode === "rect" ? shapeType : editMode,
          ...tempRect,
          strokeColor: editMode === "rect" ? fontColor : "transparent",
          strokeWidth: editMode === "rect" ? strokeWidth : 1.5,
          fillShape: editMode === "rect" ? fillShape : false,
          fillColor: editMode === "rect" ? fontColor : undefined,
          color: editMode === "redact" ? redactColor : editMode === "highlight" ? highlightColor : undefined,
          date: Date.now(),
        };
        pushHistory([...annotations, newAnn]);
        if (editMode === "highlight") setSelected(newAnn.id);   // reveal the note badge immediately
      }
    }
    setDrawing(false); setDrawStart(null); setTempRect(null);
  };

  const confirmText = () => {
    if (!textInput.trim() || !pendingPos) { setShowTextModal(false); return; }
    pushHistory([...annotations, {
      id: Date.now(), page: currentPage, type: "text",
      x: pendingPos.x, y: pendingPos.y,
      text: textInput, fontSize, color: fontColor,
      fontFamily, bold, italic, underline,
    }]);
    setShowTextModal(false);
    setTextInput("");
  };

  const confirmSig = ({ dataUrl, ratio }) => {
    if (!pendingSigPos) return;
    const w = 160;                                  // default on-page width (page units ≈ pt)
    const h = Math.round(w / (ratio || 2.4));       // preserve the signature's true proportions
    pushHistory([...annotations, {
      id: Date.now(), page: currentPage, type: "image",
      x: pendingSigPos.x - w / 2, y: pendingSigPos.y - h / 2,
      w, h,
      src: dataUrl, mimeType: "image/png", isSignature: true,
    }]);
    setShowSigModal(false);
    setPendingSigPos(null);
    setEditMode("select");
  };

  const cancelSig = () => { setShowSigModal(false); setPendingSigPos(null); };
  const cancelText = () => { setShowTextModal(false); setTextInput(""); };

  const deleteSelected = () => {
    if (!selected) return;
    removeAnnotation(selected);
  };

  // Insert a Greek/science symbol. Rendered to a transparent PNG (so it exports
  // to PDF regardless of font support) and placed as a movable/resizable image.
  const insertSymbol = (ch) => {
    const fs = 72, pad = 10;
    const meas = document.createElement("canvas").getContext("2d");
    meas.font = `${fs}px 'Times New Roman', serif`;
    const w = Math.max(24, Math.ceil(meas.measureText(ch).width) + pad * 2);
    const h = Math.ceil(fs * 1.25) + pad;
    const EX = 4;
    const cvs = document.createElement("canvas");
    cvs.width = w * EX; cvs.height = h * EX;
    const ctx = cvs.getContext("2d");
    ctx.scale(EX, EX);
    ctx.fillStyle = fontColor || "#000000";
    ctx.font = `${fs}px 'Times New Roman', serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ch, w / 2, h / 2);
    const dataUrl = cvs.toDataURL("image/png");
    const dispH = 40, dispW = Math.round((w / h) * dispH);
    const newAnn = {
      id: Date.now(), page: currentPage, type: "image", isSymbol: true,
      x: 60, y: 60, w: dispW, h: dispH, src: dataUrl, mimeType: "image/png",
    };
    pushHistory([...annotations, newAnn]);
    setSelected(newAnn.id);
    setEditMode("select");
    setShowSymbols(false);
  };

  const savePDF = async () => {
    if (!pdfDoc) return;
    setSaving(true);
    try {
      const { rgb, StandardFonts, PDFName, PDFNumber, PDFArray, PDFDict, PDFHexString, PDFString, PDFRawStream, PDFBool, PDFRef } = pdfLib;
      // Re-load the ORIGINAL file for every save so output never accumulates
      // duplicate annotations or re-stamped drawings across repeated saves.
      const doc   = file ? await pdfLib.PDFDocument.load(await file.arrayBuffer()) : pdfDoc;
      const pages = doc.getPages();
      const ctx   = doc.context;

      // Page units → PDF user space, through the same pdf.js viewport used for
      // display (handles CropBox offsets and rotated pages).
      const vps = {};
      for (const p of new Set(annotations.map(a => a.page))) {
        try { vps[p] = (await pdfJsDocRef.current.getPage(p + 1)).getViewport({ scale: 1 }); } catch (_) {}
      }
      const toPdf = (pi, x, y) => vps[pi] ? vps[pi].convertToPdfPoint(x, y) : [x, pages[pi].getSize().height - y];
      const boxToPdf = (pi, x, y, w, h) => {
        const [ax, ay] = toPdf(pi, x, y), [bx, by] = toPdf(pi, x + w, y + h);
        return { x: Math.min(ax, bx), y: Math.min(ay, by), w: Math.abs(bx - ax), h: Math.abs(by - ay) };
      };

      const hexToRgb = hex => {
        const r = parseInt(hex.slice(1,3),16)/255;
        const g = parseInt(hex.slice(3,5),16)/255;
        const b = parseInt(hex.slice(5,7),16)/255;
        return rgb(r,g,b);
      };

      // ── Real PDF annotations (Adobe-compatible) ──
      const numArr = (nums) => { const a = PDFArray.withContext(ctx); nums.forEach(n => a.push(PDFNumber.of(n))); return a; };
      // A Highlight markup annotation with QuadPoints, colour, an appearance
      // stream (so every viewer renders it) and the note in /Contents.
      const addHighlightAnnot = (page, ann) => {
        const b = boxToPdf(ann.page, ann.x, ann.y, ann.w, ann.h);
        const x1 = b.x, x2 = b.x + b.w, y1 = b.y, y2 = b.y + b.h;
        const w = Math.max(1, x2 - x1), h = Math.max(1, y2 - y1);
        const m = (ann.color || "rgba(255,230,0,0.45)").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        const cr = m ? +m[1]/255 : 1, cg = m ? +m[2]/255 : 0.9, cb = m ? +m[3]/255 : 0;
        const ca = m && m[4] ? +m[4] : 0.4;
        // ExtGState (Multiply blend + opacity) + appearance form XObject
        const gs = PDFDict.withContext(ctx);
        gs.set(PDFName.of("Type"), PDFName.of("ExtGState"));
        gs.set(PDFName.of("BM"), PDFName.of("Multiply"));
        gs.set(PDFName.of("ca"), PDFNumber.of(ca));
        const gsRef = ctx.register(gs);
        const extg = PDFDict.withContext(ctx); extg.set(PDFName.of("GS"), gsRef);
        const res = PDFDict.withContext(ctx); res.set(PDFName.of("ExtGState"), extg);
        const apDict = PDFDict.withContext(ctx);
        apDict.set(PDFName.of("Type"), PDFName.of("XObject"));
        apDict.set(PDFName.of("Subtype"), PDFName.of("Form"));
        apDict.set(PDFName.of("FormType"), PDFNumber.of(1));
        apDict.set(PDFName.of("BBox"), numArr([0, 0, w, h]));
        apDict.set(PDFName.of("Resources"), res);
        const apBytes = new TextEncoder().encode(`/GS gs ${cr.toFixed(4)} ${cg.toFixed(4)} ${cb.toFixed(4)} rg 0 0 ${w.toFixed(2)} ${h.toFixed(2)} re f`);
        apDict.set(PDFName.of("Length"), PDFNumber.of(apBytes.length));
        const apRef = ctx.register(PDFRawStream.of(apDict, apBytes));
        const apN = PDFDict.withContext(ctx); apN.set(PDFName.of("N"), apRef);

        const annot = PDFDict.withContext(ctx);
        annot.set(PDFName.of("Type"), PDFName.of("Annot"));
        annot.set(PDFName.of("Subtype"), PDFName.of("Highlight"));
        annot.set(PDFName.of("Rect"), numArr([x1, y1, x2, y2]));
        annot.set(PDFName.of("QuadPoints"), numArr([x1, y2, x2, y2, x1, y1, x2, y1]));
        annot.set(PDFName.of("C"), numArr([cr, cg, cb]));
        annot.set(PDFName.of("CA"), PDFNumber.of(ca));
        annot.set(PDFName.of("F"), PDFNumber.of(4));
        annot.set(PDFName.of("T"), PDFHexString.fromText("PDF Tools"));
        annot.set(PDFName.of("M"), PDFString.of(pdfDateNow()));
        if (ann.comment) annot.set(PDFName.of("Contents"), PDFHexString.fromText(ann.comment));
        annot.set(PDFName.of("AP"), apN);
        page.node.addAnnot(ctx.register(annot));
      };
      // A Text (sticky-note) annotation carrying a comment on a non-highlight item.
      const addTextNote = (page, ann) => {
        const [x, y] = toPdf(ann.page, ann.x, ann.y);
        const annot = PDFDict.withContext(ctx);
        annot.set(PDFName.of("Type"), PDFName.of("Annot"));
        annot.set(PDFName.of("Subtype"), PDFName.of("Text"));
        annot.set(PDFName.of("Name"), PDFName.of("Comment"));
        annot.set(PDFName.of("Rect"), numArr([x, y - 20, x + 20, y]));
        annot.set(PDFName.of("F"), PDFNumber.of(4));
        annot.set(PDFName.of("Open"), PDFBool.False);
        annot.set(PDFName.of("T"), PDFHexString.fromText("PDF Tools"));
        annot.set(PDFName.of("M"), PDFString.of(pdfDateNow()));
        annot.set(PDFName.of("Contents"), PDFHexString.fromText(ann.comment || ""));
        page.node.addAnnot(ctx.register(annot));
      };

      // embed fonts once
      const fontMap = {
        Helvetica:      await doc.embedFont(StandardFonts.Helvetica),
        HelveticaBold:  await doc.embedFont(StandardFonts.HelveticaBold),
        TimesRoman:     await doc.embedFont(StandardFonts.TimesRoman),
        TimesRomanBold: await doc.embedFont(StandardFonts.TimesRomanBold),
        Courier:        await doc.embedFont(StandardFonts.Courier),
        CourierBold:    await doc.embedFont(StandardFonts.CourierBold),
      };

      const pickFont = (ann) => {
        const fo = FONT_OPTIONS.find(f => f.value === ann.fontFamily) || FONT_OPTIONS[0];
        const key = fo.pdfLib + (ann.bold ? "Bold" : "");
        return fontMap[key] || fontMap[fo.pdfLib] || fontMap["Helvetica"];
      };

      // ── Imported notes: edit in place, delete removed ones ──
      // Each carries the exact /Annots index it was read from (in the original
      // file, which is re-loaded above), so the original annotation is updated
      // rather than duplicated. A note deleted in the app is removed together
      // with its pop-up window; clearing a note's text keeps the highlight.
      const present = new Map(annotations.filter(a => a.existing).map(a => [a.id, a]));
      const removals = new Map();   // page index → Set of /Annots indices
      const markRemove = (pi, idx) => { if (typeof idx !== "number") return; if (!removals.has(pi)) removals.set(pi, new Set()); removals.get(pi).add(idx); };
      for (const imp of importedRef.current) {
        const ann = present.get(imp.id);
        if (!ann) { markRemove(imp.page, imp.annotIndex); markRemove(imp.page, imp.popupIndex); continue; }
        const text = (ann.comment || "").trim();
        if (text === (ann.origComment || "")) continue;
        try {
          const annots = pages[imp.page].node.Annots && pages[imp.page].node.Annots();
          const d = annots && annots.lookup(imp.annotIndex, PDFDict);
          if (!d) continue;
          if (text) d.set(PDFName.of("Contents"), PDFHexString.fromText(text));
          else d.delete(PDFName.of("Contents"));
          d.set(PDFName.of("M"), PDFString.of(pdfDateNow()));
        } catch (_) { /* leave the original untouched on any error */ }
      }
      // Remove highest-index-first so earlier indices stay valid.
      for (const [pi, set] of removals) {
        const annots = pages[pi].node.Annots && pages[pi].node.Annots();
        if (!annots) continue;
        for (const idx of [...set].sort((a, b) => b - a)) {
          if (idx >= annots.size()) continue;
          try { const ref = annots.get(idx); annots.remove(idx); if (ref instanceof PDFRef) { try { ctx.delete(ref); } catch (_) {} } } catch (_) {}
        }
      }

      for (const ann of annotations) {
        const page = pages[ann.page];
        if (!page || ann.type === "reply" || ann.type === "note") continue;
        const P = (x, y) => toPdf(ann.page, x, y);
        const B = () => boxToPdf(ann.page, ann.x, ann.y, ann.w, ann.h);

        if (ann.type === "text" && ann.text) {
          const f = pickFont(ann);
          const textSize = ann.fontSize * 1.1;
          const [textX, textY] = P(ann.x, ann.y);
          page.drawText(ann.text, {
            x: textX, y: textY,
            size: textSize,
            font: f, color: hexToRgb(ann.color || "#000000"),
          });
          // Draw underline manually (pdf-lib has no textDecoration support)
          if (ann.underline) {
            const textWidth = f.widthOfTextAtSize(ann.text, textSize);
            const underlineY = textY - textSize * 0.15;
            page.drawLine({
              start: { x: textX, y: underlineY },
              end:   { x: textX + textWidth, y: underlineY },
              thickness: Math.max(0.5, textSize * 0.07),
              color: hexToRgb(ann.color || "#000000"),
            });
          }
        }
        if (ann.type === "redact") {
          const rc = ann.color === "white" ? rgb(1,1,1) : rgb(0,0,0);
          const b = B();
          page.drawRectangle({ x: b.x, y: b.y, width: b.w, height: b.h, color: rc });
        }
        if (ann.existing) continue;   // already in the PDF (pdf-lib preserves it) — don't duplicate
        if (ann.type === "highlight") {
          // Save as a real, Adobe-compatible Highlight annotation (with its note),
          // not a baked-in rectangle — so the note survives save/reopen.
          addHighlightAnnot(page, ann);
        }
        if (["rect","circle","triangle","arrow","arrowUp","star","diamond","line","dblArrow","callout","checkmark","cross"].includes(ann.type)) {
          const shSc = hexToRgb(ann.strokeColor || "#000000");
          const shFc = ann.fillShape ? hexToRgb(ann.fillColor || ann.strokeColor || "#000000") : undefined;
          const shB = B();
          const shX = shB.x, shY = shB.y, shW = shB.w, shH = shB.h;
          const shCx = shX+shW/2, shCy = shY+shH/2, shBw = ann.strokeWidth || 1.5;
          const pt = (px,py) => ({x:px, y:py});

          if (ann.type === "rect" || ann.type === "callout") {
            const rh = ann.type==="callout" ? shH*0.8 : shH;
            if(shFc){page.drawRectangle({x:shX,y:shY,width:shW,height:rh,borderColor:shSc,borderWidth:shBw,color:shFc});}
            else{page.drawRectangle({x:shX,y:shY,width:shW,height:rh,borderColor:shSc,borderWidth:shBw,opacity:0});}
          }
          if (ann.type === "circle") {
            if(shFc){page.drawEllipse({x:shCx,y:shCy,xScale:shW/2,yScale:shH/2,borderColor:shSc,borderWidth:shBw,color:shFc});}
            else{page.drawEllipse({x:shCx,y:shCy,xScale:shW/2,yScale:shH/2,borderColor:shSc,borderWidth:shBw,opacity:0});}
          }
          if (ann.type === "line") {
            page.drawLine({ start:pt(shX,shY), end:pt(shX+shW,shY+shH), thickness:shBw, color:shSc });
          }
          if (ann.type === "triangle") {
            page.drawLine({ start:pt(shCx,shY+shH), end:pt(shX,shY),       thickness:shBw, color:shSc });
            page.drawLine({ start:pt(shX,shY),       end:pt(shX+shW,shY),   thickness:shBw, color:shSc });
            page.drawLine({ start:pt(shX+shW,shY),   end:pt(shCx,shY+shH), thickness:shBw, color:shSc });
          }
          if (ann.type === "diamond") {
            page.drawLine({ start:pt(shCx,shY+shH), end:pt(shX,shCy),     thickness:shBw, color:shSc });
            page.drawLine({ start:pt(shX,shCy),      end:pt(shCx,shY),     thickness:shBw, color:shSc });
            page.drawLine({ start:pt(shCx,shY),      end:pt(shX+shW,shCy), thickness:shBw, color:shSc });
            page.drawLine({ start:pt(shX+shW,shCy),  end:pt(shCx,shY+shH), thickness:shBw, color:shSc });
          }
          if (ann.type === "arrow" || ann.type === "dblArrow") {
            page.drawLine({ start:pt(shX,shCy), end:pt(shX+shW,shCy), thickness:shBw, color:shSc });
          }
          if (ann.type === "arrowUp") {
            page.drawLine({ start:pt(shCx,shY), end:pt(shCx,shY+shH), thickness:shBw, color:shSc });
          }
          if (ann.type === "star") {
            const starPtsArr = Array.from({length:10},(_,si)=>{
              const sa=(si*Math.PI/5)-Math.PI/2, sr=si%2===0?Math.min(shW,shH)/2:Math.min(shW,shH)/4;
              return {x:shCx+sr*Math.cos(sa), y:shCy+sr*Math.sin(sa)};
            });
            for(let si=0;si<starPtsArr.length;si++){
              page.drawLine({ start:pt(starPtsArr[si].x,starPtsArr[si].y), end:pt(starPtsArr[(si+1)%starPtsArr.length].x,starPtsArr[(si+1)%starPtsArr.length].y), thickness:shBw, color:shSc });
            }
          }
          if (ann.type === "checkmark") {
            const ckBw = shBw * 1.4;
            page.drawLine({ start:pt(shX+shW*0.08, shY+shH*0.5),  end:pt(shX+shW*0.38, shY+shH*0.18), thickness:ckBw, color:shSc });
            page.drawLine({ start:pt(shX+shW*0.38, shY+shH*0.18), end:pt(shX+shW*0.92, shY+shH*0.82), thickness:ckBw, color:shSc });
          }
          if (ann.type === "cross") {
            const crP = shW * 0.1, crBw = shBw * 1.4;
            page.drawLine({ start:pt(shX+crP,     shY+shH-crP), end:pt(shX+shW-crP, shY+crP),     thickness:crBw, color:shSc });
            page.drawLine({ start:pt(shX+shW-crP, shY+shH-crP), end:pt(shX+crP,     shY+crP),     thickness:crBw, color:shSc });
          }
        }
        if (ann.type === "sign" && ann.points?.length > 1) {
          for (let i = 0; i < ann.points.length - 1; i++) {
            const [sx, sy] = P(ann.points[i].x, ann.points[i].y), [ex, ey] = P(ann.points[i+1].x, ann.points[i+1].y);
            page.drawLine({ start: { x: sx, y: sy }, end: { x: ex, y: ey }, thickness: 1.5, color: rgb(0,0,0.7) });
          }
        }
        if (ann.type === "image" && ann.src) {
          try {
            // Convert any image format (incl. GIF) to PNG via an offscreen canvas
            const imgEl = await new Promise((res, rej) => {
              const i = new Image();
              i.onload = () => res(i);
              i.onerror = rej;
              i.src = ann.src;
            });
            const cvs = document.createElement("canvas");
            cvs.width  = imgEl.naturalWidth  || 400;
            cvs.height = imgEl.naturalHeight || 300;
            cvs.getContext("2d").drawImage(imgEl, 0, 0);
            const pngDataUrl = cvs.toDataURL("image/png");
            const base64 = pngDataUrl.split(",")[1];
            const raw    = atob(base64);
            const bytes2 = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) bytes2[i] = raw.charCodeAt(i);
            const embeddedImg = await doc.embedPng(bytes2);
            const ib = B();
            page.drawImage(embeddedImg, { x: ib.x, y: ib.y, width: ib.w, height: ib.h });
          } catch (_) { /* skip unembeddable images */ }
        }
      }

      // Persist comments attached to non-highlight items (shapes, images, symbols)
      // as Adobe sticky-note annotations so they survive save/reopen too.
      for (const ann of annotations) {
        if (ann.existing || ann.type === "highlight" || ann.type === "reply") continue;
        if (ann.comment && ann.comment.trim()) {
          try { addTextNote(pages[ann.page], ann); } catch (_) {}
        }
      }

      const bytes = await doc.save();
      const url   = URL.createObjectURL(new Blob([bytes], { type:"application/pdf" }));
      const fname = `${outputName.trim().replace(/\.pdf$/i,"")||"edited"}.pdf`;
      setSaveResult({ url, filename: fname });
    } catch(e) { setError(friendlyPdfError(e, "Save error: ")); }
    setSaving(false);
  };

  const activeCursor = editMode === "select" ? "default" : editMode === "sign" ? "crosshair" : editMode === "addText" ? "text" : "crosshair";
  // 1 screen px expressed in page units — for UI chrome (markers, outlines)
  // that should keep a constant on-screen size at every zoom level.
  const ui = 1 / scale;
  // Comment marker (speech-bubble badge) centred on (x, y), in page units.
  // dx: extra on-screen offset (px) so the marker sits just past the end of
  // the line instead of on the text or on a resize handle.
  const noteBadge = (x, y, filled, dx = 0, dy = 0) => (
    <g transform={`translate(${x} ${y}) scale(${ui}) translate(${dx} ${dy})`}>
      <circle r={9} fill={filled ? "#D81F3F" : "#ffffff"} stroke={filled ? "#ffffff" : "#D81F3F"} strokeWidth={1.6} style={{ filter:"drop-shadow(0 1px 1.5px rgba(0,0,0,.35))" }}/>
      <path d="M-4.2,-2.6 h8.4 M-4.2,0.2 h8.4 M-4.2,3 h5.2" stroke={filled ? "#fff" : "#D81F3F"} strokeWidth={1.2} strokeLinecap="round" pointerEvents="none"/>
    </g>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"0", height:"100%" }}>

      {/* Text modal */}
      {showTextModal && (
        <TextInputModal
          ann={{ fontSize, color: fontColor, fontFamily, bold, italic }}
          textInput={textInput}
          setTextInput={setTextInput}
          onConfirm={confirmText}
          onCancel={cancelText}
        />
      )}

      {showSigModal && (
        <SignatureModal onConfirm={confirmSig} onCancel={cancelSig} />
      )}

      {/* ── Persistent hint above toolbar ── */}
      <div style={{ fontSize:"11px", color:"#8C8C88", fontStyle:"italic", marginBottom:"6px" }}>
        If the uploaded PDF is not visible, try adjusting the Zoom level or navigate between pages using the ◀ ▶ buttons above
      </div>

      {/* ── Toolbar row 1: mode buttons ── */}
      <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"10px 0 8px", flexWrap:"wrap" }}>
        {EDIT_MODES.map(m => (
          <button key={m.id} onClick={() => setEditMode(m.id)} title={m.label} style={{
            display:"flex", alignItems:"center", gap:"7px",
            padding:"7px 13px", borderRadius:"8px", border:"1px solid",
            borderColor: editMode===m.id ? T.accent : T.border,
            background:  editMode===m.id ? T.accentBg : "rgba(0,0,0,.03)",
            color:       editMode===m.id ? T.accent : T.dim,
            cursor:"pointer", fontSize:"12.5px", fontWeight:500, fontFamily:T.ui, transition:"all .15s",
          }}>
            <Icon name={m.icon} size={15}/>{m.label}
          </button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"6px" }}>
          <button onClick={undo} disabled={historyIdx <= 0} title="Undo (Ctrl+Z)" style={{
            display:"flex", alignItems:"center", gap:"6px", padding:"6px 12px", borderRadius:"8px",
            border:`1px solid ${T.border}`,
            background: historyIdx > 0 ? "rgba(0,0,0,.04)" : "transparent",
            color: historyIdx > 0 ? T.text : T.faintest,
            cursor: historyIdx > 0 ? "pointer" : "not-allowed",
            fontSize:"13px", fontFamily:T.ui, transition:"all .15s",
          }}><Icon name="undo" size={15}/>Undo</button>
          <button onClick={redo} disabled={historyIdx >= history.length - 1} title="Redo (Ctrl+Y)" style={{
            display:"flex", alignItems:"center", gap:"6px", padding:"6px 12px", borderRadius:"8px",
            border:`1px solid ${T.border}`,
            background: historyIdx < history.length - 1 ? "rgba(0,0,0,.04)" : "transparent",
            color: historyIdx < history.length - 1 ? T.text : T.faintest,
            cursor: historyIdx < history.length - 1 ? "pointer" : "not-allowed",
            fontSize:"13px", fontFamily:T.ui, transition:"all .15s",
          }}><Icon name="redo" size={15}/>Redo</button>
          <div style={{ width:"1px", height:"20px", background:T.border, margin:"0 2px" }}/>
          {selected && (
            <button onClick={deleteSelected} title="Delete selected (Del)" style={{
              display:"flex", alignItems:"center", gap:"6px", padding:"6px 12px", borderRadius:"8px",
              border:"1px solid rgba(176,30,46,.3)", background:"rgba(176,30,46,.08)",
              color:T.bad, cursor:"pointer", fontSize:"12px", fontFamily:T.ui,
            }}><Icon name="trash" size={14}/>Delete</button>
          )}
          <div style={{ fontSize:"10px", color:T.faintest, letterSpacing:".05em", fontFamily:T.mono }}>
            {historyIdx > 0 ? `${historyIdx} action${historyIdx>1?"s":""}` : ""}
          </div>
        </div>
      </div>

      {/* ── Toolbar row 2: text formatting (only for addText mode) ── */}
      {editMode === "addText" && (
        <div style={{
          display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap",
          padding:"8px 12px", background:"rgba(216,31,63,.05)",
          border:"1px solid rgba(216,31,63,.15)", borderRadius:"10px", marginBottom:"8px",
        }}>
          <span style={{ fontSize:"11px", color:"#D81F3F", letterSpacing:".08em", fontWeight:700, marginRight:"4px" }}>TEXT OPTIONS</span>

          {/* Font family */}
          <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}
            style={{ ...miniInput, width:"170px", cursor:"pointer" }}>
            {[...new Set(FONT_OPTIONS.map(f => f.group))].map(group => (
              <optgroup key={group} label={group}>
                {FONT_OPTIONS.filter(f => f.group === group).map(f => (
                  <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Font size */}
          <select value={fontSize} onChange={e => setFontSize(+e.target.value)}
            style={{ ...miniInput, width:"72px", cursor:"pointer" }}>
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}pt</option>)}
          </select>

          {/* Bold */}
          <button onClick={() => setBold(b => !b)} title="Bold" style={{
            ...miniInput, width:"34px", fontWeight:700, textAlign:"center", padding:"6px 0", cursor:"pointer",
            borderColor: bold ? "#D81F3F" : "rgba(0,0,0,.12)",
            background:  bold ? "rgba(216,31,63,.2)" : "rgba(0,0,0,.04)",
            color:       bold ? "#D81F3F" : "#5C5C5A",
          }}>B</button>

          {/* Italic */}
          <button onClick={() => setItalic(i => !i)} title="Italic" style={{
            ...miniInput, width:"34px", fontStyle:"italic", textAlign:"center", padding:"6px 0", cursor:"pointer",
            borderColor: italic ? "#D81F3F" : "rgba(0,0,0,.12)",
            background:  italic ? "rgba(216,31,63,.2)" : "rgba(0,0,0,.04)",
            color:       italic ? "#D81F3F" : "#5C5C5A",
          }}>I</button>

          {/* Underline */}
          <button onClick={() => setUnderline(u => !u)} title="Underline" style={{
            ...miniInput, width:"34px", textDecoration:"underline", textAlign:"center", padding:"6px 0", cursor:"pointer",
            borderColor: underline ? "#D81F3F" : "rgba(0,0,0,.12)",
            background:  underline ? "rgba(216,31,63,.2)" : "rgba(0,0,0,.04)",
            color:       underline ? "#D81F3F" : "#5C5C5A",
          }}>U</button>

          {/* Color */}
          <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
            <span style={{ fontSize:"12px", color:"#8C8C88" }}>Color</span>
            <input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)}
              style={{ width:"30px", height:"30px", border:"1px solid rgba(0,0,0,.16)", borderRadius:"6px", background:"none", cursor:"pointer", padding:"2px" }} />
            <span style={{ fontSize:"12px", color:"#B6B5B0", fontFamily:"monospace" }}>{fontColor}</span>
          </div>

          {/* Preview swatch */}
          <div style={{
            marginLeft:"auto", fontFamily, fontSize: Math.min(fontSize,18)+"px",
            fontWeight: bold?"bold":"normal", fontStyle: italic?"italic":"normal",
            textDecoration: underline?"underline":"none",
            color: fontColor, background:"rgba(0,0,0,.04)",
            border:"1px solid rgba(0,0,0,.07)", borderRadius:"6px",
            padding:"4px 10px", whiteSpace:"nowrap",
          }}>
            Aa Preview
          </div>
        </div>
      )}

      {/* ── Toolbar row: Redact options ── */}
      {editMode === "redact" && (
        <div style={{
          display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap",
          padding:"8px 12px", background:"rgba(176,30,46,.05)",
          border:"1px solid rgba(176,30,46,.2)", borderRadius:"10px", marginBottom:"8px",
        }}>
          <span style={{ fontSize:"11px", color:"#B01E2E", letterSpacing:".08em", fontWeight:700 }}>REDACT OPTIONS</span>
          <span style={{ fontSize:"12px", color:"#8C8C88" }}>Cover color:</span>
          {[
            { value:"black", label:"Black", desc:"Standard redaction" },
            { value:"white", label:"White", desc:"Invisible cover" },
          ].map(opt => (
            <button key={opt.value} onClick={() => setRedactColor(opt.value)} title={opt.desc} style={{
              padding:"6px 14px", borderRadius:"8px", border:"1px solid",
              borderColor: redactColor===opt.value ? "#B01E2E" : "rgba(0,0,0,.12)",
              background:  redactColor===opt.value ? "rgba(176,30,46,.15)" : "rgba(0,0,0,.035)",
              color:       redactColor===opt.value ? "#B01E2E" : "#8C8C88",
              cursor:"pointer", fontSize:"12px", fontFamily:"inherit",
            }}>{opt.label}</button>
          ))}

        </div>
      )}

      {/* ── Toolbar row: Highlight options ── */}
      {editMode === "highlight" && (
        <div style={{
          display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap",
          padding:"8px 12px", background:"rgba(255,220,0,.05)",
          border:"1px solid rgba(255,220,0,.2)", borderRadius:"10px", marginBottom:"8px",
        }}>
          <span style={{ fontSize:"11px", color:"#f0e060", letterSpacing:".08em", fontWeight:700 }}>HIGHLIGHT COLOR</span>
          {[
            { label:"Yellow",  value:"rgba(255,230,0,0.45)"   },
            { label:"Green",   value:"rgba(0,230,100,0.4)"    },
            { label:"Blue",    value:"rgba(0,160,255,0.4)"    },
            { label:"Red",     value:"rgba(255,60,60,0.4)"    },
            { label:"Orange",  value:"rgba(255,140,0,0.45)"   },
            { label:"Purple",  value:"rgba(160,60,255,0.4)"   },
            { label:"White",   value:"rgba(255,255,255,0.6)"  },
          ].map(opt => (
            <button key={opt.value} onClick={() => setHighlightColor(opt.value)} style={{
              padding:"5px 12px", borderRadius:"8px", border:"1px solid",
              borderColor: highlightColor===opt.value ? "#f0e060" : "rgba(0,0,0,.12)",
              background:  highlightColor===opt.value ? opt.value : "rgba(0,0,0,.035)",
              color:       highlightColor===opt.value ? "#fff" : "#5C5C5A",
              cursor:"pointer", fontSize:"12px", fontFamily:"inherit",
              fontWeight: highlightColor===opt.value ? 700 : 400,
              textShadow: highlightColor===opt.value ? "0 1px 3px rgba(0,0,0,.5)" : "none",
            }}>{opt.label}</button>
          ))}
          {/* Custom color picker */}
          <div style={{ display:"flex", alignItems:"center", gap:"5px", marginLeft:"4px" }}>
            <span style={{ fontSize:"11px", color:"#8C8C88" }}>Custom:</span>
            <input type="color"
              value={"#" + (highlightColor.match(/\d+/g)||[255,230,0]).slice(0,3).map(n=>parseInt(n).toString(16).padStart(2,"0")).join("")}
              onChange={e => {
                const hex = e.target.value;
                const r = parseInt(hex.slice(1,3),16);
                const g = parseInt(hex.slice(3,5),16);
                const b = parseInt(hex.slice(5,7),16);
                setHighlightColor(`rgba(${r},${g},${b},0.45)`);
              }}
              style={{ width:"28px", height:"28px", border:"1px solid rgba(0,0,0,.16)", borderRadius:"6px", background:"none", cursor:"pointer", padding:"2px" }}
            />
          </div>
        </div>
      )}

      {/* ── Toolbar row: Shape options ── */}
      {editMode === "rect" && (
        <div style={{
          display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap",
          padding:"8px 12px", background:"rgba(216,31,63,.05)",
          border:"1px solid rgba(216,31,63,.2)", borderRadius:"10px", marginBottom:"8px",
        }}>
          <span style={{ fontSize:"11px", color:"#80b0ff", letterSpacing:".08em", fontWeight:700, marginRight:"4px" }}>SHAPE</span>

          {/* Shape picker */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
            {SHAPES.map(s => (
              <button key={s.id} onClick={() => setShapeType(s.id)} title={s.label} style={{
                padding:"5px 10px", borderRadius:"7px", border:"1px solid",
                borderColor: shapeType===s.id ? "#80b0ff" : "rgba(0,0,0,.12)",
                background:  shapeType===s.id ? "rgba(216,31,63,.18)" : "rgba(0,0,0,.035)",
                color:       shapeType===s.id ? "#80b0ff" : "#5C5C5A",
                cursor:"pointer", fontSize:"14px", fontFamily:"inherit", fontWeight: shapeType===s.id?700:400,
                minWidth:"36px", textAlign:"center",
              }}>{s.icon}</button>
            ))}
          </div>

          <div style={{ width:"1px", height:"24px", background:"rgba(0,0,0,.10)", margin:"0 4px" }}/>

          {/* Stroke width */}
          <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
            <span style={{ fontSize:"11px", color:"#8C8C88" }}>Width</span>
            {[1,2,3,5,8].map(w => (
              <button key={w} onClick={() => setStrokeWidth(w)} style={{
                width:"28px", height:"28px", borderRadius:"6px", border:"1px solid",
                borderColor: strokeWidth===w ? "#80b0ff" : "rgba(0,0,0,.12)",
                background:  strokeWidth===w ? "rgba(216,31,63,.18)" : "rgba(0,0,0,.035)",
                color:       strokeWidth===w ? "#80b0ff" : "#5C5C5A",
                cursor:"pointer", fontSize:"11px", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center",
              }}><div style={{ width:`${w*2}px`, height:`${w*2}px`, maxWidth:"16px", maxHeight:"16px", background:"currentColor", borderRadius:"50%" }}/></button>
            ))}
          </div>

          <div style={{ width:"1px", height:"24px", background:"rgba(0,0,0,.10)", margin:"0 4px" }}/>

          {/* Stroke color */}
          <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
            <span style={{ fontSize:"11px", color:"#8C8C88" }}>Color</span>
            <input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)}
              style={{ width:"28px", height:"28px", border:"1px solid rgba(0,0,0,.16)", borderRadius:"6px", background:"none", cursor:"pointer", padding:"2px" }}/>
          </div>

          <div style={{ width:"1px", height:"24px", background:"rgba(0,0,0,.10)", margin:"0 4px" }}/>

          {/* Fill toggle */}
          <button onClick={() => setFillShape(f => !f)} style={{
            padding:"5px 12px", borderRadius:"7px", border:"1px solid",
            borderColor: fillShape ? "#80b0ff" : "rgba(0,0,0,.12)",
            background:  fillShape ? "rgba(216,31,63,.18)" : "rgba(0,0,0,.035)",
            color:       fillShape ? "#80b0ff" : "#8C8C88",
            cursor:"pointer", fontSize:"12px", fontFamily:"inherit",
          }}>{fillShape ? "Filled" : "Outline only"}</button>

          <div style={{ width:"1px", height:"24px", background:"rgba(0,0,0,.10)", margin:"0 4px" }}/>

          {/* Science / Greek symbol picker — a little hidden window of α β γ θ … */}
          <div style={{ position:"relative" }}>
            <button onClick={() => setShowSymbols(s => !s)} title="Insert a Greek / science symbol" style={{
              padding:"5px 12px", borderRadius:"7px", border:"1px solid",
              borderColor: showSymbols ? "#80b0ff" : "rgba(0,0,0,.12)",
              background:  showSymbols ? "rgba(216,31,63,.18)" : "rgba(0,0,0,.035)",
              color:       showSymbols ? "#80b0ff" : "#5C5C5A",
              cursor:"pointer", display:"flex", alignItems:"center", gap:"6px",
            }}><span style={{ fontSize:"15px", fontFamily:"'Times New Roman', serif" }}>Ω</span><span style={{ fontSize:"11px" }}>Symbols</span></button>
            {showSymbols && (
              <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:40, background:"#fff", border:`1px solid ${T.borderUp}`, borderRadius:"10px", boxShadow:"0 10px 30px rgba(0,0,0,.18)", padding:"10px", width:"252px" }}>
                <div style={{ fontSize:"10px", letterSpacing:".08em", color:T.faint, textTransform:"uppercase", marginBottom:"8px" }}>Insert symbol</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(8, 1fr)", gap:"4px", maxHeight:"184px", overflowY:"auto" }}>
                  {SCIENCE_SYMBOLS.map(ch => (
                    <button key={ch} onClick={() => insertSymbol(ch)} title={`Insert ${ch}`} style={{
                      height:"28px", display:"flex", alignItems:"center", justifyContent:"center",
                      border:`1px solid ${T.border}`, borderRadius:"6px", background:"rgba(0,0,0,.02)",
                      color:T.text, cursor:"pointer", fontSize:"17px", fontFamily:"'Times New Roman', serif",
                    }}
                    onMouseEnter={e=>{ e.currentTarget.style.background="rgba(216,31,63,.1)"; e.currentTarget.style.borderColor=T.accent; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background="rgba(0,0,0,.02)"; e.currentTarget.style.borderColor=T.border; }}>
                      {ch}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize:"10px", color:T.faintest, marginTop:"8px", lineHeight:1.5 }}>Placed on the page in the current color — drag to position, corner-handles to resize.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drop/load zone */}
      {!file && (
        <div onClick={() => fileInputRef.current.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") loadPDF(f); }}
          style={{ flex:1, border:`1.5px dashed ${T.borderUp}`, borderRadius:"14px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", background:"rgba(0,0,0,.02)", gap:"14px" }}>
          <div style={{ color:T.faintest }}><Icon name="file" size={38} stroke={1.4}/></div>
          <div style={{ color:T.dim, fontSize:"14px" }}>
            Drop a PDF here, or <span style={{ color:T.accent }}>browse files</span>
          </div>
          <input ref={fileInputRef} type="file" accept=".pdf" style={{ display:"none" }}
            onChange={e => e.target.files[0] && loadPDF(e.target.files[0])} />
        </div>
      )}

      {loading && (
        <div style={{ textAlign:"center", padding:"40px", color:T.dim, display:"flex", flexDirection:"column", alignItems:"center", gap:"10px" }}>
          <span style={{ display:"flex", animation:"spin 1s linear infinite", color:T.accent }}><Icon name="spinner" size={26}/></span>
          <div>Loading PDF</div>
        </div>
      )}

      {error && (
        <div style={{ display:"flex", alignItems:"center", gap:"9px", background:"rgba(176,30,46,.08)", border:"1px solid rgba(176,30,46,.2)", borderRadius:"10px", padding:"12px 16px", color:T.bad, fontSize:"13px" }}><Icon name="alert" size={16}/>{error}</div>
      )}

      {/* Editor area */}
      {file && !loading && (
        <div style={{ display:"flex", flexDirection:"column", gap:"10px", flex:1 }}>

          {/* Nav bar */}
          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
            <button onClick={() => setCurrentPage(p => Math.max(0,p-1))} disabled={currentPage===0} style={{ ...navBtn, display:"flex", alignItems:"center", padding:"6px 9px" }}><Icon name="chevL" size={15}/></button>
            <span style={{ color:T.dim, fontSize:"12.5px", minWidth:"86px", textAlign:"center", fontFamily:T.mono }}>{currentPage+1} / {pageCount}</span>
            <button onClick={() => setCurrentPage(p => Math.min(pageCount-1,p+1))} disabled={currentPage===pageCount-1} style={{ ...navBtn, display:"flex", alignItems:"center", padding:"6px 9px" }}><Icon name="chevR" size={15}/></button>
            {/* Zoom — Acrobat-style: −  [ 125 % ▾ ]  + */}
            <div style={{ position:"relative", display:"flex", alignItems:"center", marginLeft:"10px", border:`1px solid ${T.border}`, borderRadius:"8px", background:"#fff", height:"32px" }}>
              {(() => {
                const zb = { display:"flex", alignItems:"center", justifyContent:"center", width:"32px", height:"30px", border:"none", background:"transparent", color:T.dim, cursor:"pointer", padding:0 };
                const pct = Math.round(scale * 100);
                const presets = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
                return (
                  <>
                    <button onClick={() => zoomStep(-1)} disabled={scale <= ZOOM_MIN + 1e-3} title="Zoom out (Ctrl −)" style={{ ...zb, opacity: scale <= ZOOM_MIN + 1e-3 ? .35 : 1, borderRadius:"7px 0 0 7px" }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><Icon name="zoomOut" size={17}/></button>
                    <div style={{ display:"flex", alignItems:"center", height:"100%", borderLeft:`1px solid ${T.border}`, borderRight:`1px solid ${T.border}` }}>
                      <input value={zoomText ?? `${pct}%`} title="Zoom level — type a value and press Enter"
                        onFocus={e => { setZoomText(String(pct)); const t = e.target; setTimeout(() => t.select(), 0); }}
                        onChange={e => setZoomText(e.target.value)}
                        onBlur={() => setZoomText(null)}
                        onKeyDown={e => {
                          if (e.key === "Enter") { const v = parseFloat(String(zoomText).replace(",", ".")); if (v > 0) { setZoomMode("custom"); zoomTo(v / 100); } e.currentTarget.blur(); }
                          if (e.key === "Escape") e.currentTarget.blur();
                        }}
                        style={{ width:"54px", height:"100%", textAlign:"center", border:"none", outline:"none", background:"transparent", fontFamily:T.mono, fontSize:"12.5px", color:T.text, padding:0 }}/>
                      <button onClick={() => setShowZoomMenu(v => !v)} title="Zoom presets" style={{ ...zb, width:"22px", color:T.faint }}><Icon name="chevD" size={13}/></button>
                    </div>
                    <button onClick={() => zoomStep(1)} disabled={scale >= ZOOM_MAX - 1e-3} title="Zoom in (Ctrl +)" style={{ ...zb, opacity: scale >= ZOOM_MAX - 1e-3 ? .35 : 1, borderRadius:"0 7px 7px 0" }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><Icon name="zoomIn" size={17}/></button>
                    {showZoomMenu && (
                      <>
                        <div onMouseDown={() => setShowZoomMenu(false)} style={{ position:"fixed", inset:0, zIndex:60 }}/>
                        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:"28px", zIndex:61, minWidth:"170px", background:"#fff", border:`1px solid ${T.borderUp}`, borderRadius:"10px", boxShadow:"0 10px 30px rgba(0,0,0,.18)", padding:"5px", lineHeight:1.2 }}>
                          {[["fitWidth","Fit width","Ctrl+2"],["fitPage","Fit page","Ctrl+0"]].map(([m, label, kb]) => (
                            <button key={m} onClick={() => { setShowZoomMenu(false); applyFit(m); }} className="zoom-opt" style={{ display:"flex", alignItems:"center", gap:"8px", width:"100%", padding:"7px 10px", border:"none", borderRadius:"6px", background: zoomMode===m ? T.accentBg : "transparent", color: zoomMode===m ? T.accent : T.text, cursor:"pointer", fontSize:"12.5px", fontFamily:T.ui, textAlign:"left" }}>
                              {label}<span style={{ marginLeft:"auto", fontSize:"10.5px", color:T.faint, fontFamily:T.mono }}>{kb}</span>
                            </button>
                          ))}
                          <div style={{ height:"1px", background:T.border, margin:"4px 2px" }}/>
                          {presets.map(z => {
                            const on = zoomMode === "custom" && Math.abs(scale - z) < 1e-3;
                            return (
                              <button key={z} onClick={() => { setShowZoomMenu(false); setZoomMode("custom"); zoomTo(z); }} style={{ display:"flex", alignItems:"center", width:"100%", padding:"6px 10px", border:"none", borderRadius:"6px", background: on ? T.accentBg : "transparent", color: on ? T.accent : T.text, cursor:"pointer", fontSize:"12.5px", fontFamily:T.mono, textAlign:"left" }}>
                                {Math.round(z*100)}%{z === 1 && <span style={{ marginLeft:"auto", fontSize:"10.5px", color:T.faint }}>Ctrl+1</span>}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"6px" }}>
              <input value={outputName} onChange={e => setOutputName(e.target.value)}
                style={{ ...miniInput, width:"120px", fontFamily:T.mono }} placeholder="filename" />
              <span style={{ color:T.faint, fontSize:"13px", fontFamily:T.mono }}>.pdf</span>
              <button onClick={savePDF} disabled={saving} style={{
                display:"flex", alignItems:"center", gap:"7px", padding:"8px 16px", borderRadius:"8px",
                background: saving?T.accentBg:T.accent,
                border:"none", cursor:saving?"not-allowed":"pointer",
                color:saving?T.accent:"#FFFFFF", fontSize:"13px", fontWeight:600, fontFamily:T.ui,
              }}>
                {saving ? <><span style={{ display:"flex", animation:"spin 1s linear infinite" }}><Icon name="spinner" size={15}/></span>Saving</> : <><Icon name="download" size={16}/>Save PDF</>}
              </button>
            </div>
          </div>

          {/* Save result download link */}
          {saveResult && (
            <div style={{
              display:"flex", alignItems:"center", gap:"12px",
              padding:"12px 16px", borderRadius:"10px",
              background:"rgba(31,138,83,.06)",
              border:"1px solid rgba(31,138,83,.25)",
              animation:"fadeIn .3s",
            }}>
              <span style={{ display:"flex", color:T.good }}><Icon name="check" size={18}/></span>
              <div style={{ flex:1 }}>
                <div style={{ color:T.good, fontSize:"13px", fontWeight:600 }}>PDF ready</div>
                <div style={{ color:"#2E7D5B", fontSize:"11px", marginTop:"2px", fontFamily:T.mono }}>{saveResult.filename}</div>
              </div>
              <a href={saveResult.url} download={saveResult.filename} style={{
                display:"flex", alignItems:"center", gap:"7px", padding:"8px 16px", borderRadius:"8px",
                background:T.good,
                color:"#FFFFFF", fontWeight:600, fontSize:"13px",
                textDecoration:"none", fontFamily:T.ui,
                border:"none", cursor:"pointer",
              }}><Icon name="download" size={15}/>Download</a>
              <button onClick={() => setSaveResult(null)} style={{
                display:"flex", background:"none", border:"none", color:"#2E7D5B",
                cursor:"pointer", padding:"2px",
              }}><Icon name="close" size={16}/></button>
            </div>
          )}

          {/* Hint */}
          <div style={{ fontSize:"11px", color:"#B6B5B0", fontStyle:"italic" }}>
            {editMode==="addText"   && "Click anywhere on the page to open the text editor"}
            {editMode==="redact"    && "Drag to draw a black redaction box (hides content permanently)"}
            {editMode==="highlight" && "Drag to highlight — then click the red note button on it (or double-click) to add a comment. Notes appear in the panel on the right."}
            {editMode==="rect"      && `Drag to draw a ${SHAPES.find(s=>s.id===shapeType)?.label||"shape"}`}
            {editMode==="sign"      && "Click anywhere on the page to open the signature drawing pad"}
            {editMode==="select"    && "Click an annotation to select it, drag to move, use Delete button to remove"}
            {editMode==="image" && (imagePlacedPos ? (imageDataUrl ? "Step 3 — adjust size then click Place Image" : "Step 2 — choose your image file") : "Step 1 — click on the page to mark where you want the image")}
          </div>

          {/* Image tool — 3-step panel */}
          {editMode === "image" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"10px", padding:"10px 14px",
              background:"rgba(216,31,63,.05)", border:"1px solid rgba(216,31,63,.2)",
              borderRadius:"10px", marginBottom:"4px" }}>

              {/* Step 1 */}
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{ width:"22px", height:"22px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                  background: imagePlacedPos ? "rgba(100,220,100,.2)" : "rgba(216,31,63,.2)",
                  border: `1px solid ${imagePlacedPos ? "rgba(100,220,100,.5)" : "rgba(216,31,63,.4)"}`,
                  fontSize:"11px", fontWeight:700, color: imagePlacedPos ? "#1F8A53" : "#D81F3F", flexShrink:0 }}>1</span>
                <span style={{ fontSize:"12px", color: imagePlacedPos ? "#1F8A53" : "#D81F3F" }}>
                  {imagePlacedPos ? `✓ Position set (${Math.round(imagePlacedPos.x)}, ${Math.round(imagePlacedPos.y)})` : "Click on the PDF page to set position"}
                </span>
                {imagePlacedPos && (
                  <button onClick={() => { setImagePlacedPos(null); setImageDataUrl(null); setImageFile(null); setImageNatSize(null); }}
                    style={{ marginLeft:"auto", background:"none", border:"none", color:"#B01E2E", cursor:"pointer", fontSize:"13px" }}>✕ Reset</button>
                )}
              </div>

              {/* Step 2 */}
              {imagePlacedPos && (
                <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
                  <span style={{ width:"22px", height:"22px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                    background: imageDataUrl ? "rgba(100,220,100,.2)" : "rgba(216,31,63,.2)",
                    border: `1px solid ${imageDataUrl ? "rgba(100,220,100,.5)" : "rgba(216,31,63,.4)"}`,
                    fontSize:"11px", fontWeight:700, color: imageDataUrl ? "#1F8A53" : "#D81F3F", flexShrink:0 }}>2</span>
                  <input ref={imageInputRef} type="file" accept=".jpg,.jpeg,.png,.gif,.webp,image/*"
                    style={{ display:"none" }}
                    onChange={e => {
                      const f = e.target.files[0];
                      if (!f) return;
                      setImageFile(f);
                      const reader = new FileReader();
                      reader.onload = ev => {
                        const url = ev.target.result;
                        setImageDataUrl(url);
                        const img = new Image();
                        img.onload = () => {
                          setImageNatSize({ w: img.naturalWidth, h: img.naturalHeight });
                          const dw = Math.min(img.naturalWidth, 280);
                          const dh = Math.round(dw * img.naturalHeight / img.naturalWidth);
                          setImageDispW(dw); setImageDispH(dh);
                        };
                        img.src = url;
                      };
                      reader.readAsDataURL(f);
                    }}/>
                  {imageDataUrl
                    ? <><img src={imageDataUrl} alt="preview" style={{ height:"28px", borderRadius:"4px", border:"1px solid rgba(0,0,0,.16)", objectFit:"cover" }}/>
                        <span style={{ fontSize:"11px", color:"#1F8A53" }}>✓ {imageFile?.name}</span>
                        {imageNatSize && <span style={{ fontSize:"10px", color:"#B6B5B0" }}>{imageNatSize.w}×{imageNatSize.h}px</span>}
                        <button onClick={() => { setImageDataUrl(null); setImageFile(null); setImageNatSize(null); }}
                          style={{ background:"none", border:"none", color:"#B01E2E", cursor:"pointer", fontSize:"13px" }}>✕</button>
                      </>
                    : <button onClick={() => imageInputRef.current.click()} style={{
                        padding:"5px 14px", borderRadius:"8px", border:"1px solid rgba(216,31,63,.4)",
                        background:"rgba(216,31,63,.1)", color:"#D81F3F", cursor:"pointer", fontSize:"12px", fontFamily:"inherit" }}>
                        Choose Image <span style={{ fontSize:"10px", color:"#B6B5B0", marginLeft:"4px" }}>JPG · PNG · GIF · WEBP</span>
                      </button>
                  }
                </div>
              )}

              {/* Step 3 */}
              {imagePlacedPos && imageDataUrl && (
                <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                  <span style={{ width:"22px", height:"22px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                    background:"rgba(216,31,63,.2)", border:"1px solid rgba(216,31,63,.4)",
                    fontSize:"11px", fontWeight:700, color:"#D81F3F", flexShrink:0 }}>3</span>
                  <span style={{ fontSize:"12px", color:"#D81F3F" }}>W</span>
                  <input type="number" value={imageDispW} min={20} max={1200}
                    onChange={e => { const w=parseInt(e.target.value)||20; setImageDispW(w); if(lockAspect&&imageNatSize) setImageDispH(Math.round(w*imageNatSize.h/imageNatSize.w)); }}
                    style={{ width:"62px", padding:"4px 6px", borderRadius:"6px", background:"rgba(0,0,0,.05)", border:"1px solid rgba(0,0,0,.12)", color:"#1A1A1C", fontSize:"12px", fontFamily:"inherit" }}/>
                  <span style={{ fontSize:"11px", color:"#B6B5B0" }}>×</span>
                  <span style={{ fontSize:"12px", color:"#D81F3F" }}>H</span>
                  <input type="number" value={imageDispH} min={20} max={1200}
                    onChange={e => { const h=parseInt(e.target.value)||20; setImageDispH(h); if(lockAspect&&imageNatSize) setImageDispW(Math.round(h*imageNatSize.w/imageNatSize.h)); }}
                    style={{ width:"62px", padding:"4px 6px", borderRadius:"6px", background:"rgba(0,0,0,.05)", border:"1px solid rgba(0,0,0,.12)", color:"#1A1A1C", fontSize:"12px", fontFamily:"inherit" }}/>
                  <label style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"11px", color:T.dim, cursor:"pointer" }}>
                    <input type="checkbox" checked={lockAspect} onChange={e => setLockAspect(e.target.checked)} style={{ accentColor:T.accent }}/>Lock ratio
                  </label>
                  {[0.5,1,1.5,2].map(m => (
                    <button key={m} onClick={() => { const base=Math.min(imageNatSize?.w||200,280); const w=Math.round(base*m); const h=imageNatSize?Math.round(w*imageNatSize.h/imageNatSize.w):Math.round(w*0.75); setImageDispW(w); setImageDispH(h); }}
                      style={{ padding:"3px 7px", borderRadius:"5px", fontSize:"10px", border:"1px solid rgba(216,31,63,.3)", background:T.accentBg, color:T.accent, cursor:"pointer", fontFamily:T.mono }}>{m}×</button>
                  ))}
                  <button onClick={() => {
                    const newAnn = { id:Date.now(), page:currentPage, type:"image",
                      x: imagePlacedPos.x - imageDispW/2, y: imagePlacedPos.y - imageDispH/2,
                      w: imageDispW, h: imageDispH, src: imageDataUrl, mimeType: imageFile?.type||"image/png" };
                    pushHistory([...annotations, newAnn]);
                    setEditMode("select"); setSelected(newAnn.id);
                    dragAnnRef.current = newAnn.id;
                    dragOffRef.current = { x: imageDispW/2, y: imageDispH/2 };
                    setImagePlacedPos(null);
                  }} style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"6px", padding:"6px 15px", borderRadius:"8px", border:"none",
                    background:T.good, color:"#FFFFFF",
                    cursor:"pointer", fontSize:"12px", fontWeight:600, fontFamily:T.ui }}>
                    <Icon name="check" size={14}/>Place image
                  </button>
                </div>
              )}

              {/* Tip — placement is not final */}
              <div style={{ display:"flex", alignItems:"flex-start", gap:"7px", fontSize:"11px", color:T.faint, lineHeight:1.5, paddingTop:"2px" }}>
                <span style={{ color:T.accent, display:"flex", marginTop:"1px" }}><Icon name="image" size={13}/></span>
                <span>When you place your image, you can still change its dimensions or location however you want — select it, then drag the red corner handles to resize or drag the image itself to move it.</span>
              </div>
            </div>
          )}

          {/* Canvas + comments panel, side by side */}
          <div style={{ display:"flex", gap:"16px", alignItems:"flex-start", width:"100%" }}>
            <div ref={leftColRef} style={{ flex:"1 1 auto", minWidth:0, overflowX:"auto", overflowY:"hidden", paddingBottom:"4px" }}>

          {/* Canvas + SVG overlay */}
          <div ref={pageBoxRef} style={{ position:"relative", display:"inline-block", lineHeight:0, margin:"1px", overflow:"hidden", alignSelf:"flex-start", boxShadow:"0 0 0 1px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.10), 0 8px 24px rgba(0,0,0,.06)" }}>
            <canvas ref={canvasRef} style={{ display:"block" }} />
            <svg ref={overlayRef}
              viewBox={pageBase ? `0 0 ${pageBase.w} ${pageBase.h}` : undefined}
              preserveAspectRatio="none"
              style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", cursor:activeCursor, overflow:"visible" }}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>

              {pageAnnotations.map(ann => {
                const sel = selected === ann.id || activeComment === ann.id;
                const dash = sel ? `${6*ui},${3*ui}` : "0";
                const selStroke = sel ? "#D81F3F" : "none";

                if (ann.type === "redact") return (
                  <g key={ann.id}>
                    <rect x={ann.x} y={ann.y} width={ann.w} height={ann.h}
                      fill={ann.color === "white" ? "#ffffff" : "#000000"}
                      stroke={sel ? "#D81F3F" : ann.color === "white" ? "#aaa" : "none"}
                      strokeWidth={(sel?2:1)*ui} strokeDasharray={dash} />
                    {sel && <text x={ann.x + ann.w/2} y={ann.y + ann.h/2 + 4*ui} textAnchor="middle"
                      fontSize={11*ui} fill={ann.color === "white" ? "#666" : "#fff"} fontFamily="sans-serif">
                      {ann.color === "white" ? "White Cover" : "Black Redact"}
                    </text>}
                  </g>
                );
                if (ann.type === "note") {
                  // A note read from the PDF. The highlight itself is drawn by pdf.js
                  // on the canvas; here: a hit area over each highlighted line + marker.
                  const boxes = ann.quads && ann.quads.length ? ann.quads : [ann];
                  const tip = [ann.author, ann.comment].filter(Boolean).join(": ");
                  return (
                    <g key={ann.id} style={{ cursor:"pointer" }} className="pdfnote"
                       onMouseDown={(e)=>e.stopPropagation()}
                       onClick={(e)=>{ e.stopPropagation(); openCommentPopup(ann); }}>
                      {boxes.map((q, qi) => (
                        <rect key={qi} x={q.x} y={q.y} width={q.w} height={q.h}
                          fill={sel ? "rgba(216,31,63,.10)" : "transparent"}
                          stroke={sel ? "#D81F3F" : "transparent"} strokeWidth={1.2*ui} strokeDasharray={`${4*ui},${3*ui}`}/>
                      ))}
                      {ann.comment || annotations.some(r => r.parentId === ann.id) ? noteBadge(ann.bx ?? ann.x, ann.by ?? ann.y, true, ann.bdx || 0, ann.bdy || 0) : null}
                      <title>{tip || "Comment"}</title>
                    </g>
                  );
                }
                if (ann.type === "highlight") return (
                  <g key={ann.id} onDoubleClick={(e)=>{ e.stopPropagation(); openCommentPopup(ann); }}>
                    <rect x={ann.x} y={ann.y} width={ann.w} height={ann.h}
                      fill={ann.color || "rgba(255,230,0,.45)"} stroke={selStroke} strokeWidth={sel?1.5*ui:0} strokeDasharray={dash}
                      style={{ mixBlendMode:"multiply" }}>
                      {ann.comment ? <title>{ann.comment}</title> : null}
                    </rect>
                    {/* Note marker — click to add/read a comment (filled when a note exists).
                        Shown when the highlight is selected or already has a note. */}
                    {(sel || ann.comment) && (
                      <g style={{ cursor:"pointer" }}
                         onMouseDown={(e)=>e.stopPropagation()}
                         onClick={(e)=>{ e.stopPropagation(); openCommentPopup(ann); }}>
                        {(() => { const a = noteAnchor(ann); return noteBadge(a.x, a.y, !!ann.comment, a.dx); })()}
                      </g>
                    )}
                  </g>
                );
                if (["rect","circle","triangle","arrow","arrowUp","star","diamond","line","dblArrow","callout","checkmark","cross"].includes(ann.type)) {
                  const sc = sel ? "#D81F3F" : (ann.strokeColor || "#000");
                  const sw = ann.strokeWidth || 1.5;
                  const fc = ann.fillShape ? (ann.fillColor || ann.strokeColor || "#000") : "transparent";
                  const cx = ann.x + ann.w/2, cy = ann.y + ann.h/2;
                  const w = ann.w, h = ann.h;
                  let shape = null;

                  if (ann.type === "rect") shape = <rect x={ann.x} y={ann.y} width={w} height={h} fill={fc} stroke={sc} strokeWidth={sw} strokeDasharray={dash}/>;

                  if (ann.type === "circle") shape = <ellipse cx={cx} cy={cy} rx={w/2} ry={h/2} fill={fc} stroke={sc} strokeWidth={sw} strokeDasharray={dash}/>;

                  if (ann.type === "triangle") {
                    const pts = `${cx},${ann.y} ${ann.x},${ann.y+h} ${ann.x+w},${ann.y+h}`;
                    shape = <polygon points={pts} fill={fc} stroke={sc} strokeWidth={sw} strokeDasharray={dash}/>;
                  }

                  if (ann.type === "diamond") {
                    const pts = `${cx},${ann.y} ${ann.x+w},${cy} ${cx},${ann.y+h} ${ann.x},${cy}`;
                    shape = <polygon points={pts} fill={fc} stroke={sc} strokeWidth={sw} strokeDasharray={dash}/>;
                  }

                  if (ann.type === "star") {
                    const outerR = Math.min(w,h)/2, innerR = Math.min(w,h)/4;
                    const starPts = Array.from({length:10},(_,i)=>{
                      const a = (i*Math.PI/5) - Math.PI/2;
                      const r = i%2===0 ? outerR : innerR;
                      return `${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`;
                    }).join(" ");
                    shape = <polygon points={starPts} fill={fc} stroke={sc} strokeWidth={sw} strokeDasharray={dash}/>;
                  }

                  if (ann.type === "line") shape = <line x1={ann.x} y1={ann.y+h} x2={ann.x+w} y2={ann.y} stroke={sc} strokeWidth={sw} strokeDasharray={dash} strokeLinecap="round"/>;

                  if (ann.type === "arrow") {
                    const mx = ann.x+w-12, arrowH = 8;
                    shape = <g><line x1={ann.x} y1={cy} x2={mx} y2={cy} stroke={sc} strokeWidth={sw}/><polygon points={`${ann.x+w},${cy} ${mx},${cy-arrowH} ${mx},${cy+arrowH}`} fill={sc}/></g>;
                  }

                  if (ann.type === "arrowUp") {
                    const my = ann.y+12, arrowH = 8;
                    shape = <g><line x1={cx} y1={ann.y+h} x2={cx} y2={my} stroke={sc} strokeWidth={sw}/><polygon points={`${cx},${ann.y} ${cx-arrowH},${my} ${cx+arrowH},${my}`} fill={sc}/></g>;
                  }

                  if (ann.type === "dblArrow") {
                    const lx = ann.x+12, rx = ann.x+w-12, arrowH = 8;
                    shape = <g><line x1={lx} y1={cy} x2={rx} y2={cy} stroke={sc} strokeWidth={sw}/><polygon points={`${ann.x},${cy} ${lx},${cy-arrowH} ${lx},${cy+arrowH}`} fill={sc}/><polygon points={`${ann.x+w},${cy} ${rx},${cy-arrowH} ${rx},${cy+arrowH}`} fill={sc}/></g>;
                  }

                  if (ann.type === "callout") {
                    const tail = 14;
                    shape = <g>
                      <rect x={ann.x} y={ann.y} width={w} height={h-tail} rx={4} fill={fc} stroke={sc} strokeWidth={sw} strokeDasharray={dash}/>
                      <polygon points={`${ann.x+16},${ann.y+h-tail} ${ann.x+28},${ann.y+h-tail} ${ann.x+20},${ann.y+h}`} fill={fc} stroke={sc} strokeWidth={sw}/>
                    </g>;
                  }

                  if (ann.type === "checkmark") {
                    // ✓ drawn as two line segments
                    const ckPts = [
                      `${ann.x + w*0.08},${ann.y + h*0.5}`,
                      `${ann.x + w*0.38},${ann.y + h*0.82}`,
                      `${ann.x + w*0.92},${ann.y + h*0.18}`,
                    ].join(" ");
                    shape = <polyline points={ckPts} fill="none" stroke={sc} strokeWidth={sw*1.4} strokeLinecap="round" strokeLinejoin="round"/>;
                  }

                  if (ann.type === "cross") {
                    // ✗ drawn as two diagonal lines
                    const p = w * 0.1;
                    shape = <g>
                      <line x1={ann.x+p} y1={ann.y+p} x2={ann.x+w-p} y2={ann.y+h-p} stroke={sc} strokeWidth={sw*1.4} strokeLinecap="round"/>
                      <line x1={ann.x+w-p} y1={ann.y+p} x2={ann.x+p} y2={ann.y+h-p} stroke={sc} strokeWidth={sw*1.4} strokeLinecap="round"/>
                    </g>;
                  }

                  return <g key={ann.id}>{shape}{sel && <rect x={ann.x-3*ui} y={ann.y-3*ui} width={w+6*ui} height={h+6*ui} fill="none" stroke="#D81F3F" strokeWidth={ui} strokeDasharray={`${5*ui},${3*ui}`} rx={2*ui}/>}</g>;
                }
                if (ann.type === "text") {
                  const lines = ann.text.split("\n");
                  const lh = ann.fontSize * 1.3;
                  return (
                    <g key={ann.id}>
                      {sel && <rect x={ann.x-4*ui} y={ann.y-ann.fontSize-4*ui} width={Math.max(...lines.map(l=>l.length))*ann.fontSize*0.6+8*ui} height={lines.length*lh+8*ui} fill="rgba(216,31,63,.08)" stroke="#D81F3F" strokeWidth={ui} strokeDasharray={`${5*ui},${3*ui}`} rx={3*ui}/>}
                      {lines.map((line, li) => (
                        <text key={li} x={ann.x} y={ann.y + li*lh}
                          fontSize={ann.fontSize} fill={ann.color||"#000"}
                          fontFamily={ann.fontFamily||"Helvetica, sans-serif"}
                          fontWeight={ann.bold?"bold":"normal"}
                          fontStyle={ann.italic?"italic":"normal"}
                          textDecoration={ann.underline?"underline":"none"}
                          style={{ userSelect:"none" }}>
                          {line}
                        </text>
                      ))}
                    </g>
                  );
                }
                if (ann.type === "image" && ann.src) {
                  return (
                    <g key={ann.id}>
                      <image href={ann.src} x={ann.x} y={ann.y} width={ann.w} height={ann.h} preserveAspectRatio="xMidYMid meet"/>
                      {sel && <rect x={ann.x-2*ui} y={ann.y-2*ui} width={ann.w+4*ui} height={ann.h+4*ui}
                        fill="none" stroke="#D81F3F" strokeWidth={2*ui} strokeDasharray={`${6*ui},${3*ui}`}/>}
                    </g>
                  );
                }
                if (ann.type === "sign" && ann.points) {
                  const d = ann.points.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
                  return <path key={ann.id} d={d} fill="none" stroke={sel?"#D81F3F":"#003080"} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>;
                }
                return null;
              })}

              {/* Comment markers of shapes / images / symbols that carry a note */}
              {pageAnnotations.filter(a => a.comment && a.type !== "note" && a.type !== "highlight" && typeof a.w === "number").map(a => (
                <g key={"nb-"+a.id} style={{ cursor:"pointer" }}
                   onMouseDown={(e)=>e.stopPropagation()}
                   onClick={(e)=>{ e.stopPropagation(); openCommentPopup(a); }}>
                  {noteBadge(a.x + a.w, a.y, true, BADGE_DX)}
                  <title>{a.comment}</title>
                </g>
              ))}

              {/* Image placement preview — show where it will land before Place is clicked */}
              {editMode === "image" && imagePlacedPos && imageDataUrl && (
                <g opacity="0.65">
                  <image href={imageDataUrl}
                    x={imagePlacedPos.x - imageDispW/2} y={imagePlacedPos.y - imageDispH/2}
                    width={imageDispW} height={imageDispH}
                    preserveAspectRatio="xMidYMid meet"/>
                  <rect x={imagePlacedPos.x - imageDispW/2 - 2*ui} y={imagePlacedPos.y - imageDispH/2 - 2*ui}
                    width={imageDispW+4*ui} height={imageDispH+4*ui}
                    fill="none" stroke="#D81F3F" strokeWidth={1.5*ui} strokeDasharray={`${6*ui},${3*ui}`}/>
                </g>
              )}
              {/* Crosshair when pos not yet set */}
              {editMode === "image" && !imagePlacedPos && (
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
                  fontSize={13*ui} fill="rgba(216,31,63,.4)" fontFamily="sans-serif">
                  Click here to set image position
                </text>
              )}
              {tempRect && (
                <>
                  {editMode !== "image" && (
                    <rect x={tempRect.x} y={tempRect.y} width={tempRect.w} height={tempRect.h}
                      fill={editMode==="highlight"?(highlightColor||"rgba(255,230,0,.35)"):editMode==="redact"?"rgba(0,0,0,.6)":"transparent"}
                      stroke={editMode==="rect"?fontColor:"#D81F3F"} strokeWidth={1.5*ui} strokeDasharray={`${6*ui},${3*ui}`}/>
                  )}
                </>
              )}

            </svg>

            {/* Resize handles overlay — INSIDE the relative canvas box so it aligns with the image */}
            {selected && (() => {
              const ann = pageAnnotations.find(a => a.id === selected);
              // Resizable: anything stored as a box (image, highlight, redact,
              // shapes) — i.e. has numeric w/h and isn't free text or a path.
              const isResizable = ann && !ann.existing && typeof ann.w === "number" && typeof ann.h === "number" && ann.type !== "text" && ann.type !== "sign" && ann.type !== "note";
              if (!isResizable) return null;
              return (
                <div style={{
                  position: "absolute",
                  left: `${ann.x * scale}px`,
                  top: `${ann.y * scale}px`,
                  width: `${ann.w * scale}px`,
                  height: `${ann.h * scale}px`,
                  pointerEvents: "none",   // empty area passes clicks through to the SVG (move), handles re-enable themselves
                  zIndex: 50,
                }}>
                  <ResizeHandles
                    isSelected={true}
                    onResizeStart={handleResizeStart}
                  />
                </div>
              );
            })()}
          </div>

          {/* Annotation chips */}
          {pageAnnotations.length > 0 && (
            <div style={{ marginTop:"4px" }}>
              <div style={{ fontSize:"10px", letterSpacing:".1em", color:"#B6B5B0", textTransform:"uppercase", marginBottom:"6px" }}>
                Annotations on page {currentPage+1} ({pageAnnotations.length})
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                {pageAnnotations.map(ann => (
                  <div key={ann.id} onClick={() => setSelected(ann.id)} style={{
                    padding:"4px 10px", borderRadius:"6px", fontSize:"11px", cursor:"pointer",
                    border:`1px solid ${selected===ann.id?"#D81F3F":"rgba(0,0,0,.12)"}`,
                    background: selected===ann.id?"rgba(216,31,63,.1)":"rgba(0,0,0,.035)",
                    color: selected===ann.id?"#D81F3F":"#5C5C5A",
                  }}>
                    {ann.type==="text" ? `T "${ann.text?.slice(0,18)||"…"}"` : ann.isSignature ? `signature` : ann.type==="image" ? `image` : ann.type==="note" ? `comment` : ann.type}
                  </div>
                ))}
              </div>

              {/* Resize panel for the selected box annotation */}
              {(() => {
                const selAnn = annotations.find(a => a.id === selected);
                const resizable = selAnn && !selAnn.existing && typeof selAnn.w === "number" && typeof selAnn.h === "number" && selAnn.type !== "text" && selAnn.type !== "sign" && selAnn.type !== "note";
                if (!resizable) return null;
                const resizeLabel = selAnn.isSignature ? "Resize Signature"
                  : selAnn.type === "image" ? "Resize Image"
                  : selAnn.type === "highlight" ? "Resize Highlight"
                  : selAnn.type === "redact" ? "Resize Redaction"
                  : "Resize Shape";
                return (
                  <div style={{ marginTop:"12px", padding:"12px 14px", background:"rgba(0,0,0,.03)", border:"1px solid rgba(0,0,0,.07)", borderRadius:"10px" }}>
                    <div style={{ fontSize:"10px", letterSpacing:".1em", color:selAnn.isSignature?"#D81F3F":"#2E7D5B", textTransform:"uppercase", marginBottom:"10px" }}>
                      {resizeLabel}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                      <label style={{ fontSize:"11px", color:"#8C8C88" }}>W</label>
                      <input type="number" value={Math.round(selAnn.w)} min={20} max={2000}
                        onChange={e => {
                          const w = parseInt(e.target.value) || 20;
                          setAnnotations(prev => prev.map(a => a.id === selected ? { ...a, w } : a));
                        }}
                        style={{ width:"64px", padding:"4px 7px", borderRadius:"6px", background:"rgba(0,0,0,.05)", border:"1px solid rgba(0,0,0,.12)", color:"#1A1A1C", fontSize:"12px", fontFamily:"inherit" }}/>
                      <span style={{ fontSize:"11px", color:"#B6B5B0" }}>×</span>
                      <label style={{ fontSize:"11px", color:"#8C8C88" }}>H</label>
                      <input type="number" value={Math.round(selAnn.h)} min={20} max={2000}
                        onChange={e => {
                          const h = parseInt(e.target.value) || 20;
                          setAnnotations(prev => prev.map(a => a.id === selected ? { ...a, h } : a));
                        }}
                        style={{ width:"64px", padding:"4px 7px", borderRadius:"6px", background:"rgba(0,0,0,.05)", border:"1px solid rgba(0,0,0,.12)", color:"#1A1A1C", fontSize:"12px", fontFamily:"inherit" }}/>
                      <button onClick={() => {
                        const a = annotations.find(x => x.id === selected);
                        if (!a) return;
                        const ratio = a.w / a.h;
                        const w = Math.round(a.w);
                        const h = Math.round(w / ratio);
                        setAnnotations(prev => prev.map(x => x.id === selected ? { ...x, w, h } : x));
                      }} style={{ padding:"4px 10px", borderRadius:"6px", border:"1px solid rgba(0,0,0,.12)", background:"rgba(0,0,0,.04)", color:"#5C5C5A", cursor:"pointer", fontSize:"10px", fontFamily:"inherit" }}>
                        Lock ratio
                      </button>
                      <button onClick={() => pushHistory([...annotations])} style={{ padding:"4px 10px", borderRadius:"6px", border:"none", background:"rgba(100,200,100,.15)", color:"#1F8A53", cursor:"pointer", fontSize:"10px", fontFamily:"inherit", marginLeft:"auto" }}>
                        ✓ Apply
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
            </div>{/* end left column */}

            {/* ── Comments panel (Acrobat-style): grouped by page, searchable, threaded ── */}
            {(() => {
              const repliesOf = (id) => annotations.filter(r => r.type === "reply" && r.parentId === id);
              const all = annotations.filter(a => a.type !== "reply" && (a.type === "highlight" || a.type === "note" || (a.comment && a.comment.trim())));
              const q = commentSearch.trim().toLowerCase();
              const hit = (a) => !q || [a.comment, a.author, ...repliesOf(a.id).flatMap(r => [r.comment, r.author])]
                .some(s => (s || "").toLowerCase().includes(q));
              const items = all.filter(hit).sort((a,b) => (a.page - b.page) || ((a.by ?? a.y) - (b.by ?? b.y)) || (a.x - b.x));
              const groups = [];
              items.forEach(a => { const g = groups[groups.length-1]; if (g && g.page === a.page) g.items.push(a); else groups.push({ page:a.page, items:[a] }); });
              const typeLabel = (a) => a.type === "highlight" ? "Highlight" : a.type !== "note" ? (a.type === "image" ? (a.isSymbol ? "Symbol" : "Image") : "Shape")
                : ({ Highlight:"Highlight", Text:"Sticky note", FreeText:"Text box", Underline:"Underline", StrikeOut:"Strikethrough", Squiggly:"Squiggly", Square:"Rectangle", Circle:"Oval", Ink:"Drawing", Line:"Line", Polygon:"Polygon", PolyLine:"Polyline", Stamp:"Stamp", FileAttachment:"Attachment", Caret:"Insert text" }[a.subtype] || a.subtype || "Comment");
              const markText = (s) => {
                if (!q || !s) return s;
                const i = s.toLowerCase().indexOf(q);
                if (i < 0) return s;
                return <>{s.slice(0,i)}<mark style={{ background:"rgba(255,214,0,.55)", color:"inherit", borderRadius:"2px" }}>{s.slice(i, i+q.length)}</mark>{s.slice(i+q.length)}</>;
              };
              if (!showComments) return (
                <button onClick={()=>setShowComments(true)} title="Show comments panel" style={{ flexShrink:0, position:"sticky", top:"8px", writingMode:"vertical-rl", padding:"14px 9px", borderRadius:"10px", border:`1px solid ${T.border}`, background:T.surface, color:T.dim, cursor:"pointer", fontSize:"12px", fontWeight:600, fontFamily:T.ui }}>
                  Comments{all.length?` (${all.length})`:""} ◂
                </button>
              );
              return (
                <aside style={{ width:"312px", flexShrink:0, position:"sticky", top:"8px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:"12px", display:"flex", flexDirection:"column", maxHeight:"calc(100vh - 120px)", overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,.05)" }}>
                  <div style={{ flexShrink:0, display:"flex", alignItems:"center", gap:"8px", padding:"12px 14px", borderBottom:`1px solid ${T.border}` }}>
                    <span style={{ color:T.accent, display:"flex" }}><Icon name="marker" size={16}/></span>
                    <div style={{ fontSize:"13px", fontWeight:600, color:T.text }}>Comments</div>
                    <span style={{ fontSize:"11px", color:T.faint, fontFamily:T.mono, background:"rgba(0,0,0,.05)", borderRadius:"10px", padding:"1px 7px" }}>{all.length}</span>
                    <button onClick={()=>setShowComments(false)} title="Hide panel" style={{ marginLeft:"auto", background:"none", border:"none", color:T.faint, cursor:"pointer", display:"flex" }}><Icon name="chevR" size={16}/></button>
                  </div>
                  <div style={{ flexShrink:0, padding:"10px 12px", borderBottom:`1px solid ${T.border}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"7px", background:"rgba(0,0,0,.04)", border:`1px solid ${T.border}`, borderRadius:"8px", padding:"6px 10px" }}>
                      <span style={{ color:T.faint, display:"flex" }}><Icon name="zoomIn" size={14}/></span>
                      <input value={commentSearch} onChange={e=>setCommentSearch(e.target.value)} placeholder="Search comments…" style={{ flex:1, minWidth:0, border:"none", background:"none", outline:"none", fontSize:"12px", color:T.text, fontFamily:T.ui }}/>
                      {commentSearch && <span style={{ fontSize:"10.5px", color:T.faint, fontFamily:T.mono }}>{items.length}</span>}
                      {commentSearch && <button onClick={()=>setCommentSearch("")} style={{ background:"none", border:"none", color:T.faint, cursor:"pointer", display:"flex" }}><Icon name="close" size={13}/></button>}
                    </div>
                  </div>
                  <div ref={panelListRef} style={{ flex:"1 1 auto", minHeight:0, overflowY:"auto", padding:"4px 10px 10px" }}>
                    {items.length === 0 && (
                      <div style={{ padding:"26px 12px", textAlign:"center", color:T.faintest, fontSize:"12px", lineHeight:1.6 }}>
                        {all.length ? "No comments match your search." : "No comments yet. Use the Highlight tool, then click its marker to write a note."}
                      </div>
                    )}
                    {groups.map(g => (
                      <div key={g.page} style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        <div style={{ flexShrink:0, display:"flex", alignItems:"center", gap:"6px", padding:"10px 2px 0", fontSize:"10.5px", letterSpacing:".08em", textTransform:"uppercase", color:T.faint, fontWeight:600 }}>
                          Page {g.page+1}<span style={{ flex:1, height:"1px", background:T.border }}/><span style={{ fontFamily:T.mono, letterSpacing:0 }}>{g.items.length}</span>
                        </div>
                        {g.items.map(a => {
                          const sel = selected === a.id || activeComment === a.id;
                          const bar = a.type==="highlight" ? (a.color||"rgba(255,230,0,.45)") : (a.color || "#D81F3F");
                          const reps = repliesOf(a.id);
                          const who = a.author || (a.existing ? "Unknown author" : "You");
                          return (
                            <div key={a.id} data-ann={a.id} onClick={()=>goToAnnotation(a)} className="cmt-card" style={{
                              flexShrink:0, position:"relative", border:`1px solid ${sel?T.accent:T.border}`, borderLeft:`4px solid ${bar.replace(/,\s*0?\.\d+\)$/, ",0.95)")}`,
                              borderRadius:"8px", background: sel?"rgba(216,31,63,.045)":"#fff", cursor:"pointer",
                              boxShadow: sel ? "0 0 0 3px rgba(216,31,63,.10)" : "0 1px 2px rgba(0,0,0,.04)", transition:"border-color .12s, box-shadow .12s",
                            }}>
                              <div style={{ display:"flex", alignItems:"center", gap:"7px", padding:"8px 10px 4px" }}>
                                <span style={{ width:"22px", height:"22px", borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(216,31,63,.10)", color:T.accent, fontSize:"10.5px", fontWeight:700 }}>
                                  {(who.trim()[0] || "?").toUpperCase()}
                                </span>
                                <div style={{ minWidth:0, flex:1 }}>
                                  <div style={{ fontSize:"12px", fontWeight:600, color:T.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{markText(who)}</div>
                                  <div style={{ fontSize:"10.5px", color:T.faint, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{typeLabel(a)}{a.date ? " · " + formatNoteDate(a.date) : ""}</div>
                                </div>
                                <button onClick={e=>{ e.stopPropagation(); removeAnnotation(a.id); }} title="Delete comment" className="cmt-del" style={{ flexShrink:0, background:"none", border:"none", color:T.faintest, cursor:"pointer", display:"flex", padding:"3px", borderRadius:"5px" }} onMouseEnter={e=>e.currentTarget.style.color=T.bad} onMouseLeave={e=>e.currentTarget.style.color=T.faintest}><Icon name="trash" size={13}/></button>
                              </div>
                              <div style={{
                                padding:"2px 10px 9px 39px", fontSize:"12.5px", lineHeight:1.5, color: a.comment ? T.text : T.faintest, fontStyle: a.comment ? "normal" : "italic",
                                whiteSpace:"pre-wrap", wordBreak:"break-word",
                                ...(sel ? {} : { display:"-webkit-box", WebkitLineClamp:4, WebkitBoxOrient:"vertical", overflow:"hidden" }),
                              }}>
                                {a.comment ? markText(a.comment) : "Add a note…"}
                              </div>
                              {reps.length > 0 && (
                                <div style={{ margin:"0 10px 9px 39px", paddingLeft:"9px", borderLeft:`2px solid ${T.border}`, display:"flex", flexDirection:"column", gap:"6px" }}>
                                  {reps.map(r => (
                                    <div key={r.id} style={{ fontSize:"12px", lineHeight:1.45 }}>
                                      <span style={{ fontWeight:600, color:T.text }}>{markText(r.author || "Reply")}</span>
                                      {r.date ? <span style={{ color:T.faint, fontSize:"10.5px" }}> · {formatNoteDate(r.date)}</span> : null}
                                      <div style={{ color:T.dim, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{r.comment ? markText(r.comment) : <i style={{ color:T.faintest }}>(empty)</i>}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </aside>
              );
            })()}
          </div>{/* end canvas + panel row */}

          {/* ── Floating note editor — fixed & high z-index, always above the PDF ── */}
          {activeComment != null && (() => {
            const a = annotations.find(x => x.id === activeComment);
            if (!a) return null;
            const readOnly = !!a.readOnly;   // e.g. a FreeText box — its visible text lives in the page itself
            const reps = annotations.filter(r => r.type === "reply" && r.parentId === a.id);
            const bar = a.type==="highlight" ? (a.color||"rgba(255,230,0,.45)") : (a.color || "#D81F3F");
            const who = a.author || (a.existing ? "Unknown author" : "You");
            const setText = (id, v) => setAnnotations(prev => prev.map(x => x.id===id ? {...x, comment:v} : x));
            const keys = (e) => { if (e.key==="Escape") closeCommentPopup(); if (e.key==="Enter" && (e.ctrlKey||e.metaKey)) closeCommentPopup(); };
            const ta = { width:"100%", border:`1px solid ${T.border}`, borderRadius:"8px", background:"#fff", padding:"8px 10px", fontSize:"13px", color:T.text, fontFamily:T.ui, outline:"none", resize:"vertical", lineHeight:1.5, boxSizing:"border-box" };
            return (
              <>
                <div onMouseDown={closeCommentPopup} style={{ position:"fixed", inset:0, zIndex:1190, background:"transparent" }}/>
                <div onMouseDown={e=>e.stopPropagation()} style={{ position:"fixed", left:commentPos.left+"px", top:commentPos.top+"px", zIndex:1200, width:"300px", maxHeight:"calc(100vh - 24px)", display:"flex", flexDirection:"column", background:"#fff", border:`1px solid ${T.borderUp}`, borderTop:`4px solid ${bar.replace(/,\s*0?\.\d+\)$/, ",0.95)")}`, borderRadius:"12px", boxShadow:"0 16px 44px rgba(0,0,0,.26)", overflow:"hidden", animation:"fadeIn .12s" }}>
                  <div style={{ flexShrink:0, display:"flex", alignItems:"center", gap:"8px", padding:"9px 12px", borderBottom:`1px solid ${T.border}`, background:"rgba(0,0,0,.02)" }}>
                    <span style={{ width:"22px", height:"22px", borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(216,31,63,.10)", color:T.accent, fontSize:"10.5px", fontWeight:700 }}>{(who.trim()[0] || "?").toUpperCase()}</span>
                    <div style={{ minWidth:0, flex:1 }}>
                      <div style={{ fontSize:"12.5px", fontWeight:600, color:T.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{who}</div>
                      <div style={{ fontSize:"10.5px", color:T.faint }}>Page {a.page+1}{a.date ? " · " + formatNoteDate(a.date) : ""}</div>
                    </div>
                    <button onClick={closeCommentPopup} title="Close (Esc)" style={{ background:"none", border:"none", color:T.faint, cursor:"pointer", display:"flex" }}><Icon name="close" size={15}/></button>
                  </div>
                  <div style={{ overflowY:"auto", padding:"10px 12px", display:"flex", flexDirection:"column", gap:"10px" }}>
                    {readOnly ? (
                      <div style={{ fontSize:"13px", lineHeight:1.6, color:T.text, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                        {a.comment || <span style={{ color:T.faintest, fontStyle:"italic" }}>(empty note)</span>}
                        <div style={{ marginTop:"6px", fontSize:"10.5px", color:T.faint }}>Text box — its text is part of the page and can't be edited here.</div>
                      </div>
                    ) : (
                      <textarea ref={commentInputRef} value={a.comment || ""} onChange={e => setText(a.id, e.target.value)} onKeyDown={keys}
                        placeholder="Write a note…" rows={Math.min(8, Math.max(3, ((a.comment||"").match(/\n/g)||[]).length + 2))} style={ta}/>
                    )}
                    {reps.length > 0 && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px", paddingLeft:"10px", borderLeft:`2px solid ${T.border}` }}>
                        <div style={{ fontSize:"10.5px", letterSpacing:".07em", textTransform:"uppercase", color:T.faint, fontWeight:600 }}>Replies ({reps.length})</div>
                        {reps.map(r => (
                          <div key={r.id}>
                            <div style={{ fontSize:"11.5px", color:T.dim, marginBottom:"3px" }}><b style={{ color:T.text }}>{r.author || "Reply"}</b>{r.date ? " · " + formatNoteDate(r.date) : ""}</div>
                            <textarea value={r.comment || ""} onChange={e => setText(r.id, e.target.value)} onKeyDown={keys} rows={2} style={{ ...ta, fontSize:"12.5px" }}/>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ flexShrink:0, display:"flex", alignItems:"center", gap:"8px", padding:"9px 12px", borderTop:`1px solid ${T.border}` }}>
                    <button onClick={() => removeAnnotation(a.id)} title="Delete this comment" style={{ display:"flex", alignItems:"center", gap:"5px", padding:"6px 10px", borderRadius:"8px", border:`1px solid rgba(176,30,46,.3)`, background:"rgba(176,30,46,.06)", color:T.bad, cursor:"pointer", fontSize:"12px", fontFamily:T.ui }}><Icon name="trash" size={13}/>Delete</button>
                    <span style={{ fontSize:"10.5px", color:T.faintest, marginLeft:"auto" }}>Ctrl+Enter</span>
                    <button onClick={closeCommentPopup} style={{ padding:"6px 16px", borderRadius:"8px", border:"none", background:T.accent, color:"#fff", cursor:"pointer", fontSize:"12px", fontWeight:600, fontFamily:T.ui }}>Done</button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
export default function PDFTools() {
  const [activeTool, setActiveTool]     = useState("editor");
  const [files, setFiles]               = useState([]);
  const [options, setOptions]           = useState({ pages:"", rotation:"90", splitMode:"pages", translateFrom:"en", translateTo:"tr", translateEngine:"claude", imgFit:"fit", imgOrient:"portrait", imgFormat:"png", imgQuality:"2", convertServer:"http://localhost:3000" });
  const [outputName, setOutputName]     = useState("output");
  const [loading, setLoading]           = useState(false);
  const [dropZoneDrag, setDropZoneDrag] = useState(false);
  const [dragOverIdx, setDragOverIdx]   = useState(null);
  const dragSrcIdx                      = useRef(null);
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState("");
  const [pdfLib, setPdfLib]             = useState(null);
  const fileInputRef                    = useRef();
  const abortRef                        = useRef(null); // cancels in-flight translate fetch
  const [translateKey, setTranslateKey] = useState(0);  // increment to fully remount translate panel
  const activeRunRef                    = useRef(0);    // identifies the latest tool run
  const runningRef                      = useRef(false);
  const pdfJsRef                        = useRef(null); // pdf.js instance — ref-scoped, never stale across remounts
  const [apiKey, setApiKey]             = useState(() => { try { return localStorage.getItem("anthropic_api_key") || ""; } catch (_) { return ""; } });
  const [showKey, setShowKey]           = useState(false);
  // Saved Anthropic keys — a small address-book so long keys are picked, not retyped.
  const [savedKeys, setSavedKeys]       = useState(() => { try { return JSON.parse(localStorage.getItem("anthropic_api_keys") || "[]"); } catch (_) { return []; } });
  const persistKeys = (list) => { setSavedKeys(list); try { localStorage.setItem("anthropic_api_keys", JSON.stringify(list)); } catch (_) {} };
  const saveCurrentKey = () => {
    const key = apiKey.trim();
    if (!key) return;
    if (savedKeys.some(k => k.key === key)) return;   // already saved
    const label = (typeof window !== "undefined" && window.prompt)
      ? (window.prompt("Name this key (e.g. Work, Personal):", `Key …${key.slice(-4)}`) || `Key …${key.slice(-4)}`)
      : `Key …${key.slice(-4)}`;
    persistKeys([...savedKeys, { label: label.trim() || `Key …${key.slice(-4)}`, key }]);
  };
  const removeSavedKey = (key) => persistKeys(savedKeys.filter(k => k.key !== key));

  useEffect(() => {
    // Check synchronously first (already cached on window from a previous mount)
    if (window.PDFLib) { setPdfLib(window.PDFLib); return; }
    // Avoid duplicate script tags
    if (document.querySelector('script[src*="pdf-lib"]')) {
      const poll = setInterval(() => {
        if (window.PDFLib) { setPdfLib(window.PDFLib); clearInterval(poll); }
      }, 100);
      return () => clearInterval(poll);
    }
    const s = document.createElement("script");
    s.src = "./vendor/pdf-lib.min.js";
    s.onload = () => setPdfLib(window.PDFLib);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    return () => {
      activeRunRef.current += 1;
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      runningRef.current = false;
    };
  }, []);

  // Preload pdf.js when translate or extract tool is active — no cold-start on Run click
  useEffect(() => {
    if (activeTool !== "translate" && activeTool !== "extract") return;
    if (pdfJsRef.current) return; // already loaded for this component instance
    const WORKER = "./vendor/pdf.worker.min.js";
    const existing = document.querySelector('script[src*="pdf.min.js"]');
    if (existing && window.pdfjsLib) {
      // Script already on page — grab the library but re-assign worker in case it was lost
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
      pdfJsRef.current = window.pdfjsLib;
      return;
    }
    const s = document.createElement("script");
    s.src = "./vendor/pdf.min.js";
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER; pdfJsRef.current = window.pdfjsLib; };
    document.head.appendChild(s);
  }, [activeTool]);

  const addFiles  = useCallback((nf) => { setFiles(p=>[...p,...Array.from(nf)]); setResult(null); setError(""); }, []);
  const removeFile = useCallback((idx) => setFiles(p=>p.filter((_,i)=>i!==idx)), []);

  const handleDropZone = useCallback((e) => {
    e.preventDefault(); setDropZoneDrag(false);
    const all = Array.from(e.dataTransfer.files);
    const d = activeTool==="img2pdf"
      ? all.filter(f => f.type.startsWith("image/") || /\.(jpe?g|png|gif|webp|bmp)$/i.test(f.name))
      : activeTool==="word2pdf"
      ? all.filter(f => /\.(docx?|odt|rtf)$/i.test(f.name))
      : all.filter(f => f.type==="application/pdf");
    if (d.length) addFiles(d);
  }, [addFiles, activeTool]);

  const handleDragStart = (idx) => { dragSrcIdx.current = idx; };
  const handleDragOver  = (idx) => setDragOverIdx(idx);
  const handleDrop      = (idx) => {
    const src = dragSrcIdx.current;
    if (src===null||src===idx) { setDragOverIdx(null); return; }
    setFiles(prev => { const n=[...prev]; const [m]=n.splice(src,1); n.splice(idx,0,m); return n; });
    dragSrcIdx.current=null; setDragOverIdx(null);
  };

  const readBytes = (file) => new Promise((res,rej) => {
    const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsArrayBuffer(file);
  });
  const finalName = () => `${(outputName.trim().replace(/\.pdf$/i,"")||"output")}.pdf`;
  const triggerDownload = (bytes, filename) => {
    const url = URL.createObjectURL(new Blob([bytes],{type:"application/pdf"}));
    setResult({url,filename});
  };

  const runMerge = async () => {
    const {PDFDocument}=pdfLib;
    const merged=await PDFDocument.create();
    for (const f of files) {
      const doc=await PDFDocument.load(await readBytes(f));
      (await merged.copyPages(doc,doc.getPageIndices())).forEach(p=>merged.addPage(p));
    }
    triggerDownload(await merged.save(), finalName());
  };

  const runSplit = async () => {
    const {PDFDocument}=pdfLib;
    const bytes = await readBytes(files[0]);
    const src=await PDFDocument.load(bytes);
    const total=src.getPageCount();
    const baseName = outputName.trim().replace(/\.pdf$/i,"") || "split";

    if (options.splitMode==="halves") {
      // Split into two equal halves
      const mid=Math.ceil(total/2);
      const urls=[];
      for (let half=0;half<2;half++) {
        const nd=await PDFDocument.create();
        const rng=half===0
          ? Array.from({length:mid},(_,i)=>i)
          : Array.from({length:total-mid},(_,i)=>mid+i);
        const copied = await nd.copyPages(src, rng);
        copied.forEach(p=>nd.addPage(p));
        const blob = new Blob([await nd.save()],{type:"application/pdf"});
        urls.push({url:URL.createObjectURL(blob), filename:`${baseName}_part${half+1}.pdf`});
      }
      setResult({multiple:urls});

    } else if (options.splitMode==="pages") {
      // Split every page into its own file
      const urls=[];
      for (let pi=0;pi<total;pi++) {
        const nd=await PDFDocument.create();
        const [copied]=await nd.copyPages(src,[pi]);
        nd.addPage(copied);
        const blob=new Blob([await nd.save()],{type:"application/pdf"});
        urls.push({url:URL.createObjectURL(blob), filename:`${baseName}_page${pi+1}.pdf`});
      }
      setResult({multiple:urls});

    } else {
      // "ranges" mode: each comma-separated group becomes its own file
      const rawRanges = (options.pages||"").split(",").map(s=>s.trim()).filter(Boolean);
      if (!rawRanges.length) { setError("Enter page ranges, e.g. 1-3, 4-6"); return; }
      const urls=[];
      for (let ri=0;ri<rawRanges.length;ri++) {
        const rng = parsePageRanges(rawRanges[ri], total);
        if (!rng.length) continue;
        const nd=await PDFDocument.create();
        const copied=await nd.copyPages(src,rng);
        copied.forEach(p=>nd.addPage(p));
        const blob=new Blob([await nd.save()],{type:"application/pdf"});
        urls.push({url:URL.createObjectURL(blob), filename:`${baseName}_part${ri+1}.pdf`});
      }
      if (!urls.length) { setError("No valid pages found in the ranges entered."); return; }
      if (urls.length===1) {
        setResult({url:urls[0].url, filename:urls[0].filename});
      } else {
        setResult({multiple:urls});
      }
    }
  };

  const runRotate = async () => {
    const {PDFDocument,degrees}=pdfLib;
    const doc=await PDFDocument.load(await readBytes(files[0]));
    const ang=parseInt(options.rotation);
    parsePageRanges(options.pages,doc.getPageCount()).forEach(i=>{
      const p=doc.getPage(i); p.setRotation(degrees((p.getRotation().angle+ang)%360));
    });
    triggerDownload(await doc.save(), finalName());
  };

  // ── Images → PDF ──
  // Converts/merges JPG, PNG, JPEG (and other raster formats) into one PDF.
  // Each image becomes its own page. Honors the file ordering from the chip list.
  const runImg2Pdf = async () => {
    const {PDFDocument}=pdfLib;
    const pdfDoc=await PDFDocument.create();

    const fitMode  = options.imgFit  || "fit";      // "fit" = page sized to image, "a4" = fit onto A4
    const pageOrient = options.imgOrient || "portrait";
    // A4 in points
    const A4 = pageOrient==="landscape" ? { w:841.89, h:595.28 } : { w:595.28, h:841.89 };

    for (const f of files) {
      const buf = await readBytes(f);
      const bytes = new Uint8Array(buf);

      // Detect type — embed PNG natively, convert everything else to PNG via canvas
      let embedded;
      const isPng  = f.type === "image/png"  || /\.png$/i.test(f.name);
      const isJpg  = f.type === "image/jpeg" || /\.jpe?g$/i.test(f.name);

      if (isJpg && jpegOrientation(bytes) > 1 && typeof createImageBitmap === "function") {
        // Rotated photo: let the browser apply the EXIF orientation, then re-encode.
        const bmp = await createImageBitmap(new Blob([bytes], { type: "image/jpeg" }), { imageOrientation: "from-image" });
        const cvs = document.createElement("canvas");
        cvs.width = bmp.width; cvs.height = bmp.height;
        cvs.getContext("2d").drawImage(bmp, 0, 0);
        const blob = await new Promise(res => cvs.toBlob(res, "image/jpeg", 0.95));
        embedded = await pdfDoc.embedJpg(new Uint8Array(await blob.arrayBuffer()));
      } else if (isJpg) {
        embedded = await pdfDoc.embedJpg(bytes);
      } else if (isPng) {
        embedded = await pdfDoc.embedPng(bytes);
      } else {
        // GIF / WEBP / others → convert to PNG on an offscreen canvas
        const dataUrl = await new Promise((res,rej)=>{
          const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f);
        });
        const imgEl = await new Promise((res,rej)=>{
          const im=new Image(); im.onload=()=>res(im); im.onerror=rej; im.src=dataUrl;
        });
        const cvs=document.createElement("canvas");
        cvs.width=imgEl.naturalWidth||800; cvs.height=imgEl.naturalHeight||600;
        cvs.getContext("2d").drawImage(imgEl,0,0);
        const pngUrl=cvs.toDataURL("image/png");
        const raw=atob(pngUrl.split(",")[1]);
        const arr=new Uint8Array(raw.length);
        for (let i=0;i<raw.length;i++) arr[i]=raw.charCodeAt(i);
        embedded = await pdfDoc.embedPng(arr);
      }

      const iw = embedded.width, ih = embedded.height;

      if (fitMode==="a4") {
        // Place the image centered & scaled to fit inside the A4 page (keeps aspect ratio)
        const page = pdfDoc.addPage([A4.w, A4.h]);
        const margin = 28;
        const maxW = A4.w - margin*2, maxH = A4.h - margin*2;
        const scale = Math.min(maxW/iw, maxH/ih);
        const dw = iw*scale, dh = ih*scale;
        page.drawImage(embedded, { x:(A4.w-dw)/2, y:(A4.h-dh)/2, width:dw, height:dh });
      } else {
        // "fit" — page exactly matches the image dimensions
        const page = pdfDoc.addPage([iw, ih]);
        page.drawImage(embedded, { x:0, y:0, width:iw, height:ih });
      }
    }

    triggerDownload(await pdfDoc.save(), finalName());
  };

  // ── PDF → Images ──
  // Renders each PDF page to a canvas via pdf.js, then exports as JPG or PNG.
  // Produces one downloadable image per page.
  const runPdf2Img = async () => {
    // Ensure pdf.js is available
    let pdfjs = pdfJsRef.current || window.pdfjsLib;
    if (!pdfjs) {
      await new Promise((res,rej)=>{
        const s=document.createElement("script");
        s.src="./vendor/pdf.min.js";
        s.onload=()=>{ window.pdfjsLib.GlobalWorkerOptions.workerSrc="./vendor/pdf.worker.min.js"; res(); };
        s.onerror=rej; document.head.appendChild(s);
      });
      pdfjs = window.pdfjsLib;
      pdfJsRef.current = pdfjs;
    }

    const fmt   = options.imgFormat || "png";          // "png" | "jpeg"
    const ext   = fmt==="jpeg" ? "jpg" : "png";
    const mime  = fmt==="jpeg" ? "image/jpeg" : "image/png";
    const dpiScale = parseFloat(options.imgQuality || "2"); // render scale (higher = sharper)
    const baseName = outputName.trim().replace(/\.pdf$/i,"") || "page";

    const buf = await readBytes(files[0]);
    const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
    const total = doc.numPages;

    // Optional page range — blank means all pages
    const pageList = parsePageRanges(options.pages, total).map(i=>i+1);
    const pages = pageList.length ? pageList : Array.from({length:total},(_,i)=>i+1);

    const urls=[];
    for (const pageNum of pages) {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: dpiScale });
      const cvs = document.createElement("canvas");
      cvs.width = Math.round(viewport.width); cvs.height = Math.round(viewport.height);
      const ctx = cvs.getContext("2d");
      // White background for JPEG (no transparency support)
      if (fmt==="jpeg") { ctx.fillStyle="#ffffff"; ctx.fillRect(0,0,cvs.width,cvs.height); }
      await page.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise(res => cvs.toBlob(res, mime, fmt==="jpeg"?0.92:undefined));
      urls.push({ url: URL.createObjectURL(blob), filename: `${baseName}_${pageNum}.${ext}` });
    }

    if (urls.length===1) {
      setResult({ url:urls[0].url, filename:urls[0].filename, isImage:true });
    } else {
      setResult({ multiple:urls, isImage:true });
    }
  };

  // ── Word ⇄ PDF via a LibreOffice conversion server ──
  // LibreOffice can't run in the browser, so the file is POSTed to a small
  // backend that shells out to `soffice --headless --convert-to`.
  const runLibreConvert = async (target, ext) => {
    const server = (options.convertServer || "http://localhost:3000").replace(/\/+$/, "");
    const fd = new FormData();
    fd.append("file", files[0]);
    fd.append("target", target);
    let res;
    try {
      res = await fetch(`${server}/convert`, { method: "POST", body: fd });
    } catch (e) {
      throw new Error(`Could not reach the conversion server at ${server}. Make sure the LibreOffice server (convert-server.js) is running and the URL is correct.`);
    }
    if (!res.ok) {
      let msg = `Conversion server returned ${res.status}`;
      try { const t = await res.text(); if (t) msg += ` — ${t.slice(0,160)}`; } catch (_) {}
      throw new Error(msg);
    }
    const blob = await res.blob();
    const base = (outputName.trim() || files[0].name.replace(/\.[^.]+$/, "")) || "converted";
    setResult({ url: URL.createObjectURL(blob), filename: `${base}.${ext}` });
  };

  const runWord2Pdf = () => runLibreConvert("pdf", "pdf");
  const runPdf2Word = () => runLibreConvert("docx", "docx");


  const LANGUAGES = [
    { code:"en", label:"English"    },
    { code:"tr", label:"Turkish"    },
    { code:"fr", label:"French"     },
    { code:"de", label:"German"     },
    { code:"es", label:"Spanish"    },
    { code:"it", label:"Italian"    },
    { code:"pt", label:"Portuguese" },
    { code:"ru", label:"Russian"    },
    { code:"ar", label:"Arabic"     },
    { code:"zh", label:"Chinese"    },
    { code:"ja", label:"Japanese"   },
    { code:"ko", label:"Korean"     },
  ];

  // Build the downloadable HTML result once the translation text is ready.
  // Shared by both the Claude and Google Translate engines.
  const buildTranslationResult = (translated, fromLang, toLang, extracted, runId) => {
    const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${fromLang} to ${toLang} Translation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Noto Sans',sans-serif;font-size:11.5pt;line-height:1.75;color:#1a1a1a;background:#fff;padding:36pt 48pt;max-width:740px;margin:auto}
    header{border-bottom:2px solid #1a3a6e;padding-bottom:10pt;margin-bottom:24pt}
    h1{font-size:14pt;color:#1a3a6e;margin-bottom:4pt}
    .meta{font-size:9pt;color:#666}
    p{margin-bottom:10pt;text-align:justify}
    @media print{body{padding:0}header{page-break-after:avoid}}
  </style>
</head>
<body>
  <header>
    <h1>${fromLang} &rarr; ${toLang} Translation</h1>
    <div class="meta">Source: ${esc(files[0].name)} &nbsp;&middot;&nbsp; ${new Date().toLocaleDateString()}</div>
  </header>
  ${translated.split(/\n\n+/).map(p => p.trim() ? `<p>${esc(p.trim().replace(/\n/g,' '))}</p>` : '').join('\n  ')}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const fname = `${files[0].name.replace(/\.pdf$/i,"")}_${toLang.toLowerCase()}.html`;
    if (activeRunRef.current !== runId) return;
    setResult({ url, filename: fname, translated, from: fromLang, to: toLang, charCount: extracted.length, isHtml: true });
  };

  // Free, keyless translation via Google's public endpoint. No API key needed.
  // The text is split into chunks (the endpoint is GET-only with a URL limit)
  // and translated sequentially, streaming the result in as each chunk lands.
  const runGoogleTranslate = async (extracted, fromLang, toLang, runId) => {
    const sl = options.translateFrom || "en";
    const tl = options.translateTo || "tr";

    // Group paragraphs into ~1200-char chunks to stay under the URL length limit.
    const paras = extracted.split(/\n\n+/);
    const chunks = [];
    let cur = "";
    for (const p of paras) {
      if (cur && (cur.length + p.length + 2) > 1200) { chunks.push(cur); cur = p; }
      else cur = cur ? cur + "\n\n" + p : p;
    }
    if (cur) chunks.push(cur);

    let translated = "";
    for (const chunk of chunks) {
      if (activeRunRef.current !== runId) return;
      const url = "https://translate.googleapis.com/translate_a/single?client=gtx"
        + `&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(chunk)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Google Translate returned ${res.status}. Try again, or use fewer pages.`);
      const data = await res.json();
      const piece = (data?.[0] || []).map(seg => seg?.[0] || "").join("");
      translated += (translated ? "\n\n" : "") + piece.trim();
      if (activeRunRef.current === runId) setResult(prev => ({ ...prev, preview: translated }));
    }

    if (!translated.trim()) {
      setError("Translation returned empty result. Please try again.");
      setResult(null);
      return;
    }
    buildTranslationResult(translated, fromLang, toLang, extracted, runId);
  };

  const runTranslate = async (runId) => {
    // Step 1: load pdf.js if not already loaded for this component instance
    const getPdfJs = () => new Promise((resolve, reject) => {
      const WORKER = "./vendor/pdf.worker.min.js";
      if (pdfJsRef.current) {
        // Already loaded and stored in ref — always fresh for this mount
        pdfJsRef.current.GlobalWorkerOptions.workerSrc = WORKER;
        resolve(pdfJsRef.current);
        return;
      }
      // Not yet in ref — load fresh (handles cold start or remount)
      const existing = document.querySelector('script[src*="pdf.min.js"]');
      if (existing && window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
        pdfJsRef.current = window.pdfjsLib;
        resolve(pdfJsRef.current);
        return;
      }
      const s = document.createElement("script");
      s.src = "./vendor/pdf.min.js";
      s.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
        pdfJsRef.current = window.pdfjsLib;
        resolve(pdfJsRef.current);
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });

    const pdfjs = await getPdfJs();
    if (activeRunRef.current !== runId) return;
    const bytes = await readBytes(files[0]);
    if (activeRunRef.current !== runId) return;

    // Step 2: extract text — sorted by position, footnotes/URLs filtered out
    let extracted = "";
    try {
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(bytes) });
      const pdfDoc = await loadingTask.promise;
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1 });
        const pageH = viewport.height;

        // Sort top-to-bottom, left-to-right; filter URLs, lone numbers, footnote zone
        const items = textContent.items
          .filter(item => {
            const text = item.str.trim();
            if (!text) return false;
            if (/^https?:\/\//i.test(text)) return false;
            if (/^\d{1,3}$/.test(text)) return false;
            const y = item.transform[5];
            if (y < pageH * 0.10) return false;
            return true;
          })
          .sort((a, b) => {
            const yDiff = b.transform[5] - a.transform[5];
            if (Math.abs(yDiff) > 5) return yDiff;
            return a.transform[4] - b.transform[4];
          });

        // Group into lines by y-position, then join
        const lines = [];
        let currentLine = [];
        let lastY = null;
        for (const item of items) {
          const y = Math.round(item.transform[5]);
          if (lastY !== null && Math.abs(y - lastY) > 8) {
            if (currentLine.length) lines.push(currentLine.join(" ").trim());
            currentLine = [];
          }
          if (item.str.trim()) currentLine.push(item.str.trim());
          lastY = y;
        }
        if (currentLine.length) lines.push(currentLine.join(" ").trim());

        const pageText = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
        if (pageText) extracted += pageText + "\n\n";
      }
    } catch(e) {
      if (activeRunRef.current !== runId) return;
      setError("Could not read PDF: " + e.message);
      return;
    }

    extracted = extracted.trim();
    if (activeRunRef.current !== runId) return;
    if (!extracted || extracted.length < 5) {
      setError("No text found in this PDF. It may be a scanned image-only PDF which cannot be translated.");
      return;
    }

    const fromLang = LANGUAGES.find(l => l.code === options.translateFrom)?.label || "English";
    const toLang   = LANGUAGES.find(l => l.code === options.translateTo)?.label   || "Turkish";

    setResult({ translating: true, from: fromLang, to: toLang, preview: "", engine: options.translateEngine });

    // Free engine — no API key, translate via Google's public endpoint.
    if (options.translateEngine === "google") {
      try {
        await runGoogleTranslate(extracted, fromLang, toLang, runId);
      } catch (e) {
        if (activeRunRef.current !== runId) return;
        setError("Google Translate error: " + e.message);
        setResult(null);
      }
      return;
    }

    try {
      // Step 3: translate the WHOLE document — split at paragraph boundaries
      // into chunks (previously everything after 12,000 characters was silently
      // dropped). Each chunk streams in live, appended to the preview.
      const CHUNK = 24000;
      const chunks = [];
      let cur = "";
      for (const p of extracted.split(/\n\n+/)) {
        if (cur && cur.length + p.length + 2 > CHUNK) { chunks.push(cur); cur = p; }
        else cur = cur ? cur + "\n\n" + p : p;
      }
      if (cur) chunks.push(cur);

      // Build headers — include key + version when running outside Claude's artifact platform
      const fetchHeaders = { "Content-Type": "application/json" };
      if (apiKey.trim()) {
        fetchHeaders["x-api-key"] = apiKey.trim();
        fetchHeaders["anthropic-version"] = "2023-06-01";
        // Required for direct calls to the Anthropic API from a browser/Electron
        // origin — without it the request is rejected by CORS before it is sent.
        fetchHeaders["anthropic-dangerous-direct-browser-access"] = "true";
      }

      let translated = "";
      for (let ci = 0; ci < chunks.length; ci++) {
        if (activeRunRef.current !== runId) return;
        const controller = new AbortController();
        abortRef.current = controller;
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          signal: controller.signal,
          headers: fetchHeaders,
          body: JSON.stringify({
            model: "claude-haiku-5-5",
            max_tokens: 64000,
            stream: true,
            output_config: { effort: "low" },   // plain translation needs little reasoning
            system: `You are a professional translator. Translate the text from ${fromLang} to ${toLang}. Preserve paragraph structure and line breaks. Output ONLY the translated text — no explanations, no preamble, no notes.`,
            messages: [{ role: "user", content: chunks[ci] }],
          }),
        });

        if (activeRunRef.current !== runId) { controller.abort(); return; }

        if (!response.ok) {
          let msg = response.statusText || `HTTP ${response.status}`;
          try { const err = await response.json(); msg = err.error?.message || msg; } catch (_) {}
          setError("Translation failed: " + msg);
          setResult(null);
          return;
        }

        // Read the SSE stream and accumulate text live
        const prefix = translated ? translated + "\n\n" : "";
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let part = "", buffer = "", stopReason = null, streamDone = false;
        const handle = (evt) => {
          // Anthropic terminates with message_stop (NOT "[DONE]" which is OpenAI's format)
          if (evt.type === "message_stop") { streamDone = true; return; }
          if (evt.type === "message_delta" && evt.delta?.stop_reason) { stopReason = evt.delta.stop_reason; return; }
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
            part += evt.delta.text;
            if (activeRunRef.current === runId) setResult(prev => ({ ...prev, preview: prefix + part }));
          }
          if (evt.type === "error") throw new Error(evt.error?.message || "Unknown error");
        };
        while (!streamDone) {
          if (activeRunRef.current !== runId) { reader.cancel(); return; }
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data) continue;
            let evt; try { evt = JSON.parse(data); } catch (_) { continue; }   // skip malformed lines
            handle(evt);
            if (streamDone) break;
          }
        }
        reader.cancel();
        // Flush any remaining data left in buffer after stream ends
        if (buffer.trim().startsWith("data: ")) { try { handle(JSON.parse(buffer.trim().slice(6))); } catch (_) {} }

        if (stopReason === "refusal") {
          setError(`The model declined to translate part ${ci + 1} of ${chunks.length}.`);
          setResult(null);
          return;
        }
        translated = prefix + part.trim();
      }

      if (!translated.trim()) {
        setError("Translation returned empty result. Please try again.");
        setResult(null);
        return;
      }

      if (activeRunRef.current !== runId) return;

      // Step 4: generate a UTF-8 HTML file — full Unicode, no font embedding issues
      buildTranslationResult(translated, fromLang, toLang, extracted, runId);

    } catch(e) {
      if (e.name === "AbortError") return; // silently drop — a new run has started
      if (activeRunRef.current !== runId) return;
      setError("Translation error: " + e.message);
      setResult(null);
    } finally {
      if (activeRunRef.current === runId) abortRef.current = null;
    }
  };

  const runExtract = async () => {
    const pdfjs = await new Promise((resolve, reject) => {
      const WORKER = "./vendor/pdf.worker.min.js";
      if (pdfJsRef.current) {
        pdfJsRef.current.GlobalWorkerOptions.workerSrc = WORKER;
        resolve(pdfJsRef.current);
        return;
      }
      const existing = document.querySelector('script[src*="pdf.min.js"]');
      if (existing && window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
        pdfJsRef.current = window.pdfjsLib;
        resolve(pdfJsRef.current);
        return;
      }
      const s = document.createElement("script");
      s.src = "./vendor/pdf.min.js";
      s.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
        pdfJsRef.current = window.pdfjsLib;
        resolve(pdfJsRef.current);
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    const bytes = await readBytes(files[0]);
    let extracted = "";
    try {
      const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const tc = await page.getTextContent();
        // Same approach as pdf.js' own find bar: concatenate runs, newline at each end-of-line marker.
        extracted += tc.items.map(it => (it.str || "") + (it.hasEOL ? "\n" : "")).join("").replace(/[ \t]+\n/g, "\n").trim() + "\n\n";
      }
    } catch(e) { setError("Extract error: " + e.message); return; }
    extracted = extracted.trim();
    if (!extracted) { setError("No text found — PDF may be image-based."); return; }
    setResult({ text: extracted });
  };

  const runTool = async () => {
    if (runningRef.current) return;
    // Cancel any in-flight request from a previous run
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    if (!pdfLib && !["translate","extract","word2pdf","pdf2word"].includes(activeTool)) { setError("PDF engine loading…"); return; }
    if (files.length === 0) {
      setError(activeTool==="img2pdf" ? "Please upload at least one image."
        : activeTool==="word2pdf" ? "Please upload a Word document (DOCX, DOC, ODT or RTF)."
        : "Please upload at least one PDF file.");
      return;
    }
    if (activeTool === "merge" && files.length < 2) { setError("Need at least 2 PDFs to merge."); return; }
    runningRef.current = true;
    const runId = activeRunRef.current + 1;
    activeRunRef.current = runId;
    setLoading(true); setResult(null); setError(""); setOutputName(prev => prev || "output");
    try {
      if      (activeTool === "merge")     await runMerge();
      else if (activeTool === "split")     await runSplit();
      else if (activeTool === "rotate")    await runRotate();
      else if (activeTool === "img2pdf")   await runImg2Pdf();
      else if (activeTool === "pdf2img")   await runPdf2Img();
      else if (activeTool === "word2pdf")  await runWord2Pdf();
      else if (activeTool === "pdf2word")  await runPdf2Word();
      else if (activeTool === "translate") await runTranslate(runId);
      else if (activeTool === "extract")   await runExtract();
    } catch(e) { setError(friendlyPdfError(e)); }
    finally {
      if (activeRunRef.current === runId) setLoading(false);
      runningRef.current = false;
    }
  };

  const activeTData = SIDEBAR_TOOLS.find(t => t.id === activeTool);
  const showOutputName = activeTool !== "extract" && activeTool !== "editor" && activeTool !== "translate";

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.ui, color:T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,450;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes slideIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:6px}::-webkit-scrollbar-track{background:transparent}
        select,input{transition:border-color .2s}
        select:focus,input:focus{border-color:${T.accent}!important;outline:none}
        option{background:${T.surface};color:${T.text}}
      `}</style>

      {/* Header */}
      <div style={{ borderBottom:`1px solid ${T.border}`, padding:"16px 32px", display:"flex", alignItems:"center", gap:"14px", background:T.surface }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"30px", height:"30px", borderRadius:"7px", background:T.ink, color:"#FFFFFF" }}>
          <Icon name="file" size={17}/>
        </div>
        <div style={{ display:"flex", flexDirection:"column", lineHeight:1.15 }}>
          <div style={{ fontSize:"14.5px", color:T.text, fontWeight:600, letterSpacing:".01em" }}>Document Studio</div>
          <div style={{ fontSize:"10.5px", letterSpacing:".16em", color:T.faint, textTransform:"uppercase" }}>PDF Toolkit</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"7px", fontSize:"11.5px", color:pdfLib?T.good:T.dim, fontFamily:T.mono }}>
          {pdfLib
            ? <><span style={{ width:"7px", height:"7px", borderRadius:"50%", background:T.good }}/>Ready</>
            : <><span style={{ display:"flex", animation:"spin 1s linear infinite" }}><Icon name="spinner" size={13}/></span>Loading engine</>}
        </div>
      </div>

      <div style={{ display:"flex", height:"calc(100vh - 63px)" }}>
        {/* Sidebar */}
        <div style={{ width:"208px", borderRight:`1px solid ${T.border}`, padding:"14px 0", flexShrink:0, overflowY:"auto", background:T.surface }}>
          {SIDEBAR_TOOLS.map((t, i) => {
            const showCaption = i === 0 || SIDEBAR_TOOLS[i-1].section !== t.section;
            return (
            <div key={t.id}>
              {showCaption && (
                <div style={{ padding: i===0 ? "0 18px 9px" : "18px 18px 9px", fontSize:"10px", letterSpacing:".16em", color:T.faintest, textTransform:"uppercase", fontWeight:600 }}>{t.section}</div>
              )}
              <button onClick={() => {
                activeRunRef.current += 1;
                if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
                runningRef.current = false;
                setActiveTool(t.id);
                setResult(null);
                setError("");
                setFiles([]);
                setLoading(false);
                setOutputName("output");
                setOptions({ pages:"", rotation:"90", splitMode:"pages", translateFrom: options.translateFrom, translateTo: options.translateTo, translateEngine: options.translateEngine||"claude", imgFit:"fit", imgOrient:"portrait", imgFormat:"png", imgQuality:"2", convertServer: options.convertServer||"http://localhost:3000" });
              }} style={{
              display:"flex", alignItems:"center", gap:"11px", width:"100%", padding:"10px 18px",
              background: activeTool===t.id ? T.accentBg : "transparent",
              border:"none", borderLeft: activeTool===t.id ? `2px solid ${T.accent}` : "2px solid transparent",
              cursor:"pointer", textAlign:"left", transition:"all .15s",
            }}
              onMouseEnter={e=>{ if(activeTool!==t.id) e.currentTarget.style.background="rgba(0,0,0,.03)"; }}
              onMouseLeave={e=>{ if(activeTool!==t.id) e.currentTarget.style.background="transparent"; }}>
              <span style={{ color: activeTool===t.id ? T.accent : T.faint, display:"flex", transition:"color .15s" }}><Icon name={t.icon} size={17}/></span>
              <span style={{ fontSize:"13px", color: activeTool===t.id ? T.text : T.dim, fontWeight: activeTool===t.id ? 600 : 450, letterSpacing:".01em" }}>{t.label}</span>
              </button>
            </div>
            );
          })}
        </div>

        {/* Main */}
        <div style={{ flex:1, overflow:"auto", padding:"24px 32px" }}>

          {activeTool === "editor" && (
            <div style={{ height:"100%" }}>
              <div style={{ marginBottom:"16px", display:"flex", alignItems:"center", gap:"11px" }}>
                <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"34px", height:"34px", borderRadius:"8px", background:T.accentBg, color:T.accent }}><Icon name="editor" size={19}/></span>
                <div>
                  <div style={{ fontSize:"18px", color:T.text, fontWeight:600, letterSpacing:".01em" }}>PDF Editor</div>
                  <div style={{ fontSize:"12.5px", color:T.faint }}>Add text, shapes, images & redactions visually</div>
                </div>
              </div>
              {pdfLib ? <PDFEditor pdfLib={pdfLib} /> : <div style={{ color:T.dim, padding:"40px", textAlign:"center" }}>Loading PDF engine…</div>}
            </div>
          )}

          {activeTool !== "editor" && (
            <div key={activeTool === "translate" ? `translate-${translateKey}` : activeTool} style={{ maxWidth:"580px" }}>
              <div style={{ marginBottom:"20px", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"11px" }}>
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"34px", height:"34px", borderRadius:"8px", background:T.accentBg, color:T.accent }}><Icon name={activeTData.icon} size={19}/></span>
                  <div>
                    <div style={{ fontSize:"18px", color:T.text, fontWeight:600, letterSpacing:".01em" }}>{activeTData.label}</div>
                    <div style={{ fontSize:"12.5px", color:T.faint, marginTop:"1px" }}>{activeTData.desc}</div>
                  </div>
                </div>
                {activeTool === "translate" && (
                  <button
                    title="Reset translate tool"
                    onClick={() => {
                      // Abort any in-flight stream
                      if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
                      activeRunRef.current += 1;
                      runningRef.current = false;
                      // Clear the ref so pdf.js reloads completely fresh on next run
                      pdfJsRef.current = null;
                      // Incrementing translateKey unmounts + remounts the entire panel
                      // — same effect as closing and reopening the tool
                      setTranslateKey(k => k + 1);
                    }}
                    style={{
                      display:"flex", alignItems:"center", gap:"6px",
                      padding:"7px 13px", borderRadius:"8px",
                      border:`1px solid rgba(216,31,63,.3)`,
                      background:T.accentBg,
                      color:T.accent, fontSize:"12px", fontWeight:500,
                      cursor:"pointer", fontFamily:T.ui,
                      transition:"all .15s", flexShrink:0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(216,31,63,.2)"}
                    onMouseLeave={e => e.currentTarget.style.background=T.accentBg}
                  >
                    <Icon name="rotate" size={14}/>Reset
                  </button>
                )}
              </div>

              {/* Language selector + API key — shown above drop zone for translate tool */}
              {activeTool==="translate"&&(
                <>
                <div key={translateKey} style={{ marginBottom:"14px", background:"rgba(216,31,63,.05)", border:"1px solid rgba(216,31,63,.2)", borderRadius:"11px", padding:"12px 16px" }}>
                  <div style={{ fontSize:"10px", letterSpacing:".12em", color:"#8C8C88", textTransform:"uppercase", marginBottom:"10px" }}>Translation Direction</div>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    {/* FROM */}
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"10px", color:"#8C8C88", marginBottom:"5px", letterSpacing:".08em" }}>From</div>
                      <select value={options.translateFrom||"en"} onChange={e=>setOptions(o=>({...o,translateFrom:e.target.value}))}
                        style={{ width:"100%", padding:"8px 10px", borderRadius:"8px", background:"rgba(0,0,0,.05)", border:"1px solid rgba(216,31,63,.3)", color:"#D81F3F", fontSize:"13px", fontFamily:"inherit", fontWeight:600, cursor:"pointer", outline:"none" }}>
                        {LANGUAGES.map(l=>(
                          <option key={l.code} value={l.code} disabled={l.code===options.translateTo}>{l.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Swap button */}
                    <button
                      title="Swap languages"
                      onClick={()=>setOptions(o=>({...o,translateFrom:o.translateTo,translateTo:o.translateFrom}))}
                      style={{ marginTop:"17px", padding:"7px 10px", borderRadius:"8px", border:"1px solid rgba(216,31,63,.3)", background:"rgba(216,31,63,.08)", color:"#D81F3F", cursor:"pointer", fontSize:"16px", lineHeight:1, flexShrink:0 }}
                    >⇄</button>

                    {/* TO */}
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"10px", color:"#8C8C88", marginBottom:"5px", letterSpacing:".08em" }}>To</div>
                      <select value={options.translateTo||"tr"} onChange={e=>setOptions(o=>({...o,translateTo:e.target.value}))}
                        style={{ width:"100%", padding:"8px 10px", borderRadius:"8px", background:"rgba(0,0,0,.05)", border:"1px solid rgba(216,31,63,.3)", color:"#D81F3F", fontSize:"13px", fontFamily:"inherit", fontWeight:600, cursor:"pointer", outline:"none" }}>
                        {LANGUAGES.map(l=>(
                          <option key={l.code} value={l.code} disabled={l.code===options.translateFrom}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Translation engine — Claude (needs key) or Google Translate (free) */}
                <div style={{ marginBottom:"14px", background:"rgba(0,0,0,.03)", border:"1px solid rgba(0,0,0,.07)", borderRadius:"11px", padding:"12px 16px" }}>
                  <div style={{ fontSize:"10px", letterSpacing:".12em", color:"#8C8C88", textTransform:"uppercase", marginBottom:"8px" }}>Translation Engine</div>
                  <div style={{ display:"flex", gap:"8px" }}>
                    {[
                      { id:"claude", label:"Claude AI", note:"Best quality · needs API key" },
                      { id:"google", label:"Google Translate", note:"Free · no key needed" },
                    ].map(m=>(
                      <button key={m.id} onClick={()=>setOptions(o=>({...o,translateEngine:m.id}))} style={{
                        flex:1, textAlign:"left", padding:"9px 12px", borderRadius:"9px", border:"1px solid",
                        borderColor: options.translateEngine===m.id ? "#D81F3F" : "rgba(0,0,0,.12)",
                        background: options.translateEngine===m.id ? "rgba(216,31,63,.1)" : "rgba(0,0,0,.02)",
                        cursor:"pointer", fontFamily:"inherit",
                      }}>
                        <div style={{ fontSize:"13px", fontWeight:600, color: options.translateEngine===m.id ? "#D81F3F" : "#5C5C5A" }}>{m.label}</div>
                        <div style={{ fontSize:"10px", color:"#8C8C88", marginTop:"2px" }}>{m.note}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* API Key — only for the Claude engine. Includes a saved-keys picker. */}
                {options.translateEngine==="claude" && (
                <div style={{ marginBottom:"14px", background:"rgba(0,0,0,.03)", border:"1px solid rgba(0,0,0,.07)", borderRadius:"11px", padding:"12px 16px" }}>
                  <div style={{ fontSize:"10px", letterSpacing:".12em", color:"#8C8C88", textTransform:"uppercase", marginBottom:"8px" }}>Anthropic API Key</div>

                  {/* Saved keys — pick instead of retyping */}
                  {savedKeys.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"8px" }}>
                      {savedKeys.map(k => {
                        const active = k.key === apiKey.trim();
                        return (
                          <span key={k.key} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"5px 8px 5px 10px", borderRadius:"7px",
                            border:`1px solid ${active ? "#D81F3F" : "rgba(0,0,0,.12)"}`, background: active ? "rgba(216,31,63,.1)" : "rgba(0,0,0,.03)" }}>
                            <button onClick={()=>{ setApiKey(k.key); try { localStorage.setItem("anthropic_api_key", k.key); } catch(_){} }}
                              title="Use this key" style={{ background:"none", border:"none", cursor:"pointer", fontSize:"12px", fontFamily:"inherit",
                              color: active ? "#D81F3F" : "#5C5C5A", fontWeight: active ? 600 : 400, padding:0 }}>
                              {active ? "✓ " : ""}{k.label} <span style={{ color:"#B6B5B0", fontFamily:T.mono }}>…{k.key.slice(-4)}</span>
                            </button>
                            <button onClick={()=>removeSavedKey(k.key)} title="Remove saved key" style={{ background:"none", border:"none", cursor:"pointer", color:"#B6B5B0", fontSize:"12px", padding:0, lineHeight:1 }}
                              onMouseEnter={e=>e.currentTarget.style.color="#B01E2E"} onMouseLeave={e=>e.currentTarget.style.color="#B6B5B0"}>✕</button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      placeholder="sk-ant-… (leave blank if not required)"
                      onChange={e => {
                        setApiKey(e.target.value);
                        try { if (e.target.value.trim()) localStorage.setItem("anthropic_api_key", e.target.value.trim()); else localStorage.removeItem("anthropic_api_key"); } catch (_) {}
                      }}
                      style={{ flex:1, padding:"8px 12px", borderRadius:"8px", background:"rgba(0,0,0,.04)", border:"1px solid rgba(0,0,0,.12)", color:"#1A1A1C", fontSize:"13px", fontFamily:T.mono, outline:"none" }}
                    />
                    <button onClick={()=>setShowKey(s=>!s)} title={showKey?"Hide key":"Show key"} style={{ padding:"7px 10px", borderRadius:"8px", border:"1px solid rgba(0,0,0,.12)", background:"rgba(0,0,0,.04)", color:"#8C8C88", cursor:"pointer", fontSize:"13px", flexShrink:0 }}>
                      {showKey ? "Hide" : "Show"}
                    </button>
                    {apiKey && <button onClick={()=>{ setApiKey(""); try { localStorage.removeItem("anthropic_api_key"); } catch (_) {} }} title="Clear key" style={{ padding:"7px 10px", borderRadius:"8px", border:"1px solid rgba(176,30,46,.2)", background:"rgba(176,30,46,.08)", color:"#B01E2E", cursor:"pointer", fontSize:"12px", flexShrink:0 }}>✕</button>}
                  </div>

                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"6px", gap:"8px" }}>
                    <div style={{ fontSize:"10px", color:"#B6B5B0" }}>
                      {apiKey ? "Key saved in this browser" : "No key needed here. Paste your key only when running this file elsewhere."}
                    </div>
                    {apiKey.trim() && !savedKeys.some(k=>k.key===apiKey.trim()) && (
                      <button onClick={saveCurrentKey} style={{ flexShrink:0, padding:"5px 12px", borderRadius:"7px", border:"1px solid rgba(216,31,63,.35)", background:"rgba(216,31,63,.08)", color:"#D81F3F", cursor:"pointer", fontSize:"11px", fontWeight:600, fontFamily:"inherit" }}>
                        + Save this key
                      </button>
                    )}
                  </div>
                </div>
                )}
                </>
              )}

              {/* Drop zone */}
              <div onDragOver={e=>{e.preventDefault();setDropZoneDrag(true);}} onDragLeave={()=>setDropZoneDrag(false)} onDrop={handleDropZone} onClick={()=>fileInputRef.current.click()}
                style={{ border:`1.5px dashed ${dropZoneDrag?T.accent:T.borderUp}`, borderRadius:"13px", padding:"26px", textAlign:"center", cursor:"pointer", background:dropZoneDrag?T.accentBg:"rgba(0,0,0,.02)", marginBottom:"14px", transition:"all .2s" }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:"9px", color:dropZoneDrag?T.accent:T.faint }}><Icon name={activeTool==="img2pdf"?"image":activeTool==="word2pdf"?"word":"plus"} size={26} stroke={1.5}/></div>
                <div style={{ color:T.dim, fontSize:"13.5px" }}>
                  {activeTool==="img2pdf"
                    ? <>Drop images (JPG, PNG, JPEG), or <span style={{ color:T.accent }}>browse files</span></>
                    : activeTool==="word2pdf"
                    ? <>Drop a Word file (DOCX, DOC, ODT), or <span style={{ color:T.accent }}>browse files</span></>
                    : <>Drop PDF{activeTool==="merge"?"s":""} here, or <span style={{ color:T.accent }}>browse files</span></>}
                </div>
                <input ref={fileInputRef} type="file"
                  accept={activeTool==="img2pdf" ? ".jpg,.jpeg,.png,.gif,.webp,.bmp,image/*" : activeTool==="word2pdf" ? ".doc,.docx,.odt,.rtf" : ".pdf"}
                  multiple={activeTool==="merge"||activeTool==="img2pdf"}
                  style={{ display:"none" }} onChange={e=>addFiles(e.target.files)}/>
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:"7px", marginBottom:"16px", animation:"fadeIn .3s" }} onDragEnd={()=>setDragOverIdx(null)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2px" }}>
                    <div style={{ fontSize:"10px", letterSpacing:".12em", color:"#B6B5B0", textTransform:"uppercase" }}>
                      {files.length} file{files.length>1?"s":""} {(activeTool==="merge"||activeTool==="img2pdf")&&files.length>1&&<span style={{color:"#8C8C88"}}>— drag to reorder</span>}
                    </div>
                    <button onClick={()=>setFiles([])} style={{ background:"none", border:"none", color:"#8C8C88", cursor:"pointer", fontSize:"12px" }}>Clear all</button>
                  </div>
                  {files.map((f,i) => (
                    <FileChip key={`${f.name}-${f.size}-${i}`} file={f} index={i} total={files.length}
                      onRemove={removeFile} onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop} isDragOver={dragOverIdx===i}/>
                  ))}
                </div>
              )}

              {/* Options */}
              <div style={{ background:"rgba(0,0,0,.03)", border:"1px solid rgba(0,0,0,.07)", borderRadius:"12px", padding:"16px 18px", marginBottom:"16px" }}>
                <div style={{ fontSize:"10px", letterSpacing:".12em", color:"#B6B5B0", textTransform:"uppercase", marginBottom:"12px" }}>Options</div>
                {activeTool==="split"&&(
                  <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                    <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                      {[
                        {id:"pages",  label:"Every page → separate file"},
                        {id:"halves", label:"Split in half"},
                        {id:"ranges", label:"Custom ranges"},
                      ].map(m=>(
                        <button key={m.id} onClick={()=>setOptions(o=>({...o,splitMode:m.id}))} style={{ padding:"6px 14px", borderRadius:"8px", border:"1px solid", borderColor:options.splitMode===m.id?"#D81F3F":"rgba(0,0,0,.10)", background:options.splitMode===m.id?"rgba(216,31,63,.1)":"transparent", color:options.splitMode===m.id?"#D81F3F":"#8C8C88", cursor:"pointer", fontSize:"12px", fontFamily:"inherit" }}>{m.label}</button>
                      ))}
                    </div>
                    {options.splitMode==="ranges"&&(
                      <div>
                        <input value={options.pages} onChange={e=>setOptions(o=>({...o,pages:e.target.value}))} placeholder="e.g. 1-3, 4-6, 7 — each group → separate file" style={inputStyle}/>
                        <div style={{fontSize:"11px",color:"#B6B5B0",marginTop:"6px"}}>Each comma-separated range becomes its own PDF file.</div>
                      </div>
                    )}
                    {options.splitMode==="pages"&&<div style={{fontSize:"11px",color:"#B6B5B0"}}>Each page will be saved as a separate PDF file.</div>}
                    {options.splitMode==="halves"&&<div style={{fontSize:"11px",color:"#B6B5B0"}}>Splits the PDF into two equal halves.</div>}
                  </div>
                )}
                {activeTool==="rotate"&&(
                  <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                    <div style={{ color:"#8C8C88", fontSize:"12px" }}>Rotation angle</div>
                    <div style={{ display:"flex", gap:"8px" }}>
                      {["90","180","270"].map(deg=>(
                        <button key={deg} onClick={()=>setOptions(o=>({...o,rotation:deg}))} style={{ padding:"6px 14px", borderRadius:"8px", border:"1px solid", borderColor:options.rotation===deg?"#D81F3F":"rgba(0,0,0,.10)", background:options.rotation===deg?"rgba(216,31,63,.1)":"transparent", color:options.rotation===deg?"#D81F3F":"#8C8C88", cursor:"pointer", fontSize:"12px" }}>{deg}°</button>
                      ))}
                    </div>
                    <input value={options.pages} onChange={e=>setOptions(o=>({...o,pages:e.target.value}))} placeholder="Pages e.g. 1,3 (blank = all)" style={inputStyle}/>
                  </div>
                )}
                {activeTool==="translate"&&(
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                    <div style={{ fontSize:"11px", color:"#B6B5B0", fontStyle:"italic", lineHeight:1.5 }}>
                      Long documents are split into chunks and translated sequentially.<br/>
                      Works best with text-based PDFs. Scanned (image-only) PDFs cannot be translated.
                    </div>
                  </div>
                )}
                {activeTool==="img2pdf"&&(
                  <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                    <div>
                      <div style={{ color:"#8C8C88", fontSize:"12px", marginBottom:"8px" }}>Page sizing</div>
                      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                        {[
                          {id:"fit", label:"Page matches image"},
                          {id:"a4",  label:"Fit onto A4 page"},
                        ].map(m=>(
                          <button key={m.id} onClick={()=>setOptions(o=>({...o,imgFit:m.id}))} style={{ padding:"6px 14px", borderRadius:"8px", border:"1px solid", borderColor:options.imgFit===m.id?"#D81F3F":"rgba(0,0,0,.10)", background:options.imgFit===m.id?"rgba(216,31,63,.1)":"transparent", color:options.imgFit===m.id?"#D81F3F":"#8C8C88", cursor:"pointer", fontSize:"12px", fontFamily:"inherit" }}>{m.label}</button>
                        ))}
                      </div>
                    </div>
                    {options.imgFit==="a4"&&(
                      <div>
                        <div style={{ color:"#8C8C88", fontSize:"12px", marginBottom:"8px" }}>Orientation</div>
                        <div style={{ display:"flex", gap:"8px" }}>
                          {[
                            {id:"portrait",  label:"Portrait"},
                            {id:"landscape", label:"Landscape"},
                          ].map(m=>(
                            <button key={m.id} onClick={()=>setOptions(o=>({...o,imgOrient:m.id}))} style={{ padding:"6px 14px", borderRadius:"8px", border:"1px solid", borderColor:options.imgOrient===m.id?"#D81F3F":"rgba(0,0,0,.10)", background:options.imgOrient===m.id?"rgba(216,31,63,.1)":"transparent", color:options.imgOrient===m.id?"#D81F3F":"#8C8C88", cursor:"pointer", fontSize:"12px", fontFamily:"inherit" }}>{m.label}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={{ fontSize:"11px", color:"#B6B5B0", fontStyle:"italic", lineHeight:1.5 }}>
                      Each image becomes one page, in the order shown above. Drag the chips to reorder.
                    </div>
                  </div>
                )}
                {activeTool==="pdf2img"&&(
                  <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                    <div>
                      <div style={{ color:"#8C8C88", fontSize:"12px", marginBottom:"8px" }}>Image format</div>
                      <div style={{ display:"flex", gap:"8px" }}>
                        {[
                          {id:"png",  label:"PNG (lossless)"},
                          {id:"jpeg", label:"JPG (smaller)"},
                        ].map(m=>(
                          <button key={m.id} onClick={()=>setOptions(o=>({...o,imgFormat:m.id}))} style={{ padding:"6px 14px", borderRadius:"8px", border:"1px solid", borderColor:options.imgFormat===m.id?"#D81F3F":"rgba(0,0,0,.10)", background:options.imgFormat===m.id?"rgba(216,31,63,.1)":"transparent", color:options.imgFormat===m.id?"#D81F3F":"#8C8C88", cursor:"pointer", fontSize:"12px", fontFamily:"inherit" }}>{m.label}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ color:"#8C8C88", fontSize:"12px", marginBottom:"8px" }}>Resolution</div>
                      <div style={{ display:"flex", gap:"8px" }}>
                        {[
                          {id:"1", label:"1× (screen)"},
                          {id:"2", label:"2× (sharp)"},
                          {id:"3", label:"3× (print)"},
                        ].map(m=>(
                          <button key={m.id} onClick={()=>setOptions(o=>({...o,imgQuality:m.id}))} style={{ padding:"6px 14px", borderRadius:"8px", border:"1px solid", borderColor:options.imgQuality===m.id?"#D81F3F":"rgba(0,0,0,.10)", background:options.imgQuality===m.id?"rgba(216,31,63,.1)":"transparent", color:options.imgQuality===m.id?"#D81F3F":"#8C8C88", cursor:"pointer", fontSize:"12px", fontFamily:"inherit" }}>{m.label}</button>
                        ))}
                      </div>
                    </div>
                    <input value={options.pages} onChange={e=>setOptions(o=>({...o,pages:e.target.value}))} placeholder="Pages e.g. 1-3, 5 (blank = all)" style={inputStyle}/>
                    <div style={{ fontSize:"11px", color:"#B6B5B0", fontStyle:"italic", lineHeight:1.5 }}>
                      Each selected page is exported as its own image file.
                    </div>
                  </div>
                )}
                {(activeTool==="word2pdf"||activeTool==="pdf2word")&&(
                  <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                    <div>
                      <div style={{ color:T.faint, fontSize:"12px", marginBottom:"7px" }}>LibreOffice conversion server</div>
                      <input value={options.convertServer} onChange={e=>setOptions(o=>({...o,convertServer:e.target.value}))}
                        placeholder="http://localhost:3000" style={{ ...inputStyle, fontFamily:T.mono, fontSize:"12px" }}/>
                    </div>
                    <div style={{ display:"flex", gap:"9px", alignItems:"flex-start", background:T.accentBg, border:`1px solid rgba(216,31,63,.2)`, borderRadius:"10px", padding:"11px 13px" }}>
                      <span style={{ color:T.accent, display:"flex", marginTop:"1px" }}><Icon name="alert" size={15}/></span>
                      <div style={{ fontSize:"11.5px", color:T.dim, lineHeight:1.55 }}>
                        {activeTool==="word2pdf"
                          ? "Converts DOCX/DOC/ODT/RTF to PDF with full layout fidelity."
                          : "Converts a PDF into an editable Word document."}
                        {" "}This runs through LibreOffice, which can't execute in the browser — start the included
                        {" "}<span style={{ fontFamily:T.mono, color:T.text }}>convert-server.js</span> first, then set its URL above.
                      </div>
                    </div>
                  </div>
                )}
                {["merge","extract"].includes(activeTool)&&<div style={{ color:"#B6B5B0", fontSize:"13px", fontStyle:"italic" }}>No additional options needed.</div>}
              </div>

              {showOutputName&&(
                <div style={{ marginBottom:"16px" }}>
                  <label style={{ display:"block", fontSize:"11px", letterSpacing:".1em", color:"#8C8C88", textTransform:"uppercase", marginBottom:"7px" }}>
                    {activeTool==="pdf2img" ? "Output filename prefix" : "Output filename"}
                  </label>
                  <div style={{ display:"flex", alignItems:"center" }}>
                    <input value={outputName} onChange={e=>setOutputName(e.target.value)} placeholder={activeTool==="pdf2img"?"e.g. page":"e.g. project-final"} style={{ ...inputStyle, borderRadius:"8px 0 0 8px", flex:1 }}/>
                    <span style={{ padding:"10px 14px", background:"rgba(0,0,0,.04)", border:"1px solid rgba(0,0,0,.12)", borderLeft:"none", borderRadius:"0 8px 8px 0", color:"#8C8C88", fontSize:"13px" }}>
                      {activeTool==="pdf2img" ? `_N.${options.imgFormat==="jpeg"?"jpg":"png"}` : activeTool==="pdf2word" ? ".docx" : ".pdf"}
                    </span>
                  </div>
                </div>
              )}

              {error&&<div style={{ display:"flex", alignItems:"center", gap:"9px", background:"rgba(176,30,46,.08)", border:"1px solid rgba(176,30,46,.2)", borderRadius:"10px", padding:"12px 16px", marginBottom:"14px", color:T.bad, fontSize:"13px" }}><Icon name="alert" size={16}/>{error}</div>}

              {/* Cancel button — only shown while translation is streaming */}
              {loading && activeTool==="translate" ? (
                <button onClick={()=>{
                  if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
                  activeRunRef.current += 1;
                  runningRef.current = false;
                  setLoading(false);
                  setResult(null);
                  setError("");
                }} style={{ width:"100%", padding:"13px", borderRadius:"10px", background:"rgba(176,30,46,.08)", border:"1px solid rgba(176,30,46,.35)", cursor:"pointer", color:T.bad, fontFamily:T.ui, fontSize:"14px", fontWeight:600, transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:"9px" }}>
                  <Icon name="close" size={16}/> Cancel translation
                </button>
              ) : (
                <button onClick={runTool} disabled={loading} style={{ width:"100%", padding:"13px", borderRadius:"10px", background:loading?T.accentBg:T.accent, border:"none", cursor:loading?"not-allowed":"pointer", color:loading?T.accent:"#FFFFFF", fontFamily:T.ui, fontSize:"14px", fontWeight:600, transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:"9px" }}>
                  {loading ? <><span style={{ display:"flex", animation:"spin 1s linear infinite" }}><Icon name="spinner" size={16}/></span>Processing</> : <>Run {activeTData.label}</>}
                </button>
              )}

              {result&&(
                <div style={{ marginTop:"16px", background:T.goodBg, border:"1px solid rgba(31,138,83,.2)", borderRadius:"12px", padding:"18px", animation:"fadeIn .4s" }}>
                  {result.translating && (
                    <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                        <span style={{ display:"flex", animation:"spin 1s linear infinite", color:T.accent }}><Icon name="spinner" size={19}/></span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:"13px", color:"#D81F3F" }}>Translating {result.from} → {result.to}…</div>
                          <div style={{ fontSize:"11px", color:"#8C8C88", marginTop:"3px" }}>Translation is streaming live below</div>
                        </div>
                      </div>
                      {result.preview && (
                        <div style={{ background:"rgba(0,0,0,.25)", border:"1px solid rgba(0,0,0,.07)", borderRadius:"8px", padding:"10px 12px", maxHeight:"160px", overflow:"auto" }}>
                          <div style={{ color:"#2E2E2E", fontSize:"12px", lineHeight:1.7, whiteSpace:"pre-wrap", wordBreak:"break-word", fontFamily:T.mono }}>
                            {result.preview}<span style={{ display:"inline-block", width:"2px", height:"13px", background:"#D81F3F", marginLeft:"2px", animation:"pulse 1s infinite", verticalAlign:"text-bottom" }}/>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {!result.translating && <>
                    <div style={{ color:"#1F8A53", fontSize:"11px", fontWeight:700, marginBottom:"12px", letterSpacing:".07em" }}>✓ DONE</div>
                    {result.url&&(
                      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                        {result.translated && (
                          <div style={{ fontSize:"11px", color:"#8C8C88", marginBottom:"4px" }}>
                            {result.from} → {result.to} · {result.charCount?.toLocaleString()} chars extracted
                          </div>
                        )}
                        {/* Image preview for single image exports */}
                        {result.isImage && (
                          <img src={result.url} alt="preview" style={{ maxWidth:"100%", maxHeight:"260px", objectFit:"contain", borderRadius:"8px", border:"1px solid rgba(31,138,83,.2)", background:"rgba(0,0,0,.035)" }}/>
                        )}
                        {/* Editable filename row */}
                        <div style={{ display:"flex", alignItems:"center", gap:"0" }}>
                          <input
                            value={result.filename}
                            onChange={e => setResult(r => ({ ...r, filename: e.target.value }))}
                            style={{ flex:1, padding:"8px 12px", borderRadius:"8px 0 0 8px", background:"rgba(0,0,0,.05)", border:"1px solid rgba(31,138,83,.25)", borderRight:"none", color:"#1A1A1C", fontSize:"13px", fontFamily:T.mono, outline:"none" }}
                          />
                          <a href={result.url} download={result.filename} style={{ display:"flex", alignItems:"center", gap:"8px", textDecoration:"none", background:"#1F8A53", borderRadius:"0 8px 8px 0", padding:"8px 16px", color:"#FFFFFF", fontWeight:700, fontSize:"13px", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                            Download
                          </a>
                        </div>
                        <div style={{ fontSize:"11px", color:"#2E7D5B" }}>
                          {result.isHtml ? "HTML file — open in browser · print as PDF for a .pdf copy"
                            : result.isImage ? "Click to save the image"
                            : result.translated ? "Click to save translated PDF"
                            : "Click to save your file"}
                        </div>
                        {result.translated && (
                          <details style={{ marginTop:"6px" }}>
                            <summary style={{ color:"#8C8C88", fontSize:"12px", cursor:"pointer", userSelect:"none" }}>Preview translated text…</summary>
                            <pre style={{ color:"#2E2E2E", fontSize:"12px", lineHeight:1.6, whiteSpace:"pre-wrap", wordBreak:"break-word", margin:"10px 0 0", maxHeight:"240px", overflow:"auto", fontFamily:T.mono, background:"rgba(0,0,0,.2)", padding:"12px", borderRadius:"8px" }}>{result.translated}</pre>
                          </details>
                        )}
                      </div>
                    )}
                    {result.multiple&&(
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        {result.isImage && (
                          <div style={{ fontSize:"11px", color:"#8C8C88", marginBottom:"2px" }}>{result.multiple.length} images ready to download</div>
                        )}
                        {result.multiple.map((item,i)=>(
                          <a key={i} href={item.url} download={item.filename} style={{ display:"flex", alignItems:"center", gap:"11px", textDecoration:"none", background:T.goodBg, border:"1px solid rgba(31,138,83,.2)", borderRadius:"10px", padding:"12px 16px" }}>
                            {result.isImage
                              ? <img src={item.url} alt="" style={{ width:"36px", height:"36px", objectFit:"cover", borderRadius:"5px", border:`1px solid ${T.borderUp}` }}/>
                              : <span style={{ color:T.good, display:"flex" }}><Icon name="download" size={17}/></span>}
                            <div style={{ color:T.good, fontSize:"13px", fontWeight:500, fontFamily:T.mono }}>{item.filename}</div>
                          </a>
                        ))}
                      </div>
                    )}
                    {result.text&&<pre style={{ color:"#2E2E2E", fontSize:"12px", lineHeight:1.6, whiteSpace:"pre-wrap", wordBreak:"break-word", margin:0, maxHeight:"260px", overflow:"auto", fontFamily:T.mono }}>{result.text}</pre>}
                  </>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width:"100%", padding:"10px 14px", borderRadius:"8px",
  background:"rgba(0,0,0,.035)", border:`1px solid ${T.border}`,
  color:T.text, fontSize:"13px", fontFamily:T.ui, outline:"none",
};

const navBtn = {
  padding:"6px 11px", borderRadius:"7px", border:`1px solid ${T.border}`,
  background:"rgba(0,0,0,.03)", color:T.dim, cursor:"pointer", fontSize:"12px", fontFamily:T.ui,
};

const miniInput = {
  padding:"7px 11px", borderRadius:"7px", border:`1px solid ${T.border}`,
  background:"rgba(0,0,0,.035)", color:T.text, fontSize:"12px", fontFamily:T.ui, outline:"none",
};

/* ══════════════════════════════════════════
   RESIZE HANDLES COMPONENT
   Shows 8 draggable handles for resizing images/signatures
══════════════════════════════════════════ */
function ResizeHandles({ isSelected, onResizeStart }) {
  const handles = [
    { pos: "tl", cursor: "nwse-resize", top: "-6px", left: "-6px" },
    { pos: "tr", cursor: "nesw-resize", top: "-6px", right: "-6px" },
    { pos: "bl", cursor: "nesw-resize", bottom: "-6px", left: "-6px" },
    { pos: "br", cursor: "nwse-resize", bottom: "-6px", right: "-6px" },
    { pos: "t", cursor: "ns-resize", top: "-6px", left: "50%", transform: "translateX(-50%)" },
    { pos: "b", cursor: "ns-resize", bottom: "-6px", left: "50%", transform: "translateX(-50%)" },
    { pos: "l", cursor: "ew-resize", top: "50%", left: "-6px", transform: "translateY(-50%)" },
    { pos: "r", cursor: "ew-resize", top: "50%", right: "-6px", transform: "translateY(-50%)" },
  ];

  if (!isSelected) return null;

  return (
    <>
      {handles.map(h => (
        <div
          key={h.pos}
          onMouseDown={e => {
            e.stopPropagation();
            onResizeStart(e, h.pos);
          }}
          style={{
            position: "absolute",
            width: "12px",
            height: "12px",
            background: "#D81F3F",
            border: "2px solid #FFFFFF",
            borderRadius: "2px",
            cursor: h.cursor,
            top: h.top,
            bottom: h.bottom,
            left: h.left,
            right: h.right,
            transform: h.transform,
            boxShadow: "0 0 0 1px rgba(0,0,0,.22), 0 1px 2px rgba(0,0,0,.25)",
            zIndex: 1001,
            transition: "background 0.15s",
            boxSizing: "border-box",
            pointerEvents: "auto",
          }}
          onMouseEnter={e => {
            e.target.style.background = "#B0182F";
          }}
          onMouseLeave={e => {
            e.target.style.background = "#D81F3F";
          }}
        />
      ))}
    </>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";

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
   PDF EDITOR
══════════════════════════════════════════ */
function PDFEditor({ pdfLib }) {
  const [file, setFile]               = useState(null);
  const [pdfDoc, setPdfDoc]           = useState(null);
  const [pageCount, setPageCount]     = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [docVersion, setDocVersion]   = useState(0);   // bumped each time a new PDF is loaded, forces a re-render of the canvas
  const [scale, setScale]             = useState(1.2);
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
  const [fontSize, setFontSize]           = useState(16);
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
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      if (e.key === "Delete" || e.key === "Backspace") { deleteSelected(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [historyIdx, history, selected, annotations]);

  // Handle resize mouse movements
  useEffect(() => {
    if (!isResizing || !resizeData || !selected) return;

    let finalAnns = null;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - resizeData.startX;
      const deltaY = e.clientY - resizeData.startY;

      const { handle, startRect } = resizeData;
      let newX = startRect.x;
      let newY = startRect.y;
      let newW = startRect.w;
      let newH = startRect.h;

      // Canvas coordinates map 1:1 to screen pixels, so apply the delta directly
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
      const minSize = 15;
      if (newW < minSize) {
        if (['l', 'tl', 'bl'].includes(handle)) newX = startRect.x + startRect.w - minSize;
        newW = minSize;
      }
      if (newH < minSize) {
        if (['t', 'tl', 'tr'].includes(handle)) newY = startRect.y + startRect.h - minSize;
        newH = minSize;
      }

      newX = Math.round(newX); newY = Math.round(newY);
      newW = Math.round(newW); newH = Math.round(newH);

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
  }, [isResizing, resizeData, selected]);

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
      setCurrentPage(0);
      setDocVersion(v => v + 1);   // guarantees the render effect runs even if currentPage was already 0
    } catch (e) { setError("Could not load PDF: " + e.message); }
    setLoading(false);
  };

  const renderPage = useCallback(async (pageIdx) => {
    if (!pdfJsDocRef.current || !canvasRef.current) return;
    const page   = await pdfJsDocRef.current.getPage(pageIdx + 1);
    const vp     = page.getViewport({ scale });
    const canvas = canvasRef.current;
    canvas.width = vp.width; canvas.height = vp.height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, vp.width, vp.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
  }, [scale]);

  useEffect(() => { renderPage(currentPage); }, [currentPage, scale, renderPage, docVersion]);

  const getCanvasPos = (e) => {
    const rect = overlayRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const pageAnnotations = annotations.filter(a => a.page === currentPage);

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
        dragAnnRef.current = hit.id;
        dragOffRef.current = { x: pos.x - hit.x, y: pos.y - hit.y };
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
        pushHistory([...annotations, {
          id: Date.now(), page: currentPage,
          type: editMode === "rect" ? shapeType : editMode,
          ...tempRect,
          strokeColor: editMode === "rect" ? fontColor : "transparent",
          strokeWidth: editMode === "rect" ? strokeWidth : 1.5,
          fillShape: editMode === "rect" ? fillShape : false,
          fillColor: editMode === "rect" ? fontColor : undefined,
          color: editMode === "redact" ? redactColor : editMode === "highlight" ? highlightColor : undefined,
        }]);
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
    const w = 190;                                  // default on-page width
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
    pushHistory(annotations.filter(a => a.id !== selected));
    setSelected(null);
  };

  const savePDF = async () => {
    if (!pdfDoc) return;
    setSaving(true);
    try {
      const { rgb, StandardFonts } = pdfLib;
      const doc   = pdfDoc;
      const pages = doc.getPages();

      const hexToRgb = hex => {
        const r = parseInt(hex.slice(1,3),16)/255;
        const g = parseInt(hex.slice(3,5),16)/255;
        const b = parseInt(hex.slice(5,7),16)/255;
        return rgb(r,g,b);
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

      for (const ann of annotations) {
        const page = pages[ann.page];
        const { height } = page.getSize();
        const pdfY = (y) => height - y / scale;

        if (ann.type === "text" && ann.text) {
          const f = pickFont(ann);
          const textSize = ann.fontSize / scale * 1.1;
          const textX = ann.x / scale;
          const textY = pdfY(ann.y);
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
          page.drawRectangle({ x: ann.x/scale, y: pdfY(ann.y+ann.h), width: ann.w/scale, height: ann.h/scale, color: rc });
        }
        if (ann.type === "highlight") {
          // Parse rgba color stored on annotation
          const hc = ann.color || "rgba(255,230,0,0.45)";
          const m = hc.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          const hr = m ? parseInt(m[1])/255 : 1;
          const hg = m ? parseInt(m[2])/255 : 0.9;
          const hb = m ? parseInt(m[3])/255 : 0;
          const ha = m && m[4] ? parseFloat(m[4]) : 0.4;
          page.drawRectangle({ x: ann.x/scale, y: pdfY(ann.y+ann.h), width: ann.w/scale, height: ann.h/scale, color: rgb(hr,hg,hb), opacity: ha });
        }
        if (["rect","circle","triangle","arrow","arrowUp","star","diamond","line","dblArrow","callout","checkmark","cross"].includes(ann.type)) {
          const shSc = hexToRgb(ann.strokeColor || "#000000");
          const shFc = ann.fillShape ? hexToRgb(ann.fillColor || ann.strokeColor || "#000000") : undefined;
          const shX = ann.x/scale, shY = pdfY(ann.y+ann.h), shW = ann.w/scale, shH = ann.h/scale;
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
            page.drawLine({ start: { x: ann.points[i].x/scale, y: pdfY(ann.points[i].y) }, end: { x: ann.points[i+1].x/scale, y: pdfY(ann.points[i+1].y) }, thickness: 1.5, color: rgb(0,0,0.7) });
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
            page.drawImage(embeddedImg, {
              x: ann.x / scale, y: pdfY(ann.y + ann.h),
              width:  ann.w / scale,
              height: ann.h / scale,
            });
          } catch (_) { /* skip unembeddable images */ }
        }
      }

      const bytes = await doc.save();
      const url   = URL.createObjectURL(new Blob([bytes], { type:"application/pdf" }));
      const fname = `${outputName.trim().replace(/\.pdf$/i,"")||"edited"}.pdf`;
      setSaveResult({ url, filename: fname });
    } catch(e) { setError("Save error: " + e.message); }
    setSaving(false);
  };

  const activeCursor = editMode === "select" ? "default" : editMode === "sign" ? "crosshair" : editMode === "addText" ? "text" : "crosshair";

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
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
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
            <span style={{ color:T.faintest, fontSize:"12px", marginLeft:"8px" }}>Zoom</span>
            {[0.8,1.0,1.2,1.5,2.0].map(z => (
              <button key={z} onClick={() => setScale(z)} style={{ ...navBtn, fontFamily:T.mono, borderColor:scale===z?T.accent:"rgba(0,0,0,.10)", color:scale===z?T.accent:T.faint, background:scale===z?T.accentBg:"transparent" }}>
                {Math.round(z*100)}%
              </button>
            ))}
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
            {editMode==="highlight" && "Drag to highlight an area — pick a color from the toolbar above"}
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

          {/* Canvas + SVG overlay */}
          <div style={{ position:"relative", display:"inline-block", lineHeight:0, border:"1px solid rgba(0,0,0,.08)", borderRadius:"4px", overflow:"hidden", alignSelf:"flex-start", boxShadow:"0 1px 3px rgba(0,0,0,.10), 0 8px 24px rgba(0,0,0,.06)" }}>
            <canvas ref={canvasRef} style={{ display:"block" }} />
            <svg ref={overlayRef}
              style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", cursor:activeCursor }}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>

              {pageAnnotations.map(ann => {
                const sel = selected === ann.id;
                const dash = sel ? "6,3" : "0";
                const selStroke = sel ? "#D81F3F" : "none";

                if (ann.type === "redact") return (
                  <g key={ann.id}>
                    <rect x={ann.x} y={ann.y} width={ann.w} height={ann.h}
                      fill={ann.color === "white" ? "#ffffff" : "#000000"}
                      stroke={sel ? "#D81F3F" : ann.color === "white" ? "#aaa" : "none"}
                      strokeWidth={sel?2:1} strokeDasharray={dash} />
                    {sel && <text x={ann.x + ann.w/2} y={ann.y + ann.h/2 + 5} textAnchor="middle"
                      fontSize="11" fill={ann.color === "white" ? "#666" : "#fff"} fontFamily="sans-serif">
                      {ann.color === "white" ? "White Cover" : "Black Redact"}
                    </text>}
                  </g>
                );
                if (ann.type === "highlight") return (
                  <rect key={ann.id} x={ann.x} y={ann.y} width={ann.w} height={ann.h}
                    fill={ann.color || "rgba(255,230,0,.45)"} stroke={selStroke} strokeWidth={sel?2:0} strokeDasharray={dash} />
                );
                if (["rect","circle","triangle","arrow","arrowUp","star","diamond","line","dblArrow","callout","checkmark","cross"].includes(ann.type)) {
                  const sc = sel ? "#D81F3F" : (ann.strokeColor || "#000");
                  const sw = sel ? 2 : (ann.strokeWidth || 1.5);
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

                  return <g key={ann.id}>{shape}{sel && <rect x={ann.x-3} y={ann.y-3} width={w+6} height={h+6} fill="none" stroke="#D81F3F" strokeWidth={1} strokeDasharray="5,3" rx={2}/>}</g>;
                }
                if (ann.type === "text") {
                  const lines = ann.text.split("\n");
                  const lh = ann.fontSize * 1.3;
                  return (
                    <g key={ann.id}>
                      {sel && <rect x={ann.x-4} y={ann.y-ann.fontSize-4} width={Math.max(...lines.map(l=>l.length))*ann.fontSize*0.6+8} height={lines.length*lh+8} fill="rgba(216,31,63,.08)" stroke="#D81F3F" strokeWidth={1} strokeDasharray="5,3" rx={3}/>}
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
                      {sel && <rect x={ann.x-2} y={ann.y-2} width={ann.w+4} height={ann.h+4}
                        fill="none" stroke="#D81F3F" strokeWidth={2} strokeDasharray="6,3"/>}
                    </g>
                  );
                }
                if (ann.type === "sign" && ann.points) {
                  const d = ann.points.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
                  return <path key={ann.id} d={d} fill="none" stroke={sel?"#D81F3F":"#003080"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>;
                }
                return null;
              })}

              {/* Image placement preview — show where it will land before Place is clicked */}
              {editMode === "image" && imagePlacedPos && imageDataUrl && (
                <g opacity="0.65">
                  <image href={imageDataUrl}
                    x={imagePlacedPos.x - imageDispW/2} y={imagePlacedPos.y - imageDispH/2}
                    width={imageDispW} height={imageDispH}
                    preserveAspectRatio="xMidYMid meet"/>
                  <rect x={imagePlacedPos.x - imageDispW/2 - 2} y={imagePlacedPos.y - imageDispH/2 - 2}
                    width={imageDispW+4} height={imageDispH+4}
                    fill="none" stroke="#D81F3F" strokeWidth={1.5} strokeDasharray="6,3"/>
                </g>
              )}
              {/* Crosshair when pos not yet set */}
              {editMode === "image" && !imagePlacedPos && (
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
                  fontSize="13" fill="rgba(216,31,63,.4)" fontFamily="sans-serif">
                  Click here to set image position
                </text>
              )}
              {tempRect && (
                <>
                  {editMode !== "image" && (
                    <rect x={tempRect.x} y={tempRect.y} width={tempRect.w} height={tempRect.h}
                      fill={editMode==="highlight"?(highlightColor||"rgba(255,230,0,.35)"):editMode==="redact"?"rgba(0,0,0,.6)":"transparent"}
                      stroke={editMode==="rect"?fontColor:"#D81F3F"} strokeWidth={1.5} strokeDasharray="6,3"/>
                  )}
                </>
              )}

            </svg>

            {/* Resize handles overlay — INSIDE the relative canvas box so it aligns with the image */}
            {selected && (() => {
              const ann = pageAnnotations.find(a => a.id === selected);
              // Photos and signatures are both stored as type "image" with w/h
              const isResizable = ann?.type === "image" && ann?.src != null;
              if (!isResizable) return null;
              return (
                <div style={{
                  position: "absolute",
                  left: `${ann.x}px`,
                  top: `${ann.y}px`,
                  width: `${ann.w}px`,
                  height: `${ann.h}px`,
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
                    {ann.type==="text" ? `T "${ann.text?.slice(0,18)||"…"}"` : ann.isSignature ? `signature` : ann.type==="image" ? `image` : ann.type}
                  </div>
                ))}
              </div>

              {/* Resize panel for selected image / signature */}
              {(() => {
                const selAnn = annotations.find(a => a.id === selected);
                if (!selAnn || (selAnn.type !== "image")) return null;
                return (
                  <div style={{ marginTop:"12px", padding:"12px 14px", background:"rgba(0,0,0,.03)", border:"1px solid rgba(0,0,0,.07)", borderRadius:"10px" }}>
                    <div style={{ fontSize:"10px", letterSpacing:".1em", color:selAnn.isSignature?"#D81F3F":"#2E7D5B", textTransform:"uppercase", marginBottom:"10px" }}>
                      {selAnn.isSignature ? "Resize Signature" : "Resize Image"}
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
  const [options, setOptions]           = useState({ pages:"", rotation:"90", splitMode:"pages", translateFrom:"en", translateTo:"tr", imgFit:"fit", imgOrient:"portrait", imgFormat:"png", imgQuality:"2", convertServer:"http://localhost:3000" });
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

      if (isJpg) {
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
      cvs.width = viewport.width; cvs.height = viewport.height;
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

    setResult({ translating: true, from: fromLang, to: toLang, preview: "" });

    try {
      // Step 3: streaming API call — words appear live as they're generated
      const textToTranslate = extracted.slice(0, 12000);

      // Build headers — include key + version when running outside Claude's artifact platform
      const fetchHeaders = { "Content-Type": "application/json" };
      if (apiKey.trim()) {
        fetchHeaders["x-api-key"] = apiKey.trim();
        fetchHeaders["anthropic-version"] = "2023-06-01";
        // Required for direct calls to the Anthropic API from a browser/Electron
        // origin — without it the request is rejected by CORS before it is sent.
        fetchHeaders["anthropic-dangerous-direct-browser-access"] = "true";
      }

      const controller = new AbortController();
      abortRef.current = controller;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: controller.signal,
        headers: fetchHeaders,
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 8000,
          stream: true,
          system: `You are a professional translator. Translate the text from ${fromLang} to ${toLang}. Preserve paragraph structure and line breaks. Output ONLY the translated text — no explanations, no preamble, no notes.`,
          messages: [{ role: "user", content: textToTranslate }],
        }),
      });

      if (activeRunRef.current !== runId) {
        controller.abort();
        return;
      }

      if (!response.ok) {
        const err = await response.json();
        setError("Translation failed: " + (err.error?.message || response.statusText));
        setResult(null);
        return;
      }

      // Read the SSE stream and accumulate text live
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let translated = "";
      let buffer = "";

      let streamDone = false;
      while (!streamDone) {
        if (activeRunRef.current !== runId) {
          reader.cancel();
          return;
        }
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data) continue;
          try {
            const evt = JSON.parse(data);
            // Anthropic terminates with message_stop (NOT "[DONE]" which is OpenAI's format)
            if (evt.type === "message_stop") { streamDone = true; break; }
            if (evt.type === "message_delta" && evt.delta?.stop_reason) { streamDone = true; break; }
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
              translated += evt.delta.text;
              if (activeRunRef.current === runId) {
                setResult(prev => ({ ...prev, preview: translated }));
              }
            }
            if (evt.type === "error") {
              setError("Translation error: " + (evt.error?.message || "Unknown error"));
              setResult(null);
              return;
            }
          } catch (_) { /* skip malformed lines */ }
        }
      }
      reader.cancel();

      // Flush any remaining data left in buffer after stream ends
      if (buffer.trim().startsWith("data: ")) {
        try {
          const evt = JSON.parse(buffer.slice(6).trim());
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
            translated += evt.delta.text;
          }
        } catch (_) {}
      }

      if (!translated.trim()) {
        setError("Translation returned empty result. Please try again.");
        setResult(null);
        return;
      }

      if (activeRunRef.current !== runId) return;

         // Step 4: generate a UTF-8 HTML file — full Unicode, no font embedding issues
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
    <div class="meta">Source: ${files[0].name} &nbsp;&middot;&nbsp; ${new Date().toLocaleDateString()}</div>
  </header>
  ${translated.split(/\n\n+/).map(p => p.trim() ? `<p>${p.trim().replace(/\n/g,' ')}</p>` : '').join('\n  ')}
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url  = URL.createObjectURL(blob);
      const fname = `${files[0].name.replace(/\.pdf$/i,"")}_${toLang.toLowerCase()}.html`;
      if (activeRunRef.current !== runId) return;
      setResult({ url, filename: fname, translated, from: fromLang, to: toLang, charCount: extracted.length, isHtml: true });

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
        extracted += tc.items.map(it => it.str).join(" ") + "\n\n";
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
    } catch(e) { setError("Error: " + e.message); }
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
                setOptions({ pages:"", rotation:"90", splitMode:"pages", translateFrom: options.translateFrom, translateTo: options.translateTo, imgFit:"fit", imgOrient:"portrait", imgFormat:"png", imgQuality:"2", convertServer: options.convertServer||"http://localhost:3000" });
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

                {/* API Key input — required outside Claude's artifact platform */}
                <div style={{ marginBottom:"14px", background:"rgba(0,0,0,.03)", border:"1px solid rgba(0,0,0,.07)", borderRadius:"11px", padding:"12px 16px" }}>
                  <div style={{ fontSize:"10px", letterSpacing:".12em", color:"#8C8C88", textTransform:"uppercase", marginBottom:"8px" }}>Anthropic API Key</div>
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
                  <div style={{ fontSize:"10px", color:"#B6B5B0", marginTop:"6px" }}>
                    {apiKey ? "Key saved in this browser" : "No key needed here. Paste your key only when running this file elsewhere."}
                  </div>
                </div>
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

// Shared primitives for all journal pages
// A4 @ 96dpi = 794 x 1123 px. We use 800 x 1131 for slightly rounder numbers.

const A4 = { w: 800, h: 1131 };

const VALUES = [
  { id: 'courage',   label: 'Courage',    color: '#ec6608', tint: '#fde5d0', glyph: 'C', prompt: 'stepping into something uncomfortable' },
  { id: 'curiosity', label: 'Curiosity',  color: '#009fe3', tint: '#d2eefa', glyph: 'Cu', prompt: 'asking, noticing, wondering' },
  { id: 'integrity', label: 'Integrity',  color: '#2a2b7c', tint: '#d4d5e5', glyph: 'I', prompt: 'doing the right thing when unseen' },
  { id: 'kindness',  label: 'Kindness',   color: '#e6007e', tint: '#f9d0e5', glyph: 'K', prompt: 'putting someone else first' },
  { id: 'respect',   label: 'Respect',    color: '#9b1844', tint: '#ead0d7', glyph: 'R', prompt: 'honouring people, place and self' },
];

// Writing surface styles — SVG pattern defs consumed across pages
function SurfaceDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <pattern id="rule-lines" width="100%" height="32" patternUnits="userSpaceOnUse">
          <line x1="0" y1="31.5" x2="1200" y2="31.5" stroke="#c9c4b5" strokeWidth="0.75" />
        </pattern>
        <pattern id="rule-lines-narrow" width="100%" height="28" patternUnits="userSpaceOnUse">
          <line x1="0" y1="27.5" x2="1200" y2="27.5" stroke="#c9c4b5" strokeWidth="0.75" />
        </pattern>
        <pattern id="rule-lines-wide" width="100%" height="36" patternUnits="userSpaceOnUse">
          <line x1="0" y1="35.5" x2="1200" y2="35.5" stroke="#c9c4b5" strokeWidth="0.75" />
        </pattern>
        <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.9" fill="#bab4a1" />
        </pattern>
        <pattern id="dot-grid-fine" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#b8b3a0" />
        </pattern>
      </defs>
    </svg>
  );
}

// A surface that accepts `kind` = ruled | dotted | blank, and renders the pattern
function WritingSurface({ kind = 'ruled', height, children, style, spacing = 'normal' }) {
  let fill = 'transparent';
  if (kind === 'ruled') {
    fill = spacing === 'narrow' ? 'url(#rule-lines-narrow)' : spacing === 'wide' ? 'url(#rule-lines-wide)' : 'url(#rule-lines)';
  } else if (kind === 'dotted') {
    fill = spacing === 'narrow' ? 'url(#dot-grid-fine)' : 'url(#dot-grid)';
  }
  return (
    <div style={{ position: 'relative', height, ...style }}>
      <svg width="100%" height={height} style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="none">
        <rect width="100%" height="100%" fill={fill} />
      </svg>
      {children}
    </div>
  );
}

// A photo/sketch slot — visible as a dashed box when photoSlots=true
function PhotoSlot({ width, height, label = 'Photo or sketch', style, filled }) {
  if (!filled) {
    // Empty placeholder
    return (
      <div style={{
        width, height,
        border: '1.5px dashed #b9607d',
        borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#b9607d',
        fontFamily: 'Calluna Sans, Lato, sans-serif',
        fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
        background: 'rgba(221,189,202,0.12)',
        flexDirection: 'column', gap: 6,
        ...style,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="1.5"/>
          <circle cx="9" cy="11" r="1.5"/>
          <path d="M3 17l5-5 4 4 3-3 6 5"/>
        </svg>
        <span>{label}</span>
      </div>
    );
  }
  // Filled — use a warm, generic illustration via CSS gradient
  return (
    <div style={{
      width, height,
      borderRadius: 4,
      background: filled,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      ...style,
    }} />
  );
}

// Value tag / pill
function ValueTag({ value, selected = false, size = 'md' }) {
  const small = size === 'sm';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: small ? 5 : 7,
      padding: small ? '3px 9px' : '5px 12px',
      borderRadius: 999,
      border: `1.25px solid ${value.color}`,
      background: selected ? value.color : 'transparent',
      color: selected ? '#fff' : value.color,
      fontFamily: 'Calluna Sans, Lato, sans-serif',
      fontWeight: 700,
      fontSize: small ? 9.5 : 11,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      lineHeight: 1,
    }}>
      <span style={{
        width: small ? 6 : 7, height: small ? 6 : 7, borderRadius: 999,
        background: selected ? '#fff' : value.color,
      }}/>
      {value.label}
    </div>
  );
}

// Tick-box checkbox (hand-friendly in GoodNotes)
function CheckBox({ checked, size = 14, color = '#7c7c7c' }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      border: `1.25px solid ${color}`, borderRadius: 3,
      position: 'relative', verticalAlign: 'middle',
      background: '#fff',
    }}>
      {checked && (
        <svg viewBox="0 0 14 14" style={{ position: 'absolute', inset: -1, width: size + 2, height: size + 2 }}>
          <path d="M3 7.5l2.5 2.5L11 4" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </span>
  );
}

// Handwritten-feel overlay text — uses Caveat (loaded in HTML head)
function Handwritten({ children, color = '#1a1a1a', size = 18, style }) {
  return (
    <span style={{
      fontFamily: "'Caveat', 'Kalam', cursive",
      fontSize: size,
      color,
      lineHeight: 1.3,
      ...style,
    }}>{children}</span>
  );
}

// Page shell — always A4
function Page({ bg = '#fbf8f1', children, style }) {
  return (
    <div style={{
      width: A4.w, height: A4.h,
      background: bg,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Calluna Sans', 'Lato', system-ui, sans-serif",
      color: '#1f1d1a',
      ...style,
    }}>
      {children}
    </div>
  );
}

// Small footer — page number + school mark
function PageFooter({ pageNum, total, ageBand, accent = '#9b1844', dark = false }) {
  const textColor = dark ? 'rgba(255,255,255,0.55)' : '#a8a29a';
  return (
    <div style={{
      position: 'absolute', bottom: 24, left: 48, right: 48,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase',
      color: textColor, fontWeight: 500,
    }}>
      <span>Haileybury · Reflective Journal</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span>{ageBand}</span>
        <span style={{ width: 3, height: 3, borderRadius: 999, background: accent }}/>
        <span>{pageNum} / {total}</span>
      </span>
    </div>
  );
}

Object.assign(window, {
  A4, VALUES, SurfaceDefs, WritingSurface, PhotoSlot, ValueTag, CheckBox, Handwritten, Page, PageFooter,
});

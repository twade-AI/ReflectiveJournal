// Shared primitives for the Reflective Journal app.
// VALUES palette, small components, and pure helpers.

const VALUES = [
  { id: 'courage',   label: 'Courage',    color: '#ec6608', tint: '#fde5d0', glyph: 'C',  prompt: 'stepping into something uncomfortable' },
  { id: 'curiosity', label: 'Curiosity',  color: '#009fe3', tint: '#d2eefa', glyph: 'Cu', prompt: 'asking, noticing, wondering' },
  { id: 'integrity', label: 'Integrity',  color: '#2a2b7c', tint: '#d4d5e5', glyph: 'I',  prompt: 'doing the right thing when unseen' },
  { id: 'kindness',  label: 'Kindness',   color: '#e6007e', tint: '#f9d0e5', glyph: 'K',  prompt: 'putting someone else first' },
  { id: 'respect',   label: 'Respect',    color: '#9b1844', tint: '#ead0d7', glyph: 'R',  prompt: 'honouring people, place and self' },
];
const VALUE_BY_ID = Object.fromEntries(VALUES.map(v => [v.id, v]));

// Skills palette — separate from the brand values, with a cooler/cleaner
// tone. Used alongside values on every reflection.
const SKILLS = [
  { id: 'organisation',  label: 'Organisation',            color: '#3a5a8c', tint: '#dde4ee' },
  { id: 'reflection',    label: 'Reflection',              color: '#7e57c2', tint: '#e7defa' },
  { id: 'leadership',    label: 'Leadership and Teamwork', color: '#00897b', tint: '#cfe9e6' },
  { id: 'time',          label: 'Time Management',         color: '#c98508', tint: '#fbeed3' },
  { id: 'problem',       label: 'Problem Solving',         color: '#558b3f', tint: '#dfe9d2' },
  { id: 'critical',      label: 'Critical Thinking',       color: '#8b3a62', tint: '#ead2da' },
  { id: 'communication', label: 'Communication',           color: '#0288d1', tint: '#cee5f1' },
];
const SKILL_BY_ID = Object.fromEntries(SKILLS.map(s => [s.id, s]));

// Compass-friendly multi-line labels for long names.
function compassLabel(label) {
  const map = {
    'leadership and teamwork': ['LEADERSHIP &', 'TEAMWORK'],
    'time management':         ['TIME',         'MANAGEMENT'],
    'problem solving':         ['PROBLEM',      'SOLVING'],
    'critical thinking':       ['CRITICAL',     'THINKING'],
  };
  return map[(label || '').toLowerCase()] ?? [(label || '').toUpperCase()];
}

const MOODS = ['Energised', 'Curious', 'Steady', 'Wobbly', 'Tired', 'Other'];

// ── Date helpers ───────────────────────────────────────────────
function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(+d)) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function weekCommencingISO(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  const day = d.getDay();                  // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;   // back to Monday
  d.setDate(d.getDate() + diff);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ── Value tag (display / toggleable) ───────────────────────────
function ValueTag({ value, selected = false, onToggle, size = 'md' }) {
  const small = size === 'sm';
  const clickable = !!onToggle;
  return (
    <button
      type="button"
      onClick={clickable ? () => onToggle(value.id) : undefined}
      disabled={!clickable}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: small ? 5 : 7,
        padding: small ? '4px 10px' : '6px 14px',
        borderRadius: 999,
        border: `1.5px solid ${value.color}`,
        background: selected ? value.color : 'transparent',
        color: selected ? '#fff' : value.color,
        fontFamily: "'Calluna Sans', 'Lato', system-ui, sans-serif",
        fontWeight: 700,
        fontSize: small ? 10.5 : 12,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        lineHeight: 1,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background .12s, color .12s, transform .08s',
      }}
      onMouseDown={clickable ? (e) => e.currentTarget.style.transform = 'scale(0.97)' : undefined}
      onMouseUp={clickable ? (e) => e.currentTarget.style.transform = '' : undefined}
      onMouseLeave={clickable ? (e) => e.currentTarget.style.transform = '' : undefined}
    >
      <span style={{
        width: small ? 6 : 7, height: small ? 6 : 7, borderRadius: 999,
        background: selected ? '#fff' : value.color,
      }}/>
      {value.label}
    </button>
  );
}

// ── Tag picker (multi-select bar) ──────────────────────────────
// Works with any list of {id, label, color}. Defaults to VALUES so existing
// callers keep working; pass items={SKILLS} to render the skills set.
function ValuePicker({ selected = [], onChange, size = 'md', items = VALUES }) {
  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  };
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {items.map(v => (
        <ValueTag key={v.id} value={v}
          selected={selected.includes(v.id)}
          onToggle={toggle}
          size={size}/>
      ))}
    </div>
  );
}

// ── Photo upload ───────────────────────────────────────────────
// Stores uploads inline as dataURLs. Good enough for a prototype; a real
// backend would swap this for a signed-URL upload + stored reference.
function PhotoUpload({ value, onChange, caption, onCaption }) {
  const inputRef = React.useRef(null);
  const onFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  if (value) {
    return (
      <div>
        <div style={{
          position: 'relative', borderRadius: 10, overflow: 'hidden',
          aspectRatio: '4 / 3', background: '#ead0d7',
        }}>
          <img src={value} alt="Reflection" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
          <button type="button" onClick={() => onChange(null)}
            style={{
              position: 'absolute', top: 10, right: 10,
              background: 'rgba(31,29,26,0.78)', color: '#fff', border: 'none',
              borderRadius: 999, padding: '6px 12px', fontSize: 12,
              cursor: 'pointer', fontWeight: 600, letterSpacing: '0.04em',
            }}>
            Remove
          </button>
        </div>
        {onCaption && (
          <input
            type="text"
            value={caption || ''}
            onChange={(e) => onCaption(e.target.value)}
            placeholder="Caption (optional)"
            style={{
              marginTop: 10, width: '100%', padding: '10px 12px',
              border: '1px solid #e3dcc8', borderRadius: 8,
              fontSize: 14, background: '#fff', fontFamily: 'inherit',
              color: '#1f1d1a',
            }}/>
        )}
      </div>
    );
  }
  return (
    <button type="button" onClick={() => inputRef.current?.click()}
      style={{
        width: '100%', aspectRatio: '4 / 3',
        border: '1.5px dashed #b9607d', borderRadius: 10,
        background: 'rgba(221,189,202,0.12)', color: '#9b1844',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, cursor: 'pointer', fontFamily: 'inherit',
        transition: 'background .12s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(221,189,202,0.25)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(221,189,202,0.12)'}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="1.5"/>
        <circle cx="9" cy="11" r="1.5"/>
        <path d="M3 17l5-5 4 4 3-3 6 5"/>
      </svg>
      <span style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
        Add a photo (optional)
      </span>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => onFile(e.target.files?.[0])}/>
    </button>
  );
}

// ── Generic form primitives ────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: hint ? 4 : 8 }}>
        {label}
      </div>
      {hint && <div style={{ fontSize: 12.5, color: '#7c7c7c', fontStyle: 'italic', marginBottom: 10 }}>{hint}</div>}
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', ...rest }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      {...rest}
      style={{
        width: '100%', padding: '11px 14px',
        border: '1px solid #e3dcc8', borderRadius: 8,
        fontSize: 15, background: '#fff', fontFamily: 'inherit',
        color: '#1f1d1a',
      }}/>
  );
}

function TextArea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%', padding: '12px 14px',
        border: '1px solid #e3dcc8', borderRadius: 8,
        fontSize: 15, background: '#fff', fontFamily: 'inherit',
        color: '#1f1d1a', resize: 'vertical', lineHeight: 1.55,
      }}/>
  );
}

function NumberStepper({ value, onChange, min = 0, max = 99, color = '#9b1844', label }) {
  const set = (n) => onChange(Math.min(max, Math.max(min, n)));
  const onType = (e) => {
    const raw = e.target.value;
    if (raw === '') { onChange(0); return; }
    const n = Number(raw);
    if (Number.isFinite(n)) set(Math.round(n));
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 6px 6px 14px', border: `1.25px solid ${color}`,
      borderRadius: 10, background: '#fff',
    }}>
      {label && <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color }}>{label}</span>}
      <button type="button" onClick={() => set((value || 0) - 1)}
        style={{ width: 30, height: 30, border: 'none', borderRadius: 8, background: 'transparent', color, fontSize: 18, cursor: 'pointer', fontWeight: 700 }}>−</button>
      <input
        type="number" inputMode="numeric"
        value={value ?? 0} min={min} max={max}
        onChange={onType}
        onFocus={(e) => e.target.select()}
        className="num-stepper-input"
        style={{
          width: 56, textAlign: 'center', fontSize: 18, fontWeight: 700, color,
          fontVariantNumeric: 'tabular-nums',
          border: 'none', background: 'transparent', padding: '4px 0',
          fontFamily: 'inherit', outline: 'none',
          MozAppearance: 'textfield',
        }}/>
      <button type="button" onClick={() => set((value || 0) + 1)}
        style={{ width: 30, height: 30, border: 'none', borderRadius: 8, background: color, color: '#fff', fontSize: 18, cursor: 'pointer', fontWeight: 700 }}>+</button>
    </div>
  );
}

function Button({ onClick, children, variant = 'primary', type = 'button', disabled = false }) {
  const styles = {
    primary:  { background: '#9b1844', color: '#fff', border: '1.5px solid #9b1844' },
    ghost:    { background: 'transparent', color: '#9b1844', border: '1.5px solid transparent' },
    outline:  { background: '#fff', color: '#9b1844', border: '1.5px solid #9b1844' },
    danger:   { background: 'transparent', color: '#9b1844', border: '1.5px solid transparent' },
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        padding: '11px 22px', borderRadius: 999,
        fontFamily: 'inherit', fontWeight: 700,
        fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'transform .08s, box-shadow .12s',
        ...styles,
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.98)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = '')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = '')}>
      {children}
    </button>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick}
      style={{
        background: '#fff',
        border: '1px solid #e3dcc8',
        borderRadius: 14,
        padding: 22,
        boxShadow: '0 1px 3px rgba(31,29,26,0.03)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color .12s, box-shadow .12s, transform .08s',
        ...style,
      }}
      onMouseEnter={onClick ? (e) => {
        e.currentTarget.style.borderColor = '#b9607d';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(155,24,68,0.08)';
      } : undefined}
      onMouseLeave={onClick ? (e) => {
        e.currentTarget.style.borderColor = '#e3dcc8';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(31,29,26,0.03)';
      } : undefined}>
      {children}
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────
const Icons = {
  plus: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>),
  arrow: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>),
  back: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 19l-7-7 7-7"/></svg>),
  camera: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="1.5"/><circle cx="9" cy="11" r="1.5"/><path d="M3 17l5-5 4 4 3-3 6 5"/></svg>),
  trash: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></svg>),
};

Object.assign(window, {
  VALUES, VALUE_BY_ID, SKILLS, SKILL_BY_ID, compassLabel, MOODS,
  todayISO, formatDate, weekCommencingISO,
  ValueTag, ValuePicker, PhotoUpload,
  Field, TextInput, TextArea, NumberStepper, Button, Card,
  Icons,
});

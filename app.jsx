// Reflective Journal — KS3 interactive app.
// Views: Profile (dashboard), Weekly reflections, Long Tutorial reflections.
// State persists to localStorage.

const { useState, useEffect, useMemo } = React;

// ─── Storage ──────────────────────────────────────────────────
const STORAGE_KEY = 'haileybury-journal-v1';
const EMPTY = { pupil: { name: '', year: '', house: '', tutor: '' }, weekly: [], tutorial: [], books: [], works: [] };

function useJournal() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...EMPTY, ...JSON.parse(raw) };
    } catch {}
    return EMPTY;
  });
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Most often QuotaExceededError — the journal got too big to fit in
      // localStorage (~5MB on iOS). Tell the App via a custom event so it
      // can show a toast.
      window.dispatchEvent(new CustomEvent('rj:storage-error', { detail: e }));
    }
  }, [state]);
  return [state, setState];
}

const newId = () => (crypto?.randomUUID?.() ?? String(Date.now() + Math.random()));

// Join an array as English prose: ['a','b','c'] => 'a, b, and c'
function joinList(parts) {
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

// ─── App shell ────────────────────────────────────────────────
function App() {
  const [state, setState] = useJournal();
  const [view, setView] = useState('profile');
  const [toast, setToast] = useState(null);
  const toastTimerRef = React.useRef(null);

  const showToast = (msg, opts) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, ...(opts || {}) });
    toastTimerRef.current = setTimeout(() => setToast(null), opts?.durationMs ?? 4000);
  };
  const dismissToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  };

  // Surface localStorage quota failures (or other write errors) so pupils
  // know their entry didn't actually persist.
  useEffect(() => {
    const onErr = () => showToast(
      "Couldn't save — your journal is too big for local storage. Try removing an older photo or video.",
      { durationMs: 9000 }
    );
    window.addEventListener('rj:storage-error', onErr);
    return () => window.removeEventListener('rj:storage-error', onErr);
  }, []);

  const patch = (fn) => setState(fn);
  const addWeekly      = (e) => { patch(s => ({ ...s, weekly:   [{ ...e, id: newId() }, ...s.weekly] }));         showToast('Reflection saved'); };
  const addTutorial    = (e) => { patch(s => ({ ...s, tutorial: [{ ...e, id: newId() }, ...s.tutorial] }));        showToast('Long tutorial saved'); };
  const addBook        = (e) => { patch(s => ({ ...s, books:    [{ ...e, id: newId() }, ...(s.books || [])] }));   showToast('Book saved'); };
  const addWork        = (e) => { patch(s => ({ ...s, works:    [{ ...e, id: newId() }, ...(s.works || [])] }));   showToast('Trophy added'); };
  const updateWeekly   = (id, e) => { patch(s => ({ ...s, weekly:   s.weekly.map(x   => x.id === id ? { ...x, ...e } : x) })); showToast('Reflection updated'); };
  const updateTutorial = (id, e) => { patch(s => ({ ...s, tutorial: s.tutorial.map(x => x.id === id ? { ...x, ...e } : x) })); showToast('Long tutorial updated'); };
  const updateBook     = (id, e) => { patch(s => ({ ...s, books:    (s.books || []).map(x => x.id === id ? { ...x, ...e } : x) })); showToast('Book updated'); };
  const updateWork     = (id, e) => { patch(s => ({ ...s, works:    (s.works || []).map(x => x.id === id ? { ...x, ...e } : x) })); showToast('Trophy updated'); };

  // Delete with undo: actually remove the entry, but keep a copy in the toast
  // so the user can put it back within 6 seconds.
  const removeEntry = (kind, id) => {
    const entry = (state[kind] || []).find(x => x.id === id);
    if (!entry) return;
    patch(s => ({ ...s, [kind]: (s[kind] || []).filter(x => x.id !== id) }));
    const label = kind === 'tutorial' ? 'Long tutorial' : kind === 'books' ? 'Book' : kind === 'works' ? 'Trophy' : 'Reflection';
    showToast(`${label} deleted`, {
      durationMs: 6000,
      undo: () => {
        // Re-insert with original id at the top of the list
        patch(s => ({ ...s, [kind]: [entry, ...(s[kind] || [])] }));
        dismissToast();
      },
    });
  };

  const setPupil = (p) => patch(s => ({ ...s, pupil: { ...s.pupil, ...p } }));

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f3ea',
      color: '#1f1d1a',
      fontFamily: "'Calluna Sans', 'Lato', system-ui, sans-serif",
    }}>
      <NavBar view={view} onNav={setView} pupil={state.pupil}/>
      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '40px 24px 80px' }}>
        {view === 'profile'   && <ProfileView   state={state} onNav={setView} onUpdatePupil={setPupil}/>}
        {view === 'weekly'    && <WeeklyView    entries={state.weekly}      onAdd={addWeekly}   onUpdate={updateWeekly}   onDelete={(id) => removeEntry('weekly', id)}/>}
        {view === 'tutorial'  && <TutorialView  entries={state.tutorial}    onAdd={addTutorial} onUpdate={updateTutorial} onDelete={(id) => removeEntry('tutorial', id)}/>}
        {view === 'library'   && <LibraryView   entries={state.books || []} onAdd={addBook}     onUpdate={updateBook}     onDelete={(id) => removeEntry('books', id)}/>}
        {view === 'trophies'  && <TrophiesView  entries={state.works || []} onAdd={addWork}     onUpdate={updateWork}     onDelete={(id) => removeEntry('works', id)}/>}
        {view === 'scrapbook' && <ScrapbookView state={state}/>}
        {view === 'book'      && <BookView      state={state}/>}
      </main>
      {toast && <Toast toast={toast} onDismiss={dismissToast}/>}
    </div>
  );
}

// Bottom-anchored toast with optional Undo action.
function Toast({ toast, onDismiss }) {
  return (
    <div style={{
      position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)',
      zIndex: 100,
      background: '#1f1d1a', color: '#fbf5e4',
      padding: '12px 14px 12px 18px', borderRadius: 10,
      display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: '0 12px 32px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.2)',
      fontFamily: "'Calluna Sans', 'Lato', system-ui, sans-serif",
      fontSize: 14, fontWeight: 500, maxWidth: 'calc(100vw - 32px)',
    }}>
      <span>{toast.msg}</span>
      {toast.undo && (
        <button onClick={toast.undo}
          style={{
            border: 'none', background: 'transparent', color: '#e8a935',
            fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            cursor: 'pointer', padding: '4px 8px',
          }}>
          Undo
        </button>
      )}
      <button onClick={onDismiss} aria-label="Dismiss"
        style={{
          border: 'none', background: 'transparent', color: 'rgba(251,245,228,0.6)',
          cursor: 'pointer', padding: '4px 6px', fontSize: 16, lineHeight: 1,
        }}>×</button>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────
function NavBar({ view, onNav, pupil }) {
  const tabs = [
    { id: 'profile',   label: 'The Hero' },
    { id: 'weekly',    label: 'Reflections' },
    { id: 'tutorial',  label: 'Long Tutorials' },
    { id: 'library',   label: 'The Library' },
    { id: 'trophies',  label: 'Trophies' },
    { id: 'scrapbook', label: 'Relics' },
    { id: 'book',      label: 'The Saga' },
  ];
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: '#9b1844', color: '#fff',
      borderBottom: '3px solid #ec6608',
    }}>
      <div className="rj-nav-inner" style={{ maxWidth: 1040, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="assets/logo-white.png" alt="Haileybury"
            style={{ height: 44, width: 'auto', display: 'block' }}/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingLeft: 14, borderLeft: '1px solid rgba(255,255,255,0.28)' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1 }}>
              The <span style={{ fontStyle: 'italic' }}>Odyssey</span>
            </div>
            <div style={{ fontSize: 9.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', fontWeight: 600, lineHeight: 1 }}>
              Reflective Journal
            </div>
          </div>
        </div>
        <nav className="rj-nav-tabs" style={{ display: 'flex', gap: 4, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => onNav(t.id)}
              style={{
                padding: '8px 14px', borderRadius: 999, border: 'none',
                background: view === t.id ? '#fff' : 'transparent',
                color: view === t.id ? '#9b1844' : 'rgba(255,255,255,0.82)',
                fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'background .12s',
              }}>
              {t.label}
            </button>
          ))}
        </nav>
        {pupil.name && (
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)', marginLeft: 10 }}>
            {pupil.name}{pupil.year ? ` · Year ${pupil.year}` : ''}
          </div>
        )}
      </div>
    </header>
  );
}

// ─── Profile view ─────────────────────────────────────────────
function ProfileView({ state, onNav, onUpdatePupil }) {
  const { pupil, weekly, tutorial } = state;
  const books = state.books || [];
  const works = state.works || [];
  const totalWeekly = weekly.length;
  const totalTutorial = tutorial.length;
  const totalBooks = books.length;
  const totalWorks = works.length;
  const yellowTotal = tutorial.reduce((n, e) => n + (e.yellowTickets || 0), 0);
  const blueTotal   = tutorial.reduce((n, e) => n + (e.blueTickets   || 0), 0);

  // Value counts across all entries
  const valueCounts = useMemo(() => {
    const counts = Object.fromEntries(VALUES.map(v => [v.id, 0]));
    [...weekly, ...tutorial].forEach(e => (e.values || []).forEach(id => { if (counts[id] != null) counts[id] += 1; }));
    return counts;
  }, [weekly, tutorial]);
  const maxValueCount = Math.max(1, ...Object.values(valueCounts));
  const topValueId = Object.entries(valueCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topValue = topValueId && valueCounts[topValueId] > 0 ? VALUE_BY_ID[topValueId] : null;

  // Skill counts in parallel
  const skillCounts = useMemo(() => {
    const counts = Object.fromEntries(SKILLS.map(s => [s.id, 0]));
    [...weekly, ...tutorial].forEach(e => (e.skills || []).forEach(id => { if (counts[id] != null) counts[id] += 1; }));
    return counts;
  }, [weekly, tutorial]);
  const maxSkillCount = Math.max(1, ...Object.values(skillCounts));

  const [compassMode, setCompassMode] = useState('values');
  const isSkills = compassMode === 'skills';

  // Term-snapshot history for the compass. We snapshot value/skill counts
  // at the end of each completed academic term (Michaelmas: 31 Dec, Lent:
  // 31 Mar). Live compass shows the current cumulative.
  const compassHistory = useMemo(() => {
    const today = todayISO();
    const yr = Number(today.slice(0, 4));
    const mo = Number(today.slice(5, 7));
    // Academic year starts in September
    const ayStart = mo >= 9 ? yr : yr - 1;
    const michaelmasEnd = `${ayStart}-12-31`;
    const lentEnd       = `${ayStart + 1}-03-31`;
    const allEntries = [...weekly, ...tutorial];

    const snapshot = (key, items, until) => {
      const seed = Object.fromEntries(items.map(i => [i.id, 0]));
      allEntries.forEach(e => {
        if (!e.date || e.date > until) return;
        (e[key] || []).forEach(id => { if (seed[id] != null) seed[id]++; });
      });
      return seed;
    };

    const sumCounts = (c) => Object.values(c).reduce((a, b) => a + b, 0);

    const valueSnapshots = [];
    const skillSnapshots = [];
    if (today > michaelmasEnd) {
      const v = snapshot('values', VALUES, michaelmasEnd);
      const s = snapshot('skills', SKILLS, michaelmasEnd);
      if (sumCounts(v) > 0) valueSnapshots.push({ label: 'Michaelmas', counts: v });
      if (sumCounts(s) > 0) skillSnapshots.push({ label: 'Michaelmas', counts: s });
    }
    if (today > lentEnd) {
      const v = snapshot('values', VALUES, lentEnd);
      const s = snapshot('skills', SKILLS, lentEnd);
      if (sumCounts(v) > 0) valueSnapshots.push({ label: 'Lent', counts: v });
      if (sumCounts(s) > 0) skillSnapshots.push({ label: 'Lent', counts: s });
    }
    return { valueSnapshots, skillSnapshots };
  }, [weekly, tutorial]);

  // Auto-summary paragraph (first-person, rule-based — a real LLM summary is a
  // future backend job). The pupil narrates their own journal so far.
  const summary = useMemo(() => {
    if (totalWeekly + totalTutorial + totalBooks + totalWorks === 0) {
      return `I haven't set off on the journey yet — my first reflection, book, or trophy is just a tap away.`;
    }
    const bits = [];
    const counts = [
      totalWeekly   ? `${totalWeekly} reflection${totalWeekly === 1 ? '' : 's'}`        : null,
      totalTutorial ? `${totalTutorial} long tutorial${totalTutorial === 1 ? '' : 's'}` : null,
      totalBooks    ? `${totalBooks} book${totalBooks === 1 ? '' : 's'}`                : null,
      totalWorks    ? `${totalWorks} ${totalWorks === 1 ? 'piece' : 'pieces'} of proud work` : null,
    ].filter(Boolean);
    bits.push(`So far I've logged ${joinList(counts)}.`);

    if (topValue && valueCounts[topValueId] >= 2) {
      bits.push(`My compass points strongest to ${topValue.label.toLowerCase()} — it's shown up in ${valueCounts[topValueId]} entries.`);
    }
    if (yellowTotal + blueTotal > 0) {
      const ticketBits = [];
      if (yellowTotal > 0) ticketBits.push(`${yellowTotal} yellow`);
      if (blueTotal > 0)   ticketBits.push(`${blueTotal} blue`);
      bits.push(`I've picked up ${joinList(ticketBits)} ticket${(yellowTotal + blueTotal) === 1 ? '' : 's'} this year.`);
    }
    if (totalBooks > 0) {
      const topRated = [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
      if (topRated && (topRated.rating || 0) >= 4 && topRated.title) {
        bits.push(`My favourite read so far is "${topRated.title}"${topRated.author ? ` by ${topRated.author}` : ''}.`);
      }
    }
    const mostRecent = [...weekly, ...tutorial, ...books, ...works].sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];
    if (mostRecent) {
      const title = mostRecent.title || mostRecent.moment || mostRecent.story || '';
      if (title) bits.push(`Most recently I wrote about "${title.slice(0, 90)}${title.length > 90 ? '…' : ''}".`);
    }
    return bits.join(' ');
  }, [weekly, tutorial, books, works, valueCounts, topValueId, topValue, yellowTotal, blueTotal, totalWeekly, totalTutorial, totalBooks, totalWorks]);

  const firstLetter = summary.charAt(0);
  const restSummary = summary.slice(1);

  return (
    <div>
      {/* Odyssey hero — no frame; multiply blends the logo's white background into the parchment */}
      <div style={{ margin: '-16px 0 0', textAlign: 'center' }}>
        <img src="assets/logo-odyssey.png" alt="The Haileybury Odyssey" className="rj-hero-logo"
          style={{
            width: '100%', maxWidth: 640, height: 'auto', display: 'block', margin: '0 auto',
            mixBlendMode: 'multiply',
          }}/>
      </div>

      <OrnamentDivider/>

      {/* Greeting — drop cap, serif, journal feel */}
      <div style={{ marginBottom: 8, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: '#8a6d2a', fontWeight: 700, marginBottom: 10 }}>
          Chapter I · The Hero
        </div>
        <h1 className="rj-hero-h1" style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 700, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {pupil.name ? <>Hello, <span style={{ fontStyle: 'italic', color: '#9b1844' }}>{pupil.name.split(' ')[0]}.</span></> : <>Your <span style={{ fontStyle: 'italic', color: '#9b1844' }}>hero's journey</span>.</>}
        </h1>
      </div>

      {/* Drop-cap summary */}
      <div style={{ maxWidth: 680, margin: '18px auto 28px', padding: '0 12px' }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: '#3a3835', lineHeight: 1.65, margin: 0, fontStyle: 'italic', textAlign: 'center' }}>
          <span style={{
            float: 'left', fontFamily: "'Playfair Display', serif", fontSize: 54,
            lineHeight: 0.9, padding: '4px 10px 0 0', color: '#9b1844', fontWeight: 700, fontStyle: 'normal',
          }}>{firstLetter}</span>
          {restSummary}
        </p>
        <div style={{ clear: 'both' }}/>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8, justifyContent: 'center' }}>
        <Button onClick={() => onNav('weekly')}>+ New reflection</Button>
        <Button variant="outline" onClick={() => onNav('tutorial')}>+ Prep for long tutorial</Button>
        <Button variant="outline" onClick={() => onNav('library')}>+ Log a book</Button>
        <Button variant="outline" onClick={() => onNav('trophies')}>+ Add a trophy</Button>
      </div>

      <OrnamentDivider/>

      {/* Stat seals */}
      <div style={{ marginBottom: 10 }}>
        <SectionHeader eyebrow="The Ledger" title="Your year, in numbers."/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 8 }}>
        <StatSeal label="Reflections"    value={totalWeekly}   accent="#9b1844"/>
        <StatSeal label="Long tutorials" value={totalTutorial} accent="#9b1844"/>
        <StatSeal label="Books read"     value={totalBooks}    accent="#558b3f"/>
        <StatSeal label="Trophies"       value={totalWorks}    accent="#c98508"/>
        <StatSeal label="Yellow tickets" value={yellowTotal}   accent="#c98508"/>
        <StatSeal label="Blue tickets"   value={blueTotal}     accent="#2a2b7c"/>
      </div>

      <OrnamentDivider/>

      {/* The Compass — framed card with Values/Skills toggle */}
      <div style={{ marginBottom: 10 }}>
        <SectionHeader eyebrow="Chapter II · The Compass" title="Which way are you growing?"/>
      </div>
      <FramedCard style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <CompassToggle mode={compassMode} onChange={setCompassMode}/>
        </div>
        <div style={{ fontSize: 13, color: '#7c7c7c', fontStyle: 'italic', textAlign: 'center', marginBottom: 14 }}>
          {isSkills
            ? 'Tag a skill on a reflection or long tutorial and the needle turns toward it.'
            : 'Tag a value on a reflection or long tutorial and the needle turns toward it.'}
        </div>
        <ValuesChart
          items={isSkills ? SKILLS : VALUES}
          counts={isSkills ? skillCounts : valueCounts}
          max={isSkills ? maxSkillCount : maxValueCount}
          history={isSkills ? compassHistory.skillSnapshots : compassHistory.valueSnapshots}/>
      </FramedCard>

      <OrnamentDivider/>

      {/* About me — card of ownership */}
      <div style={{ marginBottom: 10 }}>
        <SectionHeader eyebrow="Chapter III · The Hero's Card" title="This journal belongs to…"/>
      </div>
      <FramedCard>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <Field label="Name"><TextInput value={pupil.name}  onChange={(v) => onUpdatePupil({ name: v })}  placeholder="Your name"/></Field>
          <Field label="Year"><TextInput value={pupil.year}  onChange={(v) => onUpdatePupil({ year: v })}  placeholder="e.g. 8"/></Field>
          <Field label="House"><TextInput value={pupil.house} onChange={(v) => onUpdatePupil({ house: v })} placeholder="House name"/></Field>
          <Field label="Tutor"><TextInput value={pupil.tutor} onChange={(v) => onUpdatePupil({ tutor: v })} placeholder="Tutor's name"/></Field>
        </div>
      </FramedCard>
    </div>
  );
}

// ─── Journal ornaments ───────────────────────────────────────────
// Flourished divider between sections — thin gold lines meeting at a central compass rose.
function OrnamentDivider({ color = '#c9a74a' }) {
  return (
    <div style={{ margin: '34px 0 30px', display: 'flex', justifyContent: 'center' }}>
      <svg width="420" height="24" viewBox="0 0 420 24" style={{ maxWidth: '100%' }} aria-hidden="true">
        {/* flanking lines */}
        <line x1="0"   y1="12" x2="176" y2="12" stroke={color} strokeWidth="0.75" opacity="0.9"/>
        <line x1="244" y1="12" x2="420" y2="12" stroke={color} strokeWidth="0.75" opacity="0.9"/>
        {/* inner dots */}
        <circle cx="170" cy="12" r="1.5" fill={color}/>
        <circle cx="250" cy="12" r="1.5" fill={color}/>
        {/* flourish leaves */}
        <path d="M 180 12 Q 192 4 204 12 Q 192 20 180 12 Z" fill={color} opacity="0.35"/>
        <path d="M 240 12 Q 228 4 216 12 Q 228 20 240 12 Z" fill={color} opacity="0.35"/>
        {/* central compass rose */}
        <g transform="translate(210 12)">
          <circle r="8" fill="none" stroke={color} strokeWidth="0.75"/>
          <circle r="5" fill="none" stroke={color} strokeWidth="0.5" opacity="0.6"/>
          <path d="M 0 -9 L 1.2 0 L 0 9 L -1.2 0 Z" fill={color}/>
          <path d="M -9 0 L 0 1.2 L 9 0 L 0 -1.2 Z" fill={color}/>
          <path d="M -6 -6 L 0.8 -0.8 L 6 6 L -0.8 0.8 Z" fill={color} opacity="0.5"/>
          <path d="M -6 6 L 0.8 0.8 L 6 -6 L -0.8 -0.8 Z" fill={color} opacity="0.5"/>
          <circle r="1.2" fill={color}/>
        </g>
      </svg>
    </div>
  );
}

// Chapter-style section header — small gold eyebrow + serif title, centred.
function SectionHeader({ eyebrow, title }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 18 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: '#8a6d2a', fontWeight: 700, marginBottom: 8 }}>{eyebrow}</div>
      <h2 className="rj-section-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1f1d1a', margin: 0, letterSpacing: '-0.015em' }}>
        {title}
      </h2>
    </div>
  );
}

// Pill-shaped Values/Skills toggle.
function CompassToggle({ mode, onChange }) {
  const opts = [{ id: 'values', label: 'Values' }, { id: 'skills', label: 'Skills' }];
  return (
    <div style={{
      display: 'inline-flex', padding: 3, gap: 0,
      background: '#f6ead0', border: '1px solid #d9c78a',
      borderRadius: 999, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
    }}>
      {opts.map(o => {
        const active = mode === o.id;
        return (
          <button key={o.id} type="button" onClick={() => onChange(o.id)}
            style={{
              padding: '7px 18px', borderRadius: 999, border: 'none',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 11,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              background: active ? '#9b1844' : 'transparent',
              color: active ? '#fff' : '#8a6d2a',
              cursor: 'pointer', transition: 'background .15s, color .15s',
            }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// A card with gold corner flourishes — feels like a framed page.
function FramedCard({ children, style }) {
  const cornerSize = 20;
  const Corner = ({ rotate, x, y }) => (
    <svg width={cornerSize} height={cornerSize} viewBox="0 0 24 24"
      style={{ position: 'absolute', [x]: -6, [y]: -6, transform: `rotate(${rotate}deg)`, pointerEvents: 'none' }}>
      <path d="M 22 2 L 14 2 M 22 2 L 22 10 M 22 2 Q 16 4 14 10" fill="none" stroke="#c9a74a" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="22" cy="2" r="1.6" fill="#c9a74a"/>
    </svg>
  );
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(180deg, rgba(255,253,247,0.92) 0%, rgba(251,245,228,0.92) 100%)',
      border: '1px solid #d9c78a',
      borderRadius: 10,
      padding: 24,
      boxShadow: '0 1px 3px rgba(31,29,26,0.04), inset 0 0 0 1px rgba(255,255,255,0.4)',
      ...style,
    }}>
      <Corner rotate="0"   x="left"  y="top"/>
      <Corner rotate="90"  x="right" y="top"/>
      <Corner rotate="270" x="left"  y="bottom"/>
      <Corner rotate="180" x="right" y="bottom"/>
      {children}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e3dcc8', borderRadius: 12,
      padding: '16px 18px',
    }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 600, marginTop: 8 }}>{label}</div>
    </div>
  );
}

// Stat "seal" — parchment fill, gold double-ring frame, serif tabular numeral.
function StatSeal({ label, value, accent }) {
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(180deg, #fffdf4 0%, #f6ead0 100%)',
      border: '1.25px solid #c9a74a',
      borderRadius: 10,
      padding: '22px 16px 18px',
      textAlign: 'center',
      outline: '1px solid #c9a74a',
      outlineOffset: 3,
      boxShadow: '0 2px 8px rgba(155,124,50,0.1)',
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif", fontSize: 46, fontWeight: 700,
        color: accent, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      <div style={{
        marginTop: 10, fontSize: 9.5, letterSpacing: '0.26em', textTransform: 'uppercase',
        color: '#8a6d2a', fontWeight: 700,
      }}>{label}</div>
    </div>
  );
}

// A petal-bloom chart. Five teardrop petals radiate from the centre, each
// value's petal length proportional to how often it has been tagged.
// A compass rose. Spear-point arms radiate from the centre pivot; arm
// length is proportional to how often that item has been tagged. Degree
// ring with tick marks, central pivot with compass star. Renders any
// ordered list of {id, label, color} via the `items` prop.
function ValuesChart({ counts, max, items = VALUES, history }) {
  const n = items.length;
  const size = 380;
  const cx = size / 2, cy = size / 2;
  const pivotR   = 22;
  const ringIn   = 138;
  const ringOut  = 148;
  const armMax   = 128;
  const armMin   = 54;
  const armHalfW = n > 5 ? 11 : 14;     // narrower arms when there are more
  const labelR   = 170;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const stepDeg = 360 / n;

  const arms = items.map((v, i) => {
    const count = counts[v.id] || 0;
    const ratio = max ? count / max : 0;
    const tip = armMin + (armMax - armMin) * ratio;
    const angle = i * stepDeg;
    const rad = angle * Math.PI / 180;
    const labelX = Math.sin(rad) * labelR;
    const labelY = -Math.cos(rad) * labelR;
    return { v, count, tip, angle, labelX, labelY, faded: count === 0 };
  });
  const topCount = Math.max(...arms.map(a => a.count));
  const topArm = topCount > 0 ? arms.find(a => a.count === topCount) : null;

  // Diamond arm halves (split for a 3D spear look)
  // base sits at y=pivotR (just outside the pivot), tip at y=-len
  const armRight = (len) => `M 0 ${-pivotR + 2} L ${armHalfW} 0 L 0 ${-len} Z`;
  const armLeft  = (len) => `M 0 ${-pivotR + 2} L ${-armHalfW} 0 L 0 ${-len} Z`;

  // Degree ring ticks. We always draw 60 ticks (one every 6°). A tick is
  // "major" if it falls on (or close to) one of our value bearings, "mid"
  // every 30°, otherwise a fine tick.
  const tickCount = 60;
  const majorBearings = arms.map(a => a.angle);
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const a = i * (360 / tickCount);
    const rad = a * Math.PI / 180;
    const isMajor = majorBearings.some(b => Math.abs(((a - b + 540) % 360) - 180) > 179);
    const isMid   = !isMajor && a % 30 === 0;
    const tickLen = isMajor ? 12 : isMid ? 7 : 4;
    const mid = (ringIn + ringOut) / 2;
    const r1 = mid - tickLen / 2;
    const r2 = mid + tickLen / 2;
    return {
      x1: Math.sin(rad) * r1, y1: -Math.cos(rad) * r1,
      x2: Math.sin(rad) * r2, y2: -Math.cos(rad) * r2,
      major: isMajor, mid: isMid,
    };
  });

  return (
    <div>
      <svg viewBox={`0 0 ${size} ${size}`}
        style={{ display: 'block', width: '100%', maxWidth: 480, margin: '0 auto', overflow: 'visible' }}>
        <defs>
          <filter id="armShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.8"/>
            <feOffset dx="0" dy="1.2"/>
            <feComponentTransfer><feFuncA type="linear" slope="0.22"/></feComponentTransfer>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <radialGradient id="pivotGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#fff7d9"/>
            <stop offset="60%"  stopColor="#e9c86e"/>
            <stop offset="100%" stopColor="#c9a74a"/>
          </radialGradient>
          <style>{`
            @keyframes rj-sweep {
              0%   { transform: scaleY(0);  opacity: 0; }
              60%  { opacity: 1; }
              100% { transform: scaleY(1);  opacity: 1; }
            }
            .rj-arm-body { transform-origin: 0 0; animation: rj-sweep .7s cubic-bezier(.2,.8,.3,1.1) backwards; }
            ${arms.map((_, i) => `.rj-arm-${i} .rj-arm-body { animation-delay: ${i * 70}ms; }`).join('\n')}
            @keyframes rj-ring-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
            .rj-ring { animation: rj-ring-fade .5s ease-out backwards; }
          `}</style>
        </defs>

        <g transform={`translate(${cx} ${cy})`}>
          {/* Degree ring (two concentric circles) */}
          <g className="rj-ring">
            <circle r={ringOut + 10} fill="none" stroke="#c9a74a" strokeWidth="0.5" strokeOpacity="0.35"/>
            <circle r={ringOut}      fill="none" stroke="#c9a74a" strokeWidth="1"/>
            <circle r={ringIn}       fill="none" stroke="#c9a74a" strokeWidth="0.75"/>
            {ticks.map((t, i) => (
              <line key={i}
                x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                stroke={t.major ? '#8a6d2a' : '#c9a74a'}
                strokeWidth={t.major ? 1.2 : t.mid ? 0.75 : 0.5}
                strokeOpacity={t.major ? 1 : 0.7}/>
            ))}
            {/* Inner dashed guide at max-arm radius */}
            <circle r={armMax + 4} fill="none" stroke="#c9a74a" strokeOpacity="0.28" strokeWidth="0.5" strokeDasharray="2 4"/>
          </g>

          {/* Term-history ghost arms (rendered behind the live arms) */}
          {(history || []).map((snap, snapIdx) => {
            // Older snapshots fade more
            const opacity = 0.16 + (snapIdx / Math.max(1, history.length)) * 0.18;
            return arms.map(a => {
              const ghostCount = snap.counts?.[a.v.id] || 0;
              if (ghostCount === 0) return null;
              const ghostRatio = max ? ghostCount / max : 0;
              const ghostTip = armMin + (armMax - armMin) * ghostRatio;
              const ghostPath = `M 0 ${-pivotR + 2} L ${armHalfW} 0 L 0 ${-ghostTip} L ${-armHalfW} 0 Z`;
              return (
                <g key={`${snapIdx}-${a.v.id}`} transform={`rotate(${a.angle})`} opacity={opacity}>
                  <path d={ghostPath} fill="none" stroke={a.v.color} strokeWidth="1" strokeDasharray="3 3"/>
                </g>
              );
            });
          })}

          {/* Compass arms — spear-pointed, split into light/dark halves */}
          {arms.map((a, i) => (
            <g key={a.v.id} className={`rj-arm-${i}`}>
              <g transform={`rotate(${a.angle})`} opacity={a.faded ? 0.35 : 1}>
                <g className="rj-arm-body">
                  <path d={armRight(a.tip)} fill={a.v.color} opacity="0.96" filter="url(#armShadow)"/>
                  <path d={armLeft(a.tip)}  fill={a.v.color} opacity="0.65"/>
                  {/* centerline spine */}
                  <line x1="0" y1={-pivotR + 2} x2="0" y2={-a.tip} stroke="#1f1d1a" strokeOpacity="0.25" strokeWidth="0.5"/>
                  {/* tip marker */}
                  <circle cx="0" cy={-a.tip} r="2.2" fill={a.v.color} stroke="#fff" strokeWidth="0.75"/>
                </g>
              </g>
              {/* Label — supports 1- or 2-line names */}
              <g transform={`translate(${a.labelX} ${a.labelY})`}>
                {(() => {
                  const lines = compassLabel(a.v.label);
                  const fontSize = n > 5 ? 9 : 10.5;
                  const lineH = fontSize + 1.5;
                  const blockH = lines.length * lineH;
                  const labelTop = -8 - (blockH - lineH);
                  return lines.map((w, j) => (
                    <text key={j} textAnchor="middle" dominantBaseline="middle"
                      y={labelTop + j * lineH}
                      fill={a.v.color} fontSize={fontSize} fontWeight="700" letterSpacing="0.16em">
                      {w}
                    </text>
                  ));
                })()}
                <text textAnchor="middle" dominantBaseline="middle" y={n > 5 ? 9 : 10}
                  fill={a.faded ? '#bab4a1' : '#1f1d1a'} fontSize={n > 5 ? 13 : 15} fontWeight="700"
                  style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {a.count}
                </text>
              </g>
            </g>
          ))}

          {/* Central pivot — gold disc with a small magenta compass star */}
          <circle r={pivotR + 4} fill="none" stroke="#c9a74a" strokeWidth="0.6" strokeOpacity="0.5"/>
          <circle r={pivotR} fill="url(#pivotGrad)" stroke="#8a6d2a" strokeWidth="1"/>
          <circle r={pivotR - 5} fill="none" stroke="#8a6d2a" strokeWidth="0.5" strokeOpacity="0.55"/>
          {/* 4-point star inside pivot */}
          {[0, 90, 180, 270].map(angle => (
            <path key={angle} d={`M 0 0 L 3 0 L 0 ${-(pivotR - 6)} L -3 0 Z`}
              fill="#9b1844" transform={`rotate(${angle})`}/>
          ))}
          {/* Secondary smaller diagonal points */}
          {[45, 135, 225, 315].map(angle => (
            <path key={angle} d={`M 0 0 L 2 0 L 0 ${-(pivotR - 10)} L -2 0 Z`}
              fill="#9b1844" opacity="0.6" transform={`rotate(${angle})`}/>
          ))}
          <circle r="2.2" fill="#5a0d25"/>
        </g>
      </svg>

      {history?.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', fontSize: 11, color: '#7c7c7c', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 16, height: 2, background: '#9b1844' }}/> Now
          </span>
          {history.map((snap, i) => (
            <span key={snap.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, opacity: 0.7 }}>
              <span style={{ display: 'inline-block', width: 16, height: 0, borderTop: '1.5px dashed #8a6d2a' }}/> {snap.label}
            </span>
          ))}
        </div>
      )}

      {topArm ? (
        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: '#5f5a52' }}>
          The needle points strongest to{' '}
          <span style={{ color: topArm.v.color, fontWeight: 700 }}>{topArm.v.label.toLowerCase()}</span>
          {' — '}{topArm.count} tag{topArm.count === 1 ? '' : 's'} this year{total > 0 ? ` · ${total} total` : ''}.
        </div>
      ) : (
        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: '#7c7c7c', fontStyle: 'italic' }}>
          Tag values on your reflections and long tutorials — your compass will turn.
        </div>
      )}
    </div>
  );
}

// Reusable filter bar: keyword search + month dropdown + value/skill chips.
// Collapsed by default — clicking the header expands the full panel. Active
// filters show a count badge next to the toggle so they're visible even when
// collapsed.
function FilterBar({ filter, onChange, kind = 'reflection', availableMonths = [] }) {
  const activeCount =
    ((filter.q || '').trim() ? 1 : 0) +
    ((filter.month || '') ? 1 : 0) +
    (filter.values?.length || 0) +
    (filter.skills?.length || 0);
  const [expanded, setExpanded] = useState(activeCount > 0);

  const set = (patch) => onChange({ ...filter, ...patch });
  const toggleId = (key, id) => {
    const arr = filter[key] || [];
    set({ [key]: arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id] });
  };
  const clear = () => onChange({ q: '', month: '', values: [], skills: [] });

  return (
    <div style={{
      background: 'rgba(255,255,255,0.6)', border: '1px solid #e3dcc8',
      borderRadius: 12, marginBottom: 16, overflow: 'hidden',
    }}>
      {/* Header / toggle */}
      <button type="button" onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', textAlign: 'left',
        }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9b1844" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M6 12h12M10 18h4"/>
          </svg>
          <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700 }}>
            Search & filter
          </span>
          {activeCount > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              background: '#9b1844', color: '#fff',
              padding: '2px 8px', borderRadius: 999,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {activeCount} active
            </span>
          )}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {activeCount > 0 && (
            <span onClick={(e) => { e.stopPropagation(); clear(); }}
              style={{ color: '#9b1844', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 6px' }}>
              Clear
            </span>
          )}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#9b1844" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: 'transform .15s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </span>
      </button>

      {/* Body */}
      {expanded && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #efe9d9' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
            <input
              type="search"
              value={filter.q || ''}
              onChange={(e) => set({ q: e.target.value })}
              placeholder={kind === 'library' ? 'Search by title, author, or review…' : 'Search keywords…'}
              style={{
                flex: 1, minWidth: 180, padding: '9px 12px',
                border: '1px solid #e3dcc8', borderRadius: 8,
                fontSize: 14, background: '#fff', fontFamily: 'inherit', color: '#1f1d1a',
              }}/>
            <select value={filter.month || ''} onChange={(e) => set({ month: e.target.value })}
              style={{
                padding: '9px 12px', border: '1px solid #e3dcc8', borderRadius: 8,
                fontSize: 14, background: '#fff', fontFamily: 'inherit', color: '#1f1d1a',
                minWidth: 160,
              }}>
              <option value="">All months</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
          </div>
          {kind !== 'library' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, minWidth: 50 }}>Values</span>
                {VALUES.map(v => (
                  <ValueTag key={v.id} value={v}
                    selected={(filter.values || []).includes(v.id)}
                    onToggle={() => toggleId('values', v.id)}
                    size="sm"/>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, minWidth: 50 }}>Skills</span>
                {SKILLS.map(s => (
                  <ValueTag key={s.id} value={s}
                    selected={(filter.skills || []).includes(s.id)}
                    onToggle={() => toggleId('skills', s.id)}
                    size="sm"/>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Sort entries newest-first by `date`. Entries with no date sink to the
// bottom. Stable-ish — same-date entries keep insertion order.
function sortByDateDesc(entries) {
  return [...entries].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

// Bucket an ISO date string into a human label relative to today.
function dateBucket(iso) {
  if (!iso) return 'Undated';
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(+d)) return 'Undated';
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const weekAgo = new Date(start); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);
  if (d >= weekAgo)    return 'This week';
  if (d >= monthStart) return 'Earlier this month';
  if (d >= yearStart)  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// Walk a sorted entry list and emit a list of { type, ... } items so that
// each group of consecutive same-bucket entries gets a heading row.
function groupEntries(entries) {
  const out = [];
  let lastBucket = null;
  for (const e of entries) {
    const b = dateBucket(e.date);
    if (b !== lastBucket) {
      out.push({ type: 'heading', label: b, key: `h-${b}-${e.id || ''}` });
      lastBucket = b;
    }
    out.push({ type: 'entry', entry: e, key: e.id });
  }
  return out;
}

// Heading row used inside grouped lists.
function DateHeading({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, marginBottom: -4,
    }}>
      <span style={{
        fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
        color: '#8a6d2a', fontWeight: 700,
      }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #d9c78a 0%, transparent 100%)' }}/>
    </div>
  );
}

// Render an ISO YYYY-MM string as e.g. "October 2026"
function formatMonth(ym) {
  if (!ym) return '';
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// Build the sorted list of YYYY-MM strings present in a set of entries.
function monthsFromEntries(entries) {
  const set = new Set();
  entries.forEach(e => {
    if (e.date && e.date.length >= 7) set.add(e.date.slice(0, 7));
  });
  return Array.from(set).sort((a, b) => b.localeCompare(a)); // newest first
}

// Apply filter to a list of entries.
function applyFilter(entries, filter, searchKeys) {
  const q = (filter.q || '').trim().toLowerCase();
  const valueIds = filter.values || [];
  const skillIds = filter.skills || [];
  const month = filter.month || '';
  return entries.filter(e => {
    if (q) {
      const hay = searchKeys.map(k => (e[k] || '').toString().toLowerCase()).join(' ');
      if (!hay.includes(q)) return false;
    }
    if (month && (e.date || '').slice(0, 7) !== month) return false;
    if (valueIds.length && !valueIds.every(id => (e.values || []).includes(id))) return false;
    if (skillIds.length && !skillIds.every(id => (e.skills || []).includes(id))) return false;
    return true;
  });
}

// ─── Weekly Reflections ───────────────────────────────────────
function WeeklyView({ entries, onAdd, onUpdate, onDelete }) {
  const [composing, setComposing] = useState(entries.length === 0);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState({ q: '', month: '', values: [], skills: [] });

  if (composing) {
    return (
      <WeeklyForm
        onCancel={entries.length > 0 ? () => setComposing(false) : null}
        onSave={(entry) => { onAdd(entry); setComposing(false); }}/>
    );
  }

  if (editingId) {
    const entry = entries.find(e => e.id === editingId);
    if (entry) {
      return (
        <WeeklyForm
          initial={entry}
          onCancel={() => setEditingId(null)}
          onSave={(patch) => { onUpdate(editingId, patch); setEditingId(null); }}/>
      );
    }
  }

  const months = monthsFromEntries(entries);
  const filtered = sortByDateDesc(applyFilter(entries, filter, ['moment', 'proud', 'tricky', 'caption', 'mood']));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 8 }}>Reflections</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
            A habit of <span style={{ fontStyle: 'italic', color: '#9b1844' }}>noticing.</span>
          </h1>
          <p style={{ fontSize: 14.5, color: '#5f5a52', marginTop: 10, maxWidth: 540, lineHeight: 1.5 }}>
            Five minutes a week. What happened, what you're proud of, what was tricky. Tag the values that showed up and the compass turns with you.
          </p>
        </div>
        <Button onClick={() => setComposing(true)}>+ New reflection</Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState label="No reflections yet."/>
      ) : (
        <>
          <FilterBar filter={filter} onChange={setFilter} availableMonths={months}/>
          {filtered.length === 0 ? (
            <EmptyState label="No reflections match those filters."/>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {groupEntries(filtered).map(item =>
                item.type === 'heading' ? (
                  <DateHeading key={item.key} label={item.label}/>
                ) : (
                  <WeeklyCard key={item.key} entry={item.entry}
                    onEdit={() => setEditingId(item.entry.id)}
                    onDelete={() => onDelete(item.entry.id)}/>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function WeeklyCard({ entry, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 6 }}>
            Reflection · week of {formatDate(entry.weekCommencing || entry.date)}
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1f1d1a', fontStyle: 'italic', lineHeight: 1.3, marginBottom: 10 }}>
            {entry.moment || 'Untitled'}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {(entry.values || []).map(id => VALUE_BY_ID[id] && <ValueTag key={`v-${id}`} value={VALUE_BY_ID[id]} selected size="sm"/>)}
            {(entry.skills || []).map(id => SKILL_BY_ID[id] && <ValueTag key={`s-${id}`} value={SKILL_BY_ID[id]} selected size="sm"/>)}
            {entry.mood && (
              <span style={{ padding: '4px 10px', borderRadius: 999, border: '1.5px solid #ec6608', background: '#fde5d0', color: '#ec6608', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {entry.mood}
              </span>
            )}
          </div>
        </div>
        <div className="rj-card-actions" style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setOpen(o => !o)}
            style={{ border: 'none', background: 'transparent', color: '#9b1844', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 10px' }}>
            {open ? 'Less' : 'More'}
          </button>
          <button onClick={onEdit}
            style={{ border: 'none', background: 'transparent', color: '#9b1844', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 10px' }}>
            Edit
          </button>
          <button onClick={onDelete} title="Delete"
            style={{ border: 'none', background: 'transparent', color: '#9b1844', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'inline-flex', alignItems: 'center' }}>
            {Icons.trash}
          </button>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #efe9d9', display: 'grid', gridTemplateColumns: entry.photo ? '160px 1fr' : '1fr', gap: 18 }}>
          {entry.photo && <img src={entry.photo} alt="" style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 8 }}/>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entry.proud && <DetailRow label="Proud of" color="#ec6608" body={entry.proud}/>}
            {entry.tricky && <DetailRow label="Tricky"  color="#009fe3" body={entry.tricky}/>}
            {entry.caption && <div style={{ fontSize: 12, fontStyle: 'italic', color: '#7c7c7c' }}>{entry.caption}</div>}
          </div>
        </div>
      )}
    </Card>
  );
}

function DetailRow({ label, body, color }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#1f1d1a', lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div style={{
      padding: 48, textAlign: 'center', border: '1.5px dashed #e3dcc8',
      borderRadius: 14, color: '#7c7c7c', fontStyle: 'italic',
    }}>
      {label}
    </div>
  );
}

function WeeklyForm({ onSave, onCancel, initial }) {
  const editing = !!initial;
  const [date, setDate]       = useState(initial?.date   ?? todayISO());
  const [moment, setMoment]   = useState(initial?.moment ?? '');
  const [values, setValues]   = useState(initial?.values ?? []);
  const [skills, setSkills]   = useState(initial?.skills ?? []);
  const [photo, setPhoto]     = useState(initial?.photo  ?? null);
  const [caption, setCaption] = useState(initial?.caption ?? '');
  const [proud, setProud]     = useState(initial?.proud  ?? '');
  const [tricky, setTricky]   = useState(initial?.tricky ?? '');
  const [mood, setMood]       = useState(initial?.mood   ?? '');

  const canSave = moment.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    onSave({
      kind: 'weekly', date, weekCommencing: weekCommencingISO(date),
      moment: moment.trim(), values, skills,
      photo, caption: caption.trim(),
      proud: proud.trim(), tricky: tricky.trim(), mood,
    });
  };

  return (
    <FormShell
      eyebrow={editing ? 'Edit Reflection' : 'New Reflection'}
      title={editing
        ? <>Edit this <span style={{ fontStyle: 'italic', color: '#9b1844' }}>reflection.</span></>
        : <>This week <span style={{ fontStyle: 'italic', color: '#9b1844' }}>in five minutes.</span></>}
      onCancel={onCancel}
      onSave={save}
      canSave={canSave}>
      <Field label="Date"><TextInput type="date" value={date} onChange={setDate}/></Field>

      <Field label="A moment from this week" hint="Could be big or small — a match, a lesson, a tricky conversation.">
        <TextArea value={moment} onChange={setMoment} placeholder="What happened? Who was there?" rows={5}/>
      </Field>

      <Field label="Values in this story" hint="Tap any that showed up.">
        <ValuePicker selected={values} onChange={setValues}/>
      </Field>

      <Field label="Skills you used or stretched" hint="Tap any that came into play.">
        <ValuePicker selected={skills} onChange={setSkills} items={SKILLS}/>
      </Field>

      <Field label="Photo or sketch (optional)">
        <PhotoUpload value={photo} onChange={setPhoto} caption={caption} onCaption={setCaption}/>
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <Field label="I'm proud of…">
          <TextArea value={proud} onChange={setProud} rows={3} placeholder="Something small counts."/>
        </Field>
        <Field label="Something tricky…">
          <TextArea value={tricky} onChange={setTricky} rows={3} placeholder="A wobble you noticed."/>
        </Field>
      </div>

      <Field label="My week in one word">
        <MoodPicker value={mood} onChange={setMood}/>
      </Field>
    </FormShell>
  );
}

// Mood chips with an "Other" chip that reveals a free-text input. The mood
// is stored as the actual word (preset or custom), not the literal "Other".
function MoodPicker({ value, onChange }) {
  const presets = MOODS.filter(m => m !== 'Other');
  const isCustom = !!value && !presets.includes(value);
  const [otherOpen, setOtherOpen] = useState(isCustom);

  const pickPreset = (w) => {
    onChange(value === w ? '' : w);
    setOtherOpen(false);
  };
  const toggleOther = () => {
    setOtherOpen(prev => {
      const next = !prev;
      if (next) {
        // Opening: clear any preset selection so the input becomes the source
        if (presets.includes(value)) onChange('');
      } else {
        // Closing: clear any custom mood
        if (isCustom) onChange('');
      }
      return next;
    });
  };

  const otherSelected = otherOpen || isCustom;

  const chip = (label, selected, onClick) => (
    <button type="button" onClick={onClick}
      style={{
        padding: '10px 16px', borderRadius: 8,
        border: `1.5px solid ${selected ? '#9b1844' : '#e3dcc8'}`,
        background: selected ? '#9b1844' : '#fff',
        color: selected ? '#fff' : '#1f1d1a',
        fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      }}>
      {label}
    </button>
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {presets.map(w => chip(w, value === w, () => pickPreset(w)))}
        {chip('Other', otherSelected, toggleOther)}
      </div>
      {otherSelected && (
        <input
          type="text"
          autoFocus={otherOpen && !isCustom}
          value={isCustom ? value : ''}
          maxLength={30}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your own word…"
          style={{
            marginTop: 12, width: '100%', maxWidth: 320,
            padding: '10px 12px', border: '1px solid #e3dcc8', borderRadius: 8,
            fontSize: 14, background: '#fff', fontFamily: 'inherit', color: '#1f1d1a',
          }}/>
      )}
    </div>
  );
}

// ─── Form shell (shared by weekly + tutorial) ─────────────────
function FormShell({ eyebrow, title, onCancel, onSave, canSave, children }) {
  return (
    <div>
      <div className="rj-form-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 8 }}>{eyebrow}</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, margin: 0, lineHeight: 1.05, letterSpacing: '-0.02em' }}>{title}</h1>
        </div>
        <div className="rj-form-actions" style={{ display: 'flex', gap: 10 }}>
          {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
          <Button onClick={onSave} disabled={!canSave}>Save</Button>
        </div>
      </div>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>{children}</div>
      </Card>
      {/* Duplicate save/cancel at the bottom for long forms */}
      <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button onClick={onSave} disabled={!canSave}>Save</Button>
      </div>
    </div>
  );
}

// ─── Long Tutorial Reflections ────────────────────────────────
function TutorialView({ entries, onAdd, onUpdate, onDelete }) {
  const [composing, setComposing] = useState(entries.length === 0);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState({ q: '', month: '', values: [], skills: [] });

  if (composing) {
    return (
      <TutorialForm
        onCancel={entries.length > 0 ? () => setComposing(false) : null}
        onSave={(entry) => { onAdd(entry); setComposing(false); }}/>
    );
  }

  if (editingId) {
    const entry = entries.find(e => e.id === editingId);
    if (entry) {
      return (
        <TutorialForm
          initial={entry}
          onCancel={() => setEditingId(null)}
          onSave={(patch) => { onUpdate(editingId, patch); setEditingId(null); }}/>
      );
    }
  }

  const months = monthsFromEntries(entries);
  const filtered = sortByDateDesc(applyFilter(entries, filter, ['title', 'story', 'shift', 'wentWell', 'differently', 'discuss', 'caption']));

  const yellowTotal = entries.reduce((n, e) => n + (e.yellowTickets || 0), 0);
  const blueTotal   = entries.reduce((n, e) => n + (e.blueTickets   || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 8 }}>Long Tutorials</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
            Before you meet your <span style={{ fontStyle: 'italic', color: '#9b1844' }}>tutor.</span>
          </h1>
          <p style={{ fontSize: 14.5, color: '#5f5a52', marginTop: 10, maxWidth: 540, lineHeight: 1.5 }}>
            A longer reflection to prepare for your long tutorial. Log your yellow and blue tickets too — they're part of the story.
          </p>
        </div>
        <Button onClick={() => setComposing(true)}>+ New long tutorial</Button>
      </div>

      {(yellowTotal + blueTotal) > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <TicketBadge color="#e8a935" tint="#fdeecb" label="Yellow tickets (total)" value={yellowTotal}/>
          <TicketBadge color="#2a2b7c" tint="#d4d5e5" label="Blue tickets (total)"   value={blueTotal}/>
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState label="No long tutorials yet."/>
      ) : (
        <>
          <FilterBar filter={filter} onChange={setFilter} availableMonths={months}/>
          {filtered.length === 0 ? (
            <EmptyState label="No long tutorials match those filters."/>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {groupEntries(filtered).map(item =>
                item.type === 'heading' ? (
                  <DateHeading key={item.key} label={item.label}/>
                ) : (
                  <TutorialCard key={item.key} entry={item.entry}
                    onEdit={() => setEditingId(item.entry.id)}
                    onDelete={() => onDelete(item.entry.id)}/>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TicketBadge({ color, tint, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 999, background: tint, border: `1.5px solid ${color}` }}>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color, fontWeight: 700 }}>{label}</span>
    </div>
  );
}

function TutorialCard({ entry, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 6 }}>
            {entry.term ? `${entry.term} · ` : ''}{formatDate(entry.date)}
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#1f1d1a', lineHeight: 1.2, marginBottom: 10 }}>
            {entry.title || 'Untitled'}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {(entry.values || []).map(id => VALUE_BY_ID[id] && <ValueTag key={`v-${id}`} value={VALUE_BY_ID[id]} selected size="sm"/>)}
            {(entry.skills || []).map(id => SKILL_BY_ID[id] && <ValueTag key={`s-${id}`} value={SKILL_BY_ID[id]} selected size="sm"/>)}
          </div>
          {(entry.yellowTickets > 0 || entry.blueTickets > 0) && (
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {entry.yellowTickets > 0 && <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#fdeecb', color: '#c98508' }}>{entry.yellowTickets} yellow</span>}
              {entry.blueTickets   > 0 && <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#d4d5e5', color: '#2a2b7c' }}>{entry.blueTickets} blue</span>}
            </div>
          )}
        </div>
        <div className="rj-card-actions" style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setOpen(o => !o)}
            style={{ border: 'none', background: 'transparent', color: '#9b1844', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 10px' }}>
            {open ? 'Less' : 'More'}
          </button>
          <button onClick={onEdit}
            style={{ border: 'none', background: 'transparent', color: '#9b1844', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 10px' }}>
            Edit
          </button>
          <button onClick={onDelete} title="Delete"
            style={{ border: 'none', background: 'transparent', color: '#9b1844', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'inline-flex', alignItems: 'center' }}>
            {Icons.trash}
          </button>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #efe9d9', display: 'grid', gridTemplateColumns: entry.photo ? '180px 1fr' : '1fr', gap: 18 }}>
          {entry.photo && (
            <div>
              <img src={entry.photo} alt="" style={{ width: 180, height: 140, objectFit: 'cover', borderRadius: 8 }}/>
              {entry.caption && <div style={{ marginTop: 6, fontSize: 12, fontStyle: 'italic', color: '#7c7c7c' }}>{entry.caption}</div>}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entry.story    && <DetailRow label="What happened"           color="#9b1844" body={entry.story}/>}
            {entry.shift    && <DetailRow label="What shifted in me"      color="#ec6608" body={entry.shift}/>}
            {entry.wentWell && <DetailRow label="What went well"          color="#009870" body={entry.wentWell}/>}
            {entry.differently && <DetailRow label="What I'd do differently" color="#ec6608" body={entry.differently}/>}
            {entry.discuss  && <DetailRow label="To discuss with tutor"   color="#9b1844" body={entry.discuss}/>}
          </div>
        </div>
      )}
    </Card>
  );
}

function TutorialForm({ onSave, onCancel, initial }) {
  const editing = !!initial;
  const [date, setDate]               = useState(initial?.date        ?? todayISO());
  const [term, setTerm]               = useState(initial?.term        ?? 'Michaelmas');
  const [title, setTitle]             = useState(initial?.title       ?? '');
  const [story, setStory]             = useState(initial?.story       ?? '');
  const [shift, setShift]             = useState(initial?.shift       ?? '');
  const [values, setValues]           = useState(initial?.values      ?? []);
  const [skills, setSkills]           = useState(initial?.skills      ?? []);
  const [photo, setPhoto]             = useState(initial?.photo       ?? null);
  const [caption, setCaption]         = useState(initial?.caption     ?? '');
  const [wentWell, setWentWell]       = useState(initial?.wentWell    ?? '');
  const [differently, setDifferently] = useState(initial?.differently ?? '');
  const [discuss, setDiscuss]         = useState(initial?.discuss     ?? '');
  const [yellowTickets, setYellow]    = useState(initial?.yellowTickets ?? 0);
  const [blueTickets, setBlue]        = useState(initial?.blueTickets   ?? 0);

  const canSave = title.trim().length > 0 && story.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    onSave({
      kind: 'tutorial', date, term,
      title: title.trim(), story: story.trim(), shift: shift.trim(),
      values, skills,
      photo, caption: caption.trim(),
      wentWell: wentWell.trim(), differently: differently.trim(), discuss: discuss.trim(),
      yellowTickets: Number(yellowTickets) || 0, blueTickets: Number(blueTickets) || 0,
    });
  };

  return (
    <FormShell
      eyebrow={editing ? 'Edit Long Tutorial' : 'New Long Tutorial'}
      title={editing
        ? <>Edit this <span style={{ fontStyle: 'italic', color: '#9b1844' }}>long tutorial.</span></>
        : <>Prep for your <span style={{ fontStyle: 'italic', color: '#9b1844' }}>long tutorial.</span></>}
      onCancel={onCancel}
      onSave={save}
      canSave={canSave}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <Field label="Date"><TextInput type="date" value={date} onChange={setDate}/></Field>
        <Field label="Term">
          <select value={term} onChange={(e) => setTerm(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', border: '1px solid #e3dcc8', borderRadius: 8, fontSize: 15, background: '#fff', fontFamily: 'inherit', color: '#1f1d1a' }}>
            <option>Michaelmas</option><option>Lent</option><option>Summer</option>
          </select>
        </Field>
      </div>

      <Field label="Title" hint="Give this reflection a name.">
        <TextInput value={title} onChange={setTitle} placeholder="e.g. The Community Garden Project"/>
      </Field>

      <Field label="What happened" hint="Tell the story. Setting, people, choice points.">
        <TextArea value={story} onChange={setStory} rows={6}/>
      </Field>

      <Field label="What shifted in me" hint="A moment something clicked, or a view changed.">
        <TextArea value={shift} onChange={setShift} rows={4}/>
      </Field>

      <Field label="Values this touches">
        <ValuePicker selected={values} onChange={setValues}/>
      </Field>

      <Field label="Skills you used or stretched" hint="Tap any that came into play.">
        <ValuePicker selected={skills} onChange={setSkills} items={SKILLS}/>
      </Field>

      <Field label="Photo or sketch (optional)">
        <PhotoUpload value={photo} onChange={setPhoto} caption={caption} onCaption={setCaption}/>
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <Field label="What went well">
          <TextArea value={wentWell} onChange={setWentWell} rows={3}/>
        </Field>
        <Field label="What I'd do differently">
          <TextArea value={differently} onChange={setDifferently} rows={3}/>
        </Field>
      </div>

      <Field label="To discuss with my tutor" hint="A question you want to bring into the long tutorial.">
        <TextArea value={discuss} onChange={setDiscuss} rows={3}/>
      </Field>

      <div>
        <div style={{ fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 4 }}>Tickets this term</div>
        <div style={{ fontSize: 12.5, color: '#7c7c7c', fontStyle: 'italic', marginBottom: 12 }}>How many yellow / blue tickets have you picked up since your last long tutorial?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <NumberStepper label="Yellow tickets" value={yellowTickets} onChange={setYellow} color="#c98508"/>
          <NumberStepper label="Blue tickets"   value={blueTickets}   onChange={setBlue}   color="#2a2b7c"/>
        </div>
      </div>
    </FormShell>
  );
}

// ─── The Library (reading log) ───────────────────────────────
function LibraryView({ entries, onAdd, onUpdate, onDelete }) {
  const [composing, setComposing] = useState(entries.length === 0);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState({ q: '', month: '', values: [], skills: [] });

  if (composing) {
    return (
      <BookForm
        onCancel={entries.length > 0 ? () => setComposing(false) : null}
        onSave={(entry) => { onAdd(entry); setComposing(false); }}/>
    );
  }
  if (editingId) {
    const entry = entries.find(e => e.id === editingId);
    if (entry) {
      return (
        <BookForm
          initial={entry}
          onCancel={() => setEditingId(null)}
          onSave={(patch) => { onUpdate(editingId, patch); setEditingId(null); }}/>
      );
    }
  }

  const months = monthsFromEntries(entries);
  const filtered = sortByDateDesc(applyFilter(entries, filter, ['title', 'author', 'review']));
  const avg = entries.length ? (entries.reduce((s, e) => s + (e.rating || 0), 0) / entries.length) : 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 8 }}>The Library</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
            Books along <span style={{ fontStyle: 'italic', color: '#9b1844' }}>the way.</span>
          </h1>
          <p style={{ fontSize: 14.5, color: '#5f5a52', marginTop: 10, maxWidth: 540, lineHeight: 1.5 }}>
            Log every book you read. Title, author, a quick review, your rating. Add a cover if you'd like.
          </p>
        </div>
        <Button onClick={() => setComposing(true)}>+ New book</Button>
      </div>

      {entries.length > 0 && (
        <div style={{ display: 'flex', gap: 14, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700 }}>
            {entries.length} book{entries.length === 1 ? '' : 's'} read
          </span>
          {avg > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#5f5a52' }}>
              Average rating <StarRating value={Math.round(avg)} size={16}/>
              <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#c98508' }}>{avg.toFixed(1)}</span>
            </span>
          )}
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState label="No books logged yet."/>
      ) : (
        <>
          <FilterBar filter={filter} onChange={setFilter} kind="library" availableMonths={months}/>
          {filtered.length === 0 ? (
            <EmptyState label="No books match those filters."/>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {groupEntries(filtered).map(item =>
                item.type === 'heading' ? (
                  <DateHeading key={item.key} label={item.label}/>
                ) : (
                  <LibraryCard key={item.key} entry={item.entry}
                    onEdit={() => setEditingId(item.entry.id)}
                    onDelete={() => onDelete(item.entry.id)}/>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LibraryCard({ entry, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: 16, alignItems: 'flex-start' }}>
        <BookCover photo={entry.photo} title={entry.title} small/>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#558b3f', fontWeight: 700, marginBottom: 6 }}>
            Book · {formatDate(entry.date)}
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1f1d1a', fontStyle: 'italic', lineHeight: 1.25 }}>
            {entry.title || 'Untitled'}
          </div>
          {entry.author && (
            <div style={{ fontSize: 13, color: '#5f5a52', fontStyle: 'italic', marginTop: 2 }}>
              by {entry.author}
            </div>
          )}
          <div style={{ marginTop: 10 }}>
            <StarRating value={entry.rating || 0} size={18}/>
          </div>
        </div>
        <div className="rj-card-actions" style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setOpen(o => !o)}
            style={{ border: 'none', background: 'transparent', color: '#9b1844', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 10px' }}>
            {open ? 'Less' : 'More'}
          </button>
          <button onClick={onEdit}
            style={{ border: 'none', background: 'transparent', color: '#9b1844', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 10px' }}>
            Edit
          </button>
          <button onClick={onDelete} title="Delete"
            style={{ border: 'none', background: 'transparent', color: '#9b1844', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'inline-flex', alignItems: 'center' }}>
            {Icons.trash}
          </button>
        </div>
      </div>
      {open && entry.review && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #efe9d9' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14.5, color: '#1f1d1a', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
            {entry.review}
          </div>
        </div>
      )}
    </Card>
  );
}

function BookForm({ onSave, onCancel, initial }) {
  const editing = !!initial;
  const [date, setDate]     = useState(initial?.date   ?? todayISO());
  const [title, setTitle]   = useState(initial?.title  ?? '');
  const [author, setAuthor] = useState(initial?.author ?? '');
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [review, setReview] = useState(initial?.review ?? '');
  const [photo, setPhoto]   = useState(initial?.photo  ?? null);

  const canSave = title.trim().length > 0 && author.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    onSave({
      kind: 'book', date,
      title: title.trim(), author: author.trim(),
      rating: Number(rating) || 0,
      review: review.trim(),
      photo,
    });
  };

  return (
    <FormShell
      eyebrow={editing ? 'Edit Book' : 'New Book'}
      title={editing
        ? <>Edit this <span style={{ fontStyle: 'italic', color: '#9b1844' }}>book.</span></>
        : <>Log a <span style={{ fontStyle: 'italic', color: '#9b1844' }}>book.</span></>}
      onCancel={onCancel}
      onSave={save}
      canSave={canSave}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <Field label="Title"><TextInput value={title} onChange={setTitle} placeholder="e.g. The Hobbit"/></Field>
        <Field label="Author"><TextInput value={author} onChange={setAuthor} placeholder="e.g. J. R. R. Tolkien"/></Field>
      </div>

      <Field label="Date finished"><TextInput type="date" value={date} onChange={setDate}/></Field>

      <Field label="Rating">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StarRating value={rating} onChange={setRating} size={28}/>
          {rating > 0 && (
            <span style={{ fontSize: 13, color: '#7c7c7c', fontStyle: 'italic' }}>
              {rating} of 5
            </span>
          )}
        </div>
      </Field>

      <Field label="Review" hint="What did you think? Who would you recommend it to?">
        <TextArea value={review} onChange={setReview} rows={6} placeholder="A few lines…"/>
      </Field>

      <Field label="Cover photo (optional)">
        <PhotoUpload value={photo} onChange={setPhoto}/>
      </Field>
    </FormShell>
  );
}

// Five-star clickable rating (read-only when onChange is not passed).
function StarRating({ value = 0, onChange, size = 22, color = '#c98508' }) {
  const interactive = typeof onChange === 'function';
  return (
    <div style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = n <= value;
        return (
          <button key={n} type="button"
            aria-label={`${n} of 5 stars`}
            onClick={interactive ? () => onChange(n === value ? 0 : n) : undefined}
            disabled={!interactive}
            style={{
              border: 'none', background: 'transparent', padding: 1,
              cursor: interactive ? 'pointer' : 'default',
              lineHeight: 0,
            }}>
            <svg width={size} height={size} viewBox="0 0 24 24"
              fill={filled ? color : 'none'} stroke={color} strokeWidth="1.4"
              strokeLinejoin="round">
              <path d="M 12 2.5 L 14.6 8.6 L 21.5 9.3 L 16.4 14.1 L 17.8 21 L 12 17.5 L 6.2 21 L 7.6 14.1 L 2.5 9.3 L 9.4 8.6 Z"/>
            </svg>
          </button>
        );
      })}
    </div>
  );
}

// Book cover thumbnail, with a magenta placeholder when no photo is present.
function BookCover({ photo, title, small }) {
  const w = small ? 90 : 140;
  const h = small ? 130 : 200;
  if (photo) {
    return (
      <img src={photo} alt={title || ''}
        style={{ width: w, height: h, objectFit: 'cover', borderRadius: 4, boxShadow: '0 2px 8px rgba(31,29,26,0.18)' }}/>
    );
  }
  return (
    <div style={{
      width: w, height: h, borderRadius: 4,
      background: 'linear-gradient(135deg, #9b1844 0%, #6c0d2c 100%)',
      color: '#fbf5e4', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '8px', boxShadow: '0 2px 8px rgba(31,29,26,0.18)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 4, border: '0.5px solid rgba(251,245,228,0.4)', borderRadius: 2, pointerEvents: 'none' }}/>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7" style={{ marginBottom: 6 }}>
        <path d="M4 4v16h12a4 4 0 014-4V4H4zM8 4v16M8 12h12"/>
      </svg>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: small ? 10.5 : 13, fontStyle: 'italic', lineHeight: 1.2 }}>
        {(title || 'Untitled').slice(0, 32)}{(title || '').length > 32 ? '…' : ''}
      </div>
    </div>
  );
}

// ─── Trophies (proud work log) ───────────────────────────────
function TrophiesView({ entries, onAdd, onUpdate, onDelete }) {
  const [composing, setComposing] = useState(entries.length === 0);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState({ q: '', month: '', values: [], skills: [] });

  if (composing) {
    return (
      <WorkForm
        onCancel={entries.length > 0 ? () => setComposing(false) : null}
        onSave={(entry) => { onAdd(entry); setComposing(false); }}/>
    );
  }
  if (editingId) {
    const entry = entries.find(e => e.id === editingId);
    if (entry) {
      return (
        <WorkForm
          initial={entry}
          onCancel={() => setEditingId(null)}
          onSave={(patch) => { onUpdate(editingId, patch); setEditingId(null); }}/>
      );
    }
  }

  const months = monthsFromEntries(entries);
  const filtered = sortByDateDesc(applyFilter(entries, filter, ['title', 'description', 'process', 'why']));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 8 }}>Trophies</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
            Work I'm <span style={{ fontStyle: 'italic', color: '#9b1844' }}>proud of.</span>
          </h1>
          <p style={{ fontSize: 14.5, color: '#5f5a52', marginTop: 10, maxWidth: 540, lineHeight: 1.5 }}>
            Log a piece of work that made you proud. Add a photo (and an optional video walking through it). The Compass turns with the values and skills you tag.
          </p>
        </div>
        <Button onClick={() => setComposing(true)}>+ Add a trophy</Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState label="No trophies yet."/>
      ) : (
        <>
          <FilterBar filter={filter} onChange={setFilter} availableMonths={months}/>
          {filtered.length === 0 ? (
            <EmptyState label="No trophies match those filters."/>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {groupEntries(filtered).map(item =>
                item.type === 'heading' ? (
                  <DateHeading key={item.key} label={item.label}/>
                ) : (
                  <TrophyCard key={item.key} entry={item.entry}
                    onEdit={() => setEditingId(item.entry.id)}
                    onDelete={() => onDelete(item.entry.id)}/>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TrophyCard({ entry, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 16, alignItems: 'flex-start' }}>
        {entry.photo ? (
          <img src={entry.photo} alt={entry.title || ''}
            style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 6, boxShadow: '0 2px 8px rgba(31,29,26,0.12)' }}/>
        ) : (
          <div style={{
            width: 120, height: 90, borderRadius: 6,
            background: 'linear-gradient(135deg, #c98508 0%, #8a6d2a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbf5e4',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 4h14v3a4 4 0 01-4 4h-6a4 4 0 01-4-4V4zM12 11v5M9 16h6M8 20h8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c98508', fontWeight: 700, marginBottom: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
            Trophy · {formatDate(entry.date)}
            {entry.video && (
              <span style={{ background: '#fdeecb', color: '#8a6d2a', padding: '2px 8px', borderRadius: 999, fontSize: 9, letterSpacing: '0.08em' }}>
                ▶ Video
              </span>
            )}
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1f1d1a', fontStyle: 'italic', lineHeight: 1.25 }}>
            {entry.title || 'Untitled'}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {(entry.values || []).map(id => VALUE_BY_ID[id] && <ValueTag key={`v-${id}`} value={VALUE_BY_ID[id]} selected size="sm"/>)}
            {(entry.skills || []).map(id => SKILL_BY_ID[id] && <ValueTag key={`s-${id}`} value={SKILL_BY_ID[id]} selected size="sm"/>)}
          </div>
        </div>
        <div className="rj-card-actions" style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setOpen(o => !o)}
            style={{ border: 'none', background: 'transparent', color: '#9b1844', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 10px' }}>
            {open ? 'Less' : 'More'}
          </button>
          <button onClick={onEdit}
            style={{ border: 'none', background: 'transparent', color: '#9b1844', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 10px' }}>
            Edit
          </button>
          <button onClick={onDelete} title="Delete"
            style={{ border: 'none', background: 'transparent', color: '#9b1844', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'inline-flex', alignItems: 'center' }}>
            {Icons.trash}
          </button>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #efe9d9', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {entry.video && (
            <DataVideo src={entry.video}
              style={{ width: '100%', maxHeight: 380, borderRadius: 8, background: '#000' }}/>
          )}
          {entry.description && <DetailRow label="The task"           color="#9b1844" body={entry.description}/>}
          {entry.process     && <DetailRow label="How I made it"     color="#558b3f" body={entry.process}/>}
          {entry.why         && <DetailRow label="Why I'm proud"     color="#c98508" body={entry.why}/>}
        </div>
      )}
    </Card>
  );
}

function WorkForm({ onSave, onCancel, initial }) {
  const editing = !!initial;
  const [date, setDate]               = useState(initial?.date        ?? todayISO());
  const [title, setTitle]             = useState(initial?.title       ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [process, setProcess]         = useState(initial?.process     ?? '');
  const [why, setWhy]                 = useState(initial?.why         ?? '');
  const [photo, setPhoto]             = useState(initial?.photo       ?? null);
  const [video, setVideo]             = useState(initial?.video       ?? null);
  const [values, setValues]           = useState(initial?.values      ?? []);
  const [skills, setSkills]           = useState(initial?.skills      ?? []);

  // Photo is required to save (per the brief).
  const canSave = title.trim().length > 0 && !!photo;
  const save = () => {
    if (!canSave) return;
    onSave({
      kind: 'work', date,
      title: title.trim(),
      description: description.trim(),
      process: process.trim(),
      why: why.trim(),
      photo, video,
      values, skills,
    });
  };

  return (
    <FormShell
      eyebrow={editing ? 'Edit Trophy' : 'New Trophy'}
      title={editing
        ? <>Edit this <span style={{ fontStyle: 'italic', color: '#9b1844' }}>trophy.</span></>
        : <>Work I'm <span style={{ fontStyle: 'italic', color: '#9b1844' }}>proud of.</span></>}
      onCancel={onCancel}
      onSave={save}
      canSave={canSave}>
      <Field label="Title"><TextInput value={title} onChange={setTitle} placeholder="e.g. My DT bridge model"/></Field>

      <Field label="Date"><TextInput type="date" value={date} onChange={setDate}/></Field>

      <Field label="The task" hint="What were you asked to do?">
        <TextArea value={description} onChange={setDescription} rows={4}/>
      </Field>

      <Field label="How I put it together" hint="Walk through your learning process — the steps, the choices, the help you got.">
        <TextArea value={process} onChange={setProcess} rows={6}/>
      </Field>

      <Field label="Why I'm proud of it" hint="What did this teach you, or what changed in you because of it?">
        <TextArea value={why} onChange={setWhy} rows={5}/>
      </Field>

      <Field label="Photo of the work" hint="Required — a photo of the finished thing.">
        <PhotoUpload value={photo} onChange={setPhoto}/>
      </Field>

      <Field label="Walkthrough video (optional)" hint="A short clip explaining your answers to the prompts above. Small clips work best (the journal stores them in your browser).">
        <VideoUpload value={video} onChange={setVideo}/>
      </Field>

      <Field label="Values this shows">
        <ValuePicker selected={values} onChange={setValues}/>
      </Field>

      <Field label="Skills this shows">
        <ValuePicker selected={skills} onChange={setSkills} items={SKILLS}/>
      </Field>
    </FormShell>
  );
}

// Video upload + preview. Stores the video as a dataURL (same pattern as
// PhotoUpload). For the prototype we cap the size at ~5MB so the journal
// doesn't blow past localStorage's quota; larger clips will need a backend.
function VideoUpload({ value, onChange }) {
  const inputRef = React.useRef(null);
  const [error, setError] = useState(null);
  const onFile = (file) => {
    if (!file) return;
    setError(null);
    // Browser localStorage caps at ~5MB total per origin (less on iOS), and
    // a single video at 2MB encodes to ~2.7MB base64, leaving room for
    // photos and other entries. Bigger than this needs a backend.
    const cap = 2 * 1024 * 1024; // 2MB
    if (file.size > cap) {
      setError(`That video is ${(file.size / 1024 / 1024).toFixed(1)}MB. The browser can store clips up to about ${(cap / 1024 / 1024).toFixed(0)}MB — try a shorter clip or a lower-quality setting.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  if (value) {
    return (
      <div>
        <DataVideo src={value}
          style={{ width: '100%', maxHeight: 320, borderRadius: 10, background: '#000', display: 'block' }}/>
        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => onChange(null)}
            style={{
              border: '1.5px solid #9b1844', background: '#fff', color: '#9b1844',
              padding: '8px 14px', borderRadius: 999, fontFamily: 'inherit',
              fontWeight: 700, fontSize: 12, letterSpacing: '0.08em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}>
            Remove video
          </button>
          <button type="button" onClick={() => inputRef.current?.click()}
            style={{
              border: '1.5px solid #e3dcc8', background: '#fff', color: '#5f5a52',
              padding: '8px 14px', borderRadius: 999, fontFamily: 'inherit',
              fontWeight: 700, fontSize: 12, letterSpacing: '0.08em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}>
            Replace
          </button>
        </div>
        <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/*" style={{ display: 'none' }}
          onChange={(e) => onFile(e.target.files?.[0])}/>
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={() => inputRef.current?.click()}
        style={{
          width: '100%', padding: '24px 16px',
          border: '1.5px dashed #c9a74a', borderRadius: 10,
          background: 'rgba(253,238,203,0.4)', color: '#8a6d2a',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 8, cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background .12s',
        }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="14" height="12" rx="2"/>
          <path d="M17 10l4-3v10l-4-3"/>
        </svg>
        <span style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
          Add a walkthrough video
        </span>
        <span style={{ fontSize: 11, fontStyle: 'italic', color: '#7c7c7c', textAlign: 'center', maxWidth: 320 }}>
          MP4 plays everywhere. iPhone .MOV files mostly do too — if a clip won't play, re-record in your camera's "Most Compatible" setting.
        </span>
      </button>
      {error && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#9b1844', fontStyle: 'italic' }}>{error}</div>
      )}
      <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/*" style={{ display: 'none' }}
        onChange={(e) => onFile(e.target.files?.[0])}/>
    </div>
  );
}

// <video> wrapper that plays reliably across browsers. Converts dataURL
// sources to a Blob URL — Safari has known issues streaming `<video>` from
// `data:` URLs, especially when seeking. Adds `playsInline` so iOS can play
// inline rather than forcing fullscreen.
function DataVideo({ src, style }) {
  const [resolvedSrc, setResolvedSrc] = useState(null);
  useEffect(() => {
    if (!src) { setResolvedSrc(null); return; }
    if (!src.startsWith('data:')) {
      setResolvedSrc(src);
      return;
    }
    let revoked = false;
    let urlToRevoke = null;
    fetch(src)
      .then(r => r.blob())
      .then(blob => {
        if (revoked) return;
        urlToRevoke = URL.createObjectURL(blob);
        setResolvedSrc(urlToRevoke);
      })
      .catch(() => setResolvedSrc(src)); // fall back to the data URL itself
    return () => {
      revoked = true;
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [src]);

  if (!resolvedSrc) {
    return <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Loading video…</div>;
  }
  return (
    <video
      key={resolvedSrc}
      src={resolvedSrc}
      controls
      playsInline
      preload="metadata"
      style={style}/>
  );
}

// ─── Scrapbook ───────────────────────────────────────────────
// Photos from all reflections, presented as a tilted collage.
function ScrapbookView({ state }) {
  const items = useMemo(() => {
    const rows = [];
    state.weekly.forEach(e => {
      if (e.photo) rows.push({
        id: e.id, photo: e.photo, caption: e.caption, date: e.date,
        title: e.moment, values: e.values || [], kind: 'Weekly',
      });
    });
    state.tutorial.forEach(e => {
      if (e.photo) rows.push({
        id: e.id, photo: e.photo, caption: e.caption, date: e.date,
        title: e.title, values: e.values || [], kind: 'Tutorial',
      });
    });
    (state.books || []).forEach(e => {
      if (e.photo) rows.push({
        id: e.id, photo: e.photo,
        caption: e.author ? `by ${e.author}` : '',
        date: e.date,
        title: e.title, values: [], kind: 'Book',
      });
    });
    (state.works || []).forEach(e => {
      if (e.photo) rows.push({
        id: e.id, photo: e.photo,
        caption: '',
        date: e.date,
        title: e.title, values: e.values || [], kind: 'Trophy',
      });
    });
    return rows.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [state]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 10 }}>Relics</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
          Treasures <span style={{ fontStyle: 'italic', color: '#9b1844' }}>from the voyage.</span>
        </h1>
        <p style={{ fontSize: 15, color: '#5f5a52', marginTop: 12, maxWidth: 560, lineHeight: 1.5 }}>
          Photos you've gathered along the way — pinned up together.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState label="No relics yet. Add a photo to a reflection or long tutorial and it'll appear here."/>
      ) : (
        <ScrapbookCollage items={items}/>
      )}
    </div>
  );
}

// Deterministic pseudo-hash so each photo's tilt + tape colour stay stable across renders.
function strHash(s) {
  let h = 2166136261;
  for (let i = 0; i < (s || '').length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function ScrapbookCollage({ items }) {
  const TAPE_COLORS = ['rgba(254,244,168,0.9)', 'rgba(249,208,229,0.9)', 'rgba(210,238,250,0.9)', 'rgba(253,229,208,0.9)'];
  return (
    <div style={{
      columnWidth: 240, columnGap: 28, padding: '10px 6px 40px',
    }}>
      {items.map(it => {
        const h = strHash(it.id);
        const rotate = ((h % 11) - 5) * 0.6;               // −3° to +3° in 0.6° steps
        const tape  = TAPE_COLORS[h % TAPE_COLORS.length];
        const tapeRot = ((h >> 3) % 9) - 4;
        return (
          <div key={it.id}
            style={{
              display: 'inline-block', width: '100%', marginBottom: 28,
              background: '#fff', padding: 10, paddingBottom: 12,
              boxShadow: '0 2px 4px rgba(31,29,26,0.08), 0 10px 24px rgba(31,29,26,0.08)',
              transform: `rotate(${rotate}deg)`,
              breakInside: 'avoid', WebkitColumnBreakInside: 'avoid',
              position: 'relative',
            }}>
            {/* Tape strip */}
            <div aria-hidden style={{
              position: 'absolute', top: -10, left: '50%',
              transform: `translateX(-50%) rotate(${tapeRot}deg)`,
              width: 76, height: 20, background: tape,
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              borderLeft: '1px dashed rgba(0,0,0,0.1)',
              borderRight: '1px dashed rgba(0,0,0,0.1)',
            }}/>
            <img src={it.photo} alt={it.caption || it.title || ''}
              style={{ display: 'block', width: '100%', borderRadius: 2 }}/>
            {(it.caption || it.title) && (
              <div style={{
                marginTop: 10, padding: '0 4px',
                fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
                fontSize: 14.5, color: '#1f1d1a', lineHeight: 1.35,
              }}>
                {it.caption || it.title}
              </div>
            )}
            <div style={{ marginTop: 8, padding: '0 4px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700 }}>
                {it.kind} · {formatDate(it.date)}
              </span>
            </div>
            {it.values.length > 0 && (
              <div style={{ marginTop: 6, padding: '0 4px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {it.values.map(id => VALUE_BY_ID[id] && (
                  <span key={id} style={{
                    fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
                    background: VALUE_BY_ID[id].tint, color: VALUE_BY_ID[id].color,
                    fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    {VALUE_BY_ID[id].label}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Book view ───────────────────────────────────────────────
// Reads all reflections as a chronological bound book, one page-spread
// at a time. Left page = context (date, kind, values, optional photo).
// Right page = body. ← / → navigates.
function BookView({ state }) {
  const entries = useMemo(() => {
    const all = [
      ...state.weekly.map(e => ({ ...e, _kind: 'weekly' })),
      ...state.tutorial.map(e => ({ ...e, _kind: 'tutorial' })),
      ...(state.books || []).map(e => ({ ...e, _kind: 'book' })),
      ...(state.works || []).map(e => ({ ...e, _kind: 'work' })),
    ];
    // Newest first — page 1 is the most recent entry; flip back to revisit older ones.
    return all.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [state]);
  const total = entries.length;
  const [index, setIndex] = useState(0);
  const clampedIndex = Math.min(index, Math.max(0, total - 1));
  const entry = entries[clampedIndex];

  useEffect(() => {
    const onKey = (e) => {
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === 'ArrowLeft'  && clampedIndex > 0)         setIndex(clampedIndex - 1);
      if (e.key === 'ArrowRight' && clampedIndex < total - 1) setIndex(clampedIndex + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clampedIndex, total]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 10 }}>The Saga</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
          Your voyage, <span style={{ fontStyle: 'italic', color: '#9b1844' }}>bound.</span>
        </h1>
        <p style={{ fontSize: 15, color: '#5f5a52', marginTop: 12, maxWidth: 600, lineHeight: 1.5 }}>
          Every reflection, long tutorial, book, and trophy in order, page by page. Use the arrow keys or the buttons to turn the page.
        </p>
      </div>

      {total === 0 ? (
        <EmptyState label="No chapters in your saga yet."/>
      ) : (
        <>
          <ExportControls entries={entries} state={state}/>
          <BookSpread entry={entry}/>
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Button variant="outline" onClick={() => setIndex(Math.max(0, clampedIndex - 1))} disabled={clampedIndex === 0}>← Previous</Button>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              Page {clampedIndex + 1} of {total}
            </div>
            <Button variant="outline" onClick={() => setIndex(Math.min(total - 1, clampedIndex + 1))} disabled={clampedIndex === total - 1}>Next →</Button>
          </div>
        </>
      )}
    </div>
  );
}

// Saga export controls. Two modes:
//   - Full: every entry, with a generic cover.
//   - Since last tutorial: only entries written AFTER the most recent
//     long-tutorial entry's date — exactly what the pupil + tutor need
//     at the next meeting.
function ExportControls({ entries, state }) {
  const [printMode, setPrintMode] = useState('all');
  const [printPending, setPrintPending] = useState(false);

  const lastTutorial = useMemo(() => {
    return [...(state.tutorial || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];
  }, [state.tutorial]);
  const sinceDate = lastTutorial?.date || null;

  const filteredEntries = useMemo(() => {
    if (printMode !== 'sinceLast' || !sinceDate) return entries;
    return entries.filter(e => (e.date || '') > sinceDate);
  }, [entries, printMode, sinceDate]);

  // Trigger window.print after the DOM has actually rendered the new mode
  useEffect(() => {
    if (!printPending) return;
    const id = requestAnimationFrame(() => {
      window.print();
      setPrintPending(false);
    });
    return () => cancelAnimationFrame(id);
  }, [printPending, printMode]);

  const exportAll = () => { setPrintMode('all'); setPrintPending(true); };
  const exportSinceLast = () => { setPrintMode('sinceLast'); setPrintPending(true); };

  return (
    <>
      <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        {sinceDate && (
          <Button variant="outline" onClick={exportSinceLast}>
            Export since last long tutorial
          </Button>
        )}
        <Button variant="outline" onClick={exportAll}>Export all to PDF</Button>
      </div>
      <BookPrintable
        entries={filteredEntries}
        sinceLabel={printMode === 'sinceLast' ? `Since last long tutorial · ${formatDate(sinceDate)}` : null}/>
    </>
  );
}

// ─── Printable book layout (visible only via @media print) ───
function BookPrintable({ entries, sinceLabel }) {
  return (
    <div className="rj-print">
      <div className="rj-print-page rj-print-cover">
        <div style={{ textAlign: 'center' }}>
          <img src="assets/logo-odyssey.png" alt="The Haileybury Odyssey" className="rj-print-hero"/>
          <div className="rj-print-byline">
            {sinceLabel || 'A Reflective Journal · Reflections, bound.'}
          </div>
        </div>
      </div>
      {entries.map(e => (
        <div key={e.id} className="rj-print-page">
          <PrintEntry entry={e}/>
        </div>
      ))}
    </div>
  );
}

function PrintEntry({ entry }) {
  const isTutorial = entry._kind === 'tutorial';
  const isBook     = entry._kind === 'book';
  const isWork     = entry._kind === 'work';

  if (isWork) {
    return (
      <div className="rj-print-entry">
        <div className="rj-print-meta" style={{ color: '#c98508' }}>
          Trophy · {formatDate(entry.date)}
        </div>
        <h2 className="rj-print-h">{entry.title || 'Untitled'}</h2>
        {(entry.values?.length > 0 || entry.skills?.length > 0) && (
          <div className="rj-print-values">
            {(entry.values || []).map(id => VALUE_BY_ID[id] && (
              <span key={`v-${id}`} className="rj-print-tag" style={{ borderColor: VALUE_BY_ID[id].color, color: VALUE_BY_ID[id].color }}>
                {VALUE_BY_ID[id].label}
              </span>
            ))}
            {(entry.skills || []).map(id => SKILL_BY_ID[id] && (
              <span key={`s-${id}`} className="rj-print-tag" style={{ borderColor: SKILL_BY_ID[id].color, color: SKILL_BY_ID[id].color }}>
                {SKILL_BY_ID[id].label}
              </span>
            ))}
          </div>
        )}
        {entry.photo && (
          <figure className="rj-print-figure">
            <img src={entry.photo} alt=""/>
          </figure>
        )}
        {entry.description && <PrintSection label="The task"           body={entry.description}/>}
        {entry.process     && <PrintSection label="How I made it"     body={entry.process}/>}
        {entry.why         && <PrintSection label="Why I'm proud"     body={entry.why}/>}
        {entry.video && (
          <div style={{ marginTop: '5mm', fontSize: '10pt', fontStyle: 'italic', color: '#7c7c7c' }}>
            (A walkthrough video accompanies this entry in the digital journal.)
          </div>
        )}
      </div>
    );
  }

  if (isBook) {
    return (
      <div className="rj-print-entry">
        <div className="rj-print-meta" style={{ color: '#558b3f' }}>
          Book · {formatDate(entry.date)}
        </div>
        <h2 className="rj-print-h" style={{ fontStyle: 'italic' }}>{entry.title || 'Untitled'}</h2>
        {entry.author && <div style={{ fontStyle: 'italic', fontSize: '12pt', color: '#5f5a52', marginBottom: '4mm' }}>by {entry.author}</div>}
        {entry.rating > 0 && (
          <div style={{ fontSize: '11pt', color: '#c98508', marginBottom: '5mm', letterSpacing: '0.06em' }}>
            {'★'.repeat(entry.rating)}{'☆'.repeat(5 - entry.rating)}{'  '}
            <span style={{ color: '#7c7c7c' }}>{entry.rating} / 5</span>
          </div>
        )}
        {entry.photo && (
          <figure className="rj-print-figure" style={{ textAlign: 'center' }}>
            <img src={entry.photo} alt="" style={{ maxHeight: '90mm', width: 'auto', margin: '0 auto' }}/>
          </figure>
        )}
        {entry.review && <PrintSection label="Review" body={entry.review}/>}
      </div>
    );
  }

  return (
    <div className="rj-print-entry">
      <div className="rj-print-meta">
        {isTutorial ? 'Long Tutorial' : 'Reflection'} · {formatDate(entry.date)}
        {entry.term ? ` · ${entry.term}` : ''}
      </div>
      <h2 className="rj-print-h">{entry.title || entry.moment || 'Untitled'}</h2>

      {entry.values?.length > 0 && (
        <div className="rj-print-values">
          {entry.values.map(id => VALUE_BY_ID[id] && (
            <span key={id} className="rj-print-tag" style={{ borderColor: VALUE_BY_ID[id].color, color: VALUE_BY_ID[id].color }}>
              {VALUE_BY_ID[id].label}
            </span>
          ))}
        </div>
      )}
      {entry.skills?.length > 0 && (
        <div className="rj-print-values">
          {entry.skills.map(id => SKILL_BY_ID[id] && (
            <span key={id} className="rj-print-tag" style={{ borderColor: SKILL_BY_ID[id].color, color: SKILL_BY_ID[id].color }}>
              {SKILL_BY_ID[id].label}
            </span>
          ))}
        </div>
      )}

      {entry.photo && (
        <figure className="rj-print-figure">
          <img src={entry.photo} alt=""/>
          {entry.caption && <figcaption>{entry.caption}</figcaption>}
        </figure>
      )}

      {isTutorial ? (
        <>
          {entry.story       && <PrintSection label="What happened"           body={entry.story}/>}
          {entry.shift       && <PrintSection label="What shifted in me"      body={entry.shift}/>}
          {entry.wentWell    && <PrintSection label="What went well"          body={entry.wentWell}/>}
          {entry.differently && <PrintSection label="What I'd do differently" body={entry.differently}/>}
          {entry.discuss     && <PrintSection label="To discuss with tutor"   body={entry.discuss}/>}
          {(entry.yellowTickets > 0 || entry.blueTickets > 0) && (
            <div className="rj-print-tickets">
              {entry.yellowTickets > 0 && <span>Yellow tickets: <b>{entry.yellowTickets}</b></span>}
              {entry.blueTickets   > 0 && <span>Blue tickets: <b>{entry.blueTickets}</b></span>}
            </div>
          )}
        </>
      ) : (
        <>
          {entry.moment && <PrintSection label="This week"        body={entry.moment}/>}
          {entry.proud  && <PrintSection label="I'm proud of"     body={entry.proud}/>}
          {entry.tricky && <PrintSection label="Something tricky" body={entry.tricky}/>}
          {entry.mood   && <div className="rj-print-mood">Mood this week: <b>{entry.mood}</b></div>}
        </>
      )}
    </div>
  );
}

function PrintSection({ label, body }) {
  return (
    <div className="rj-print-section">
      <div className="rj-print-section-label">{label}</div>
      <div className="rj-print-section-body">{body}</div>
    </div>
  );
}

function BookSpread({ entry }) {
  const isTutorial = entry._kind === 'tutorial';
  const isBook     = entry._kind === 'book';
  const isWork     = entry._kind === 'work';
  const pageBg = 'linear-gradient(180deg, #fdf6e3 0%, #f7f0d8 100%)';

  if (isWork) {
    return (
      <div className="rj-spread" style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 16px minmax(0, 1fr)',
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(31,29,26,0.12), 0 2px 4px rgba(31,29,26,0.05)',
        background: '#c98508',
      }}>
        {/* Left page — photo + title + values/skills */}
        <div className="rj-page-left" style={{
          background: pageBg, padding: '36px 34px 36px 38px',
          minHeight: 520, borderRight: '1px solid rgba(155,24,68,0.08)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#c98508', fontWeight: 700 }}>
            Trophy · {formatDate(entry.date)}
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: '#1f1d1a', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
            {entry.title || 'Untitled'}
          </div>
          {entry.photo && (
            <img src={entry.photo} alt=""
              style={{ width: '100%', borderRadius: 6, boxShadow: '0 2px 8px rgba(31,29,26,0.1)', aspectRatio: '4/3', objectFit: 'cover' }}/>
          )}
          {entry.video && (
            <DataVideo src={entry.video}
              style={{ width: '100%', borderRadius: 6, background: '#000', maxHeight: 240 }}/>
          )}
          {(entry.values?.length > 0 || entry.skills?.length > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(entry.values || []).map(id => VALUE_BY_ID[id] && <ValueTag key={`v-${id}`} value={VALUE_BY_ID[id]} selected size="sm"/>)}
              {(entry.skills || []).map(id => SKILL_BY_ID[id] && <ValueTag key={`s-${id}`} value={SKILL_BY_ID[id]} selected size="sm"/>)}
            </div>
          )}
        </div>

        {/* Spine */}
        <div className="rj-spine" style={{
          background: 'linear-gradient(90deg, rgba(31,29,26,0.22), rgba(31,29,26,0.05) 30%, rgba(31,29,26,0.05) 70%, rgba(31,29,26,0.22))',
        }}/>

        {/* Right page — task / process / why */}
        <div className="rj-page-right" style={{
          background: pageBg, padding: '36px 38px 36px 34px',
          minHeight: 520, display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          {entry.description && <BookSection label="The task"           color="#9b1844" body={entry.description}/>}
          {entry.process     && <BookSection label="How I made it"     color="#558b3f" body={entry.process}/>}
          {entry.why         && <BookSection label="Why I'm proud"     color="#c98508" body={entry.why}/>}
        </div>
      </div>
    );
  }

  if (isBook) {
    return (
      <div className="rj-spread" style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 16px minmax(0, 1fr)',
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(31,29,26,0.12), 0 2px 4px rgba(31,29,26,0.05)',
        background: '#c98508',
      }}>
        {/* Left page — cover, title, author, stars, date */}
        <div className="rj-page-left" style={{
          background: pageBg, padding: '36px 34px 36px 38px',
          minHeight: 520, borderRight: '1px solid rgba(155,24,68,0.08)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center', gap: 18,
        }}>
          <div style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#558b3f', fontWeight: 700 }}>
            Book · {formatDate(entry.date)}
          </div>
          <BookCover photo={entry.photo} title={entry.title}/>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#1f1d1a', lineHeight: 1.15, fontStyle: 'italic' }}>
              {entry.title || 'Untitled'}
            </div>
            {entry.author && (
              <div style={{ fontSize: 13.5, color: '#5f5a52', fontStyle: 'italic', marginTop: 4 }}>by {entry.author}</div>
            )}
          </div>
          {entry.rating > 0 && <StarRating value={entry.rating} size={22}/>}
        </div>

        {/* Spine */}
        <div className="rj-spine" style={{
          background: 'linear-gradient(90deg, rgba(31,29,26,0.22), rgba(31,29,26,0.05) 30%, rgba(31,29,26,0.05) 70%, rgba(31,29,26,0.22))',
        }}/>

        {/* Right page — review */}
        <div className="rj-page-right" style={{
          background: pageBg, padding: '36px 38px 36px 34px',
          minHeight: 520,
        }}>
          <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#558b3f', fontWeight: 700, marginBottom: 8 }}>
            Review
          </div>
          {entry.review ? (
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: '#1f1d1a', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
              {entry.review}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: '#7c7c7c', fontStyle: 'italic' }}>(No review written.)</div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div style={{
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 16px minmax(0, 1fr)',
      borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(31,29,26,0.12), 0 2px 4px rgba(31,29,26,0.05)',
      background: '#c98508',
    }}>
      {/* Left page */}
      <div className="rj-page-left" style={{
        background: pageBg, padding: '36px 34px 36px 38px',
        minHeight: 520,
        borderRight: '1px solid rgba(155,24,68,0.08)',
      }}>
        <div style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 8 }}>
          {isTutorial ? 'Long Tutorial' : 'Reflection'} · {formatDate(entry.date)}
          {entry.term ? ` · ${entry.term}` : ''}
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: '#1f1d1a', lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: 18 }}>
          {entry.title || entry.moment || 'Untitled'}
        </div>

        {entry.photo && (
          <img src={entry.photo} alt=""
            style={{ width: '100%', borderRadius: 6, boxShadow: '0 2px 8px rgba(31,29,26,0.1)', marginBottom: 12, aspectRatio: '4/3', objectFit: 'cover' }}/>
        )}
        {entry.caption && (
          <div style={{ fontSize: 13, fontStyle: 'italic', color: '#5f5a52', textAlign: 'center', marginBottom: 16 }}>{entry.caption}</div>
        )}

        {entry.values?.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, marginBottom: 8 }}>Values</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {entry.values.map(id => VALUE_BY_ID[id] && <ValueTag key={id} value={VALUE_BY_ID[id]} selected size="sm"/>)}
            </div>
          </div>
        )}
        {entry.skills?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, marginBottom: 8 }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {entry.skills.map(id => SKILL_BY_ID[id] && <ValueTag key={id} value={SKILL_BY_ID[id]} selected size="sm"/>)}
            </div>
          </div>
        )}

        {isTutorial && (entry.yellowTickets > 0 || entry.blueTickets > 0) && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {entry.yellowTickets > 0 && <span style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#fdeecb', color: '#c98508' }}>{entry.yellowTickets} yellow</span>}
            {entry.blueTickets   > 0 && <span style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#d4d5e5', color: '#2a2b7c' }}>{entry.blueTickets} blue</span>}
          </div>
        )}

        {entry.mood && (
          <div>
            <div style={{ fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, marginBottom: 6 }}>Mood</div>
            <span style={{ padding: '5px 12px', borderRadius: 999, border: '1.5px solid #ec6608', background: '#fde5d0', color: '#ec6608', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{entry.mood}</span>
          </div>
        )}
      </div>

      {/* Spine */}
      <div className="rj-spine" style={{
        background: 'linear-gradient(90deg, rgba(31,29,26,0.22), rgba(31,29,26,0.05) 30%, rgba(31,29,26,0.05) 70%, rgba(31,29,26,0.22))',
      }}/>

      {/* Right page */}
      <div className="rj-page-right" style={{
        background: pageBg, padding: '36px 38px 36px 34px',
        minHeight: 520, display: 'flex', flexDirection: 'column', gap: 18,
      }}>
        {isTutorial ? (
          <>
            {entry.story       && <BookSection label="What happened"           body={entry.story}/>}
            {entry.shift       && <BookSection label="What shifted in me"      body={entry.shift}/>}
            {entry.wentWell    && <BookSection label="What went well"          body={entry.wentWell}/>}
            {entry.differently && <BookSection label="What I'd do differently" body={entry.differently}/>}
            {entry.discuss     && <BookSection label="To discuss with tutor"   body={entry.discuss}/>}
          </>
        ) : (
          <>
            {entry.moment && <BookSection label="This week"       body={entry.moment}/>}
            {entry.proud  && <BookSection label="I'm proud of"    body={entry.proud}  color="#ec6608"/>}
            {entry.tricky && <BookSection label="Something tricky" body={entry.tricky} color="#009fe3"/>}
          </>
        )}
      </div>
    </div>
  );
}

function BookSection({ label, body, color = '#9b1844' }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: '#1f1d1a', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{body}</div>
    </div>
  );
}

Object.assign(window, { App });

// Reflective Journal — KS3 interactive app.
// Views: Profile (dashboard), Weekly reflections, Long Tutorial reflections.
// State persists to localStorage.

const { useState, useEffect, useMemo } = React;

// ─── Storage ──────────────────────────────────────────────────
const STORAGE_KEY = 'haileybury-journal-v1';
const EMPTY = { pupil: { name: '', year: '', house: '', tutor: '' }, weekly: [], tutorial: [] };

function useJournal() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...EMPTY, ...JSON.parse(raw) };
    } catch {}
    return EMPTY;
  });
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);
  return [state, setState];
}

const newId = () => (crypto?.randomUUID?.() ?? String(Date.now() + Math.random()));

// ─── App shell ────────────────────────────────────────────────
function App() {
  const [state, setState] = useJournal();
  const [view, setView] = useState('profile');

  const patch = (fn) => setState(fn);
  const addWeekly   = (e) => patch(s => ({ ...s, weekly:   [{ ...e, id: newId() }, ...s.weekly] }));
  const addTutorial = (e) => patch(s => ({ ...s, tutorial: [{ ...e, id: newId() }, ...s.tutorial] }));
  const removeEntry = (kind, id) => patch(s => ({ ...s, [kind]: s[kind].filter(x => x.id !== id) }));
  const setPupil    = (p) => patch(s => ({ ...s, pupil: { ...s.pupil, ...p } }));

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f3ea',
      color: '#1f1d1a',
      fontFamily: "'Calluna Sans', 'Lato', system-ui, sans-serif",
    }}>
      <NavBar view={view} onNav={setView} pupil={state.pupil}/>
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>
        {view === 'profile'  && <ProfileView state={state} onNav={setView} onUpdatePupil={setPupil}/>}
        {view === 'weekly'   && <WeeklyView   entries={state.weekly}   onAdd={addWeekly}   onDelete={(id) => removeEntry('weekly', id)}/>}
        {view === 'tutorial' && <TutorialView entries={state.tutorial} onAdd={addTutorial} onDelete={(id) => removeEntry('tutorial', id)}/>}
      </main>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────
function NavBar({ view, onNav, pupil }) {
  const tabs = [
    { id: 'profile',  label: 'Profile' },
    { id: 'weekly',   label: 'Weekly Reflections' },
    { id: 'tutorial', label: 'Long Tutorial Reflections' },
  ];
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: '#9b1844', color: '#fff',
      borderBottom: '3px solid #ec6608',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>
            The Reflective <span style={{ fontStyle: 'italic' }}>Journal</span>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 4, marginLeft: 'auto', flexWrap: 'wrap' }}>
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
  const totalWeekly = weekly.length;
  const totalTutorial = tutorial.length;
  const yellowTotal = tutorial.reduce((n, e) => n + (e.yellowTickets || 0), 0);
  const blueTotal   = tutorial.reduce((n, e) => n + (e.blueTickets   || 0), 0);

  // Value counts across all entries
  const valueCounts = useMemo(() => {
    const counts = Object.fromEntries(VALUES.map(v => [v.id, 0]));
    [...weekly, ...tutorial].forEach(e => (e.values || []).forEach(id => { if (counts[id] != null) counts[id] += 1; }));
    return counts;
  }, [weekly, tutorial]);
  const maxCount = Math.max(1, ...Object.values(valueCounts));
  const topValueId = Object.entries(valueCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topValue = topValueId && valueCounts[topValueId] > 0 ? VALUE_BY_ID[topValueId] : null;

  // Auto-summary paragraph (rule-based — real LLM summary is a future backend job)
  const summary = useMemo(() => {
    const name = pupil.name ? pupil.name.split(' ')[0] : 'You';
    if (totalWeekly + totalTutorial === 0) return `${name} hasn't logged any reflections yet. Tap "New weekly reflection" to start.`;
    const bits = [];
    bits.push(`${name} has logged ${totalWeekly} weekly reflection${totalWeekly === 1 ? '' : 's'} and ${totalTutorial} long tutorial reflection${totalTutorial === 1 ? '' : 's'} so far.`);
    if (topValue && valueCounts[topValueId] >= 2) {
      bits.push(`The value showing up most often is ${topValue.label.toLowerCase()} — in ${valueCounts[topValueId]} entries.`);
    }
    if (yellowTotal + blueTotal > 0) {
      bits.push(`Tickets logged this year: ${yellowTotal} yellow, ${blueTotal} blue.`);
    }
    const mostRecent = [...weekly, ...tutorial].sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];
    if (mostRecent) {
      const title = mostRecent.title || mostRecent.moment || mostRecent.story || '';
      if (title) bits.push(`Most recent reflection: "${title.slice(0, 90)}${title.length > 90 ? '…' : ''}"`);
    }
    return bits.join(' ');
  }, [pupil, weekly, tutorial, valueCounts, topValueId, topValue, yellowTotal, blueTotal, totalWeekly, totalTutorial]);

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 10 }}>Profile</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {pupil.name ? `Hello, ${pupil.name.split(' ')[0]}.` : <>Your <span style={{ fontStyle: 'italic', color: '#9b1844' }}>reflection profile</span>.</>}
        </h1>
        <p style={{ fontSize: 16, color: '#5f5a52', marginTop: 12, maxWidth: 620, lineHeight: 1.55 }}>
          {summary}
        </p>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
        <Button onClick={() => onNav('weekly')}>+ New weekly reflection</Button>
        <Button variant="outline" onClick={() => onNav('tutorial')}>+ Prep for tutorial</Button>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard label="Weekly reflections"   value={totalWeekly}   accent="#9b1844"/>
        <StatCard label="Tutorial reflections" value={totalTutorial} accent="#9b1844"/>
        <StatCard label="Yellow tickets"       value={yellowTotal}   accent="#e8a935"/>
        <StatCard label="Blue tickets"         value={blueTotal}     accent="#2a2b7c"/>
      </div>

      {/* Values chart */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 6 }}>Values across the year</div>
        <div style={{ fontSize: 13, color: '#7c7c7c', fontStyle: 'italic', marginBottom: 20 }}>Which values are you paying most attention to? Tag them as you reflect and they'll show up here.</div>
        <ValuesChart counts={valueCounts} max={maxCount}/>
      </Card>

      {/* Pupil info editor */}
      <Card>
        <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 16 }}>About me</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <Field label="Name"><TextInput value={pupil.name}  onChange={(v) => onUpdatePupil({ name: v })}  placeholder="Your name"/></Field>
          <Field label="Year"><TextInput value={pupil.year}  onChange={(v) => onUpdatePupil({ year: v })}  placeholder="e.g. 8"/></Field>
          <Field label="House"><TextInput value={pupil.house} onChange={(v) => onUpdatePupil({ house: v })} placeholder="House name"/></Field>
          <Field label="Tutor"><TextInput value={pupil.tutor} onChange={(v) => onUpdatePupil({ tutor: v })} placeholder="Tutor's name"/></Field>
        </div>
      </Card>
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

function ValuesChart({ counts, max }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {VALUES.map(v => {
        const c = counts[v.id] || 0;
        const pct = max ? (c / max) * 100 : 0;
        return (
          <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 40px', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 999, background: v.color }}/>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{v.label}</span>
            </div>
            <div style={{ position: 'relative', height: 14, background: '#efe9d9', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: 0,
                width: `${pct}%`, background: v.color,
                transition: 'width .3s ease', borderRadius: 999,
              }}/>
            </div>
            <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: v.color, fontVariantNumeric: 'tabular-nums' }}>{c}</div>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { App });

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
      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '40px 24px 80px' }}>
        {view === 'profile'   && <ProfileView   state={state} onNav={setView} onUpdatePupil={setPupil}/>}
        {view === 'weekly'    && <WeeklyView    entries={state.weekly}   onAdd={addWeekly}   onDelete={(id) => removeEntry('weekly', id)}/>}
        {view === 'tutorial'  && <TutorialView  entries={state.tutorial} onAdd={addTutorial} onDelete={(id) => removeEntry('tutorial', id)}/>}
        {view === 'scrapbook' && <ScrapbookView state={state}/>}
        {view === 'book'      && <BookView      state={state}/>}
      </main>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────
function NavBar({ view, onNav, pupil }) {
  const tabs = [
    { id: 'profile',   label: 'Profile' },
    { id: 'weekly',    label: 'Weekly' },
    { id: 'tutorial',  label: 'Tutorial' },
    { id: 'scrapbook', label: 'Scrapbook' },
    { id: 'book',      label: 'Book' },
  ];
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: '#9b1844', color: '#fff',
      borderBottom: '3px solid #ec6608',
    }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
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

// A petal-bloom chart. Five teardrop petals radiate from the centre, each
// value's petal length proportional to how often it has been tagged.
function ValuesChart({ counts, max }) {
  const size = 360;
  const innerR = 38;
  const outerMax = 132;
  const outerMin = 56;
  const halfW = 24;
  const labelR = outerMax + 28;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const petalPath = (outer) => {
    const ctrlA = outer - (outer - innerR) * 0.12;
    const ctrlB = innerR + (outer - innerR) * 0.18;
    return `M 0 ${-outer} C ${halfW} ${-ctrlA} ${halfW} ${-ctrlB} 0 ${-innerR} C ${-halfW} ${-ctrlB} ${-halfW} ${-ctrlA} 0 ${-outer} Z`;
  };

  const petals = VALUES.map((v, i) => {
    const count = counts[v.id] || 0;
    const ratio = max ? count / max : 0;
    const outer = outerMin + (outerMax - outerMin) * ratio;
    const angle = i * 72;
    const labelX = Math.sin(angle * Math.PI / 180) * labelR;
    const labelY = -Math.cos(angle * Math.PI / 180) * labelR;
    return { v, count, outer, angle, labelX, labelY, faded: count === 0 };
  });
  const topCount = Math.max(...petals.map(p => p.count));
  const topPetal = topCount > 0 ? petals.find(p => p.count === topCount) : null;

  return (
    <div>
      <svg viewBox={`0 0 ${size} ${size}`}
        style={{ display: 'block', width: '100%', maxWidth: 460, margin: '0 auto', overflow: 'visible' }}>
        <defs>
          <filter id="petalShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.2"/>
            <feOffset dx="0" dy="1.5"/>
            <feComponentTransfer><feFuncA type="linear" slope="0.22"/></feComponentTransfer>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {VALUES.map(v => (
            <linearGradient key={v.id} id={`petal-${v.id}`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%"   stopColor={v.color} stopOpacity="1"/>
              <stop offset="100%" stopColor={v.color} stopOpacity="0.7"/>
            </linearGradient>
          ))}
          <style>{`
            @keyframes rj-bloom {
              0%   { transform: scale(0.2) rotate(-20deg); opacity: 0; }
              70%  { opacity: 1; }
              100% { transform: scale(1) rotate(0); opacity: 1; }
            }
            .rj-petal { transform-origin: ${size / 2}px ${size / 2}px; animation: rj-bloom .9s cubic-bezier(.2,.8,.3,1.1) backwards; }
            ${petals.map((_, i) => `.rj-petal-${i} { animation-delay: ${i * 90}ms; }`).join('\n')}
          `}</style>
        </defs>

        <g transform={`translate(${size / 2} ${size / 2})`}>
          {/* Soft bloom ring for reference */}
          <circle r={outerMax + 8} fill="none" stroke="#e3dcc8" strokeWidth="0.75" strokeDasharray="2 5"/>

          {/* Petals (and per-petal labels) */}
          {petals.map((p, i) => (
            <g key={p.v.id} className={`rj-petal rj-petal-${i}`}>
              <g transform={`rotate(${p.angle})`} opacity={p.faded ? 0.32 : 1}>
                <path d={petalPath(p.outer)}
                  fill={`url(#petal-${p.v.id})`}
                  stroke={p.v.color} strokeOpacity="0.5" strokeWidth="0.75"
                  filter="url(#petalShadow)"/>
                {/* Inner highlight stroke */}
                <path d={petalPath(p.outer - 6)}
                  fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="1"/>
              </g>
              <g transform={`translate(${p.labelX} ${p.labelY})`}>
                <text textAnchor="middle" dominantBaseline="middle" y={-7}
                  fill={p.v.color} fontSize="10.5" fontWeight="700" letterSpacing="0.16em"
                  style={{ fontFamily: 'inherit' }}>
                  {p.v.label.toUpperCase()}
                </text>
                <text textAnchor="middle" dominantBaseline="middle" y={12}
                  fill={p.faded ? '#bab4a1' : '#1f1d1a'} fontSize="15" fontWeight="700"
                  style={{ fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums' }}>
                  {p.count}
                </text>
              </g>
            </g>
          ))}

          {/* Centre disc */}
          <circle r={innerR} fill="#fff" stroke="#9b1844" strokeWidth="1.25"/>
          {total > 0 ? (
            <g>
              <text textAnchor="middle" dominantBaseline="central" y={-5}
                fill="#1f1d1a" fontSize="28" fontWeight="700"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                {total}
              </text>
              <text textAnchor="middle" dominantBaseline="central" y={17}
                fill="#7c7c7c" fontSize="8.5" fontWeight="700" letterSpacing="0.22em">
                TAGS
              </text>
            </g>
          ) : (
            <text textAnchor="middle" dominantBaseline="central"
              fill="#9b1844" fontSize="9" fontWeight="700" letterSpacing="0.22em">
              BLOOM
            </text>
          )}
        </g>
      </svg>

      {topPetal ? (
        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: '#5f5a52' }}>
          Growing most in{' '}
          <span style={{ color: topPetal.v.color, fontWeight: 700 }}>{topPetal.v.label.toLowerCase()}</span>
          {' — '}{topPetal.count} tag{topPetal.count === 1 ? '' : 's'} this year.
        </div>
      ) : (
        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: '#7c7c7c', fontStyle: 'italic' }}>
          Tag values on your reflections and your bloom will start to grow.
        </div>
      )}
    </div>
  );
}

// ─── Weekly Reflections ───────────────────────────────────────
function WeeklyView({ entries, onAdd, onDelete }) {
  const [composing, setComposing] = useState(entries.length === 0);

  if (composing) {
    return (
      <WeeklyForm
        onCancel={entries.length > 0 ? () => setComposing(false) : null}
        onSave={(entry) => { onAdd(entry); setComposing(false); }}/>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 8 }}>Weekly Reflections</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
            A habit of <span style={{ fontStyle: 'italic', color: '#9b1844' }}>noticing.</span>
          </h1>
          <p style={{ fontSize: 14.5, color: '#5f5a52', marginTop: 10, maxWidth: 540, lineHeight: 1.5 }}>
            Five minutes a week. What happened, what you're proud of, what was tricky. Tag the values that showed up.
          </p>
        </div>
        <Button onClick={() => setComposing(true)}>+ New weekly reflection</Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState label="No weekly reflections yet."/>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {entries.map(e => <WeeklyCard key={e.id} entry={e} onDelete={() => onDelete(e.id)}/>)}
        </div>
      )}
    </div>
  );
}

function WeeklyCard({ entry, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 6 }}>
            Week of {formatDate(entry.weekCommencing || entry.date)}
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1f1d1a', fontStyle: 'italic', lineHeight: 1.3, marginBottom: 10 }}>
            {entry.moment || 'Untitled'}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {(entry.values || []).map(id => VALUE_BY_ID[id] && <ValueTag key={id} value={VALUE_BY_ID[id]} selected size="sm"/>)}
            {entry.mood && (
              <span style={{ padding: '4px 10px', borderRadius: 999, border: '1.5px solid #ec6608', background: '#fde5d0', color: '#ec6608', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {entry.mood}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setOpen(o => !o)}
            style={{ border: 'none', background: 'transparent', color: '#9b1844', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 10px' }}>
            {open ? 'Less' : 'More'}
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

function WeeklyForm({ onSave, onCancel }) {
  const [date, setDate]       = useState(todayISO());
  const [moment, setMoment]   = useState('');
  const [values, setValues]   = useState([]);
  const [photo, setPhoto]     = useState(null);
  const [caption, setCaption] = useState('');
  const [proud, setProud]     = useState('');
  const [tricky, setTricky]   = useState('');
  const [mood, setMood]       = useState('');

  const canSave = moment.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    onSave({
      kind: 'weekly', date, weekCommencing: weekCommencingISO(date),
      moment: moment.trim(), values,
      photo, caption: caption.trim(),
      proud: proud.trim(), tricky: tricky.trim(), mood,
    });
  };

  return (
    <FormShell
      eyebrow="New Weekly Reflection"
      title={<>This week <span style={{ fontStyle: 'italic', color: '#9b1844' }}>in five minutes.</span></>}
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {MOODS.map(w => {
            const selected = mood === w;
            return (
              <button key={w} type="button" onClick={() => setMood(selected ? '' : w)}
                style={{
                  padding: '10px 16px', borderRadius: 8,
                  border: `1.5px solid ${selected ? '#9b1844' : '#e3dcc8'}`,
                  background: selected ? '#9b1844' : '#fff',
                  color: selected ? '#fff' : '#1f1d1a',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                {w}
              </button>
            );
          })}
        </div>
      </Field>
    </FormShell>
  );
}

// ─── Form shell (shared by weekly + tutorial) ─────────────────
function FormShell({ eyebrow, title, onCancel, onSave, canSave, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 8 }}>{eyebrow}</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, margin: 0, lineHeight: 1.05, letterSpacing: '-0.02em' }}>{title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
          <Button onClick={onSave} disabled={!canSave}>Save</Button>
        </div>
      </div>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>{children}</div>
      </Card>
    </div>
  );
}

// ─── Long Tutorial Reflections ────────────────────────────────
function TutorialView({ entries, onAdd, onDelete }) {
  const [composing, setComposing] = useState(entries.length === 0);

  if (composing) {
    return (
      <TutorialForm
        onCancel={entries.length > 0 ? () => setComposing(false) : null}
        onSave={(entry) => { onAdd(entry); setComposing(false); }}/>
    );
  }

  const yellowTotal = entries.reduce((n, e) => n + (e.yellowTickets || 0), 0);
  const blueTotal   = entries.reduce((n, e) => n + (e.blueTickets   || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 8 }}>Long Tutorial Reflections</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
            Before you meet your <span style={{ fontStyle: 'italic', color: '#9b1844' }}>tutor.</span>
          </h1>
          <p style={{ fontSize: 14.5, color: '#5f5a52', marginTop: 10, maxWidth: 540, lineHeight: 1.5 }}>
            A longer reflection to prep for a tutorial. Log your yellow and blue tickets too — they're part of the story.
          </p>
        </div>
        <Button onClick={() => setComposing(true)}>+ New tutorial reflection</Button>
      </div>

      {(yellowTotal + blueTotal) > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <TicketBadge color="#e8a935" tint="#fdeecb" label="Yellow tickets (total)" value={yellowTotal}/>
          <TicketBadge color="#2a2b7c" tint="#d4d5e5" label="Blue tickets (total)"   value={blueTotal}/>
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState label="No tutorial reflections yet."/>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {entries.map(e => <TutorialCard key={e.id} entry={e} onDelete={() => onDelete(e.id)}/>)}
        </div>
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

function TutorialCard({ entry, onDelete }) {
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
            {(entry.values || []).map(id => VALUE_BY_ID[id] && <ValueTag key={id} value={VALUE_BY_ID[id]} selected size="sm"/>)}
          </div>
          {(entry.yellowTickets > 0 || entry.blueTickets > 0) && (
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {entry.yellowTickets > 0 && <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#fdeecb', color: '#c98508' }}>{entry.yellowTickets} yellow</span>}
              {entry.blueTickets   > 0 && <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#d4d5e5', color: '#2a2b7c' }}>{entry.blueTickets} blue</span>}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setOpen(o => !o)}
            style={{ border: 'none', background: 'transparent', color: '#9b1844', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 10px' }}>
            {open ? 'Less' : 'More'}
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

function TutorialForm({ onSave, onCancel }) {
  const [date, setDate]               = useState(todayISO());
  const [term, setTerm]               = useState('Michaelmas');
  const [title, setTitle]             = useState('');
  const [story, setStory]             = useState('');
  const [shift, setShift]             = useState('');
  const [values, setValues]           = useState([]);
  const [photo, setPhoto]             = useState(null);
  const [caption, setCaption]         = useState('');
  const [wentWell, setWentWell]       = useState('');
  const [differently, setDifferently] = useState('');
  const [discuss, setDiscuss]         = useState('');
  const [yellowTickets, setYellow]    = useState(0);
  const [blueTickets, setBlue]        = useState(0);

  const canSave = title.trim().length > 0 && story.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    onSave({
      kind: 'tutorial', date, term,
      title: title.trim(), story: story.trim(), shift: shift.trim(),
      values,
      photo, caption: caption.trim(),
      wentWell: wentWell.trim(), differently: differently.trim(), discuss: discuss.trim(),
      yellowTickets: Number(yellowTickets) || 0, blueTickets: Number(blueTickets) || 0,
    });
  };

  return (
    <FormShell
      eyebrow="New Tutorial Reflection"
      title={<>Prep for your <span style={{ fontStyle: 'italic', color: '#9b1844' }}>tutorial.</span></>}
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

      <Field label="To discuss with my tutor" hint="A question you want to bring into the meeting.">
        <TextArea value={discuss} onChange={setDiscuss} rows={3}/>
      </Field>

      <div>
        <div style={{ fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 4 }}>Tickets this term</div>
        <div style={{ fontSize: 12.5, color: '#7c7c7c', fontStyle: 'italic', marginBottom: 12 }}>How many yellow / blue tickets have you picked up since your last tutorial?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <NumberStepper label="Yellow tickets" value={yellowTickets} onChange={setYellow} color="#c98508"/>
          <NumberStepper label="Blue tickets"   value={blueTickets}   onChange={setBlue}   color="#2a2b7c"/>
        </div>
      </div>
    </FormShell>
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
    return rows.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [state]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 10 }}>Scrapbook</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
          Your year <span style={{ fontStyle: 'italic', color: '#9b1844' }}>in pictures.</span>
        </h1>
        <p style={{ fontSize: 15, color: '#5f5a52', marginTop: 12, maxWidth: 560, lineHeight: 1.5 }}>
          Photos you've added to your reflections, pinned up together.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState label="No photos yet. Add a photo to a reflection and it'll appear here."/>
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
    ];
    return all.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
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
        <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 10 }}>The Book</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
          Your reflections, <span style={{ fontStyle: 'italic', color: '#9b1844' }}>bound.</span>
        </h1>
        <p style={{ fontSize: 15, color: '#5f5a52', marginTop: 12, maxWidth: 600, lineHeight: 1.5 }}>
          Every reflection you've written, in order. Use the arrow keys or the buttons to turn the page.
        </p>
      </div>

      {total === 0 ? (
        <EmptyState label="No reflections in your book yet."/>
      ) : (
        <>
          <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => window.print()}>Export to PDF</Button>
          </div>
          <BookSpread entry={entry}/>
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Button variant="outline" onClick={() => setIndex(Math.max(0, clampedIndex - 1))} disabled={clampedIndex === 0}>← Previous</Button>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              Page {clampedIndex + 1} of {total}
            </div>
            <Button variant="outline" onClick={() => setIndex(Math.min(total - 1, clampedIndex + 1))} disabled={clampedIndex === total - 1}>Next →</Button>
          </div>

          {/* Print-only layout: all reflections as full pages */}
          <BookPrintable entries={entries}/>
        </>
      )}
    </div>
  );
}

// ─── Printable book layout (visible only via @media print) ───
function BookPrintable({ entries }) {
  return (
    <div className="rj-print">
      <div className="rj-print-page rj-print-cover">
        <div style={{ textAlign: 'center' }}>
          <img src="assets/logo-magenta.png" alt="Haileybury" className="rj-print-logo"/>
          <div className="rj-print-eyebrow">A Reflective Journal</div>
          <h1 className="rj-print-title">The Haileybury <em>Odyssey</em></h1>
          <div className="rj-print-byline">Reflections, bound.</div>
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
  return (
    <div className="rj-print-entry">
      <div className="rj-print-meta">
        {isTutorial ? 'Long Tutorial' : 'Weekly'} · {formatDate(entry.date)}
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
  const pageBg = 'linear-gradient(180deg, #fdf6e3 0%, #f7f0d8 100%)';
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
      <div style={{
        background: pageBg, padding: '36px 34px 36px 38px',
        minHeight: 520,
        borderRight: '1px solid rgba(155,24,68,0.08)',
      }}>
        <div style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 8 }}>
          {isTutorial ? 'Long Tutorial' : 'Weekly'} · {formatDate(entry.date)}
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
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, marginBottom: 8 }}>Values</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {entry.values.map(id => VALUE_BY_ID[id] && <ValueTag key={id} value={VALUE_BY_ID[id]} selected size="sm"/>)}
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
      <div style={{
        background: 'linear-gradient(90deg, rgba(31,29,26,0.22), rgba(31,29,26,0.05) 30%, rgba(31,29,26,0.05) 70%, rgba(31,29,26,0.22))',
      }}/>

      {/* Right page */}
      <div style={{
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

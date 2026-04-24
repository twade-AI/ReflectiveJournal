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

Object.assign(window, { App });

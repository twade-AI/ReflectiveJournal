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

Object.assign(window, { App });

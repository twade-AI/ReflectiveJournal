// KS5 — 16-18 — Sophisticated / editorial / minimalist
// Sixth Form — long-form, essay-like, generous white space, restrained colour

function KS5Cover({ tweaks }) {
  return (
    <Page bg="#fbfaf6">
      {/* Hairline top */}
      <div style={{ position: 'absolute', top: 0, left: 56, right: 56, height: 1, background: '#1f1d1a' }}/>
      <div style={{ position: 'absolute', top: 40, left: 56, right: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#1f1d1a', fontWeight: 500 }}>
        <span>Haileybury · Sixth Form</span>
        <span>Vol. VI · 2026–27</span>
      </div>

      {/* Centre mass */}
      <div style={{ position: 'absolute', top: 180, left: 56, right: 56 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 600, marginBottom: 34 }}>A reflective journal</div>

        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 130, fontWeight: 400, lineHeight: 0.88, color: '#1f1d1a', letterSpacing: '-0.035em' }}>
          The<br/>
          <span style={{ fontStyle: 'italic' }}>Examined</span><br/>
          Year.
        </div>

        <div style={{ marginTop: 42, borderTop: '1px solid #1f1d1a', paddingTop: 22, maxWidth: 520 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 17, color: '#3a3835', lineHeight: 1.5 }}>
            Thirty-six weeks. Five values. One ongoing question — <span style={{ color: '#9b1844' }}>who are you becoming, and is it who you mean to become?</span>
          </div>
        </div>
      </div>

      {/* Ownership — minimal, bottom */}
      <div style={{ position: 'absolute', bottom: 110, left: 56, right: 56 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 28, borderTop: '1px solid #1f1d1a', paddingTop: 18 }}>
          {[['Name'], ['Year'], ['House'], ['Tutor']].map(([l]) => (
            <div key={l}>
              <div style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 500, marginBottom: 10 }}>{l}</div>
              <div style={{ height: 20, borderBottom: '0.5px solid #1f1d1a' }}/>
            </div>
          ))}
        </div>
      </div>

      {/* Values — ghost list bottom */}
      <div style={{ position: 'absolute', bottom: 56, left: 56, right: 56, display: 'flex', justifyContent: 'space-between', fontSize: 10.5, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 500 }}>
        {VALUES.map((v, i) => (
          <span key={v.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#9b1844' }}>{String(i + 1).padStart(2, '0')}</span>
            <span>{v.label}</span>
          </span>
        ))}
      </div>

      <PageFooter pageNum={1} total={5} ageBand="Sixth Form" />
    </Page>
  );
}

function KS5HowToUse({ tweaks }) {
  return (
    <Page bg="#fbfaf6">
      <div style={{ padding: '72px 72px 0' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 600, marginBottom: 10 }}>Prologue</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 56, fontWeight: 400, color: '#1f1d1a', lineHeight: 0.98, letterSpacing: '-0.025em', marginBottom: 28 }}>
          On the <span style={{ fontStyle: 'italic', color: '#9b1844' }}>practice</span><br/>of reflection.
        </div>

        {/* Body — two columns, editorial */}
        <div style={{ fontSize: 13.5, color: '#1f1d1a', lineHeight: 1.65, columnCount: 2, columnGap: 28, columnRule: '0.5px solid #d4cfc0' }}>
          <p style={{ margin: '0 0 12px', textIndent: 0 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, lineHeight: 0.8, float: 'left', padding: '4px 8px 0 0', color: '#9b1844', fontWeight: 700 }}>R</span>eflection is not a report. It is not a summary of what happened, delivered to an audience. It is a slower thing — the private work of noticing the gap between who you intend to be and who you actually were this week.
          </p>
          <p style={{ margin: '0 0 12px', textIndent: '1.5em' }}>
            This journal is yours. Use it. Some weeks, a single line is enough: a moment that surprised you, a choice you'd take back, a person who mattered. Other weeks you will want pages. Both count.
          </p>
          <p style={{ margin: '0 0 12px', textIndent: '1.5em' }}>
            Your tutorials are where the private becomes shared. Bring what you want to discuss — the pages marked <em>for tutorial</em>. Keep the rest to yourself. Trust is the ground all of this grows from.
          </p>
          <p style={{ margin: 0, textIndent: '1.5em' }}>
            Five values frame the work: Courage, Curiosity, Integrity, Kindness, Respect. They are not boxes to tick. They are a language you are learning to speak fluently about yourself.
          </p>
        </div>

        {/* Section break */}
        <div style={{ margin: '50px 0 28px', textAlign: 'center' }}>
          <span style={{ fontSize: 16, color: '#9b1844', letterSpacing: '1em' }}>· · ·</span>
        </div>

        {/* Values — table */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 600, marginBottom: 20, textAlign: 'center' }}>The five values · annotated</div>
          {VALUES.map((v, i) => (
            <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '40px 150px 1fr 180px', gap: 24, padding: '18px 0', borderTop: '0.5px solid #1f1d1a', borderBottom: i === 4 ? '0.5px solid #1f1d1a' : 'none', alignItems: 'baseline' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#9b1844', fontWeight: 600, letterSpacing: '0.08em' }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 26, color: '#1f1d1a', fontWeight: 400 }}>{v.label}</div>
              <div style={{ fontSize: 13, color: '#1f1d1a', lineHeight: 1.55 }}>{
                v.id === 'courage' ? 'The disposition to act well under pressure — moral, intellectual, physical. Not the absence of fear.' :
                v.id === 'curiosity' ? 'A habit of asking the next question. An appetite for what you don\'t yet understand.' :
                v.id === 'integrity' ? 'Wholeness — your inner life, speech, and action in alignment, unobserved or observed.' :
                v.id === 'kindness' ? 'A considered attention to others. Generous without being performative.' :
                'A recognition that people, institutions, and ideas deserve serious consideration before judgement.'
              }</div>
              <div style={{ fontSize: 10.5, color: '#7c7c7c', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500 }}>Look for: <br/><span style={{ color: v.color, fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, fontSize: 12 }}>{v.prompt}</span></div>
            </div>
          ))}
        </div>
      </div>
      <PageFooter pageNum={2} total={5} ageBand="Sixth Form" />
    </Page>
  );
}

function KS5Entry({ tweaks }) {
  const { surface, photoSlots, filled } = tweaks;
  const f = filled;
  return (
    <Page bg="#fbfaf6">
      {/* Masthead */}
      <div style={{ padding: '56px 72px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 500, paddingBottom: 14, borderBottom: '0.5px solid #1f1d1a' }}>
          <span>Entry · No. {f ? '12' : '—'}</span>
          <span>{f ? 'Michaelmas, Week 6' : '— · Week —'}</span>
          <span>{f ? '14 October 2026' : '—— · —— · ——'}</span>
          <span style={{ color: '#9b1844', fontWeight: 600 }}>For tutorial</span>
        </div>

        {/* Title — serif, large, restrained */}
        <div style={{ marginTop: 38 }}>
          {f ? (
            <>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 56, fontWeight: 400, color: '#1f1d1a', lineHeight: 1, letterSpacing: '-0.025em' }}>
                On <span style={{ fontStyle: 'italic' }}>small, repetitive</span><br/>acts of service.
              </div>
              <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
                {VALUES.filter(v => ['courage', 'kindness', 'respect'].includes(v.id)).map(v =>
                  <ValueTag key={v.id} value={v} selected size="sm"/>)}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 9.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 600, marginBottom: 10 }}>Title</div>
              <div style={{ borderBottom: '0.5px solid #1f1d1a', minHeight: 54 }}/>
              <div style={{ marginTop: 18, fontSize: 9.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 600 }}>Values engaged</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                {VALUES.map(v => <ValueTag key={v.id} value={v} size="sm"/>)}
              </div>
            </>
          )}
        </div>

        {/* Long form — two columns */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 600, marginBottom: 14 }}>The reflection</div>
          <div style={{ columnCount: 2, columnGap: 28, columnRule: '0.5px solid #d4cfc0' }}>
            <WritingSurface kind={surface} height={460}>
              {f && <div style={{ position: 'absolute', inset: '0 2px', padding: '4px 0' }}>
                <Handwritten color="#1f3a68" size={17} style={{ lineHeight: '32px' }}>
                  This term I volunteered for the<br/>
                  weekend community garden project.<br/>
                  Initially I found it difficult — I<br/>
                  didn't know much about horticulture,<br/>
                  and the physical work was more<br/>
                  demanding than I'd expected. I<br/>
                  found myself, uncharitably, resenting<br/>
                  the time it took. I did not admit<br/>
                  this to anyone.<br/>
                  <br/>
                  On the fourth Saturday, an<br/>
                  elderly resident told me how much<br/>
                  the garden meant to her — she
                </Handwritten>
              </div>}
            </WritingSurface>
          </div>
        </div>

        {/* Pull quote / key insight */}
        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: photoSlots ? '1fr 240px' : '1fr', gap: 28, alignItems: 'start' }}>
          <div style={{ borderLeft: '2px solid #9b1844', paddingLeft: 20 }}>
            <div style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 600, marginBottom: 10 }}>The turn</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 20, color: '#1f1d1a', lineHeight: 1.4, minHeight: 80 }}>
              {f ? '"I had been doing the work, but I had not been paying attention. Once I looked up, the garden was never the same."' : ''}
            </div>
          </div>
          {photoSlots && (
            <PhotoSlot
              width={240} height={132}
              filled={f ? 'linear-gradient(160deg,#4a6b3d 0%,#7d9a5f 50%,#c8b260 100%)' : null}
            />
          )}
        </div>
      </div>
      <PageFooter pageNum={3} total={5} ageBand="Sixth Form" />
    </Page>
  );
}

function KS5Entry2({ tweaks }) {
  // Continuation — page 4: what this reveals + questions for tutor
  const { surface, filled } = tweaks;
  const f = filled;
  return (
    <Page bg="#fbfaf6">
      <div style={{ padding: '56px 72px 0' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 500, paddingBottom: 14, borderBottom: '0.5px solid #1f1d1a' }}>
          Entry {f ? 'No. 12' : 'No. —'} · continued
        </div>

        {/* What this reveals */}
        <div style={{ marginTop: 36 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 600, marginBottom: 6 }}>What this reveals about me</div>
          <div style={{ fontSize: 12, color: '#7c7c7c', fontStyle: 'italic', marginBottom: 14 }}>A pattern, a habit of mind, a tendency — named.</div>
          <WritingSurface kind={surface} height={150} spacing="wide">
            {f && <div style={{ position: 'absolute', inset: '0 2px', padding: '4px 0' }}>
              <Handwritten color="#1f3a68" size={17} style={{ lineHeight: '36px' }}>
                A tendency to perform virtue without paying attention.<br/>
                To think that turning up is the same as caring. It isn't —<br/>
                caring is an active, sustained thing.
              </Handwritten>
            </div>}
          </WritingSurface>
        </div>

        {/* Where I'd like to be tested */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 600, marginBottom: 6 }}>Where I would like to be tested next</div>
          <WritingSurface kind={surface} height={114} spacing="wide">
            {f && <div style={{ position: 'absolute', inset: '0 2px', padding: '4px 0' }}>
              <Handwritten color="#1f3a68" size={17} style={{ lineHeight: '36px' }}>
                In situations where sustained attention matters more than<br/>
                arrival. Weekly commitments, long-form friendships.
              </Handwritten>
            </div>}
          </WritingSurface>
        </div>

        {/* Tutor questions — 3 lines, restrained */}
        <div style={{ marginTop: 32, padding: '22px 28px', border: '1px solid #1f1d1a', background: '#fff' }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 600, marginBottom: 16 }}>Questions I want to put to my tutor</div>
          {[1,2,3].map(n => {
            const qs = [
              'Is this something you see in me generally, or is it particular to this context?',
              'How do I tell the difference between sustained attention and performance of attention?',
              'What would you read with me on this?'
            ];
            return (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 12, marginBottom: 14, alignItems: 'baseline' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#9b1844', fontWeight: 400, fontStyle: 'italic' }}>{n}.</div>
                <div style={{ borderBottom: '0.5px solid #7c7c7c', minHeight: 30, paddingBottom: 4 }}>
                  {f && <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: '#1f1d1a', fontStyle: 'italic' }}>{qs[n-1]}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tutor note — reserved space */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 600, marginBottom: 10 }}>Tutor's note</div>
          <WritingSurface kind="ruled" height={90} spacing="wide" style={{ background: 'rgba(221,189,202,0.15)', padding: 8 }}/>
        </div>

        {/* Footer — date of conversation */}
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 500, paddingTop: 14, borderTop: '0.5px solid #1f1d1a' }}>
          <span>Tutor signature _______________________________</span>
          <span>Date _______________</span>
        </div>
      </div>
      <PageFooter pageNum={4} total={5} ageBand="Sixth Form" />
    </Page>
  );
}

function KS5YearReview({ tweaks }) {
  const { filled } = tweaks;
  return (
    <Page bg="#fbfaf6">
      <div style={{ padding: '60px 72px 0' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 600, marginBottom: 10 }}>End of year</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 68, fontWeight: 400, color: '#1f1d1a', lineHeight: 0.95, letterSpacing: '-0.03em' }}>
          <span style={{ fontStyle: 'italic' }}>Reckoning.</span>
        </div>

        <div style={{ marginTop: 16, maxWidth: 540, fontSize: 13.5, color: '#3a3835', lineHeight: 1.65, fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>
          An honest look at the year. Not a grade. A reckoning — what you did, what you did not, and what you still mean to do.
        </div>

        {/* Timeline */}
        <div style={{ marginTop: 40 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 600, marginBottom: 18 }}>Three terms · in a line</div>
          <div style={{ position: 'relative', padding: '28px 0 60px' }}>
            <div style={{ position: 'absolute', top: 48, left: 0, right: 0, height: 0.5, background: '#1f1d1a' }}/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {['Michaelmas', 'Lent', 'Summer'].map((term, i) => {
                const highs = [
                  'Turned volunteer. Discovered the gap between arriving and attending.',
                  'First real setback: unsuccessful UCAS interview. Wrote the best entry of the year.',
                  'Led the weekend project. Handed it on to someone else.'
                ];
                return (
                  <div key={term}>
                    <div style={{ position: 'relative', marginBottom: 28 }}>
                      <div style={{ position: 'absolute', top: 16, left: '50%', width: 9, height: 9, borderRadius: 999, background: '#9b1844', transform: 'translateX(-50%)' }}/>
                    </div>
                    <div style={{ textAlign: 'center', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 18, color: '#9b1844', fontWeight: 400, marginBottom: 10 }}>{term}</div>
                    <div style={{ textAlign: 'center', fontSize: 12.5, color: '#1f1d1a', lineHeight: 1.5, fontStyle: 'italic', minHeight: 56 }}>
                      {filled ? highs[i] : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Value arc — text + small chart */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 600, marginBottom: 14 }}>The value that changed most for me this year</div>
          {VALUES.map((v, i) => {
            const selected = filled && v.id === 'kindness';
            return (
              <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 14, padding: '10px 0', borderTop: i === 0 ? '0.5px solid #1f1d1a' : 'none', borderBottom: '0.5px solid #d4cfc0', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 16, height: 16, border: `1.25px solid ${v.color}`, background: selected ? v.color : 'transparent' }}/>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontStyle: selected ? 'italic' : 'normal', color: selected ? v.color : '#1f1d1a', fontWeight: selected ? 700 : 400 }}>{v.label}</div>
                </div>
                <div style={{ fontSize: 11.5, color: '#7c7c7c', fontStyle: 'italic', textAlign: 'right' }}>
                  {selected ? 'From "performed" toward "attended".' : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* Letter to future self */}
        <div style={{ marginTop: 26, padding: '20px 24px', background: '#fff', border: '0.5px solid #1f1d1a', borderLeft: '3px solid #9b1844' }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 600, marginBottom: 12 }}>A note to next year's me</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 14, color: '#1f1d1a', lineHeight: 1.65, minHeight: 78 }}>
            {filled ? 'You will be tempted to arrive and call it caring. Don\'t. The people you showed up for this year know the difference; so do you. Keep looking up.' : ''}
          </div>
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 500 }}>
            <span>Signed · {filled ? 'A. Patel' : '_______________'}</span>
            <span>To be opened · Sept {filled ? '2027' : '20__'}</span>
          </div>
        </div>
      </div>
      <PageFooter pageNum={5} total={5} ageBand="Sixth Form" />
    </Page>
  );
}

Object.assign(window, { KS5Cover, KS5HowToUse, KS5Entry, KS5Entry2, KS5YearReview });

// KS4 — 14-15 — Balanced editorial, cream paper, magenta accents, moderate density

function KS4Cover({ tweaks }) {
  return (
    <Page bg="#f7f3ea">
      {/* Magenta masthead */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 180, background: '#9b1844', padding: '40px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Haileybury · Middle School</div>
          <img src="assets/logo-white.png" alt="" style={{ height: 32 }}/>
        </div>
        <div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
          Years 10 – 11 · Academic Year 2026 / 27
        </div>
      </div>

      <div style={{ padding: '230px 56px 0' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 88, fontWeight: 700, lineHeight: 0.92, color: '#1f1d1a', letterSpacing: '-0.025em' }}>
          The<br/>Reflective<br/><span style={{ fontStyle: 'italic', color: '#9b1844' }}>Journal.</span>
        </div>
        <div style={{ marginTop: 22, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 20, color: '#5f5a52', maxWidth: 520, lineHeight: 1.35 }}>
          A year of noticing. A term of questioning. A week to pause. A moment to decide who you are becoming.
        </div>

        {/* Ownership block */}
        <div style={{ marginTop: 56, padding: '22px 24px', border: '1.25px solid #9b1844', borderLeft: '4px solid #9b1844', background: 'rgba(255,255,255,0.6)' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 16 }}>This journal belongs to</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 24 }}>
            {[['Name'], ['House'], ['Tutor']].map(([l]) => (
              <div key={l}>
                <div style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 600, marginBottom: 8 }}>{l}</div>
                <div style={{ height: 24, borderBottom: '1px solid #9b1844' }}/>
              </div>
            ))}
          </div>
        </div>

        {/* Values in a horizontal strip */}
        <div style={{ marginTop: 48 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, marginBottom: 18 }}>Guided by five values</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderTop: '1px solid #d4cfc0', borderBottom: '1px solid #d4cfc0' }}>
            {VALUES.map((v, i) => (
              <div key={v.id} style={{ padding: '18px 12px', textAlign: 'center', borderRight: i < 4 ? '1px solid #d4cfc0' : 'none' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontStyle: 'italic', color: v.color, fontWeight: 700, lineHeight: 1 }}>{v.label[0].toLowerCase()}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1f1d1a', marginTop: 6, letterSpacing: '0.04em' }}>{v.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PageFooter pageNum={1} total={5} ageBand="Years 10–11" />
    </Page>
  );
}

function KS4HowToUse({ tweaks }) {
  return (
    <Page bg="#f7f3ea">
      <div style={{ padding: '72px 60px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 42 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 10 }}>Introduction</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 700, color: '#1f1d1a', lineHeight: 1.02, letterSpacing: '-0.02em' }}>
              Why keep a<br/><span style={{ fontStyle: 'italic', color: '#9b1844' }}>reflective journal?</span>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#3a3835', lineHeight: 1.65, columnCount: 1 }}>
            The best learning happens <em>after</em> the event — when you stop, notice, and ask yourself what it meant. This journal is a habit, not a task. You'll bring it to tutorials through the year as a starting point for real conversations about who you are becoming.
            <div style={{ marginTop: 12 }}>
              Some entries will be a paragraph. Some will be a photo and a line. Some will be a question you couldn't answer yet. All of them count.
            </div>
          </div>
        </div>

        {/* Rhythm of use */}
        <div style={{ borderTop: '1px solid #9b1844', borderBottom: '1px solid #9b1844', padding: '28px 0', marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 22, textAlign: 'center' }}>The Rhythm</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { when: 'Weekly', what: 'A short check-in', time: '5 min' },
              { when: 'Monthly', what: 'A longer reflection', time: '20 min' },
              { when: 'Per term', what: 'Before tutorial', time: '30 min' },
              { when: 'Per year', what: 'A review', time: '1 hour' },
            ].map((r, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontStyle: 'italic', color: '#9b1844', fontWeight: 700, marginBottom: 4 }}>{r.when}</div>
                <div style={{ fontSize: 13, color: '#1f1d1a', fontWeight: 600, marginBottom: 2 }}>{r.what}</div>
                <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 600 }}>{r.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Values with definition */}
        <div style={{ marginBottom: 34 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, marginBottom: 16 }}>The Five Values — in your own terms</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {VALUES.map((v, i) => (
              <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr', gap: 24, padding: '14px 0', borderBottom: i < 4 ? '1px solid #d4cfc0' : 'none', alignItems: 'baseline' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: v.color, letterSpacing: '-0.01em' }}>{v.label}</div>
                <div style={{ fontSize: 12.5, color: '#3a3835', fontStyle: 'italic', lineHeight: 1.45 }}>{
                  v.id === 'courage' ? 'Doing what matters even when it would be easier not to.' :
                  v.id === 'curiosity' ? 'Asking the next question. Following what interests you.' :
                  v.id === 'integrity' ? 'Your actions match your words — especially when no one is watching.' :
                  v.id === 'kindness' ? 'Noticing others. Making the room a better place by being in it.' :
                  'Taking people, place, and yourself seriously.'
                }</div>
                <div style={{ fontSize: 11, color: '#7c7c7c', fontStyle: 'italic' }}>→ {v.prompt}</div>
              </div>
            ))}
          </div>
        </div>

        {/* A note on sharing */}
        <div style={{ padding: '18px 22px', background: '#fff', border: '1px solid #d4cfc0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 16, background: '#ec6608' }}/>
            <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#ec6608', fontWeight: 700 }}>A note on sharing</div>
          </div>
          <div style={{ fontSize: 12.5, color: '#3a3835', lineHeight: 1.55 }}>
            You decide what to share with your tutor and what to keep for yourself. Some pages are marked <em>"for tutorial"</em> — those are the ones we'll talk about together. The rest are yours alone.
          </div>
        </div>
      </div>
      <PageFooter pageNum={2} total={5} ageBand="Years 10–11" />
    </Page>
  );
}

function KS4Entry({ tweaks }) {
  const { surface, photoSlots, filled } = tweaks;
  const f = filled;
  return (
    <Page bg="#f7f3ea">
      {/* Header */}
      <div style={{ padding: '48px 56px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottom: '1.5px solid #9b1844' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700 }}>Reflection · No. {f ? '07' : '__'}</div>
          <div style={{ display: 'flex', gap: 26, fontSize: 11, color: '#3a3835' }}>
            <span><span style={{ color: '#7c7c7c', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 9.5, marginRight: 6, fontWeight: 600 }}>Date</span>{f ? '14 Oct 2026' : '__ · __ · __'}</span>
            <span><span style={{ color: '#7c7c7c', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 9.5, marginRight: 6, fontWeight: 600 }}>Term</span>{f ? 'Michaelmas' : '__________'}</span>
            <span style={{ fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ec6608', fontWeight: 700, border: '1px solid #ec6608', padding: '3px 8px' }}>For Tutorial</span>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, marginBottom: 8 }}>Title</div>
          <div style={{ borderBottom: '1px solid #9b1844', paddingBottom: 8, minHeight: 44 }}>
            {f ? <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontStyle: 'italic', color: '#1f1d1a', fontWeight: 700 }}>The Community Garden Project</span> : null}
          </div>
        </div>

        {/* Values tag row */}
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700 }}>Values</div>
          <div style={{ flex: 1, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {VALUES.map((v, i) => {
              const selected = f && (i === 0 || i === 3 || i === 4);
              return <ValueTag key={v.id} value={v} selected={selected}/>;
            })}
          </div>
        </div>

        {/* Two prompts + sidebar */}
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 232px', gap: 24 }}>
          <div>
            {/* Prompt 1 */}
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 4 }}>What happened</div>
              <div style={{ fontSize: 12, color: '#7c7c7c', fontStyle: 'italic', marginBottom: 10 }}>Tell the story in your own voice. Setting, people, choice points.</div>
              <WritingSurface kind={surface} height={200}>
                {f && <div style={{ position: 'absolute', inset: '0 2px', padding: '4px 0' }}>
                  <Handwritten color="#1f3a68" size={17} style={{ lineHeight: '32px' }}>
                    This term, I volunteered for the weekend community garden<br/>
                    project. Initially I found it difficult because I didn't know much<br/>
                    about horticulture, and the physical work was more demanding<br/>
                    than I expected. I worked for five Saturdays in a row.
                  </Handwritten>
                </div>}
              </WritingSurface>
            </div>

            {/* Prompt 2 */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 4 }}>What shifted in you</div>
              <div style={{ fontSize: 12, color: '#7c7c7c', fontStyle: 'italic', marginBottom: 10 }}>The moment something clicked, or a view changed.</div>
              <WritingSurface kind={surface} height={172}>
                {f && <div style={{ position: 'absolute', inset: '0 2px', padding: '4px 0' }}>
                  <Handwritten color="#1f3a68" size={17} style={{ lineHeight: '32px' }}>
                    The highlight was speaking with a resident who told me how<br/>
                    much the garden meant to her. It shifted my perspective from<br/>
                    seeing it as just 'gardening' to seeing it as service. Small,<br/>
                    repetitive tasks can really matter.
                  </Handwritten>
                </div>}
              </WritingSurface>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {photoSlots && (
              <div>
                <PhotoSlot width={232} height={170}
                  filled={f ? 'linear-gradient(160deg,#5a7d48 0%,#8fad6b 40%,#d9c77a 100%)' : null}/>
                <div style={{ marginTop: 6, fontSize: 10.5, color: '#7c7c7c', fontStyle: 'italic', textAlign: 'center' }}>{f ? 'Final Saturday — harvest day.' : 'Caption'}</div>
              </div>
            )}

            {/* Tutor question + going deeper */}
            <div style={{ padding: 16, background: '#fff', border: '1.25px solid #d4cfc0' }}>
              <div style={{ fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 8 }}>To discuss with tutor</div>
              <WritingSurface kind={surface} height={108} spacing="narrow">
                {f && <div style={{ position: 'absolute', inset: '0 2px' }}>
                  <Handwritten color="#1f3a68" size={15} style={{ lineHeight: '28px' }}>
                    How do you keep doing<br/>
                    something unglamorous<br/>
                    when the novelty wears off?
                  </Handwritten>
                </div>}
              </WritingSurface>
            </div>

            <div style={{ padding: 16, background: '#fde5d0' }}>
              <div style={{ fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#ec6608', fontWeight: 700, marginBottom: 8 }}>Going further</div>
              <WritingSurface kind={surface} height={72} spacing="narrow">
                {f && <div style={{ position: 'absolute', inset: '0 2px' }}>
                  <Handwritten color="#1f3a68" size={15} style={{ lineHeight: '28px' }}>
                    Sign up for term two.<br/>
                    Bring a friend.
                  </Handwritten>
                </div>}
              </WritingSurface>
            </div>
          </div>
        </div>

        {/* Went well / next time */}
        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div style={{ borderTop: '2px solid #009870', paddingTop: 10 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#009870', fontWeight: 700, marginBottom: 8 }}>What went well</div>
            <WritingSurface kind={surface} height={66} spacing="narrow">
              {f && <div style={{ position: 'absolute', inset: '0 2px' }}>
                <Handwritten color="#1f3a68" size={15} style={{ lineHeight: '28px' }}>Turning up every week even<br/>when it rained.</Handwritten>
              </div>}
            </WritingSurface>
          </div>
          <div style={{ borderTop: '2px solid #ec6608', paddingTop: 10 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#ec6608', fontWeight: 700, marginBottom: 8 }}>What I'd do differently</div>
            <WritingSurface kind={surface} height={66} spacing="narrow">
              {f && <div style={{ position: 'absolute', inset: '0 2px' }}>
                <Handwritten color="#1f3a68" size={15} style={{ lineHeight: '28px' }}>Ask residents about the<br/>garden earlier on.</Handwritten>
              </div>}
            </WritingSurface>
          </div>
        </div>
      </div>
      <PageFooter pageNum={3} total={5} ageBand="Years 10–11" />
    </Page>
  );
}

function KS4Checkin({ tweaks }) {
  const { filled } = tweaks;
  return (
    <Page bg="#f7f3ea">
      <div style={{ padding: '60px 60px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1.5px solid #9b1844', paddingBottom: 18 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 8 }}>Weekly check-in</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 700, color: '#1f1d1a', lineHeight: 1 }}>This week <span style={{ fontStyle: 'italic', color: '#9b1844' }}>in five minutes.</span></div>
          </div>
          <div style={{ fontSize: 11, color: '#7c7c7c', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Week commencing {filled ? '13 Oct' : '__ __'}</div>
        </div>

        {/* Values bar chart */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, marginBottom: 18 }}>Where the values showed up</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 200, borderBottom: '1px solid #d4cfc0', padding: '0 10px' }}>
            {VALUES.map((v, i) => {
              const val = filled ? [70, 45, 82, 55, 60][i] : 0;
              return (
                <div key={v.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <div style={{ fontSize: 11, color: v.color, fontWeight: 700, marginBottom: 4 }}>{filled ? `${val}%` : ''}</div>
                  <div style={{ width: '100%', height: `${val}%`, background: v.color, borderRadius: '2px 2px 0 0', border: filled ? 'none' : `1.25px dashed ${v.color}` }}/>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 14, padding: '10px 10px 0' }}>
            {VALUES.map(v => (
              <div key={v.id} style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#1f1d1a' }}>{v.label}</div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#7c7c7c', fontStyle: 'italic', textAlign: 'center', marginTop: 6 }}>Shade in each bar to roughly how much each value showed up for you.</div>
        </div>

        {/* Three moments */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, marginBottom: 14 }}>Three moments worth remembering</div>
          {[1,2,3].map(i => {
            const contents = ['Got picked for the 1st XI squad — hard to believe.', 'Helped Freya with maths homework. She got the method.', 'Missed an easy point in debating. Frustrated with myself.'];
            const values = [['courage'], ['kindness'], ['integrity']];
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 200px', gap: 14, padding: '12px 0', borderTop: i === 1 ? '1px solid #d4cfc0' : 'none', borderBottom: '1px solid #d4cfc0', alignItems: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: '#9b1844', fontWeight: 700, fontStyle: 'italic' }}>{i}</div>
                <WritingSurface kind="ruled" height={40} spacing="narrow">
                  {filled && <div style={{ position: 'absolute', inset: '0 2px' }}>
                    <Handwritten color="#1f3a68" size={16} style={{ lineHeight: '32px' }}>{contents[i-1]}</Handwritten>
                  </div>}
                </WritingSurface>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {VALUES.map(v => (
                    <ValueTag key={v.id} value={v} size="sm" selected={filled && values[i-1].includes(v.id)}/>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Going-forward */}
        <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#009870', fontWeight: 700, marginBottom: 8 }}>One thing I'll carry forward</div>
            <WritingSurface kind="ruled" height={80} spacing="narrow">
              {filled && <div style={{ position: 'absolute', inset: '0 2px' }}>
                <Handwritten color="#1f3a68" size={15} style={{ lineHeight: '28px' }}>Practice answering<br/>before I'm called on.</Handwritten>
              </div>}
            </WritingSurface>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#ec6608', fontWeight: 700, marginBottom: 8 }}>One thing I'll let go of</div>
            <WritingSurface kind="ruled" height={80} spacing="narrow">
              {filled && <div style={{ position: 'absolute', inset: '0 2px' }}>
                <Handwritten color="#1f3a68" size={15} style={{ lineHeight: '28px' }}>The need to get<br/>everything right first time.</Handwritten>
              </div>}
            </WritingSurface>
          </div>
        </div>
      </div>
      <PageFooter pageNum={4} total={5} ageBand="Years 10–11" />
    </Page>
  );
}

function KS4TermReview({ tweaks }) {
  const { filled } = tweaks;
  return (
    <Page bg="#f7f3ea">
      <div style={{ padding: '60px 56px 0' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 8 }}>End of term · For tutorial</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 700, color: '#1f1d1a', lineHeight: 1, letterSpacing: '-0.02em' }}>
          The Term <span style={{ fontStyle: 'italic', color: '#9b1844' }}>in Review.</span>
        </div>

        {/* Stats strip */}
        <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid #d4cfc0', background: '#fff' }}>
          {[['14', 'Entries'], ['52', 'Days logged'], ['3', 'Values grown in'], ['1', 'Standout moment']].map(([n, l], i) => (
            <div key={i} style={{ padding: '18px 14px', borderRight: i < 3 ? '1px solid #d4cfc0' : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: '#9b1844', lineHeight: 1 }}>{filled ? n : '—'}</div>
              <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 600, marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Pull quote from self */}
        <div style={{ marginTop: 28, padding: '22px 28px', borderLeft: '4px solid #9b1844', background: 'rgba(255,255,255,0.6)' }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 10 }}>A line from this term worth keeping</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 22, color: '#1f1d1a', lineHeight: 1.35 }}>
            "{filled ? 'Small, repetitive tasks can still matter. It depends on who you do them for.' : '                                                                   '}"
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: '#7c7c7c', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>— from reflection no. {filled ? '07' : '__'}</div>
        </div>

        {/* Value growth */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, marginBottom: 16 }}>Growth in each value this term</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {VALUES.map((v, i) => {
              const start = filled ? [30, 55, 40, 60, 45][i] : 0;
              const end = filled ? [65, 70, 55, 75, 50][i] : 0;
              return (
                <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 80px', gap: 14, alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1f1d1a' }}>{v.label}</div>
                  <div style={{ position: 'relative', height: 22, background: '#efe9d9', borderRadius: 2 }}>
                    {filled && <>
                      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${start}%`, width: `${end - start}%`, background: v.color, opacity: 0.9, borderRadius: 2 }}/>
                      <div style={{ position: 'absolute', top: -3, bottom: -3, left: `calc(${start}% - 1px)`, width: 2, background: '#1f1d1a' }}/>
                      <div style={{ position: 'absolute', top: -3, bottom: -3, left: `calc(${end}% - 1px)`, width: 2, background: v.color }}/>
                    </>}
                  </div>
                  <div style={{ fontSize: 11, color: v.color, fontWeight: 700 }}>{filled ? `+${end - start}` : '—'}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Questions for tutor + goals */}
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div style={{ border: '1.25px solid #9b1844', padding: '16px 18px', background: '#fff' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 10 }}>Questions for my tutor</div>
            {[1,2,3].map(n => {
              const q = ['Where do you see me stretching most right now?', 'What\'s a blind spot I might not notice?', 'Is "too careful" something I should work on?'];
              return (
                <div key={n} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 14, color: '#9b1844', fontWeight: 700, flexShrink: 0 }}>{n}.</div>
                  <div style={{ flex: 1, borderBottom: '1px solid #d4cfc0', paddingBottom: 4, minHeight: 22, fontSize: 12.5, color: '#1f1d1a' }}>
                    {filled ? q[n-1] : ''}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ border: '1.25px solid #ec6608', padding: '16px 18px', background: '#fff' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#ec6608', fontWeight: 700, marginBottom: 10 }}>Intentions for next term</div>
            {[1,2,3].map(n => {
              const g = ['Sign up for debating society.', 'Weekly volunteer shift continued.', 'Read one book outside the syllabus.'];
              return (
                <div key={n} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                  <CheckBox color="#ec6608" size={13}/>
                  <div style={{ flex: 1, borderBottom: '1px solid #efd6b8', paddingBottom: 4, minHeight: 22, fontSize: 12.5, color: '#1f1d1a' }}>
                    {filled ? g[n-1] : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <PageFooter pageNum={5} total={5} ageBand="Years 10–11" />
    </Page>
  );
}

Object.assign(window, { KS4Cover, KS4HowToUse, KS4Entry, KS4Checkin, KS4TermReview });

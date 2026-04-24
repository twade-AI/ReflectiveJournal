// KS3 — 11-14 — Playful / Structured / Scrapbook
// 5 pages: Cover, How to Use, Entry (full), Values Check-in, Term Review

function KS3Cover({ tweaks }) {
  const { surface } = tweaks;
  return (
    <Page bg="#fdf6e3">
      {/* Paper texture bar top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: '#9b1844' }}/>
      <div style={{ position: 'absolute', top: 10, left: 0, right: 0, height: 4, background: '#ec6608' }}/>

      {/* Decorative corner arcs */}
      <svg width="220" height="220" style={{ position: 'absolute', top: -40, right: -40, opacity: 0.15 }} viewBox="0 0 220 220">
        <circle cx="110" cy="110" r="100" fill="none" stroke="#9b1844" strokeWidth="2"/>
        <circle cx="110" cy="110" r="75" fill="none" stroke="#ec6608" strokeWidth="2"/>
        <circle cx="110" cy="110" r="50" fill="none" stroke="#009870" strokeWidth="2"/>
      </svg>

      <div style={{ padding: '140px 64px 0' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 24 }}>
          Haileybury · Lower School
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 76, fontWeight: 700, lineHeight: 0.95, color: '#1f1d1a', letterSpacing: '-0.02em' }}>
          My<br/>Reflective<br/><span style={{ color: '#9b1844', fontStyle: 'italic' }}>Journal</span>
        </div>
        <div style={{ marginTop: 28, fontSize: 18, color: '#5f5a52', fontStyle: 'italic', maxWidth: 440, lineHeight: 1.4 }}>
          A place to notice what you're learning, who you're becoming, and the moments that mattered.
        </div>

        {/* Name plate */}
        <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          {[['Name', 'name'], ['House', 'house'], ['Tutor', 'tutor'], ['Year', 'year']].map(([label, key]) => (
            <div key={key}>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 6 }}>{label}</div>
              <div style={{ height: 28, borderBottom: '1.25px solid #9b1844' }}/>
            </div>
          ))}
        </div>

        {/* Values strip */}
        <div style={{ marginTop: 70 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, marginBottom: 14 }}>
            The Five Haileybury Values
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {VALUES.map(v => <ValueTag key={v.id} value={v} selected />)}
          </div>
        </div>
      </div>

      {/* Logo bottom-right */}
      <div style={{ position: 'absolute', bottom: 48, right: 56, display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="assets/logo-magenta.png" alt="Haileybury" style={{ height: 44, opacity: 0.9 }}/>
      </div>

      <PageFooter pageNum={1} total={5} ageBand="Years 7–9" />
    </Page>
  );
}

function KS3HowToUse({ tweaks }) {
  const steps = [
    { n: 1, title: 'Pause and notice', body: 'Before tutorial, pick a moment from the last few weeks. It could be big or small — a match, a lesson, a tricky conversation.' },
    { n: 2, title: 'Tell the story', body: 'Write or sketch what happened. Add a photo if you like. Don\'t worry about getting it "right" — this is for you.' },
    { n: 3, title: 'Tag the values', body: 'Which of the five values showed up? Circle them. Sometimes it\'s one, sometimes all five.' },
    { n: 4, title: 'Share it', body: 'Bring your journal to your next tutor meeting. You choose what to talk about.' },
  ];
  return (
    <Page bg="#fdf6e3">
      <div style={{ padding: '72px 64px 0' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 10 }}>Welcome</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, color: '#1f1d1a', lineHeight: 1 }}>
          How this journal <span style={{ fontStyle: 'italic', color: '#9b1844' }}>works.</span>
        </div>
        <div style={{ marginTop: 16, fontSize: 15, color: '#5f5a52', lineHeight: 1.5, maxWidth: 580 }}>
          There are no wrong answers in here. It's a quiet place for you to notice what's going on — and a way to start bigger conversations with your tutor.
        </div>

        {/* 4 steps */}
        <div style={{ marginTop: 42, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {steps.map(s => (
            <div key={s.n} style={{ border: '1.25px solid #ddbdca', borderRadius: 10, padding: '20px 22px', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 999, background: '#9b1844', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}>{s.n}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1f1d1a' }}>{s.title}</div>
              </div>
              <div style={{ fontSize: 13, color: '#5f5a52', lineHeight: 1.5 }}>{s.body}</div>
            </div>
          ))}
        </div>

        {/* Values intro */}
        <div style={{ marginTop: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, marginBottom: 14 }}>The Five Values</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {VALUES.map(v => (
              <div key={v.id} style={{ textAlign: 'center', padding: '14px 8px', borderRadius: 10, background: v.tint }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: v.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>{v.glyph}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1f1d1a', marginBottom: 3 }}>{v.label}</div>
                <div style={{ fontSize: 10.5, color: '#5f5a52', lineHeight: 1.3, fontStyle: 'italic' }}>{v.prompt}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pull quote */}
        <div style={{ marginTop: 44, borderLeft: '3px solid #ec6608', paddingLeft: 18 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontStyle: 'italic', color: '#1f1d1a', lineHeight: 1.3 }}>
            "The unexamined life is not worth living."
          </div>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 600, marginTop: 8 }}>— Socrates</div>
        </div>
      </div>
      <PageFooter pageNum={2} total={5} ageBand="Years 7–9" />
    </Page>
  );
}

function KS3Entry({ tweaks }) {
  const { surface, photoSlots, filled } = tweaks;
  // Demo filled content
  const f = filled;
  return (
    <Page bg="#fdf6e3">
      {/* Header banner */}
      <div style={{ padding: '48px 48px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700 }}>Reflection · Entry</div>
          <div style={{ display: 'flex', gap: 22, fontSize: 11, color: '#5f5a52' }}>
            <div><span style={{ color: '#9b1844', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 9.5, marginRight: 8 }}>Date</span>
              {f ? <Handwritten color="#2a2b7c" size={16}>14 Oct 2026</Handwritten> : <span style={{ borderBottom: '1px solid #b9607d', display: 'inline-block', minWidth: 90, height: 18 }}/>}
            </div>
            <div><span style={{ color: '#9b1844', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 9.5, marginRight: 8 }}>Term</span>
              {f ? <Handwritten color="#2a2b7c" size={16}>Michaelmas</Handwritten> : <span style={{ borderBottom: '1px solid #b9607d', display: 'inline-block', minWidth: 90, height: 18 }}/>}
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, marginBottom: 6 }}>Give this reflection a title</div>
          <div style={{ borderBottom: '1.5px solid #9b1844', paddingBottom: 6, minHeight: 42 }}>
            {f ? <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontStyle: 'italic', color: '#1f1d1a' }}>The Community Garden</span> : null}
          </div>
        </div>

        {/* Two-column: reflection + side */}
        <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: '1fr 240px', gap: 22 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#9b1844' }}>1.</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1f1d1a' }}>What happened?</div>
            </div>
            <div style={{ fontSize: 12, color: '#7c7c7c', fontStyle: 'italic', marginBottom: 10, marginLeft: 26 }}>Tell the story. What did you do? Who was there?</div>
            <WritingSurface kind={surface} height={180}>
              {f && (
                <div style={{ position: 'absolute', inset: '0 4px', padding: '4px 0' }}>
                  <Handwritten color="#1f3a68" size={17} style={{ display: 'block', lineHeight: '32px' }}>
                    This term I helped with the weekend community<br/>
                    garden. At first it was hard — I didn't know much<br/>
                    about gardening and the work was tiring! But I kept<br/>
                    going and it got easier.
                  </Handwritten>
                </div>
              )}
            </WritingSurface>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '20px 0 8px' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#ec6608' }}>2.</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1f1d1a' }}>What did you learn about yourself?</div>
            </div>
            <WritingSurface kind={surface} height={148}>
              {f && (
                <div style={{ position: 'absolute', inset: '0 4px', padding: '4px 0' }}>
                  <Handwritten color="#1f3a68" size={17} style={{ display: 'block', lineHeight: '32px' }}>
                    I learned I can stick with something even when<br/>
                    it's boring or hard. One lady told me the garden<br/>
                    meant a lot to her — that changed how I saw it.
                  </Handwritten>
                </div>
              )}
            </WritingSurface>
          </div>

          {/* Side column */}
          <div>
            {photoSlots && (
              <PhotoSlot
                width={240} height={180}
                label="Photo or sketch"
                filled={f ? 'linear-gradient(135deg,#7fa869 0%,#b8d184 60%,#e8cf73 100%)' : null}
              />
            )}
            {photoSlots && f && (
              <div style={{ marginTop: 8 }}>
                <Handwritten color="#7c7c7c" size={14}>Saturday morning at the garden ✿</Handwritten>
              </div>
            )}

            {/* Values tagger */}
            <div style={{ marginTop: photoSlots ? 22 : 0, padding: 16, border: '1.25px dashed #b9607d', borderRadius: 8, background: 'rgba(255,255,255,0.5)' }}>
              <div style={{ fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 10 }}>Values in this story</div>
              <div style={{ fontSize: 11, color: '#5f5a52', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.4 }}>Tick the ones that showed up — big or small.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {VALUES.map((v, i) => {
                  const checked = f && (i === 0 || i === 3);
                  return (
                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckBox checked={checked} color={v.color} size={15}/>
                      <span style={{ fontSize: 12, fontWeight: 600, color: checked ? v.color : '#1f1d1a' }}>{v.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom — next time / talk with tutor */}
        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ border: '1.25px solid #ddbdca', borderRadius: 8, padding: '14px 16px', background: '#fff' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ec6608', fontWeight: 700, marginBottom: 8 }}>Next time I'll try…</div>
            <WritingSurface kind={surface} height={58} spacing="narrow">
              {f && <div style={{ position: 'absolute', inset: '0 2px', padding: '2px 0' }}>
                <Handwritten color="#1f3a68" size={15} style={{ lineHeight: '28px' }}>Ask more questions instead of<br/>just doing what I'm told.</Handwritten>
              </div>}
            </WritingSurface>
          </div>
          <div style={{ border: '1.25px solid #ddbdca', borderRadius: 8, padding: '14px 16px', background: '#fff' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 8 }}>To talk about with my tutor</div>
            <WritingSurface kind={surface} height={58} spacing="narrow">
              {f && <div style={{ position: 'absolute', inset: '0 2px', padding: '2px 0' }}>
                <Handwritten color="#1f3a68" size={15} style={{ lineHeight: '28px' }}>How do you keep going with<br/>something when it's not fun?</Handwritten>
              </div>}
            </WritingSurface>
          </div>
        </div>
      </div>
      <PageFooter pageNum={3} total={5} ageBand="Years 7–9" />
    </Page>
  );
}

function KS3Checkin({ tweaks }) {
  const { filled } = tweaks;
  return (
    <Page bg="#fdf6e3">
      <div style={{ padding: '64px 56px 0' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 8 }}>Weekly Check-in</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, color: '#1f1d1a', lineHeight: 1 }}>
          How was <span style={{ fontStyle: 'italic', color: '#9b1844' }}>your week?</span>
        </div>
        <div style={{ fontSize: 14, color: '#5f5a52', marginTop: 10, fontStyle: 'italic' }}>Colour in the dot that fits. No wrong answers.</div>

        {/* 5-value rating */}
        <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {VALUES.map((v, vi) => (
            <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 999, background: v.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700 }}>{v.glyph}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1f1d1a' }}>{v.label}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {[1,2,3,4,5].map(n => {
                  const selected = filled && ((vi === 0 && n === 3) || (vi === 1 && n === 5) || (vi === 2 && n === 4) || (vi === 3 && n === 4) || (vi === 4 && n === 3));
                  return (
                    <div key={n} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ width: 26, height: 26, borderRadius: 999, border: `1.5px solid ${v.color}`, background: selected ? v.color : '#fff', margin: '0 auto' }}/>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 20, marginTop: -4 }}>
            <div/>
            <div style={{ display: 'flex', fontSize: 10, color: '#7c7c7c', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>Not yet</div>
              <div style={{ flex: 1, textAlign: 'center' }}/>
              <div style={{ flex: 1, textAlign: 'center' }}>Some</div>
              <div style={{ flex: 1, textAlign: 'center' }}/>
              <div style={{ flex: 1, textAlign: 'center' }}>Lots</div>
            </div>
          </div>
        </div>

        {/* Proud / tricky */}
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ padding: 18, background: '#fde5d0', borderRadius: 10 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#ec6608', fontWeight: 700, marginBottom: 8 }}>I'm proud of…</div>
            <WritingSurface kind="ruled" height={104} spacing="narrow">
              {filled && <div style={{ position: 'absolute', inset: '0 2px' }}>
                <Handwritten color="#1f3a68" size={16} style={{ lineHeight: '28px' }}>
                  Answering in the debate even<br/>
                  though I was nervous. My group<br/>
                  said I made a good point!
                </Handwritten>
              </div>}
            </WritingSurface>
          </div>
          <div style={{ padding: 18, background: '#d2eefa', borderRadius: 10 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#009fe3', fontWeight: 700, marginBottom: 8 }}>Something tricky…</div>
            <WritingSurface kind="ruled" height={104} spacing="narrow">
              {filled && <div style={{ position: 'absolute', inset: '0 2px' }}>
                <Handwritten color="#1f3a68" size={16} style={{ lineHeight: '28px' }}>
                  Maths test on Thursday — I got<br/>
                  stuck and left some blank. Going<br/>
                  to ask Mr Patel for help.
                </Handwritten>
              </div>}
            </WritingSurface>
          </div>
        </div>

        {/* Mood strip */}
        <div style={{ marginTop: 22, padding: 16, border: '1.25px dashed #b9607d', borderRadius: 10 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 12 }}>My week in one word</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            {['Energised', 'Curious', 'Steady', 'Wobbly', 'Tired', 'Other'].map((w, i) => {
              const selected = filled && i === 1;
              return (
                <div key={w} style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 6, border: `1.5px solid ${selected ? '#9b1844' : '#ddbdca'}`, background: selected ? '#9b1844' : '#fff', color: selected ? '#fff' : '#1f1d1a', fontSize: 12, fontWeight: 600 }}>
                  {w}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <PageFooter pageNum={4} total={5} ageBand="Years 7–9" />
    </Page>
  );
}

function KS3TermReview({ tweaks }) {
  const { filled, photoSlots } = tweaks;
  return (
    <Page bg="#fdf6e3">
      <div style={{ padding: '56px 52px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 6 }}>End of Term</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, color: '#1f1d1a', lineHeight: 1 }}>
              Looking <span style={{ fontStyle: 'italic', color: '#9b1844' }}>back.</span>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#5f5a52' }}>
            Term <span style={{ borderBottom: '1px solid #9b1844', padding: '0 10px' }}>{filled ? 'Michaelmas' : ''}</span>{' '}
            Year <span style={{ borderBottom: '1px solid #9b1844', padding: '0 10px' }}>{filled ? '8' : ''}</span>
          </div>
        </div>

        {/* Highlights reel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 22 }}>
          {[1,2,3].map(i => (
            <div key={i}>
              <div style={{ fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700, marginBottom: 6 }}>Highlight {i}</div>
              {photoSlots ? (
                <PhotoSlot width="100%" height={120} label="Photo"
                  filled={filled ? (i === 1 ? 'linear-gradient(135deg,#2a2b7c,#009fe3)' : i === 2 ? 'linear-gradient(135deg,#7fa869,#e8cf73)' : 'linear-gradient(135deg,#9b1844,#ec6608)') : null} />
              ) : (
                <div style={{ height: 120, border: '1.5px solid #ddbdca', borderRadius: 6, background: '#fff' }}/>
              )}
              <WritingSurface kind="ruled" height={54} spacing="narrow" style={{ marginTop: 6 }}>
                {filled && <div style={{ position: 'absolute', inset: '0 2px' }}>
                  <Handwritten color="#1f3a68" size={14} style={{ lineHeight: '28px' }}>
                    {i === 1 ? 'First rugby match —\nwe won!' : i === 2 ? 'Garden project\nfinished.' : 'History essay A.'}
                  </Handwritten>
                </div>}
              </WritingSurface>
            </div>
          ))}
        </div>

        {/* Value I grew in */}
        <div style={{ padding: 20, background: '#fff', border: '1.25px solid #ddbdca', borderRadius: 10, marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9b1844', fontWeight: 700 }}>The value I grew in most this term</div>
            <div style={{ fontSize: 10, color: '#7c7c7c', fontStyle: 'italic' }}>Circle one</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {VALUES.map((v, i) => {
              const selected = filled && i === 0;
              return (
                <div key={v.id} style={{ flex: 1, padding: '14px 10px', textAlign: 'center', borderRadius: 8, border: `2px solid ${selected ? v.color : '#eee5d3'}`, background: selected ? v.tint : 'transparent' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 999, background: v.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700 }}>{v.glyph}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1f1d1a' }}>{v.label}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c7c7c', fontWeight: 700, marginBottom: 6 }}>Because…</div>
          <WritingSurface kind="ruled" height={60} spacing="narrow">
            {filled && <div style={{ position: 'absolute', inset: '0 2px' }}>
              <Handwritten color="#1f3a68" size={15} style={{ lineHeight: '28px' }}>
                I tried out for choir even though I was really<br/>
                scared. I didn't get a solo but I still went.
              </Handwritten>
            </div>}
          </WritingSurface>
        </div>

        {/* Next term goals */}
        <div style={{ padding: 20, background: '#fde5d0', borderRadius: 10 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ec6608', fontWeight: 700, marginBottom: 12 }}>My three goals for next term</div>
          {[1,2,3].map(n => {
            const goals = ['Speak up more in English lessons.', 'Try a new sport — maybe hockey?', 'Be kinder to my little sister 😅'];
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: 999, border: '1.5px solid #ec6608', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 12, fontWeight: 700, color: '#ec6608', flexShrink: 0 }}>{n}</div>
                <div style={{ flex: 1, borderBottom: '1.25px solid #ec6608', paddingBottom: 4, minHeight: 26 }}>
                  {filled && <Handwritten color="#1f3a68" size={15}>{goals[n-1]}</Handwritten>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <PageFooter pageNum={5} total={5} ageBand="Years 7–9" />
    </Page>
  );
}

Object.assign(window, { KS3Cover, KS3HowToUse, KS3Entry, KS3Checkin, KS3TermReview });

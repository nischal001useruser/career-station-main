import { useState, useEffect, useRef } from 'react'
import { API_BASE_URL } from '../config/api'

// ─── Career Station Brand Tokens ──────────────────────────────────────────────
const B = {
  teal:       '#1A6B7A',
  tealDark:   '#0F4F5C',
  tealDeep:   '#0A3540',
  tealMid:    '#1E7D8F',
  tealLight:  '#2A9BAE',
  tealPale:   '#E8F5F7',
  tealBorder: '#B8DEE4',
  tealGlow:   'rgba(26,107,122,0.12)',
  red:        '#CE2D21',
  redMid:     '#E03A2E',
  redLight:   '#F0524A',
  redPale:    '#FEF0EF',
  redBorder:  '#F4C4C1',
  gold:       '#C9922A',
  goldPale:   '#FDF3E3',
  goldBorder: '#F0D08A',
  ink:        '#0C2830',
  slate:      '#3D5A63',
  muted:      '#6B8990',
  hairline:   '#D8EAED',
  surface:    '#F5FAFB',
  white:      '#FFFFFF',
  off:        '#F3F8FA',
  green:      '#178A47',
  greenPale:  '#E6F7EE',
  greenBorder:'#A8DFC0',
  amber:      '#C97A10',
  amberPale:  '#FEF7E6',
  amberBorder:'#F0CC7A',
}

// ─── Logo Mark ────────────────────────────────────────────────────────────────
function CSLogo({ size = 120 }) {
  return (
    <img
      src="/career-station.png"
      alt="Career Station"
      style={{
        width: size,
        height: size,
        objectFit: "contain"
      }}
    />
  )
}

  function CSWordmark({ size = 'lg', inverted = false }) {
  const sizes = {
    sm: { logo: 60, main: 14, sub: 9, tag: 8 },
    md: { logo: 100, main: 19, sub: 10, tag: 9 },
    lg: { logo: 160, main: 26, sub: 13, tag: 10 },
    xl: { logo: 220, main: 32, sub: 15, tag: 11 },
  }

  const t = sizes[size] || sizes.md
  const mainColor = inverted ? 'white' : B.tealDeep
  const subColor  = inverted ? '#FF8A80' : B.red
  const tagBg     = inverted ? 'rgba(255,255,255,0.15)' : B.tealDeep
  const tagColor  = 'white'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.logo * 0.28 }}>
      <CSLogo size={t.logo} />
      <div>
        <div style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif", fontWeight: 800, fontSize: t.main, color: mainColor, letterSpacing: '0.04em', lineHeight: 1.05, textTransform: 'uppercase' }}>
          Career Station
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif", fontWeight: 700, fontSize: t.sub, color: subColor, letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1.1, marginTop: 1 }}>
          Education Service Pvt. Ltd.
        </div>
        <div style={{ display: 'inline-block', background: tagBg, color: tagColor, fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif", fontWeight: 600, fontSize: t.tag, letterSpacing: '0.14em', textTransform: 'uppercase', padding: `${t.tag * 0.15}px ${t.tag * 0.6}px`, marginTop: 3, borderRadius: 2 }}>
          A Complete Guidance for Career
        </div>
      </div>
    </div>
  )
}

function getGrade(pct) {
  if (pct >= 90) return { label: 'Distinction', tier: 'A+', color: B.teal,  bg: B.tealPale,  border: B.tealBorder }
  if (pct >= 75) return { label: 'Merit',       tier: 'A',  color: B.teal,  bg: B.tealPale,  border: B.tealBorder }
  if (pct >= 60) return { label: 'Pass',        tier: 'B',  color: B.green, bg: B.greenPale, border: B.greenBorder }
  if (pct >= 40) return { label: 'Average',     tier: 'C',  color: B.amber, bg: B.amberPale, border: B.amberBorder }
  return          { label: 'Needs Improvement', tier: 'D',  color: B.red,   bg: B.redPale,   border: B.redBorder }
}

function getMotivation(pct) {
  if (pct >= 90) return { msg: "Outstanding performance — you're among Career Station's top achievers.", icon: '🏆', level: 'Elite', action: 'Aim for 100% next round', accentColor: B.gold }
  if (pct >= 75) return { msg: "Excellent work. Your commitment to excellence is reflected in every result.", icon: '⭐', level: 'Strong', action: 'Focus on complex concepts', accentColor: B.teal }
  if (pct >= 60) return { msg: "Solid performance. Targeted practice will elevate your rank further.", icon: '📈', level: 'Good', action: 'Review incorrect answers today', accentColor: B.tealLight }
  if (pct >= 40) return { msg: "You have the foundation. Consistency and revision will transform your scores.", icon: '💪', level: 'Growing', action: 'Build a daily study habit', accentColor: B.amber }
  return { msg: "Every expert started here. Career Station's guidance system is built for your comeback.", icon: '🌱', level: 'Beginning', action: 'Master the fundamentals', accentColor: B.red }
}

// ─── Question card (logic preserved) ──────────────────────────────────────────
function QuestionCard({ question, reviewQuestions, onToggleReview }) {
  const [open, setOpen] = useState(false)
  const correct = question.status === 'Correct'
  const flagged = reviewQuestions.includes(question.question_number)

  return (
    <div style={{
      borderRadius: 14,
      background: 'white',
      border: `1.5px solid ${open ? (correct ? B.greenBorder : B.redBorder) : B.hairline}`,
      overflow: 'hidden', marginBottom: 8,
      transition: 'all 0.2s',
      boxShadow: open ? `0 4px 20px ${B.tealGlow}` : 'none',
    }}>
      <button type="button" onClick={() => setOpen(v => !v)} style={{
        width: '100%', padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: correct ? B.greenPale : B.redPale,
          border: `1.5px solid ${correct ? B.greenBorder : B.redBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: correct ? B.green : B.red,
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>{question.question_number}</div>
        <span style={{ flex: 1, fontSize: 13, color: B.slate, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
          {question.question_text || 'Question text unavailable'}
        </span>
        <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20, flexShrink: 0, background: correct ? B.greenPale : B.redPale, color: correct ? B.green : B.red, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em' }}>
          {correct ? '✓ CORRECT' : '✗ WRONG'}
        </span>
        <svg style={{ width: 14, height: 14, color: B.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div style={{ borderTop: `1px solid ${B.hairline}`, padding: '20px 18px', background: B.surface }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={tagStyle('teal')}>Section {question.section}</span>
            {correct ? <span style={tagStyle('green')}>✓ Correct</span> : <span style={tagStyle('red')}>✗ Incorrect</span>}
          </div>
          {question.question_text && (
            <p style={{ fontSize: 14, color: B.ink, marginBottom: 16, lineHeight: 1.7, fontFamily: "'Libre Baskerville', serif" }}>{question.question_text}</p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {['A','B','C','D'].map(opt => {
              const isCorrect = question.correct_option === opt
              const isSelected = question.selected_option === opt
              return (
                <div key={opt} style={{ borderRadius: 10, padding: '10px 14px', fontSize: 13, display: 'flex', gap: 8, alignItems: 'flex-start',
                  background: isCorrect ? B.greenPale : isSelected ? B.redPale : 'white',
                  border: `1.5px solid ${isCorrect ? B.greenBorder : isSelected ? B.redBorder : B.hairline}`,
                  color: isCorrect ? B.green : isSelected ? B.red : B.slate,
                }}>
                  <span style={{ fontWeight: 900, fontSize: 10, flexShrink: 0, marginTop: 2, fontFamily: "'Barlow Condensed', sans-serif" }}>{opt}.</span>
                  <span style={{ flex: 1, lineHeight: 1.45 }}>{question[`option_${opt.toLowerCase()}`] || '—'}</span>
                  {isCorrect && <span style={{ fontSize: 11, fontWeight: 700, color: B.green, flexShrink: 0 }}>✓</span>}
                  {isSelected && !isCorrect && <span style={{ fontSize: 9, fontWeight: 700, color: B.red, flexShrink: 0 }}>You</span>}
                </div>
              )
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Correct Answer', value: question.correct_option },
              { label: 'Your Answer', value: question.selected_option || 'Skipped' },
              { label: 'Result', value: question.status },
            ].map(item => (
              <div key={item.label} style={{ borderRadius: 10, padding: '10px 12px', background: 'white', border: `1px solid ${B.hairline}`, textAlign: 'center' }}>
                <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: B.muted, marginBottom: 5, fontFamily: "'Barlow Condensed', sans-serif" }}>{item.label}</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: item.label === 'Result' ? (correct ? B.green : B.red) : B.ink, fontFamily: "'Barlow Condensed', sans-serif" }}>{item.value}</p>
              </div>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderRadius: 10, padding: '10px 14px',
            border: `1.5px solid ${flagged ? B.amberBorder : B.hairline}`,
            background: flagged ? B.amberPale : 'white',
            color: flagged ? B.amber : B.muted, fontSize: 13, fontWeight: 600,
          }}>
            <input type="checkbox" checked={flagged} onChange={() => onToggleReview(question.question_number)} style={{ width: 15, height: 15, accentColor: B.amber }} />
            Flag for review request
          </label>
        </div>
      )}
    </div>
  )
}

const tagStyle = (color) => {
  const map = {
    teal:  { bg: B.tealPale,  text: B.teal,  border: B.tealBorder },
    red:   { bg: B.redPale,   text: B.red,   border: B.redBorder },
    green: { bg: B.greenPale, text: B.green, border: B.greenBorder },
    amber: { bg: B.amberPale, text: B.amber, border: B.amberBorder },
    gold:  { bg: B.goldPale,  text: B.gold,  border: B.goldBorder },
  }
  const s = map[color] || map.teal
  return {
    display: 'inline-block', background: s.bg, color: s.text,
    border: `1px solid ${s.border}`, borderRadius: 99,
    padding: '3px 10px', fontSize: 10, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
  }
}

// ─── Section bar component ─────────────────────────────────────────────────────
function SectionBar({ label, score, max, color, sublabel }) {
  const pct = Math.round((score / max) * 100)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: B.ink }}>{label}</span>
          <span style={{ fontSize: 11, color: B.muted, marginLeft: 8 }}>{sublabel}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: B.ink, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 12, color: B.muted }}>/{max}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color, marginLeft: 6, background: `${color}15`, padding: '2px 8px', borderRadius: 20 }}>{pct}%</span>
        </div>
      </div>
      <ProgressBar value={score} max={max} color={color} bg={`${color}18`} height={10} />
    </div>
  )
}

// ─── Global styles ─────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { -webkit-font-smoothing: antialiased; background: ${B.off}; }

  @keyframes cs-rise  { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cs-fade  { from { opacity:0; } to { opacity:1; } }
  @keyframes cs-pop   { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
  @keyframes cs-pulse { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
  @keyframes cs-spin  { to { transform:rotate(360deg); } }
  @keyframes cs-float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
  @keyframes cs-glow  { 0%,100%{opacity:0.6;} 50%{opacity:1;} }
  @keyframes cs-slide-in { from{opacity:0;transform:translateX(-12px);} to{opacity:1;transform:translateX(0);} }

  .cs-rise   { animation: cs-rise 0.65s cubic-bezier(0.16,1,0.3,1) forwards; }
  .cs-rise-1 { animation-delay:0.04s; opacity:0; }
  .cs-rise-2 { animation-delay:0.12s; opacity:0; }
  .cs-rise-3 { animation-delay:0.22s; opacity:0; }
  .cs-rise-4 { animation-delay:0.34s; opacity:0; }
  .cs-rise-5 { animation-delay:0.46s; opacity:0; }
  .cs-pop    { animation: cs-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .cs-fade   { animation: cs-fade 0.5s ease forwards; }
  .cs-pulse  { animation: cs-pulse 2.4s ease-in-out infinite; }
  .cs-spin   { animation: cs-spin 0.9s linear infinite; }
  .cs-float  { animation: cs-float 4s ease-in-out infinite; }

  .cs-input {
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    outline: none;
  }
  .cs-input:focus {
    border-color: ${B.teal} !important;
    box-shadow: 0 0 0 4px ${B.tealGlow}, 0 0 0 1px ${B.teal}40;
    background: white !important;
  }

  .cs-btn {
    font-family: 'DM Sans', sans-serif;
    transition: all 0.22s cubic-bezier(0.16,1,0.3,1);
    cursor: pointer;
    border: none;
    outline: none;
  }
  .cs-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(10,53,64,0.22);
  }
  .cs-btn:active:not(:disabled) { transform: translateY(0px); }

  .cs-card-hover {
    transition: transform 0.22s, box-shadow 0.22s;
  }
  .cs-card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 36px ${B.tealGlow};
  }

  .cs-tab-btn {
    transition: all 0.18s;
    cursor: pointer;
    border: none;
    font-family: 'DM Sans', sans-serif;
  }

  .cs-insight-line {
    animation: cs-slide-in 0.4s ease forwards;
  }

  /* Sun ray decorative geometry */
  .cs-sun-geo {
    position: absolute;
    pointer-events: none;
    border-radius: 50%;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${B.surface}; }
  ::-webkit-scrollbar-thumb { background: ${B.tealBorder}; border-radius: 99px; }
`

// ═════════════════════════════════════════════════════════════════════════════
// SEARCH FORM — "The Portal"
// ═════════════════════════════════════════════════════════════════════════════
function SearchForm({ onResult }) {
  const [symbolNumber, setSymbolNumber] = useState('')
  const [examDate, setExamDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!symbolNumber.trim() || !examDate.trim()) {
      setError('Please enter both your symbol number and exam date.')
      return
    }
    try {
      setLoading(true)
      const params = new URLSearchParams({ symbol_number: symbolNumber.trim(), exam_date: examDate.trim() })
      const res = await fetch(`${API_BASE_URL}/results/public?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Unable to find your result. Please check your details.')
      onResult(data.data, symbolNumber.trim(), examDate.trim())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: B.off, fontFamily: "'DM Sans', system-ui, sans-serif", color: B.ink }}>
      <style>{STYLES}</style>

      {/* ── HERO — full bleed dark teal with sun geometry ── */}
      <div style={{
        background: `linear-gradient(160deg, ${B.tealDeep} 0%, ${B.tealDark} 55%, #0D5E6D 100%)`,
        position: 'relative', overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Decorative sun-ray geometry from logo */}
        <div className="cs-sun-geo" style={{ width: 700, height: 700, top: -300, right: -200, background: `radial-gradient(circle, ${B.tealLight}18 0%, transparent 70%)` }} />
        <div className="cs-sun-geo" style={{ width: 500, height: 500, top: -150, right: -50, background: `conic-gradient(from 0deg, transparent 0%, ${B.red}08 10%, transparent 20%, ${B.red}05 30%, transparent 40%, ${B.tealLight}08 50%, transparent 60%)` }} />
        {/* Rising figure abstract lines */}
        <div style={{ position: 'absolute', top: 60, right: 80, width: 2, height: 340, background: `linear-gradient(to bottom, ${B.red}60, transparent)`, transform: 'rotate(-12deg)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 60, right: 110, width: 2, height: 280, background: `linear-gradient(to bottom, ${B.red}40, transparent)`, transform: 'rotate(-6deg)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 60, right: 140, width: 1.5, height: 260, background: `linear-gradient(to bottom, ${B.red}25, transparent)`, transform: 'rotate(0deg)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 60, right: 50, width: 2, height: 300, background: `linear-gradient(to bottom, ${B.red}50, transparent)`, transform: 'rotate(-18deg)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 60, right: 30, width: 1.5, height: 220, background: `linear-gradient(to bottom, ${B.red}30, transparent)`, transform: 'rotate(-24deg)', pointerEvents: 'none' }} />
        {/* Leaf shape faint */}
        <div style={{ position: 'absolute', bottom: -120, left: -80, width: 480, height: 600, borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%', background: `linear-gradient(160deg, ${B.tealMid}15, transparent)`, pointerEvents: 'none' }} />

        {/* Nav */}
        <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, position: 'relative', zIndex: 10 }}>
          <CSWordmark size="md" inverted />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#5DE6A0' }} className="cs-pulse" />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif" }}>
              Results Live
            </span>
          </div>
        </header>

        {/* Main hero content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '40px 40px 80px', position: 'relative', zIndex: 5 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 64, alignItems: 'center' }}>

            {/* Left: Copy */}
            <div>
              <div className="cs-rise cs-rise-1" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: `${B.red}20`, border: `1px solid ${B.red}40`,
                borderRadius: 99, padding: '7px 18px', marginBottom: 28,
              }}>
                <CSLogo size={40} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Academic Performance Portal
                </span>
              </div>

              <h1 className="cs-rise cs-rise-2" style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(42px, 6.5vw, 72px)',
                fontWeight: 900, color: 'white',
                lineHeight: 1.0, letterSpacing: '0.01em',
                textTransform: 'uppercase', marginBottom: 20,
              }}>
                Your Results.<br />
                <span style={{ color: '#7FE8F0', WebkitTextStroke: '0px' }}>Your Ascent.</span>
              </h1>

              <p className="cs-rise cs-rise-3" style={{
                fontFamily: "'Libre Baskerville', serif",
                fontSize: 16, fontStyle: 'italic',
                color: 'rgba(255,255,255,0.60)',
                lineHeight: 1.75, maxWidth: 420,
                marginBottom: 32,
              }}>
                "Every score is a stepping stone. See where you stand, understand where to grow, and let Career Station guide the rest."
              </p>

              <div className="cs-rise cs-rise-4" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {[
                  { icon: '📊', label: 'Section-wise Analysis' },
                  { icon: '🏅', label: 'Class Rank & Percentile' },
                  { icon: '🎯', label: 'Personalized Insights' },
                  { icon: '📋', label: 'Question-level Review' },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{f.icon}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form card */}
            <div className="cs-rise cs-rise-3">
              <div style={{
                background: 'white',
                borderRadius: 28,
                boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}>
                {/* Card top accent */}
                <div style={{ height: 5, background: `linear-gradient(90deg, ${B.teal} 0%, ${B.red} 100%)` }} />

                <div style={{ padding: '36px 36px 32px' }}>
                  <div style={{ marginBottom: 28 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: B.teal, marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>
                      Secure Access
                    </p>
                    <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 30, color: B.ink, textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.05, marginBottom: 8 }}>
                      View Your Result
                    </h2>
                    <p style={{ fontSize: 13, color: B.muted, lineHeight: 1.65 }}>
                      Enter the credentials provided by Career Station to unlock your complete performance report.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: B.slate, marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>
                        Symbol Number
                      </label>
                      <input
                        type="text" value={symbolNumber}
                        onChange={e => setSymbolNumber(e.target.value)}
                        placeholder="e.g. SYM001"
                        className="cs-input"
                        style={{ width: '100%', borderRadius: 14, border: `1.5px solid ${B.tealBorder}`, background: B.surface, padding: '14px 18px', fontSize: 15, color: B.ink }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: B.slate, marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>
                        Exam Date
                        <span style={{ color: B.muted, textTransform: 'none', fontWeight: 400, letterSpacing: 0, fontFamily: "'DM Sans', sans-serif" }}> (Nepali date)</span>
                      </label>
                      <input
                        type="text" value={examDate}
                        onChange={e => setExamDate(e.target.value)}
                        placeholder="e.g. 2082-01-06"
                        className="cs-input"
                        style={{ width: '100%', borderRadius: 14, border: `1.5px solid ${B.tealBorder}`, background: B.surface, padding: '14px 18px', fontSize: 15, color: B.ink }}
                      />
                    </div>

                    {error && (
                      <div style={{ background: B.redPale, border: `1.5px solid ${B.redBorder}`, borderRadius: 12, padding: '12px 16px', fontSize: 13, color: B.red, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ flexShrink: 0 }}>⚠</span> {error}
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="cs-btn" style={{
                      background: loading ? B.tealDark : `linear-gradient(135deg, ${B.teal} 0%, ${B.tealDark} 100%)`,
                      color: 'white', borderRadius: 14, padding: '16px 24px',
                      fontSize: 15, fontWeight: 700, width: '100%',
                      letterSpacing: '0.04em', opacity: loading ? 0.8 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}>
                      {loading ? (
                        <>
                          <svg style={{ width: 16, height: 16 }} className="cs-spin" fill="none" viewBox="0 0 24 24">
                            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                          </svg>
                          Fetching your results…
                        </>
                      ) : 'Access My Performance Report →'}
                    </button>

                    <p style={{ fontSize: 11, color: B.muted, textAlign: 'center', lineHeight: 1.5 }}>
                      🔒 Your result is private — only your individual data is shown
                    </p>
                  </form>
                </div>

                {/* Card bottom strip */}
                <div style={{ background: B.tealPale, borderTop: `1px solid ${B.tealBorder}`, padding: '14px 36px', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {['CMAT', 'CSIT', 'IT Entrance', 'Class 12', 'BBS'].map(label => (
                    <span key={label} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', background: B.tealDeep, color: 'white', borderRadius: 4, padding: '3px 9px', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave transition */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: `linear-gradient(to top, ${B.off}, transparent)`, pointerEvents: 'none' }} />
      </div>

      {/* Footer */}
      <footer style={{ background: B.tealDeep, padding: '28px 40px', borderTop: `3px solid ${B.red}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <CSWordmark size="sm" inverted />
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['CMAT Preparation', 'CSIT Entrance', 'IT Entrance', 'Class 12'].map(item => (
              <span key={item} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>{item}</span>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '16px auto 0', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Career Station Education Service Pvt. Ltd. · Kathmandu, Nepal</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} Career Station. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// RESULT DASHBOARD — "The Ascent"
// ═════════════════════════════════════════════════════════════════════════════
function ResultDashboard({ result, symbolNumber, examDate, onBack }) {
  const [reviewQuestions, setReviewQuestions] = useState([])
  const [reviewReason, setReviewReason] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const isAbsent = result.status === 'ABSENT'
  const pct = isAbsent ? 0 : Number(result.summary.percentage)
  const grade = getGrade(pct)
  const motive = getMotivation(pct)
  const correctCount = isAbsent ? 0 : result.question_reviews.filter(q => q.status === 'Correct').length
  const wrongCount   = isAbsent ? 0 : result.question_reviews.filter(q => q.status !== 'Correct' && q.selected_option).length
  const skippedCount = isAbsent ? 0 : result.question_reviews.filter(q => !q.selected_option).length
  const toggleReview = (num) => setReviewQuestions(c => c.includes(num) ? c.filter(n => n !== num) : [...c, num])

  const submitReview = async () => {
    setReviewError('')
    setReviewMessage('')
    if (reviewQuestions.length === 0) { setReviewError('Select at least one question to flag.'); return }
    const wc = reviewReason.trim().split(/\s+/).filter(Boolean).length
    if (wc < 100) { setReviewError(`Please write at least 100 words (currently ${wc}).`); return }
    try {
      setReviewSubmitting(true)
      const res = await fetch(`${API_BASE_URL}/review-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol_number: symbolNumber, exam_date: examDate, question_numbers: reviewQuestions.join(', '), reason: reviewReason.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to submit')
      setReviewMessage('Review request submitted. Career Station faculty will respond within 24–48 hours.')
      setReviewQuestions([])
      setReviewReason('')
    } catch (err) { setReviewError(err.message) }
    finally { setReviewSubmitting(false) }
  }

  const tabs = [
    { key: 'overview',  label: 'My Performance', icon: '📊' },
    { key: 'questions', label: `Questions (${isAbsent ? 0 : result.question_reviews.length})`, icon: '📋' },
    { key: 'review',    label: `Review Request${reviewQuestions.length ? ` · ${reviewQuestions.length}` : ''}`, icon: '🔍' },
  ]

  const firstName = isAbsent ? 'Student' : result.student.full_name.split(' ')[0]

  return (
    <div style={{ minHeight: '100vh', background: B.off, fontFamily: "'DM Sans', system-ui, sans-serif", color: B.ink }}>
      <style>{STYLES}</style>

      {/* ── STICKY NAV ──────────────────────────────────────────────────── */}
      <header style={{
        background: 'white',
        borderBottom: `1px solid ${B.tealBorder}`,
        padding: '0 32px',
        position: 'sticky', top: 0, zIndex: 200,
        boxShadow: `0 1px 20px ${B.tealGlow}`,
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button type="button" onClick={onBack} className="cs-btn" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: B.surface, border: `1.5px solid ${B.tealBorder}`,
              borderRadius: 10, padding: '7px 16px',
              fontSize: 12, color: B.slate, fontWeight: 600,
              letterSpacing: '0.04em',
            }}>
              ← Back
            </button>
            <CSWordmark size="sm" />
          </div>
          {!isAbsent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: B.ink, lineHeight: 1.2 }}>{result.student.full_name}</p>
                <p style={{ fontSize: 10, color: B.muted, letterSpacing: '0.06em' }}>{result.student.symbol_number}</p>
              </div>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: `linear-gradient(135deg, ${B.teal}, ${B.tealDark})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 900, color: 'white',
                fontFamily: "'Barlow Condensed', sans-serif",
                boxShadow: `0 2px 10px ${B.tealGlow}`,
              }}>
                {result.student.full_name.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── ABSENT STATE ──────────────────────────────────────────────────── */}
      {isAbsent ? (
        <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 24px' }}>
          <div className="cs-pop" style={{
            background: 'white', border: `1.5px solid ${B.hairline}`,
            borderRadius: 28, padding: 56, textAlign: 'center',
            boxShadow: `0 12px 48px ${B.tealGlow}`,
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>😔</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 30, textTransform: 'uppercase', letterSpacing: '0.04em', color: B.ink, marginBottom: 8 }}>
              Absent — {result.exam.exam_name}
            </h2>
            <p style={{ color: B.muted, fontSize: 14, marginBottom: 20 }}>{result.exam.course} • {result.exam.nepali_date}</p>
            <div style={{ background: B.tealPale, border: `1px solid ${B.tealBorder}`, borderRadius: 16, padding: '20px 24px' }}>
              <p style={{ color: B.slate, fontSize: 14, lineHeight: 1.75 }}>
                You were marked absent for this exam. Please contact Career Station faculty for attendance verification and to arrange a make-up session.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ── HERO RESULT BANNER ──────────────────────────────────────────── */}
          <div style={{
            background: `linear-gradient(150deg, ${B.tealDeep} 0%, ${B.tealDark} 50%, ${B.teal} 100%)`,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Sun-ray geometry */}
            <div style={{ position: 'absolute', top: -120, right: -120, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${B.tealLight}20, transparent 65%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, right: '18%', width: 1.5, height: '100%', background: `linear-gradient(to bottom, ${B.red}40, transparent)`, transform: 'rotate(-8deg)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, right: '22%', width: 1, height: '80%', background: `linear-gradient(to bottom, ${B.red}25, transparent)`, transform: 'rotate(-14deg)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: '30%', width: 200, height: 200, borderRadius: '50%', background: `${B.red}12`, pointerEvents: 'none' }} />

            <div style={{ maxWidth: 1140, margin: '0 auto', padding: '40px 32px 50px', position: 'relative', zIndex: 1 }}>
              {/* Welcome line */}
              <div className="cs-rise cs-rise-1" style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {result.exam.course} · {result.exam.topic_name} · {result.exam.nepali_date}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center' }}>
                {/* Left: Identity + greeting */}
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="cs-rise cs-rise-1" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: 'rgba(255,255,255,0.10)',
                      border: '2px solid rgba(255,255,255,0.18)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, fontWeight: 900, color: 'white',
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}>
                      {result.student.full_name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 3 }}>
                        Welcome back
                      </p>
                      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>
                        {result.student.full_name}
                      </h1>
                    </div>
                  </div>

                  <div className="cs-rise cs-rise-2">
                    <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontStyle: 'italic', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 400, marginBottom: 20 }}>
                      "{motive.msg}"
                    </p>
                  </div>

                  {/* Key insight chips */}
                  <div className="cs-rise cs-rise-3" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {result.summary.rank && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: B.goldPale, border: `1px solid ${B.goldBorder}`, borderRadius: 99, padding: '7px 16px' }}>
                        <span style={{ fontSize: 14 }}>🏅</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: B.gold, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em' }}>Rank #{result.summary.rank}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${grade.bg}`, border: `1px solid ${grade.border}`, borderRadius: 99, padding: '7px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: grade.color, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>{grade.tier} — {grade.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 99, padding: '7px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.80)', fontFamily: "'Barlow Condensed', sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase'" }}>{motive.level} Level</span>
                    </div>
                  </div>
                </div>

                {/* Right: Score ring */}
                <div className="cs-rise cs-rise-2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <ArcRing pct={pct} size={160} stroke={14} color='#7FE8F0' bg='rgba(255,255,255,0.10)'>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 40, color: 'white', lineHeight: 1 }}>
                        <AnimatedNumber target={Math.round(pct)} duration={1400} />
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.08em', fontFamily: "'Barlow Condensed', sans-serif" }}>
                        PERCENT
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                        {result.summary.marks} / 25
                      </div>
                    </div>
                  </ArcRing>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {result.exam.exam_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Hero bottom wave */}
            <div style={{ height: 32, background: B.off, borderRadius: '40px 40px 0 0', marginTop: -2 }} />
          </div>

          {/* ── QUICK STATS STRIP ──────────────────────────────────────────── */}
          <div style={{ background: B.off, padding: '0 32px' }}>
            <div style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginTop: -12, paddingBottom: 24 }}>
              {[
                { label: 'Total Marks', value: result.summary.marks, sub: 'out of 25', color: B.teal, bg: B.tealPale, border: B.tealBorder, icon: '📝' },
                { label: 'Correct', value: correctCount, sub: 'answers', color: B.green, bg: B.greenPale, border: B.greenBorder, icon: '✅' },
                { label: 'Incorrect', value: wrongCount, sub: 'answers', color: B.red, bg: B.redPale, border: B.redBorder, icon: '❌' },
                { label: 'Skipped', value: skippedCount, sub: 'unanswered', color: B.muted, bg: 'white', border: B.hairline, icon: '⭕' },
                { label: 'Accuracy', value: `${correctCount > 0 ? Math.round((correctCount / (correctCount + wrongCount || 1)) * 100) : 0}%`, sub: 'attempted', color: B.teal, bg: B.tealPale, border: B.tealBorder, icon: '🎯' },
              ].map((s, i) => (
                <div key={s.label} className={`cs-rise cs-rise-${Math.min(i + 2, 5)} cs-card-hover`} style={{
                  background: s.bg, border: `1.5px solid ${s.border}`,
                  borderRadius: 18, padding: '18px 16px', textAlign: 'center',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}>
                  <span style={{ fontSize: 20, display: 'block', marginBottom: 8 }}>{s.icon}</span>
                  <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: s.color, fontWeight: 700, marginBottom: 6, fontFamily: "'Barlow Condensed', sans-serif" }}>{s.label}</p>
                  <p style={{ fontSize: 30, fontWeight: 900, color: B.ink, lineHeight: 1, fontFamily: "'Barlow Condensed', sans-serif" }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: B.muted, marginTop: 4 }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── MAIN CONTENT AREA ──────────────────────────────────────────── */}
          <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px 72px' }}>

            {/* TABS */}
            <div className="cs-rise cs-rise-1" style={{
              display: 'flex', gap: 4, marginBottom: 28,
              background: 'white', borderRadius: 16, padding: 5,
              border: `1.5px solid ${B.tealBorder}`,
              boxShadow: `0 2px 12px ${B.tealGlow}`,
            }}>
              {tabs.map(tab => (
                <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className="cs-tab-btn" style={{
                  flex: 1, padding: '11px 14px', borderRadius: 12,
                  background: activeTab === tab.key ? B.teal : 'transparent',
                  color: activeTab === tab.key ? 'white' : B.muted,
                  fontSize: 13, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                }}>
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Exam Summary Card */}
                <div className="cs-rise cs-rise-1 cs-card-hover" style={{ background: 'white', border: `1.5px solid ${B.tealBorder}`, borderRadius: 22, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: B.teal, marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>Performance Snapshot</p>
                    <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 18, color: B.ink, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Exam Summary</h3>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: B.surface, borderRadius: 16 }}>
                    <div>
                      <p style={{ fontSize: 12, color: B.muted }}>Total Score</p>
                      <p style={{ fontSize: 24, fontWeight: 900 }}>{result.summary.marks} / 25</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 12, color: B.muted }}>Overall Percentage</p>
                      <p style={{ fontSize: 24, fontWeight: 900, color: B.teal }}>{Number(result.summary.percentage).toFixed(2)}%</p>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: 20 }}>
                    <ProgressBar value={result.summary.marks} max={25} color={B.teal} height={8} />
                  </div>
                </div>

                {/* Motivation Card */}
                <div className="cs-rise cs-rise-2 cs-card-hover" style={{
                  background: `linear-gradient(135deg, ${B.tealDeep} 0%, ${B.tealDark} 100%)`,
                  borderRadius: 22, padding: 24,
                  boxShadow: `0 8px 32px ${B.tealGlow}`,
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: 28 }}>{motive.icon}</span>
                      <div>
                        <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)', fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 3 }}>Career Station Says</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>{motive.msg}</p>
                      </div>
                    </div>
                    <div style={{ background: `${motive.accentColor}25`, border: `1px solid ${motive.accentColor}40`, borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 14 }}>🎯</span>
                      <div>
                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 2 }}>Next Focus</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{motive.action}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answer Distribution */}
                <div className="cs-rise cs-rise-2 cs-card-hover" style={{ background: 'white', border: `1.5px solid ${B.tealBorder}`, borderRadius: 22, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                  {/* ... keep your existing Answer Distribution content here ... */}
                </div>

                {/* Exam Details */}
                <div className="cs-rise cs-rise-3 cs-card-hover" style={{ background: 'white', border: `1.5px solid ${B.tealBorder}`, borderRadius: 22, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                  {/* ... keep your existing Exam Details content here ... */}
                </div>

                {/* CTA Button */}
                <button type="button" onClick={() => setActiveTab('questions')} className="cs-btn" style={{
                  background: `linear-gradient(135deg, ${B.teal} 0%, ${B.tealDark} 100%)`,
                  color: 'white', borderRadius: 18, padding: '18px 32px',
                  fontSize: 15, fontWeight: 700, width: '100%',
                  letterSpacing: '0.04em', boxShadow: `0 8px 32px ${B.tealGlow}`,
                }}>
                  View Detailed Question Review →
                </button>
              </div>
            )}

            {/* ── QUESTIONS TAB ──────────────────────────────────────────── */}
            {activeTab === 'questions' && (
              <div className="cs-rise cs-rise-1">
                <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {[
                      { color: B.green, label: `${correctCount} Correct` },
                      { color: B.red,   label: `${wrongCount} Incorrect` },
                      { color: B.muted, label: `${skippedCount} Skipped` },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                        <span style={{ fontSize: 12, color: B.slate, fontWeight: 600 }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: B.muted }}>Tap any question to expand</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {result.question_reviews.map(q => (
                    <QuestionCard key={q.question_number} question={q} reviewQuestions={reviewQuestions} onToggleReview={toggleReview} />
                  ))}
                </div>

                {reviewQuestions.length > 0 && (
                  <button type="button" onClick={() => setActiveTab('review')} className="cs-btn" style={{
                    width: '100%', marginTop: 20,
                    background: B.amberPale, border: `1.5px solid ${B.amberBorder}`,
                    borderRadius: 14, padding: '14px 24px',
                    fontSize: 13, fontWeight: 700, color: B.amber,
                  }}>
                    Submit Review Request for {reviewQuestions.length} question{reviewQuestions.length > 1 ? 's' : ''} →
                  </button>
                )}
              </div>
            )}

            {/* ── REVIEW TAB ─────────────────────────────────────────────── */}
            {activeTab === 'review' && (
              <div className="cs-rise cs-rise-1" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ background: 'white', border: `1.5px solid ${B.tealBorder}`, borderRadius: 22, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${B.hairline}` }}>
                    <CSLogo size={38} />
                    <div>
                      <p style={{ fontSize: 17, fontWeight: 900, color: B.ink, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' }}>Submit Review Request</p>
                      <p style={{ fontSize: 12, color: B.muted, marginTop: 3 }}>Career Station faculty reviews every request within 24–48 hours</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 22 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: B.slate, marginBottom: 12, fontFamily: "'Barlow Condensed', sans-serif" }}>
                      Selected Questions
                    </p>
                    {reviewQuestions.length === 0 ? (
                      <div style={{ padding: '16px 20px', background: B.surface, borderRadius: 12, border: `1px solid ${B.hairline}` }}>
                        <p style={{ fontSize: 13, color: B.muted, fontStyle: 'italic' }}>
                          Go to the Question Review tab and flag the questions you want reviewed.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {reviewQuestions.map(num => (
                          <button key={num} type="button" onClick={() => toggleReview(num)} className="cs-btn" style={{
                            background: B.amberPale, border: `1.5px solid ${B.amberBorder}`,
                            borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700,
                            color: B.amber, display: 'flex', alignItems: 'center', gap: 6,
                            fontFamily: "'Barlow Condensed', sans-serif",
                          }}>
                            Q{num} <span style={{ opacity: 0.6 }}>×</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: B.slate, fontFamily: "'Barlow Condensed', sans-serif" }}>Your Explanation</p>
                      <span style={{ fontSize: 11, fontWeight: 700, color: reviewReason.trim().split(/\s+/).filter(Boolean).length >= 100 ? B.green : B.muted }}>
                        {reviewReason.trim().split(/\s+/).filter(Boolean).length}/100 words minimum
                      </span>
                    </div>
                    <textarea
                      value={reviewReason}
                      onChange={e => setReviewReason(e.target.value)}
                      rows={8}
                      placeholder='Explain your concern clearly. For example: "Question 5 asks about the capital of Nepal. The answer key shows Option A (Mumbai) but the correct answer should be Option C (Kathmandu) because…"'
                      style={{
                        width: '100%', borderRadius: 14,
                        border: `1.5px solid ${B.tealBorder}`,
                        background: B.surface, padding: '14px 18px',
                        fontSize: 13, color: B.ink, resize: 'vertical',
                        lineHeight: 1.7, boxSizing: 'border-box',
                        outline: 'none', fontFamily: "'DM Sans', sans-serif",
                        transition: 'all 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderColor = B.teal; e.target.style.background = 'white' }}
                      onBlur={e => { e.target.style.borderColor = B.tealBorder; e.target.style.background = B.surface }}
                    />
                  </div>

                  {reviewError && (
                    <div style={{ background: B.redPale, border: `1.5px solid ${B.redBorder}`, borderRadius: 12, padding: '12px 16px', fontSize: 13, color: B.red, marginBottom: 16 }}>
                      {reviewError}
                    </div>
                  )}
                  {reviewMessage && (
                    <div style={{ background: B.greenPale, border: `1.5px solid ${B.greenBorder}`, borderRadius: 12, padding: '12px 16px', fontSize: 13, color: B.green, marginBottom: 16 }}>
                      ✓ {reviewMessage}
                    </div>
                  )}

                  <button type="button" onClick={submitReview} disabled={reviewSubmitting} className="cs-btn" style={{
                    background: reviewSubmitting ? B.tealDark : `linear-gradient(135deg, ${B.teal}, ${B.tealDark})`,
                    color: 'white', borderRadius: 14, padding: '15px 24px',
                    fontSize: 14, fontWeight: 700, width: '100%',
                    letterSpacing: '0.04em', opacity: reviewSubmitting ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  }}>
                    {reviewSubmitting ? (
                      <>
                        <svg style={{ width: 16, height: 16 }} className="cs-spin" fill="none" viewBox="0 0 24 24">
                          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                        </svg>
                        Submitting…
                      </>
                    ) : 'Submit Review Request to Career Station'}
                  </button>
                </div>

                <div style={{ background: B.tealPale, border: `1.5px solid ${B.tealBorder}`, borderRadius: 18, padding: '20px 24px' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: B.teal, marginBottom: 10, fontFamily: "'Barlow Condensed', sans-serif" }}>How It Works</p>
                  <p style={{ fontSize: 13, color: B.tealDark, lineHeight: 1.8 }}>
                    Your request is reviewed by Career Station faculty. If the concern is valid, the answer key is updated and all affected scores are recalculated automatically. Invalid or unsupported requests are archived as resolved.
                  </p>
                </div>
              </div>
            )}

          </div>
        </>
      )}

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: B.tealDeep, padding: '32px 40px', borderTop: `3px solid ${B.red}` }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 20 }}>
            <CSWordmark size="sm" inverted />
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Career Station Education Service Pvt. Ltd. · Kathmandu, Nepal</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} Career Station. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Main Export (logic preserved) ────────────────────────────────────────────
export default function StudentResultPortal() {
  const [result, setResult] = useState(null)
  const [symbolNumber, setSymbolNumber] = useState('')
  const [examDate, setExamDate] = useState('')

  const handleResult = (data, sym, date) => { setResult(data); setSymbolNumber(sym); setExamDate(date) }
  const handleBack = () => { setResult(null); setSymbolNumber(''); setExamDate('') }

  if (result) return <ResultDashboard result={result} symbolNumber={symbolNumber} examDate={examDate} onBack={handleBack} />
  return <SearchForm onResult={handleResult} />
}

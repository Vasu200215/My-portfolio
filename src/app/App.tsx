import { useEffect, useState } from 'react';
import { HeroCanvas } from './components/HeroCanvas';

/* ─── Data ────────────────────────────────────────────────── */
const PROJECTS = [
  {
    id: '01', accent: 'blue', icon: '🗺️',
    title: 'Archaeological RAG Chatbot',
    desc: 'Precision RAG system for querying archaeological PDFs, field notes, and satellite imagery. Multi-modal Q&A with predictive site localization and geospatial map overlays.',
    tags: ['LangChain', 'FAISS', 'GeoPandas', 'Folium', 'React'],
  },
  {
    id: '02', accent: 'purple', icon: '🧠',
    title: 'Local Mind',
    desc: 'Desktop-native interface for offline interaction and fine-tuning of Llama 3 and Mistral. Custom Post-Training Quantization for low-latency inference on consumer hardware.',
    tags: ['PyTorch', 'Llama 3', 'Mistral', 'PTQ', 'Qt'],
  },
  {
    id: '03', accent: 'teal', icon: '🔍',
    title: 'Site Discovery Predictor',
    desc: 'End-to-end ML pipeline combining Random Forest, XGBoost, and CNNs to predict historical site locations from multi-spectral geospatial features. 90%+ validated accuracy.',
    tags: ['Scikit-learn', 'XGBoost', 'TensorFlow', 'Folium'],
  },
  {
    id: '04', accent: 'amber', icon: '📖',
    title: 'Google Keep Clone',
    desc: 'Responsive notebook app with drag-and-drop, label categorization, and offline-first storage via Dexie.js / IndexedDB. Co-authored a peer-reviewed React paper.',
    tags: ['React JS', 'Dexie.js', 'IndexedDB', 'Sass'],
  },
];

const TOOL_GROUPS = [
  { label: 'AI / ML', tools: ['Python', 'PyTorch', 'TensorFlow', 'XGBoost', 'Scikit-learn'] },
  { label: 'Retrieval & LLMs', tools: ['LangChain', 'FAISS', 'Llama 3', 'Mistral'] },
  { label: 'Vision & Geo', tools: ['OpenCV', 'GeoPandas', 'Folium', 'Rasterio'] },
  { label: 'Frontend & API', tools: ['React JS', 'FastAPI', 'Dexie.js'] },
];

const ACCENT_GLOW: Record<string, string> = {
  blue:   'radial-gradient(ellipse at 80% 0%, rgba(59,130,246,0.13) 0%, transparent 65%)',
  purple: 'radial-gradient(ellipse at 80% 0%, rgba(139,92,246,0.13) 0%, transparent 65%)',
  teal:   'radial-gradient(ellipse at 80% 0%, rgba(20,184,166,0.13) 0%, transparent 65%)',
  amber:  'radial-gradient(ellipse at 80% 0%, rgba(245,158,11,0.13) 0%, transparent 65%)',
};
const ACCENT_ICON: Record<string, string> = {
  blue:   'rgba(59,130,246,0.15)',
  purple: 'rgba(139,92,246,0.15)',
  teal:   'rgba(20,184,166,0.15)',
  amber:  'rgba(245,158,11,0.15)',
};
const ACCENT_LINE: Record<string, string> = {
  blue: '#3b82f6', purple: '#8b5cf6', teal: '#14b8a6', amber: '#f59e0b',
};

/* ─── Tokens ─────────────────────────────────────────────── */
// Surface steps are intentionally subtle — enough to layer, not enough to flash
const T = {
  bg:   '#080808',
  s1:   '#0f0f0f',
  s2:   '#141414',
  s3:   '#1a1a1a',
  s4:   '#202020',
  tp:   '#f0efe8',        // primary text
  ts:   'rgba(240,239,232,0.6)',   // secondary (was 0.55 → bumped for readability)
  tm:   'rgba(240,239,232,0.35)',  // muted
  bd:   'rgba(255,255,255,0.08)',  // border base (was 0.06 → more definition)
  bdh:  'rgba(255,255,255,0.16)',  // border hover
  blue: '#3b82f6',
  blueD:'rgba(59,130,246,0.14)',
};

/* ─── Global CSS ─────────────────────────────────────────── */
const CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { background: ${T.bg}; overflow-x: hidden; margin: 0; font-family: 'DM Sans', sans-serif; color: ${T.tp}; }

  /* scroll offset for fixed nav */
  [id] { scroll-margin-top: 88px; }

  @keyframes vg-pin {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes vg-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.35; transform: scale(0.7); }
  }
  @keyframes vg-orb {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%       { transform: translate(-12px, 14px) scale(1.06); }
  }
  @keyframes vg-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  /* staggered panel entries */
  .vg-panel { animation: vg-pin 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .vg-row > .vg-panel:nth-child(1) { animation-delay: 0.05s; }
  .vg-row > .vg-panel:nth-child(2) { animation-delay: 0.12s; }
  .vg-row > .vg-panel:nth-child(3) { animation-delay: 0.19s; }
  .vg-row > .vg-panel:nth-child(4) { animation-delay: 0.26s; }
  .vg-exp-grid > * { animation: vg-pin 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .vg-exp-grid > *:nth-child(1) { animation-delay: 0.08s; }
  .vg-exp-grid > *:nth-child(2) { animation-delay: 0.15s; }
  .vg-exp-grid > *:nth-child(3) { animation-delay: 0.22s; }
  .vg-exp-grid > *:nth-child(4) { animation-delay: 0.29s; }

  .vg-pulse-dot   { animation: vg-pulse 2.2s ease-in-out infinite; }
  .vg-pulse-green { animation: vg-pulse 2.2s ease-in-out infinite; }
  .vg-orb-float   { animation: vg-orb 7s ease-in-out infinite; }

  /* custom cursor */
  #vg-cur, #vg-ring {
    position: fixed; pointer-events: none; border-radius: 50%; z-index: 9999;
  }
  #vg-cur {
    width: 8px; height: 8px; background: ${T.blue};
    top: 0; left: 0; transform: translate(-50%, -50%);
    transition: width 0.15s, height 0.15s, opacity 0.15s;
  }
  #vg-ring {
    width: 32px; height: 32px; border: 1.5px solid rgba(59,130,246,0.45);
    top: 0; left: 0; z-index: 9998; transform: translate(-50%, -50%);
    transition: width 0.3s cubic-bezier(0.25,0.46,0.45,0.94),
                height 0.3s cubic-bezier(0.25,0.46,0.45,0.94),
                border-color 0.2s, opacity 0.2s;
  }
  @media (pointer: fine)  { body { cursor: none; } }
  @media (pointer: coarse){ #vg-cur, #vg-ring { display: none; } }

  /* project card hover glow */
  .vg-glow {
    position: absolute; inset: 0; opacity: 0;
    transition: opacity 0.35s; border-radius: inherit; pointer-events: none;
  }
  .vg-proj:hover .vg-glow  { opacity: 1; }
  .vg-proj { transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s !important; }
  .vg-proj:hover {
    border-color: ${T.bdh} !important;
    transform: translateY(-4px) !important;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4) !important;
  }

  /* tool chip hover */
  .vg-chip {
    display: flex; align-items: center; gap: 7px;
    background: ${T.s2}; border: 1px solid ${T.bd};
    border-radius: 8px; padding: 7px 14px;
    font-size: 12.5px; font-family: 'DM Mono', monospace; color: ${T.ts};
    transition: border-color 0.2s, color 0.2s, background 0.2s; cursor: default;
  }
  .vg-chip:hover {
    border-color: ${T.bdh}; color: ${T.tp}; background: ${T.s3};
  }

  /* grid */
  .vg-row {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 14px;
    margin-bottom: 14px;
  }

  @media (min-width: 1024px) {
    .col-hero     { grid-column: span 7; }
    .col-identity { grid-column: span 5; }
    .col-7        { grid-column: span 7; }
    .col-5        { grid-column: span 5; }
  }
  @media (min-width: 640px) and (max-width: 1023px) {
    .col-hero, .col-identity { grid-column: span 12; }
    .col-7 { grid-column: span 7; }
    .col-5 { grid-column: span 5; }
  }
  @media (max-width: 639px) {
    .col-hero, .col-identity, .col-7, .col-5 { grid-column: span 12; }
  }

  /* projects grid */
  .vg-exp-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
    margin-bottom: 14px;
  }
  @media (min-width: 560px)  { .vg-exp-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .vg-exp-grid { grid-template-columns: repeat(4, 1fr); } }

  /* tool group grid */
  .vg-tool-groups {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  @media (min-width: 860px) { .vg-tool-groups { grid-template-columns: repeat(4, 1fr); } }
  @media (max-width: 480px) { .vg-tool-groups { grid-template-columns: 1fr; } }

  /* nav */
  .vg-nav-links { display: none; }
  @media (min-width: 640px) {
    .vg-nav-links  { display: flex; }
    .vg-hamburger  { display: none !important; }
  }

  /* section header rule */
  .vg-section-rule {
    display: flex; align-items: center; gap: 16px;
    margin-bottom: 20px;
  }
  .vg-section-rule::after {
    content: ''; flex: 1; height: 1px; background: ${T.bd};
  }
`;

/* ─── Custom cursor ─────────────────────────────────────── */
function useCursor() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const cur  = document.getElementById('vg-cur');
    const ring = document.getElementById('vg-ring');
    if (!cur || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0, rafId = 0;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    document.addEventListener('mousemove', onMove);
    const tick = () => {
      cur.style.left  = mx + 'px'; cur.style.top  = my + 'px';
      rx += (mx - rx) * 0.11;     ry += (my - ry) * 0.11;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      rafId = requestAnimationFrame(tick);
    };
    tick();
    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafId); };
  }, []);
}

/* ─── Nav ────────────────────────────────────────────────── */
function Nav() {
  const [open, setOpen] = useState(false);
  const close  = () => { setOpen(false); document.body.style.overflow = ''; };
  const toggle = () => setOpen(v => { document.body.style.overflow = !v ? 'hidden' : ''; return !v; });

  return (
    <>
      {/* Mobile drawer */}
      {open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(8,8,8,0.98)', zIndex:199, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:40 }}>
          {[['#projects','Projects'],['#skills','Skills'],['#contact','Contact']].map(([href, label]) => (
            <a key={href} href={href} onClick={close} style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'clamp(32px,8vw,48px)', letterSpacing:'-0.02em', color:T.ts, textDecoration:'none', transition:'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = T.tp)}
              onMouseLeave={e => (e.currentTarget.style.color = T.ts)}>
              {label}
            </a>
          ))}
          <a href="mailto:vasugoyal2002@gmail.com" onClick={close} style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:T.blue, letterSpacing:'0.04em', border:'1px solid rgba(59,130,246,0.3)', padding:'10px 24px', borderRadius:100, textDecoration:'none', marginTop:8 }}>
            vasugoyal2002@gmail.com
          </a>
        </div>
      )}

      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, padding:'clamp(13px,2vw,18px) clamp(16px,3vw,40px)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(8,8,8,0.75)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderBottom:`1px solid ${T.bd}` }}>
        <a href="#" style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:T.tp, textDecoration:'none', letterSpacing:'-0.02em' }}>
          VG<span style={{ color:T.blue }}>.</span>
        </a>
        <div className="vg-nav-links" style={{ gap:32, alignItems:'center' }}>
          {[['#projects','Projects'],['#skills','Skills'],['#contact','Contact']].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize:13, color:T.ts, textDecoration:'none', letterSpacing:'0.02em', transition:'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = T.tp)}
              onMouseLeave={e => (e.currentTarget.style.color = T.ts)}>
              {label}
            </a>
          ))}
          <a href="mailto:vasugoyal2002@gmail.com" style={{ background:T.s3, border:`1px solid ${T.bd}`, color:T.tp, padding:'8px 20px', borderRadius:100, fontSize:13, textDecoration:'none', transition:'background .2s, border-color .2s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = T.s4; el.style.borderColor = T.bdh; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = T.s3; el.style.borderColor = T.bd; }}>
            Get in touch
          </a>
        </div>
        <button className="vg-hamburger" onClick={toggle} aria-label="Menu" style={{ display:'flex', flexDirection:'column', gap:5, background:'none', border:'none', cursor:'pointer', padding:6, zIndex:201 }}>
          {[
            { tf: open ? 'translateY(6.5px) rotate(45deg)' : 'none', op: 1 },
            { tf: 'none', op: open ? 0 : 1 },
            { tf: open ? 'translateY(-6.5px) rotate(-45deg)' : 'none', op: 1 },
          ].map((s, i) => (
            <span key={i} style={{ display:'block', width:22, height:1.5, background:T.tp, transition:'transform .25s, opacity .25s', transform:s.tf, opacity:s.op }} />
          ))}
        </button>
      </nav>
    </>
  );
}

function Panel({
  children,
  className = '',
  style = {},
  noHover = false,
  id
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  noHover?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`vg-panel ${className}`}
      style={{
        background: T.s1,
        border: `1px solid ${T.bd}`,
        borderRadius: 'clamp(16px,2vw,24px)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'border-color .3s',
        ...style
      }}
      onMouseEnter={
        noHover
          ? undefined
          : e => (e.currentTarget.style.borderColor = T.bdh)
      }
      onMouseLeave={
        noHover
          ? undefined
          : e => (e.currentTarget.style.borderColor = T.bd)
      }
    >
      {children}
    </div>
  );
}


/* ─── Section Header ─────────────────────────────────────── */
function SectionHeader({ num, label }: { num: string; label: string }) {
  return (
    <div className="vg-section-rule" style={{ marginBottom:16 }}>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, letterSpacing:'0.12em', textTransform:'uppercase', color:T.tm, flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ color:T.blue, opacity:0.7 }}>{num}</span>
        {label}
      </span>
    </div>
  );
}

/* ─── App ────────────────────────────────────────────────── */
export default function App() {
  useCursor();
  const pp = 'clamp(24px,3.5vw,44px)';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div id="vg-cur" />
      <div id="vg-ring" />
      <Nav />

      <main style={{ paddingTop:'calc(64px + clamp(20px,3vw,40px))', paddingLeft:'clamp(16px,3vw,40px)', paddingRight:'clamp(16px,3vw,40px)', paddingBottom:'clamp(32px,5vw,64px)', maxWidth:1340, margin:'0 auto' }}>

        {/* ── SECTION 1: Hero + Identity ── */}
        <div className="vg-row" style={{ marginBottom:40 }}>

          {/* Hero */}
          <Panel className="col-hero" noHover style={{ minHeight:'clamp(340px,40vw,500px)', padding:pp, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
            <HeroCanvas />
            {/* Scrim for text legibility */}
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.3) 50%, transparent 100%)', zIndex:1, pointerEvents:'none' }} />
            <div style={{ position:'relative', zIndex:2 }}>
              {/* Status badge */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.22)', borderRadius:100, padding:'5px 14px', fontSize:11, fontFamily:"'DM Mono',monospace", color:T.blue, marginBottom:20, letterSpacing:'0.06em' }}>
                <span className="vg-pulse-dot" style={{ width:5, height:5, borderRadius:'50%', background:T.blue, flexShrink:0, display:'inline-block' }} />
                Applied AI / GenAI Engineer
              </div>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(30px,4.5vw,58px)', lineHeight:1.04, letterSpacing:'-0.035em', color:T.tp, marginBottom:16, marginTop:0 }}>
                Turning Information<br />Into <span style={{ color:T.blue }}>Intelligence.</span>
              </h1>
              <p style={{ fontSize:'clamp(14px,1.4vw,16px)', color:T.ts, lineHeight:1.7, maxWidth:500, marginBottom:28, fontWeight:400 }}>
                ECE engineer building RAG pipelines, computer vision models, and locally-run LLM systems. Certified in Applied AI &amp; ML from IIT Madras.
              </p>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <button onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior:'smooth' })}
                  style={{ display:'inline-flex', alignItems:'center', gap:9, background:T.blue, color:'#fff', border:'none', borderRadius:100, padding:'12px 24px', fontSize:14, fontFamily:"'DM Sans',sans-serif", fontWeight:500, cursor:'pointer', transition:'background .2s, transform .2s', whiteSpace:'nowrap' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#2563eb'; el.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = T.blue; el.style.transform = 'none'; }}>
                  View Projects
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <a href="#contact" style={{ display:'inline-flex', alignItems:'center', background:'transparent', border:`1px solid ${T.bd}`, color:T.ts, borderRadius:100, padding:'12px 24px', fontSize:14, fontFamily:"'DM Sans',sans-serif", fontWeight:400, textDecoration:'none', transition:'border-color .2s, color .2s', whiteSpace:'nowrap' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = T.bdh; el.style.color = T.tp; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = T.bd; el.style.color = T.ts; }}>
                  Contact Me
                </a>
              </div>
            </div>
          </Panel>

          {/* Identity */}
          <Panel className="col-identity" style={{ padding:pp, display:'flex', flexDirection:'column', justifyContent:'space-between', minHeight:'clamp(240px,32vw,420px)' }}>
            {/* decorative orb */}
            <div className="vg-orb-float" style={{ position:'absolute', right:-50, top:-50, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.18), rgba(59,130,246,0.06), transparent 70%)', pointerEvents:'none' }} />

            {/* Top: name + availability */}
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16 }}>
                <span className="vg-pulse-green" style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 6px rgba(34,197,94,0.6)', display:'inline-block', flexShrink:0 }} />
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:T.tm, letterSpacing:'0.1em', textTransform:'uppercase' }}>Open to Opportunities</span>
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(34px,4.5vw,52px)', letterSpacing:'-0.04em', lineHeight:1, color:T.tp, marginBottom:14 }}>
                Vasu<br />Goyal
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:5, paddingTop:14, borderTop:`1px solid ${T.bd}` }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:T.blue, letterSpacing:'0.04em' }}>// Applied AI Engineer</span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:T.tm, letterSpacing:'0.04em' }}>// ML &amp; Computer Vision</span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:T.tm, letterSpacing:'0.04em' }}>// KIET, Ghaziabad · B.Tech ECE</span>
              </div>
            </div>

            {/* Bottom: stats */}
            <div style={{ position:'relative', zIndex:1, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {[['4','Projects'],['90%+','Accuracy'],['IIT','Certified']].map(([n, l]) => (
                <div key={l} style={{ padding:'14px 12px', background:T.s2, borderRadius:14, border:`1px solid ${T.bd}`, display:'flex', flexDirection:'column', gap:5 }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'clamp(20px,2.8vw,30px)', color:T.tp, letterSpacing:'-0.03em', lineHeight:1 }}>{n}</span>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:T.tm, letterSpacing:'0.08em', textTransform:'uppercase' }}>{l}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* ── SECTION 2: Projects ── */}
        <div id="projects" style={{ marginBottom:40 }}>
          <SectionHeader num="01" label="Projects" />
          <div className="vg-exp-grid">
            {PROJECTS.map(p => (
              <div key={p.id} className="vg-proj" style={{ background:T.s1, border:`1px solid ${T.bd}`, borderRadius:'clamp(16px,2vw,24px)', padding:'clamp(22px,2.5vw,30px)', position:'relative', overflow:'hidden', minHeight:'clamp(260px,26vw,320px)', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                <div className="vg-glow" style={{ background:ACCENT_GLOW[p.accent] }} />
                {/* Top accent line */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${ACCENT_LINE[p.accent]}, transparent)`, opacity:0.6 }} />
                <div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ width:40, height:40, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, background:ACCENT_ICON[p.accent] }}>{p.icon}</div>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:T.tm, letterSpacing:'0.1em' }}>{p.id}</span>
                  </div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'clamp(15px,1.5vw,18px)', letterSpacing:'-0.02em', color:T.tp, marginBottom:10, lineHeight:1.25 }}>{p.title}</div>
                  <div style={{ fontSize:'clamp(12.5px,1.1vw,13.5px)', color:T.ts, lineHeight:1.7, fontWeight:400, marginBottom:16 }}>{p.desc}</div>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {p.tags.map(tag => (
                    <span key={tag} style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, padding:'4px 10px', borderRadius:100, border:`1px solid ${T.bd}`, color:T.tm, background:T.s2 }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 3: Skills + Contact ── */}
        <div className="vg-row" id="skills">

          {/* Skills */}
          <Panel className="col-7" style={{ padding:pp }}>
            <SectionHeader num="02" label="Skills &amp; Tools" />
            <div className="vg-tool-groups">
              {TOOL_GROUPS.map(group => (
                <div key={group.label}>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:T.blue, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10, opacity:0.8 }}>{group.label}</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {group.tools.map(tool => (
                      <div key={tool} className="vg-chip">
                        <span style={{ width:4, height:4, borderRadius:'50%', background:T.blue, opacity:0.5, flexShrink:0, display:'inline-block' }} />
                        {tool}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Contact */}
          <Panel className="col-5" id="contact" style={{ padding:pp, background:'linear-gradient(145deg, #0d0d1e 0%, #0f0f1c 100%)', border:`1px solid rgba(59,130,246,0.15)`, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            {/* background orb */}
            <div style={{ position:'absolute', bottom:-70, right:-70, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', top:-40, left:-40, width:140, height:140, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)', pointerEvents:'none' }} />

            <div style={{ position:'relative', zIndex:1 }}>
              <SectionHeader num="03" label="Contact" />
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(22px,2.6vw,32px)', letterSpacing:'-0.03em', lineHeight:1.15, color:T.tp, marginBottom:10 }}>
                Let's Build<br />Something <span style={{ color:T.blue }}>Interesting.</span>
              </div>
              <div style={{ fontSize:13.5, color:T.ts, fontWeight:400, lineHeight:1.6, marginBottom:24 }}>
                Available for full-time roles, internships, and research collaborations in AI/ML.
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:8, position:'relative', zIndex:1 }}>
              {/* Email — primary CTA */}
              <a href="mailto:vasugoyal2002@gmail.com"
                style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)', borderRadius:12, padding:'12px 16px', fontSize:13, color:T.tp, textDecoration:'none', fontFamily:"'DM Mono',monospace", transition:'background .2s, border-color .2s', overflow:'hidden', minWidth:0 }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(59,130,246,0.18)'; el.style.borderColor = 'rgba(59,130,246,0.45)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(59,130,246,0.1)'; el.style.borderColor = 'rgba(59,130,246,0.25)'; }}>
                <svg width={14} height={14} style={{ flexShrink:0 }} viewBox="0 0 24 24" fill="none" stroke={T.blue} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>vasugoyal2002@gmail.com</span>
              </a>

              {/* LinkedIn + GitHub */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  {
                    href:'https://www.linkedin.com/in/vasu-goyal-353853325/', label:'LinkedIn',
                    icon:<svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
                    hoverColor:'#3b82f6',
                  },
                  {
                    href:'https://github.com/Vasu200215', label:'GitHub',
                    icon:<svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>,
                    hoverColor:T.tp,
                  },
                ].map(({ href, label, icon, hoverColor }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:T.s2, border:`1px solid ${T.bd}`, borderRadius:12, padding:'11px 12px', fontSize:13, color:T.ts, textDecoration:'none', fontFamily:"'DM Mono',monospace", transition:'all .2s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = hoverColor; el.style.borderColor = T.bdh; el.style.background = T.s3; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.ts; el.style.borderColor = T.bd; el.style.background = T.s2; }}>
                    {icon} {label}
                  </a>
                ))}
              </div>
            </div>
          </Panel>
        </div>

      </main>

      <footer style={{ maxWidth:1340, margin:'0 auto', padding:`20px clamp(16px,3vw,40px) 40px`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8, borderTop:`1px solid ${T.bd}` }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:T.tm }}>© 2025 Vasu Goyal</span>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:T.tm }}>Applied AI / GenAI Engineer · Ghaziabad, India</span>
      </footer>
    </>
  );
}

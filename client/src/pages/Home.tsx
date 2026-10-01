import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Menu, MoveRight, X } from "lucide-react";

type Condition = { label: string; value: string; detail: string };
const CONDITIONS: Condition[] = [
  { label: "Swell", value: "1.2m", detail: "12 sec · SW" },
  { label: "Wind", value: "Offshore", detail: "8 kts · E" },
  { label: "Tide", value: "Low", detail: "06:42 · 0.4m" },
  { label: "Water", value: "27°", detail: "Boardshorts ready" },
];
const NAV_ITEMS = ["The camp", "Surf weeks", "Journal", "Contact"];
function scrollToId(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 32); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  const navigate = (label: string) => { setMenuOpen(false); const map: Record<string, string> = { "The camp": "the-camp", "Surf weeks": "surf-weeks", Journal: "journal", Contact: "contact" }; scrollToId(map[label] ?? "the-camp"); };
  return <main className="wavepoint-site">
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <button className="wordmark" onClick={() => scrollToId("top")} aria-label="WavePoint, volver al inicio"><span className="wordmark-mark">W</span><span>WAVE<span>POINT</span></span></button>
      <nav className="desktop-nav" aria-label="Navegación principal">{NAV_ITEMS.slice(0, 3).map((item) => <button key={item} onClick={() => navigate(item)}>{item}</button>)}</nav>
      <div className="header-actions"><button className="header-book" onClick={() => navigate("Surf weeks")}>Book a week <ArrowUpRight size={15} /></button><button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button></div>
    </header>
    {menuOpen && <div className="mobile-menu"><div className="mobile-menu-inner"><span className="eyebrow">WAVEPOINT / MENU</span><div className="mobile-links">{NAV_ITEMS.map((item, index) => <button key={item} onClick={() => navigate(item)}><span>0{index + 1}</span>{item}<ArrowUpRight size={18} /></button>)}</div><p>Slow mornings. Salt water. Better stories.</p></div></div>}

    <section className="hero" id="top"><div className="hero-image"><img src="/wavepoint/hero-surf.jpg" alt="Surfista entrando en una ola frente a la costa tropical" /><div className="hero-overlay" /></div><div className="hero-copy"><span className="eyebrow hero-eyebrow">Playa Santa Teresa · Costa Rica</span><h1>Find your<br /><i>good wave.</i></h1><p>A surf camp for people who came for the ocean<br className="desktop-only" /> and stayed for the in-between.</p><button className="circle-cta" onClick={() => navigate("The camp")} aria-label="Conocer WavePoint"><span>Explore<br />the point</span><ArrowDownRight size={22} /></button></div><div className="hero-meta"><span>09° 38' N</span><span>85° 10' W</span><span className="hero-scroll">Scroll to explore <ArrowDownRight size={15} /></span></div></section>

    <section className="conditions" aria-label="Condiciones del mar"><div className="conditions-title"><span className="live-dot" /><span>Live conditions</span><strong>Playa Hermosa</strong></div><div className="conditions-grid">{CONDITIONS.map((condition) => <div className="condition" key={condition.label}><span>{condition.label}</span><strong>{condition.value}</strong><small>{condition.detail}</small></div>)}</div><div className="conditions-updated">Updated 10:24 <span>●</span></div></section>

    <section className="intro-section section-pad" id="the-camp"><div className="section-kicker">01 / The camp</div><div className="intro-layout"><h2>Come as you are.<br /><em>Leave with a story.</em></h2><div className="intro-text"><p>WavePoint is a small, design-led surf house on Costa Rica's wild Pacific coast. No wristbands, no buffet lines — just warm water, good people and the kind of days that make you forget your phone exists.</p><button className="text-link" onClick={() => navigate("Contact")}>Get to know us <MoveRight size={17} /></button></div></div><div className="feature-photo"><img src="/wavepoint/lineup.jpg" alt="Grupo de surfistas disfrutando el agua" /><div className="photo-caption"><span>WavePoint house / 09.38°N</span><span>See the place <ArrowUpRight size={14} /></span></div></div></section>

    <section className="weeks-section section-pad" id="surf-weeks"><div className="section-kicker">02 / Pick your rhythm</div><div className="section-heading"><h2>One week.<br /><em>Three ways in.</em></h2><p>Every stay is built around the same thing: more time in the water. Choose the pace that feels like yours.</p></div><div className="week-list"><article><span>01</span><div><h3>First swell</h3><p>For curious beginners · 7 nights</p></div><strong>from $890</strong><ArrowUpRight size={19} /></article><article><span>02</span><div><h3>Find your line</h3><p>For improving surfers · 7 nights</p></div><strong>from $1,140</strong><ArrowUpRight size={19} /></article><article><span>03</span><div><h3>Own the dawn</h3><p>Private coaching · 5 nights</p></div><strong>from $1,490</strong><ArrowUpRight size={19} /></article></div></section>

    <section className="journal-section section-pad" id="journal"><div className="journal-heading"><div className="section-kicker">03 / From the journal</div><button className="text-link">Read all stories <MoveRight size={17} /></button></div><div className="journal-grid"><article className="journal-feature"><img src="/wavepoint/board-sunset.jpg" alt="Tabla de surf sobre la arena al atardecer" /><span>Field notes · 04 min read</span><h3>The art of doing nothing<br />before the first wave.</h3></article><article className="journal-small"><img src="/wavepoint/lesson.jpg" alt="Clase de surf en el océano" /><span>How to start · 03 min read</span><h3>Small waves,<br />big progress.</h3></article></div></section>

    <section className="closing-section" id="contact"><div className="closing-image"><img src="/wavepoint/hero-surf.jpg" alt="Ola rompiendo en la costa" /></div><div className="closing-copy"><span className="eyebrow">Ready when you are</span><h2>The ocean<br /><em>is calling.</em></h2><button className="solid-button" onClick={() => navigate("Surf weeks")}>Plan your week <ArrowUpRight size={17} /></button></div></section>
    <footer><button className="wordmark footer-mark" onClick={() => scrollToId("top")}><span className="wordmark-mark">W</span><span>WAVE<span>POINT</span></span></button><span>© 2026 WavePoint Surf House</span><span>Santa Teresa, Costa Rica</span><a href="mailto:hello@wavepoint.surf">hello@wavepoint.surf</a></footer>
  </main>;
}

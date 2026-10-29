import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown, ArrowRight, ChevronLeft, ChevronRight, ExternalLink,
  Film, Heart, Mail, Menu, Music2, Play, RotateCcw, X
} from "lucide-react";
import { settings, chapters, songs, films, letters, finale } from "./content";
import FallingRoses from "./FallingRoses";
import AnniversaryCounter from "./AnniversaryCounter";
import FloralSprig from "./FloralSprig";

// Public, illustrative Unsplash images. Replace with your own approved photos
// in src/content.js. Never commit personal or private media to a public repo.
const demo = {
  hero: "https://images.unsplash.com/photo-1723719219412-d73eb2e2b631?auto=format&fit=crop&w=1400&q=82",
  one: "https://images.unsplash.com/photo-1758810409620-f4961f7431e8?auto=format&fit=crop&w=1000&q=80",
  two: "https://images.unsplash.com/photo-1667816944184-afefcbf2a1e4?auto=format&fit=crop&w=1000&q=80",
  three: "https://images.unsplash.com/photo-1723719219412-d73eb2e2b631?auto=format&fit=crop&w=1000&q=80",
  firstDate: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=80",
  adventures: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80",
  sunset: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1000&q=80"
};
const demoMemoryImages = {
  "first-hello": demo.one,
  "first-date": demo.firstDate,
  "first-photo": demo.three,
  adventure: demo.adventures,
  outtakes: demo.two,
  "little-things": demo.sunset,
  growth: demo.two,
  home: demo.firstDate,
  today: demo.three
};
const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
};

function Photo({ src, alt, className = "", eager = false, children, sample = false }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return (
    <div className={"photo " + className}>
      {src && !broken ? (
        <img src={src} alt={alt || "Romantic photograph"} loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined} decoding="async" onError={() => setBroken(true)} />
      ) : <div className="photo-fallback"><Heart size={30} strokeWidth={1} /><span>Add your photo</span></div>}
      {sample && <span className="sample-tag">SAMPLE PHOTO</span>}
      {children}
    </div>
  );
}

function SectionHeading({ number, eyebrow, title, caption, light = false }) {
  return <motion.div {...reveal} className={"section-heading " + (light ? "on-light" : "")}>
    <span className="eyebrow">{number && <span className="section-number">{number}.</span>} {eyebrow}</span>
    <h2>{title}</h2>
    {caption && <p>{caption}</p>}
  </motion.div>;
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(limit > 0 ? window.scrollY / limit : 0);
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <div aria-hidden="true" className="scroll-progress"><span style={{ transform: "scaleX(" + progress + ")" }} /></div>;
}

function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const links = [
    ["#overview", "Our story"], ["#chapter-one", "Year one"], ["#chapter-two", "Year two"],
    ["#chapter-three", "Year three"], ["#soundtrack", "Soundtrack"],
    ["#letters", "Love letters"], ["#cinema", "Little cinema"], ["#finale", "Grand finale"]
  ];
  return <>
    <header className="site-header">
      <button className="icon-button" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="story-navigation">
        {open ? <X size={21}/> : <Menu size={21}/>}
      </button>
      <a href="#home" className="brand" onClick={() => setOpen(false)}>three years <i>♡</i></a>
      <a className="icon-button heart-link" href="#finale" aria-label="Jump to the final letter"><Heart size={20} strokeWidth={1.7}/></a>
    </header>
    <ScrollProgress />
    <AnimatePresence>
      {open && <motion.nav id="story-navigation" className="menu-drawer" aria-label="Story navigation"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
        <span className="eyebrow">FIND YOUR FAVORITE CHAPTER</span>
        {links.map(([href, label], i) => <a key={href} href={href} onClick={() => setOpen(false)}>
          <span>{String(i + 1).padStart(2, "0")}</span>{label}<ArrowRight size={15}/></a>)}
      </motion.nav>}
    </AnimatePresence>
  </>;
}

function Hero() {
  return <section id="home" className="hero" style={{ "--hero-focus": settings.heroImagePosition }}>
    <Photo className="hero-photo" src={settings.heroImage || demo.hero} eager alt={settings.heroImage ? settings.heroImageAlt : "Illustrative silhouette of a couple against a sunset"} sample={!settings.heroImage} />
    <div className="hero-shade" />
    <div className="film-grain" aria-hidden="true" />
    <motion.div className="hero-copy" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.05 }}>
      <span className="eyebrow">A LOVE STORY IN THREE CHAPTERS</span>
      <h1>Three Years,<br/><em>Still You.</em></h1>
      <AnniversaryCounter startDate={settings.relationshipStartDate} timeZone={settings.timeZone} />
      <p>Three years of laughter, late nights, adventures, and a love that keeps feeling new.</p>
      <a className="primary-button" href="#overview">Begin Our Story <ArrowRight size={17}/></a>
      <span className="hero-footnote">♡ &nbsp; MADE FOR ONE VERY SPECIAL PERSON</span>
    </motion.div>
    <a className="scroll-cue" href="#overview"><span>SCROLL TO REMEMBER</span><ArrowDown size={17}/></a>
    <div className="torn-edge torn-ivory" />
  </section>;
}

function Polaroid({ image, title, subtitle, rotation = "0deg", number, alt, note, noteId, expanded }) {
  return <div className={"polaroid" + (expanded ? " is-open" : "")} style={{ "--rotation": rotation }}>
    <Photo src={image} alt={alt || "Illustrative couple photograph"} sample />
    <div className="polaroid-caption">{number && <b>{number}</b>}<div><strong>{title}</strong><em>{subtitle}</em></div></div>
    <span className="polaroid-note" id={noteId} hidden={!expanded}>{note}</span>
  </div>;
}

function OverviewCard({ chapter, index, image, label }) {
  const [expanded, setExpanded] = useState(false);
  return <motion.div {...reveal} className="overview-link">
    <button className="polaroid-toggle" aria-label={`A note from year ${index + 1}`} aria-expanded={expanded}
      aria-controls={`polaroid-note-${chapter.id}`} onClick={() => setExpanded(!expanded)}
      onPointerEnter={event => { if (event.pointerType === "mouse") setExpanded(true); }}
      onPointerLeave={event => { if (event.pointerType === "mouse") setExpanded(false); }}>
      <Polaroid image={image} title={"Year " + (index + 1)} subtitle={label} number={index + 1}
        rotation={index % 2 ? "3deg" : "-3deg"} note={chapter.quote} expanded={expanded} noteId={`polaroid-note-${chapter.id}`} />
    </button>
    <a className="chapter-open" href={"#chapter-" + chapter.id}>Turn to year {index + 1} <ArrowRight size={13} /></a>
  </motion.div>;
}

function Overview() {
  const images = [demo.one, demo.two, demo.three];
  const labels = ["The Beginning", "Growing Together", "Still You"];
  return <section className="paper-section overview" id="overview">
    <FloralSprig className="floral-corner-top" />
    <SectionHeading light number="00" eyebrow="OUR LITTLE UNIVERSE" title={<>A love story in <em>three chapters.</em></>} caption="Different seasons. One favorite person." />
    <div className="overview-cards">
      {chapters.map((chapter, i) => <OverviewCard key={chapter.id} chapter={chapter} index={i} image={images[i]} label={labels[i]} />)}
    </div>
    <motion.blockquote {...reveal} className="overview-quote">“Out of all the stories life could have written for me, I’m glad mine has <em>you</em> in it.”</motion.blockquote>
    <span className="doodle-heart" aria-hidden="true">♡</span>
  </section>;
}

function MemoryCard({ memory, index, chapterIndex }) {
  const [secret, setSecret] = useState(false);
  const reducedMotion = useReducedMotion();
  const noteId = `confession-${memory.id}`;
  const image = memory.image || demoMemoryImages[memory.id] || demo.one;
  return <motion.article {...reveal} className={"memory-card memory-card-" + index}>
    <div className="memory-photo-wrap">
      <Photo src={image} alt={"Illustrative photo for " + memory.title} sample={!memory.image} />
      <div className="tape" aria-hidden="true" />
      <span className="memory-date">{memory.date}</span>
    </div>
    <div className="memory-copy">
      <span className="eyebrow">{memory.date}</span>
      <h3>{memory.title}</h3>
      <p>{memory.description}</p>
      {memory.secret && <div className={`memory-secret scrapbook-confession note-paper-${(chapterIndex + index) % 3}${secret ? " is-unfolded" : ""}`}>
        <button className="confession-toggle" id={`${noteId}-toggle`} aria-expanded={secret} aria-controls={noteId}
          onClick={() => setSecret(!secret)}>
          <span className="confession-stamp" aria-hidden="true"><Heart size={20} strokeWidth={1.3} /></span>
          <span className="confession-heading">
            <span className="confession-kicker">a little confession</span>
            <span className="confession-title">What I was actually thinking…</span>
            <span className="confession-invitation" aria-hidden="true">{secret ? "fold it back" : "unfold this little note"}
              <svg viewBox="0 0 38 18" fill="none"><path d="M2 5C10 17 22 16 33 7M25 6L34 6L32 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </span>
        </button>
        <AnimatePresence initial={false}>{secret && <motion.div className="confession-reveal" id={noteId} role="region"
          aria-labelledby={`${noteId}-toggle`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.3 }}>
          <div className="confession-paper">
            <span className="confession-margin" aria-hidden="true">p.s.</span>
            <p>{memory.secret}</p>
            <span className="confession-signoff" aria-hidden="true">a note to keep <Heart size={14} strokeWidth={1.2} /></span>
          </div>
        </motion.div>}</AnimatePresence>
      </div>}
    </div>
  </motion.article>;
}

function Chapter({ chapter, index }) {
  const isDark = index === 1;
  return <section id={"chapter-" + chapter.id} className={"story-chapter " + (isDark ? "dark-chapter" : "paper-section") + " chapter-" + chapter.id}>
    <FloralSprig className="floral-corner-top" />
    <FloralSprig className="floral-corner-bottom" />
    <div className="chapter-top">
      <motion.div {...reveal} className="chapter-label"><span className="eyebrow">0{index + 1}. / YEAR {index + 1}</span><span className="chapter-star">♡</span></motion.div>
      <motion.div {...reveal} className="chapter-titles"><h2>{chapter.name}</h2><em>{index === 0 ? "The Beginning" : index === 1 ? "Growing Together" : "Still You"}</em></motion.div>
      <motion.p {...reveal} className="chapter-opening">{chapter.intro}</motion.p>
    </div>
    <div className="chapter-hero-image">
      <Photo src={chapter.memories[0]?.image || [demo.one, demo.two, demo.three][index]}
        alt={"Illustrative chapter " + (index + 1) + " photograph"} sample={!chapter.memories[0]?.image} />
      <div className="chapter-image-caption">CHAPTER {index + 1} <span>·</span> {chapter.year}</div>
    </div>
    {index === 1 && <div className="chapter-tags"><span>ALL MEMORIES</span><span>ADVENTURES</span><span>LAUGHTER</span><span>LITTLE THINGS</span></div>}
    {index === 2 && <div className="paper-note"><span>THE LITTLE THINGS</span><p>Our morning texts<br/>Our late night talks<br/>Finding comfort in silence<br/>Still choosing each other</p><i>♡</i></div>}
    <div className="memory-stream">{chapter.memories.map((m, i) => <MemoryCard key={m.id} memory={m} index={i} chapterIndex={index} />)}</div>
    <motion.blockquote {...reveal} className="chapter-ending">“{chapter.quote}”<span>♡</span></motion.blockquote>
    <a className="chapter-next" href={index === 2 ? "#soundtrack" : "#chapter-" + chapters[index + 1].id}>Keep scrolling through our story <ArrowDown size={16}/></a>
    {index !== 1 && <div className={"torn-edge " + (index === 0 ? "torn-dark" : "torn-dark")} />}
  </section>;
}

function Soundtrack() {
  return <section className="soundtrack-section" id="soundtrack">
    <SectionHeading number="04" eyebrow="SONGS THAT TELL OUR STORY" title="Our Soundtrack" caption="Some songs take you right back to a moment. These are ours." />
    <div className="record-scene">
      <div className="record-cover"><Photo src={demo.sunset} alt="Illustrative sunset for the soundtrack cover" sample /></div>
      <div className="vinyl" aria-hidden="true"><span /></div>
    </div>
    <div className="song-list">{songs.map((song, i) => <motion.div {...reveal} className="song" key={song.id}>
      <span className="song-index">0{i + 1}</span>
      <div className="song-details"><h3>{song.title}</h3><p>{song.artist}</p><small>{song.note}</small></div>
      {song.url ? <a className="song-play" href={song.url} target="_blank" rel="noopener noreferrer" aria-label={"Open " + song.title}><Play size={18}/></a>
        : <span className="song-pending" title="Add the song link in src/content.js"><Music2 size={17}/></span>}
    </motion.div>)}</div>
    <p className="small-note">Add your favorite songs in src/content.js. Licensed music opens in its original player.</p>
  </section>;
}

function useDialog(isOpen, onClose) {
  const closeRef = useRef(null);
  const priorFocus = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!isOpen) return;
    priorFocus.current = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const keyDown = (e) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "Tab") {
        const modal = closeRef.current?.closest('[role="dialog"]');
        if (!modal) return;
        const nodes = [...modal.querySelectorAll('button:not([disabled]),a[href],video[controls]')];
        if (!nodes.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", keyDown);
    return () => { document.body.style.overflow = oldOverflow; window.removeEventListener("keydown", keyDown); priorFocus.current?.focus?.(); };
  }, [isOpen]);
  return closeRef;
}

function LetterModal({ letter, onClose, isFinal = false }) {
  const [showPS, setShowPS] = useState(false);
  const reducedMotion = useReducedMotion();
  const closeRef = useDialog(true, onClose);
  return <motion.div className="modal-shade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <motion.div className="letter-presentation" role="dialog" aria-modal="true" aria-label={letter.title}
      initial="sealed" animate="opened" exit={{ opacity: 0, y: 15 }}>
      <motion.div className="opening-envelope" aria-hidden="true" variants={{ sealed: { y: -100 }, opened: { y: 0 } }}
        transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.25 }}>
        <div className="opening-envelope-back" />
        <motion.div className="opening-envelope-flap" variants={{ sealed: { rotateX: 0 }, opened: { rotateX: -175 } }}
          transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.1 }} />
        <div className="opening-envelope-front" />
        <motion.span className="wax-seal" variants={{ sealed: { y: 0, opacity: 1, scale: 1 }, opened: { y: -28, opacity: 0, scale: 0.8 } }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}>♥</motion.span>
      </motion.div>
      <motion.div className="letter-modal" variants={{ sealed: { y: 65, opacity: 0, scale: 0.96 }, opened: { y: 0, opacity: 1, scale: 1 } }}
        transition={{ duration: reducedMotion ? 0 : 0.55, delay: reducedMotion ? 0 : 0.4 }}>
      <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Close letter"><X size={20}/></button>
      <span className="eyebrow">{isFinal ? "TO BE CONTINUED, FOREVER" : "SEALED WITH LOVE"}</span>
      <h2>{letter.title}</h2>
      {letter.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      {letter.ps && <><button className="ps-trigger" onClick={() => setShowPS(!showPS)}>{showPS ? "Hide P.S." : "P.S. One more thing..."} ♡</button>{showPS && <p className="postscript">{letter.ps}</p>}</>}
      <div className="letter-seal">♥</div>
      </motion.div>
    </motion.div>
  </motion.div>;
}

function LetterVault() {
  const [active, setActive] = useState(null);
  return <section className="paper-section letters-section" id="letters">
    <FloralSprig className="floral-corner-top" />
    <SectionHeading light number="05" eyebrow="WORDS FOR EVERY VERSION OF YOU" title="Letters to You" caption="A few things I have always wanted you to know. Choose an envelope." />
    <div className="envelope-list">{letters.map((letter, i) => <motion.button {...reveal} className="envelope-row" key={letter.id} onClick={() => setActive(letter)}>
      <span className="envelope-illustration"><Mail size={33} strokeWidth={1.2}/><span>♥</span></span>
      <span className="envelope-details"><strong>{letter.title}</strong><small>{letter.caption}</small></span>
      <ChevronRight size={19} strokeWidth={1.5}/>
    </motion.button>)}</div>
    <p className="letter-signoff">Four letters. A thousand feelings. Always you. ♡</p>
    <AnimatePresence>{active && <LetterModal key={active.id} letter={active} onClose={() => setActive(null)}/>}</AnimatePresence>
    <div className="torn-edge torn-dark" />
  </section>;
}

function Cinema() {
  const [active, setActive] = useState(null);
  const closeRef = useDialog(Boolean(active), () => setActive(null));
  return <section className="cinema-section" id="cinema">
    <SectionHeading number="06" eyebrow="PRESS PLAY ON OUR FAVORITE MOMENTS" title="Our Little Cinema" caption="Some memories are better in motion. Even the embarrassing ones."/>
    <div className="cinema-list">{films.map((film, i) => <motion.button {...reveal} className={"cinema-card cinema-card-" + i} key={film.id} onClick={() => setActive(film)}>
      <div className="cinema-thumb"><Photo src={film.poster || [demo.three, demo.two][i % 2]} alt={"Illustrative preview for " + film.title} sample={!film.poster} /><span className="big-play"><Play size={25} fill="currentColor"/></span></div>
      <span className="eyebrow">FILM 0{i + 1}</span><h3>{film.title}</h3><p>{film.subtitle}</p>
      <span className="cinema-link">{film.src ? "Watch this memory" : "Preview this section"} <ArrowRight size={15}/></span>
    </motion.button>)}</div>
    <AnimatePresence>{active && <motion.div className="modal-shade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onMouseDown={e => { if (e.target === e.currentTarget) setActive(null); }}>
      <div className="cinema-modal" role="dialog" aria-modal="true" aria-label={active.title}>
        <button ref={closeRef} className="modal-close" onClick={() => setActive(null)} aria-label="Close video"><X size={20}/></button>
        {active.src ? <video key={active.src} controls playsInline src={active.src} poster={active.poster || undefined} /> : <div className="empty-cinema"><Film size={40}/><h3>{active.title}</h3><p>Add your own video source in src/content.js to complete this memory.</p></div>}
      </div>
    </motion.div>}</AnimatePresence>
  </section>;
}

function Finale() {
  const [show, setShow] = useState(false);
  const [arrived, setArrived] = useState(false);
  return <motion.section className={"finale" + (arrived ? " has-arrived" : "") + (show ? " has-letter-open" : "")} id="finale"
    onViewportEnter={() => setArrived(true)} viewport={{ once: true, amount: 0.15 }}>
    <Photo className="finale-photo" src={settings.heroImage || demo.hero} alt={settings.heroImage ? settings.heroImageAlt : "Illustrative sunset photograph of a couple"} sample={!settings.heroImage} />
    <div className="finale-shade" />
    <div className="finale-warmth" aria-hidden="true" />
    <div className="film-grain" aria-hidden="true" />
    <div className="finale-lights" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i}
      style={{ left: `${8 + (i * 29) % 84}%`, top: `${12 + (i * 17) % 68}%`, "--light-delay": `${i * 0.13}s` }} />)}</div>
    <motion.div {...reveal} className="finale-copy">
      <span className="eyebrow">07. / THE GRAND FINALE</span>
      <h2>And Here We Are,<br/><em>Three Years Later ♡</em></h2>
      <p>Through every season, every challenge, and every beautiful moment, I'm still so glad it's you. Thank you for three amazing years. Here's to more adventures, more laughter, and a lifetime of us.</p>
      <span className="finale-promise">{finale.answer}</span>
      <button className="primary-button" onClick={() => setShow(true)}>Here's to Forever <Heart size={16}/></button>
    </motion.div>
    <div className="finale-bottom"><span>THE END OF CHAPTER THREE</span><h3>{settings.closing}</h3><p>{settings.subclosing}</p><a href="#home">Relive our story <RotateCcw size={15}/></a></div>
    <AnimatePresence>{show && <LetterModal letter={{title:"My Favorite Story Is Us",body:finale.letter,ps:finale.signature}} isFinal onClose={() => setShow(false)}/>}</AnimatePresence>
  </motion.section>;
}

export default function App() {
  return <MotionConfig reducedMotion="user"><div className="site"><FallingRoses /><Header /><main><Hero /><Overview />
    {chapters.map((chapter, i) => <Chapter chapter={chapter} index={i} key={chapter.id}/>)}
    <Soundtrack /><LetterVault /><Cinema /><Finale /></main>
    <footer className="site-footer"><span>MADE WITH ALL MY LOVE ♡</span><a href="#home">BACK TO THE BEGINNING ↑</a></footer>
  </div></MotionConfig>;
}

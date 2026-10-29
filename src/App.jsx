import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown, ArrowRight, ChevronLeft, ChevronRight, ExternalLink,
  Film, Heart, Mail, Menu, Music2, Play, RotateCcw, X
} from "lucide-react";
import { settings, chapters, songs, films, letters, finale, favoriteTree } from "./content";
import FallingRoses from "./FallingRoses";
import AnniversaryCounter from "./AnniversaryCounter";
import FloralSprig from "./FloralSprig";
import Photo from "./Photo";
import PhotoAlbum, { usePhotoAlbum } from "./PhotoAlbum";
import ChapterBookmarks from "./ChapterBookmarks";
import useDialog from "./useDialog";
import DialogBackdrop from "./DialogBackdrop";
import ScrollButterflies from "./ScrollButterflies";
import FlowerBouquet from "./FlowerBouquet";
import useCanonMusic from "./useCanonMusic";
import { BackgroundMusic, StoryBurst } from "./StoryOpening";
import FittedLetter from "./FittedLetter";
import FavoriteTree from "./FavoriteTree";

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
const memoryImage = memory => memory.image || demoMemoryImages[memory.id] || demo.one;
const albumPhotos = chapters.flatMap(chapter => chapter.memories.map(memory => ({
  id: memory.id, src: memoryImage(memory), title: memory.title, date: memory.date,
  caption: memory.description, sample: !memory.image,
  alt: memory.image ? (memory.alt || memory.title) : `Illustrative photo for ${memory.title}`
}))).concat(favoriteTree.image ? [{
  id: 'favorite-tree', src: favoriteTree.image, alt: favoriteTree.alt,
  title: favoriteTree.title, date: favoriteTree.eyebrow, caption: favoriteTree.note, sample: false
}] : []);
const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
};

function SealMark() {
  return <span className={"seal-mark" + (settings.monogram ? " is-monogram" : "")} aria-hidden="true">{settings.monogram || '♥'}</span>;
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
    ["#chapter-three", "Year three"], ["#favorite-tree", "Our favorite tree"], ["#soundtrack", "Soundtrack"],
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

function Hero({ phase, onBegin }) {
  const reducedMotion = useReducedMotion();
  const opened = phase === 'open';
  return <section id="home" className="hero" style={{ "--hero-focus": settings.heroImagePosition }}>
    <Photo className="hero-photo" src={settings.heroImage || demo.hero} eager alt={settings.heroImage ? settings.heroImageAlt : "Illustrative silhouette of a couple against a sunset"} sample={!settings.heroImage} />
    <div className="hero-shade" />
    <div className="film-grain" aria-hidden="true" />
    <motion.div className="hero-copy" initial={reducedMotion ? false : { opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 1.05 }}>
      <span className="eyebrow">A LOVE STORY IN THREE CHAPTERS</span>
      <h1>Three Years,<br/><em>Still You.</em></h1>
      {opened && <AnniversaryCounter startDate={settings.relationshipStartDate} timeZone={settings.timeZone} />}
      <p>Three years of laughter, late nights, adventures, and a love that keeps feeling new.</p>
      {opened ? <a className="primary-button" href="#overview">Continue Our Story <ArrowRight size={17}/></a>
        : <button className="primary-button begin-story" onClick={onBegin} disabled={phase === 'bursting'} aria-controls="our-story" aria-busy={phase === 'bursting'}>
          {phase === 'bursting' ? 'Opening Our Story…' : 'Begin Our Story'} <ArrowRight size={17}/>
        </button>}
      <span className="hero-footnote">♡ &nbsp; MADE FOR ONE VERY SPECIAL PERSON</span>
    </motion.div>
    {opened && <><a className="scroll-cue" href="#overview"><span>SCROLL TO REMEMBER</span><ArrowDown size={17}/></a>
    <div className="torn-edge torn-ivory" /></>}
  </section>;
}

function Polaroid({ image, title, subtitle, rotation = "0deg", number, alt, note, noteId, expanded }) {
  return <div className={"polaroid" + (expanded ? " is-open" : "")} style={{ "--rotation": rotation }}>
    <Photo src={image} alt={alt || "Illustrative couple photograph"} sample />
    <div className="polaroid-caption">{number && <b>{number}</b>}<div><strong>{title}</strong><em>{subtitle}</em></div></div>
    <div className="polaroid-note-slot" data-expanded={expanded}>
      <span className="polaroid-note" id={noteId} aria-hidden={!expanded}>{note}</span>
      <span className="polaroid-note-hint" aria-hidden="true">a little note for you ♡</span>
    </div>
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
  const openPhoto = usePhotoAlbum();
  const image = memoryImage(memory);
  return <motion.article {...reveal} className={"memory-card memory-card-" + index}>
    <div className="memory-photo-wrap">
      <Photo src={image} alt={memory.image ? (memory.alt || memory.title) : "Illustrative photo for " + memory.title}
        sample={!memory.image} onOpen={() => openPhoto(memory.id)} />
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

function ChapterKeepsakes({ chapter, paired = false }) {
  const openPhoto = usePhotoAlbum();
  const memories = paired ? chapter.memories.slice(0, 2) : chapter.memories.slice(0, 3);
  return <div className={paired ? "paired-snapshots" : "chapter-keepsakes"}>
    <div className={paired ? "snapshot-pair" : "photo-booth-strip"}>
      {memories.map((memory, index) => <figure key={memory.id} className="keepsake-frame">
        <Photo src={memoryImage(memory)} alt={memory.image ? (memory.alt || memory.title) : `Illustrative photo for ${memory.title}`}
          sample={!memory.image} onOpen={() => openPhoto(memory.id)} />
        <figcaption>{paired ? memory.title : `${String(index + 1).padStart(2, '0')} / ${chapter.year}`}</figcaption>
      </figure>)}
      {!paired && <span className="booth-strip-label">US, ON REPEAT ♡</span>}
    </div>
    {!paired && <div className="booth-scribble"><span>the scenes between the scenes</span><p>“{chapter.quote}”</p><span className="booth-heart" aria-hidden="true">♡</span></div>}
  </div>;
}

function Chapter({ chapter, index }) {
  const isDark = index === 1;
  const openPhoto = usePhotoAlbum();
  return <section id={"chapter-" + chapter.id} className={"story-chapter " + (isDark ? "dark-chapter" : "paper-section") + " chapter-" + chapter.id}>
    <FloralSprig className="floral-corner-top" />
    <FloralSprig className="floral-corner-bottom" />
    <div className="chapter-top">
      <motion.div {...reveal} className="chapter-label"><span className="eyebrow">0{index + 1}. / YEAR {index + 1}</span><span className="chapter-star">♡</span></motion.div>
      <motion.div {...reveal} className="chapter-titles"><h2>{chapter.name}</h2><em>{index === 0 ? "The Beginning" : index === 1 ? "Growing Together" : "Still You"}</em></motion.div>
      <motion.p {...reveal} className="chapter-opening">{chapter.intro}</motion.p>
    </div>
    {index === 0 ? <div className="chapter-hero-image">
      <Photo src={chapter.memories[0]?.image || [demo.one, demo.two, demo.three][index]}
        alt={chapter.memories[0]?.image ? chapter.memories[0].title : "Illustrative chapter " + (index + 1) + " photograph"}
        sample={!chapter.memories[0]?.image} onOpen={chapter.memories[0] ? () => openPhoto(chapter.memories[0].id) : undefined} />
      <div className="chapter-image-caption">CHAPTER {index + 1} <span>·</span> {chapter.year}</div>
    </div> : <ChapterKeepsakes chapter={chapter} paired={index === 2} />}
    {index === 1 && <div className="chapter-tags"><span>ALL MEMORIES</span><span>ADVENTURES</span><span>LAUGHTER</span><span>LITTLE THINGS</span></div>}
    {index === 2 && <div className="paper-note"><span>THE LITTLE THINGS</span><p>Our morning texts<br/>Our late night talks<br/>Finding comfort in silence<br/>Still choosing each other</p><i>♡</i></div>}
    <div className="memory-stream">{chapter.memories.map((m, i) => <MemoryCard key={m.id} memory={m} index={i} chapterIndex={index} />)}</div>
    <motion.blockquote {...reveal} className="chapter-ending">“{chapter.quote}”<span>♡</span></motion.blockquote>
    <a className="chapter-next" href={index === 2 ? "#favorite-tree" : "#chapter-" + chapters[index + 1].id}>Keep scrolling through our story <ArrowDown size={16}/></a>
    {index !== 1 && <div className={"torn-edge " + (index === 0 ? "torn-dark" : "torn-dark")} />}
  </section>;
}

function Soundtrack({ music }) {
  return <section className="soundtrack-section" id="soundtrack">
    <SectionHeading number="04" eyebrow="SONGS THAT TELL OUR STORY" title="Our Soundtrack" caption="Some songs take you right back to a moment. These are ours." />
    <div className="mixtape-keepsake" aria-hidden="true">
      <div className="cassette-sleeve"><span>A MIXTAPE FOR US</span><strong>Our songs, on repeat.</strong></div>
      <div className="cassette">
        <div className="cassette-label"><span>SIDE A</span><strong>three years of us</strong><span>♡</span></div>
        <div className="cassette-window"><i /><span /><i /></div>
        <div className="cassette-base"><i /><span>MADE WITH LOVE</span><i /></div>
      </div>
    </div>
    <div className="mixtape-tracklist">
      <div className="tracklist-heading"><span>SIDE A / THE FAVORITES</span><span>LOVE, ON REPEAT ♡</span></div>
      <ol className="song-list">{songs.map((song, i) => <motion.li {...reveal} className="song" key={song.id}>
      <span className="song-index">0{i + 1}</span>
      <div className="song-details"><h3>{song.title}</h3><p>{song.artist}</p><small>{song.note}</small></div>
      {song.background ? <button className="song-play" onClick={music.toggle} aria-pressed={music.playing} aria-label={(music.playing ? 'Pause ' : 'Play ') + song.title}><Music2 size={17}/></button>
        : song.url ? <a className="song-play" href={song.url} target="_blank" rel="noopener noreferrer" onClick={music.pause} aria-label={song.linkLabel || "Open " + song.title} title={song.linkLabel || "Open " + song.title}><ExternalLink size={17}/></a>
        : <span className="song-pending" title="Song link coming soon"><Music2 size={17}/></span>}
      </motion.li>)}</ol>
      <span className="tracklist-signoff">a few songs to carry us back.</span>
    </div>
    <p className="small-note">Find our favorites on Spotify. Canon in D accompanies our story.</p>
  </section>;
}

function LetterModal({ letter, onClose, isFinal = false }) {
  const [showPS, setShowPS] = useState(false);
  const reducedMotion = useReducedMotion();
  const closeRef = useDialog(true, onClose);
  const content = <div className={isFinal ? "final-gift-layout" : "letter-gift-layout"}>
      <div className="letter-panel">
      <motion.div className="opening-envelope" aria-hidden="true" variants={{ sealed: { y: -100 }, opened: { y: 0 } }}
        transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.25 }}>
        <div className="opening-envelope-back" />
        <motion.div className="opening-envelope-flap" variants={{ sealed: { rotateX: 0 }, opened: { rotateX: -175 } }}
          transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.1 }} />
        <div className="opening-envelope-front" />
        <motion.span className="wax-seal" variants={{ sealed: { y: 0, opacity: 1, scale: 1 }, opened: { y: -28, opacity: 0, scale: 0.8 } }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}><SealMark /></motion.span>
      </motion.div>
      <motion.div className="letter-modal" variants={{ sealed: { y: isFinal ? 18 : 65, scale: 0.96, clipPath: 'inset(100% 0% 0% 0%)' }, opened: { y: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' } }}
        transition={{ duration: reducedMotion ? 0 : 0.55, delay: reducedMotion ? 0 : 0.4 }}>
      {!isFinal && <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Close letter"><X size={20}/></button>}
      <span className="eyebrow">{isFinal ? "TO BE CONTINUED, FOREVER" : "SEALED WITH LOVE"}</span>
      <h2>{letter.title}</h2>
      {letter.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      {letter.ps && <><button className="ps-trigger" onClick={() => setShowPS(!showPS)}>{showPS ? "Hide P.S." : "P.S. One more thing..."} ♡</button>{showPS && <p className="postscript">{letter.ps}</p>}</>}
      {isFinal ? <div className="personal-signature"><span>{finale.signature}</span><strong>{settings.signature || settings.monogram}</strong><SealMark /></div>
        : <div className="letter-seal"><SealMark /></div>}
      </motion.div>
      </div>
      {isFinal && <motion.aside className="bouquet-keepsake" aria-label="Flowers for you"
        variants={{ sealed: { y: 12, scale: .94 }, opened: { y: 0, scale: 1 } }}
        transition={{ duration: reducedMotion ? 0 : .6, delay: reducedMotion ? 0 : .5 }}>
        <span className="bouquet-eyebrow">A LITTLE GIFT, ALL MY LOVE</span>
        <FlowerBouquet monogram={settings.monogram} laidDown />
      </motion.aside>}
      </div>;
  return <DialogBackdrop onClose={onClose} className={isFinal ? 'final-letter-backdrop' : ''}>
    <motion.div className={"letter-presentation" + (isFinal ? " final-letter-presentation" : "")} role="dialog" aria-modal="true" aria-label={letter.title}
      initial="sealed" animate="opened" exit={{ y: 15 }}>
      {isFinal && <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Close letter"><X size={20}/></button>}
      {isFinal ? <FittedLetter>{content}</FittedLetter> : content}
    </motion.div>
  </DialogBackdrop>;
}

function LetterVault() {
  const [active, setActive] = useState(null);
  return <section className="paper-section letters-section" id="letters">
    <FloralSprig className="floral-corner-top" />
    <SectionHeading light number="05" eyebrow="WORDS FOR EVERY VERSION OF YOU" title="Letters to You" caption="A few things I have always wanted you to know. Choose an envelope." />
    <div className="envelope-list">{letters.map((letter, i) => <motion.button {...reveal} className="envelope-row" key={letter.id} onClick={() => setActive(letter)}>
      <span className="envelope-illustration"><Mail size={33} strokeWidth={1.2}/><SealMark /></span>
      <span className="envelope-details"><strong>{letter.title}</strong><small>{letter.caption}</small></span>
      <ChevronRight size={19} strokeWidth={1.5}/>
    </motion.button>)}</div>
    <p className="letter-signoff">Four letters. A thousand feelings. Always you. ♡</p>
    <AnimatePresence>{active && <LetterModal key={active.id} letter={active} onClose={() => setActive(null)}/>}</AnimatePresence>
    <div className="torn-edge torn-dark" />
  </section>;
}

function Cinema({ music }) {
  const [active, setActive] = useState(null);
  const closeRef = useDialog(Boolean(active), () => setActive(null));
  return <section className="cinema-section" id="cinema">
    <SectionHeading number="06" eyebrow="PRESS PLAY ON OUR FAVORITE MOMENTS" title="Our Little Cinema" caption="Some memories are better in motion. Even the embarrassing ones."/>
    <div className="cinema-list">{films.map((film, i) => <motion.button {...reveal} className={"cinema-card cinema-card-" + i} key={film.id} onClick={() => setActive(film)}>
      <span className="ticket-header"><span>OUR LITTLE CINEMA</span><span>ADMIT TWO ♡</span></span>
      <span className="ticket-layout">
        <span className="cinema-thumb"><Photo src={film.poster || [demo.three, demo.two][i % 2]} alt={"Illustrative preview for " + film.title} sample={!film.poster} /><span className="big-play"><Play size={25} fill="currentColor"/></span></span>
        <span className="ticket-details"><span className="eyebrow">FILM 0{i + 1}</span><span className="ticket-title">{film.title}</span><span className="ticket-subtitle">{film.subtitle}</span>
          <span className="cinema-link">{film.src ? "Watch this memory" : "Preview this film"} <ArrowRight size={15}/></span>
        </span>
        <span className="ticket-stub" aria-hidden="true"><span>KEEPSAKE</span><strong>00{i + 1}</strong><span className="ticket-barcode" /><span>♥</span></span>
      </span>
    </motion.button>)}</div>
    <AnimatePresence>{active && <DialogBackdrop onClose={() => setActive(null)}>
      <div className="cinema-modal" role="dialog" aria-modal="true" aria-label={active.title}>
        <button ref={closeRef} className="modal-close" onClick={() => setActive(null)} aria-label="Close video"><X size={20}/></button>
        {active.src ? <video key={active.src} controls playsInline src={active.src} poster={active.poster || undefined} onPlay={music.pause} /> : <div className="empty-cinema"><Film size={40}/><h3>{active.title}</h3><p>This little film is still waiting for its first scene.</p></div>}
      </div>
    </DialogBackdrop>}</AnimatePresence>
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
      <button className="final-envelope-trigger" onClick={() => setShow(true)} aria-label="Open our final letter">
        <span className="final-envelope" aria-hidden="true">
          <span className="final-envelope-back" /><span className="final-envelope-flap" /><span className="final-envelope-front" />
          <span className="final-envelope-stamp"><SealMark /></span>
          <span className="final-envelope-address">to my favorite person</span>
        </span>
        <span className="final-envelope-label">a letter & a little bouquet</span>
        <span className="final-envelope-hint">break the seal ♡</span>
      </button>
    </motion.div>
    <div className="finale-bottom"><span>THE END OF CHAPTER THREE</span><h3>{settings.closing}</h3><p>{settings.subclosing}</p><a href="#home">Relive our story <RotateCcw size={15}/></a></div>
    <AnimatePresence>{show && <LetterModal letter={{title:"My Favorite Story Is Us",body:finale.letter}} isFinal onClose={() => setShow(false)}/>}</AnimatePresence>
  </motion.section>;
}

export default function App() {
  const [phase, setPhase] = useState('cover');
  const [storyReady, setStoryReady] = useState(false);
  const music = useCanonMusic();
  const opened = phase === 'open';
  const finishOpening = useCallback(() => setPhase('open'), []);
  useEffect(() => {
    if (opened) return;
    const oldOverflow = document.body.style.overflow;
    const oldRestoration = history.scrollRestoration;
    document.body.style.overflow = 'hidden';
    history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return () => { document.body.style.overflow = oldOverflow; history.scrollRestoration = oldRestoration; };
  }, [opened]);
  useEffect(() => {
    if (!opened) return;
    const frame = requestAnimationFrame(() => {
      const requested = window.location.hash.slice(1);
      const target = requested && requested !== 'home' ? document.getElementById(requested) : document.getElementById('overview');
      const destination = target || document.getElementById('overview');
      destination?.setAttribute('tabindex', '-1');
      destination?.focus({ preventScroll: true });
      destination?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      setStoryReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [opened]);
  useEffect(() => {
    // Warm the three chapter images without adding visible content to the cover.
    const timer = window.setTimeout(() => [0, 3, 6].forEach(index => {
      if (albumPhotos[index]) { const image = new Image(); image.src = albumPhotos[index].src; }
    }), 250);
    return () => window.clearTimeout(timer);
  }, []);
  const begin = () => {
    if (phase !== 'cover') return;
    void music.play();
    setPhase('bursting');
  };
  return <MotionConfig reducedMotion="user"><PhotoAlbum photos={albumPhotos}><div className={"site" + (!opened ? ' story-locked' : '')} data-story-state={phase} data-story-ready={storyReady}>
    {opened && <><FallingRoses /><ScrollButterflies /><Header /><ChapterBookmarks /></>}
    <main><Hero phase={phase} onBegin={begin} />
    {opened && <div id="our-story" className="story-content"><Overview />
    {chapters.map((chapter, i) => <Chapter chapter={chapter} index={i} key={chapter.id}/>)}
    <FavoriteTree /><Soundtrack music={music} /><LetterVault /><Cinema music={music} /><Finale /></div>}</main>
    {opened && <><footer className="site-footer"><span>MADE WITH ALL MY LOVE ♡</span><a href="#home">Relive our story <RotateCcw size={15}/></a></footer><BackgroundMusic music={music} /></>}
    {phase === 'bursting' && <StoryBurst photos={albumPhotos} onComplete={finishOpening} />}
    <span className="screen-reader-only" role="status">{phase === 'bursting' ? 'Opening our story…' : ''}</span>
  </div></PhotoAlbum></MotionConfig>;
}

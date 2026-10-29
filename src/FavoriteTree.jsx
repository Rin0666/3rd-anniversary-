import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, Heart } from 'lucide-react';
import { favoriteTree, settings } from './content';
import Photo from './Photo';
import { usePhotoAlbum } from './PhotoAlbum';

function TreeIllustration() {
  const leaves = [
    [81,123,-35],[111,98,18],[142,80,-22],[178,66,24],[213,80,-15],[249,96,32],
    [278,127,-25],[292,161,15],[264,190,-12],[230,209,30],[196,190,-30],
    [159,198,25],[121,199,-18],[89,175,24],[61,150,-15],[100,142,40],
    [139,124,-35],[175,109,15],[213,128,-18],[249,148,35],[220,164,-25],
    [179,150,28],[145,159,-18],[119,173,20],[81,106,25],[145,60,-20],
    [229,61,35],[272,99,-25],[308,139,30],[288,200,-25],[103,223,15],
    [153,225,-15],[242,228,20],[59,183,-20],[182,218,25],[199,54,-30]
  ];
  return <svg className="tree-illustration" viewBox="0 0 360 390" role="img" aria-label="An illustrated leafy tree keepsake">
    <ellipse cx="180" cy="345" rx="113" ry="12" fill="#a6ab85" opacity=".15" />
    <g fill="#a9b88f" opacity=".22">
      <ellipse cx="125" cy="154" rx="75" ry="81" /><ellipse cx="199" cy="120" rx="77" ry="76" />
      <ellipse cx="254" cy="161" rx="65" ry="78" /><ellipse cx="164" cy="190" rx="88" ry="63" />
    </g>
    <path d="M159 343c16-36 17-69 17-105l-8-80 15 38 9-51-1 83c2 40 2 79 21 115l-28-9z" fill="#927d5e" />
    <g fill="none" stroke="#736d4f" strokeWidth="2" strokeLinecap="round">
      <path d="M180 334c5-61 3-104-1-153M179 239c-26-22-44-45-55-75M182 212c26-15 42-34 53-63M174 201c-19-25-29-52-30-79M185 177c4-25 11-44 25-62M147 196c-26-5-45-16-58-34M210 195c25 0 43-8 57-24" />
      <path d="M143 166l-28-17M145 141l18-17M200 138l-10-21M226 164l24-9M115 181l-7-19M247 188l11 14M173 342l-33 5M188 340l41 7" />
    </g>
    <g>{leaves.map(([x,y,rotation],i) => <g key={i} transform={`translate(${x} ${y}) rotate(${rotation})`}>
      <path d="M0 13C-18 4-17-14 0-23C17-12 17 5 0 13Z" fill={['#73845f','#8f9d71','#b6be90','#627756'][i%4]} opacity=".83" />
      <path d="M0 10V-17" stroke="#f0ead7" strokeWidth=".8" opacity=".6" />
    </g>)}</g>
    <path d="M181 286c-11-12-22 3 0 17 22-14 11-29 0-17Z" fill="none" stroke="#e8d5b2" strokeWidth="1.7" />
    <g fill="#7f9068"><path d="M126 344l-8-13 2 14M235 345l7-15-1 15M147 347l-3-10-2 10" /></g>
  </svg>;
}

export default function FavoriteTree() {
  const reducedMotion = useReducedMotion();
  const openPhoto = usePhotoAlbum();
  return <section id="favorite-tree" className="favorite-tree-section paper-section" aria-labelledby="favorite-tree-title">
    <div className="tree-section-heading">
      <span className="eyebrow">{favoriteTree.eyebrow}</span>
      <h2 id="favorite-tree-title">{favoriteTree.title}</h2>
      <span className="tree-heading-rule" aria-hidden="true"><i /><Heart size={13} strokeWidth={1.2}/><i /></span>
    </div>
    <motion.div className="tree-keepsake-layout" initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: reducedMotion ? 0 : .6 }}>
      <figure className="tree-photo-keepsake">
        <span className="tree-washi" aria-hidden="true" />
        <div className="tree-photo-window" style={{ '--tree-photo-focus': favoriteTree.imagePosition }}>
          {favoriteTree.image ? <Photo src={favoriteTree.image} alt={favoriteTree.alt} onOpen={() => openPhoto('favorite-tree')} />
            : <><TreeIllustration /><span className="tree-illustration-label">ILLUSTRATED KEEPSAKE</span></>}
        </div>
        <figcaption>{favoriteTree.caption}<span aria-hidden="true">♡</span></figcaption>
      </figure>
      <div className="tree-note">
        <span className="tree-note-label">pressed between our pages</span>
        <blockquote>{favoriteTree.note}</blockquote>
        <p>{favoriteTree.body}</p>
        <span className="tree-note-signature">{settings.monogram || '♡'}</span>
        <svg className="tree-pressed-sprig" viewBox="0 0 90 155" fill="none" aria-hidden="true">
          <path d="M27 148C40 104 45 59 58 12" stroke="#8c9368" strokeWidth="2" />
          <g fill="#8f9c70" opacity=".8"><path d="M37 115C5 108 6 85 37 91Z"/><path d="M42 95C73 92 78 69 48 72Z"/><path d="M47 68C18 61 22 39 52 45Z"/><path d="M53 45C81 36 80 16 59 23Z"/></g>
        </svg>
      </div>
    </motion.div>
    <a className="tree-next" href="#soundtrack">A song for the way this feels <ArrowDown size={14}/></a>
    <div className="torn-edge torn-dark" aria-hidden="true" />
  </section>;
}

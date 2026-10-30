import React, { useId } from 'react';

function Tulip({ x, y, scale = 1, tilt = 0, palette, delay = '0s' }) {
  return <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <g className="bouquet-bloom" style={{ '--bloom-delay': delay }}>
      <path d="M-19-26C-10-20-5-27 0-34C8-23 13-19 22-26C25-5 20 17 3 28C-13 27-24 8-19-26Z" fill={palette.shadow} />
      <path d="M-22-29C-25-6-18 19 1 29C-1 5-6-17-22-29Z" fill={`url(#${palette.petal})`} />
      <path d="M23-28C24-3 19 20 1 29C1 8 8-15 23-28Z" fill={`url(#${palette.petal})`} />
      <path d="M0-29C-15-11-13 16 1 29C15 17 16-10 0-29Z" fill={`url(#${palette.cup})`} />
      <path d="M-17-20C-18-3-12 14-3 23M18-19C18-2 12 15 6 23M0-22C-4-6-3 12 1 24" fill="none" stroke={palette.vein} strokeWidth=".8" strokeLinecap="round" opacity=".55" />
      <path d="M-8 25Q1 32 9 24L5 33L-3 32Z" fill="#6c8358" />
    </g>
  </g>;
}

function Sunflower({ x, y, scale = 1, ids, delay = '0s' }) {
  return <g transform={`translate(${x} ${y}) rotate(-8) scale(${scale})`}>
    <g className="bouquet-bloom" style={{ '--bloom-delay': delay }}>
      {Array.from({ length: 21 }, (_, index) => <g key={index} transform={`rotate(${index * 360 / 21})`}>
        <path d="M-4-13C-13-24-9-39-2-45C6-42 10-28 5-14Z" fill={`url(#${ids.gold})`} stroke="#bd8337" strokeWidth=".4" />
        <path d="M0-20Q-3-32-2-40" fill="none" stroke="#fff0aa" strokeWidth=".8" opacity=".65" />
      </g>)}
      {Array.from({ length: 15 }, (_, index) => <path key={index} transform={`rotate(${index * 24 + 9})`}
        d="M-4-12C-10-21-7-31 0-35C7-30 9-21 4-12Z" fill={index % 3 ? '#efbd55' : '#f9d379'} stroke="#d59a43" strokeWidth=".5" />)}
      <circle r="18.5" fill="#c7964c" />
      <circle r="16.5" fill={`url(#${ids.seeds})`} />
      {Array.from({ length: 65 }, (_, index) => {
        const angle = index * 2.399963;
        const radius = Math.sqrt(index / 65) * 14.5;
        return <ellipse key={index} cx={Math.cos(angle) * radius} cy={Math.sin(angle) * radius} rx=".9" ry="1.25"
          transform={`rotate(${angle * 180 / Math.PI} ${Math.cos(angle) * radius} ${Math.sin(angle) * radius})`}
          fill={index % 3 ? '#bd9459' : '#ecd29a'} opacity={index % 2 ? '.8' : '.55'} />;
      })}
      <path d="M-11-10A15 15 0 0 1 11-11" fill="none" stroke="#f5dba3" strokeWidth="1" opacity=".5" />
    </g>
  </g>;
}

function Daisy({ x, y, scale = 1, tilt = 0 }) {
  return <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    {Array.from({ length: 9 }, (_, index) => <path key={index} transform={`rotate(${index * 40})`}
      d="M-2-3C-7-7-5-15-1-16C4-15 6-7 2-3Z" fill={index % 2 ? '#fffaf0' : '#f1e5ce'} stroke="#d6c7aa" strokeWidth=".4" />)}
    <circle r="4.3" fill="#d9a44f" />
    <circle cx="-1" cy="-1" r="1.8" fill="#f4cf75" />
  </g>;
}

function Eucalyptus({ x, y, tilt = 0, scale = 1 }) {
  return <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <path d="M0 0C-3-35 6-74 1-116" fill="none" stroke="#869578" strokeWidth="1.5" />
    {[-25, -48, -72, -94].map((level, index) => <g key={level}>
      <ellipse cx={-8 + index} cy={level - 3} rx={11 - index} ry={7.5 - index * .5} transform={`rotate(32 ${-8 + index} ${level - 3})`} fill={index % 2 ? '#96a797' : '#829b88'} />
      <ellipse cx={8 - index} cy={level - 9} rx={10 - index} ry={7 - index * .4} transform={`rotate(-38 ${8 - index} ${level - 9})`} fill={index % 2 ? '#acb9a5' : '#9aae9b'} />
      <path d={`M-13 ${level - 6}L0 ${level + 1}L12 ${level - 13}`} fill="none" stroke="#e3e5c9" strokeWidth=".6" opacity=".6" />
    </g>)}
    <ellipse cx="1" cy="-116" rx="5" ry="9" fill="#b4bfa9" />
  </g>;
}

function BabyBreath({ x, y, tilt = 0, scale = 1 }) {
  const tips = [[-14, -40], [6, -51], [23, -34], [-5, -23], [19, -14]];
  return <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <path d="M0 9L4-37M1-3L-14-40M4-17L23-34M3-24L6-51M0 3L19-14M3-10L-5-23" fill="none" stroke="#96a180" strokeWidth=".8" />
    {tips.map(([tipX, tipY], index) => <g key={index} transform={`translate(${tipX} ${tipY})`}>
      <path d="M0-4C5-6 6-1 3 1C5 6 0 7-2 3C-7 4-7-2-3-2C-4-6-1-7 0-4Z" fill="#fff9ec" stroke="#e1d3ba" strokeWidth=".5" />
      <circle r="1.1" fill="#d8b97d" />
    </g>)}
  </g>;
}

export default function FlowerBouquet({ monogram, laidDown = false }) {
  const prefix = useId().replace(/:/g, '');
  const ids = Object.fromEntries(['rose', 'roseCup', 'blush', 'blushCup', 'lilac', 'lilacCup', 'gold', 'seeds', 'leaf', 'paper', 'tissue', 'ribbon', 'ribbonLight'].map(name => [name, `${prefix}-${name}`]));
  const palettes = {
    rose: { petal: ids.rose, cup: ids.roseCup, shadow: '#af607b', vein: '#fae1db' },
    blush: { petal: ids.blush, cup: ids.blushCup, shadow: '#ca8c9d', vein: '#fff1e3' },
    lilac: { petal: ids.lilac, cup: ids.lilacCup, shadow: '#a1819b', vein: '#f5e4e9' },
  };
  return <figure className={'flower-bouquet' + (laidDown ? ' is-laid-down' : '')}>
    <svg className="bouquet-art" viewBox={laidDown ? '4 -10 380 310' : '0 0 310 395'} role="img" aria-label="A bouquet of pink tulips and golden sunflowers, with small daisies, eucalyptus and baby's breath, wrapped in paper and tied with a rose silk ribbon">
      <defs>
        <linearGradient id={ids.rose} x1="0" y1="0" x2="1" y2=".8"><stop stopColor="#f1b5bf" /><stop offset=".5" stopColor="#d68b9e" /><stop offset="1" stopColor="#ad5e7b" /></linearGradient>
        <linearGradient id={ids.roseCup} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f7c7cc" /><stop offset=".55" stopColor="#df9aab" /><stop offset="1" stopColor="#bd718e" /></linearGradient>
        <linearGradient id={ids.blush} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff0df" /><stop offset=".45" stopColor="#eab5b6" /><stop offset="1" stopColor="#cc8e9c" /></linearGradient>
        <linearGradient id={ids.blushCup} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff1e6" /><stop offset=".7" stopColor="#edbfc3" /><stop offset="1" stopColor="#d89fae" /></linearGradient>
        <linearGradient id={ids.lilac} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e9d7dc" /><stop offset=".55" stopColor="#c9adc2" /><stop offset="1" stopColor="#a584a0" /></linearGradient>
        <linearGradient id={ids.lilacCup} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f4e6e7" /><stop offset=".6" stopColor="#d7bfce" /><stop offset="1" stopColor="#b697b1" /></linearGradient>
        <linearGradient id={ids.gold} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffdf8b" /><stop offset=".5" stopColor="#f1c15c" /><stop offset="1" stopColor="#cb9039" /></linearGradient>
        <radialGradient id={ids.seeds} cx=".35" cy=".3"><stop stopColor="#8e663e" /><stop offset=".7" stopColor="#694b31" /><stop offset="1" stopColor="#4e3929" /></radialGradient>
        <linearGradient id={ids.leaf} x1="0" y1="0" x2="1" y2=".7"><stop stopColor="#a8b794" /><stop offset=".5" stopColor="#859c76" /><stop offset="1" stopColor="#607e60" /></linearGradient>
        <linearGradient id={ids.paper} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e8cfaa" /><stop offset=".5" stopColor="#d5b68d" /><stop offset="1" stopColor="#b99874" /></linearGradient>
        <linearGradient id={ids.tissue} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff9eb" /><stop offset=".5" stopColor="#f3e7d2" /><stop offset="1" stopColor="#ddccb1" /></linearGradient>
        <linearGradient id={ids.ribbon} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#dcabb4" /><stop offset=".45" stopColor="#bd8295" /><stop offset="1" stopColor="#94596f" /></linearGradient>
        <linearGradient id={ids.ribbonLight} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f1c8ce" /><stop offset=".5" stopColor="#cd95a4" /><stop offset="1" stopColor="#ad7186" /></linearGradient>
      </defs>
      <g transform={laidDown ? 'translate(-20 -85) rotate(65 150 270)' : undefined}>
        {/* Open tissue behind the stems keeps the arrangement airy. */}
        <path d="M58 205L39 175L103 186L151 215L215 174L266 194L242 268L164 352L119 349Z" fill={`url(#${ids.paper})`} stroke="#b99879" strokeWidth=".8" />
        <path d="M42 192L61 174L115 197L146 230L196 194L248 178L258 210L223 283L156 346L113 337Z" fill={`url(#${ids.tissue})`} stroke="#ddcbb0" strokeWidth=".7" />
        <path d="M50 191L113 218L151 260M247 190L197 222L160 267" fill="none" stroke="#fffdf2" strokeWidth="2" opacity=".75" />
        <Eucalyptus x={111} y={246} tilt={-34} scale={1.05} />
        <Eucalyptus x={198} y={240} tilt={35} scale={1.05} />
        <Eucalyptus x={188} y={186} tilt={18} scale={.9} />
        <g fill="none" strokeLinecap="round">
          <path d="M145 346C121 249 88 183 68 133M150 345C143 228 111 134 111 91M154 345C162 223 151 119 149 71M159 344C180 232 199 155 208 108M164 343C190 271 238 198 246 153M153 345C142 244 138 202 141 155M158 344C184 270 211 229 219 202" stroke="#738966" strokeWidth="3.2" />
          <path d="M146 343C126 252 91 181 70 134M155 343C162 228 150 122 150 72M165 341C190 268 237 197 247 154" stroke="#b7c39a" strokeWidth=".9" />
        </g>
        <g fill={`url(#${ids.leaf})`} stroke="#708567" strokeWidth=".6">
          <path d="M119 261C76 249 59 219 61 191C93 205 114 231 119 261ZM178 272C213 245 234 216 230 188C203 203 186 238 178 272Z" />
          <path d="M115 219C85 204 77 174 87 151C111 174 118 198 115 219ZM169 224C161 189 168 163 180 147C193 171 183 205 169 224Z" />
          <path d="M82 182C49 170 38 143 45 125C65 143 77 162 82 182ZM226 189C253 172 263 145 254 126C234 145 226 168 226 189Z" />
        </g>
        <g fill="none" stroke="#d5ddba" strokeWidth=".8" opacity=".7"><path d="M65 199Q96 223 114 253M225 196Q200 229 182 262M89 159Q106 191 112 212M180 155L171 215" /></g>
        <BabyBreath x={77} y={167} tilt={-28} scale={.9} />
        <BabyBreath x={225} y={151} tilt={28} scale={.8} />
        <Tulip x={67} y={130} scale={.94} tilt={-25} palette={palettes.rose} delay="-.7s" />
        <Tulip x={110} y={91} scale={1.02} tilt={-13} palette={palettes.blush} delay="-1.7s" />
        <Tulip x={149} y={70} scale={1.05} tilt={3} palette={palettes.rose} delay="-.4s" />
        <Tulip x={208} y={106} scale={1.02} tilt={18} palette={palettes.lilac} delay="-2.2s" />
        <Tulip x={247} y={152} scale={.83} tilt={33} palette={palettes.blush} delay="-1.2s" />
        <Sunflower x={144} y={156} scale={1.04} ids={ids} delay="-1s" />
        <Sunflower x={218} y={205} scale={.78} ids={ids} delay="-2s" />
        <Daisy x={83} y={188} scale={.8} tilt={12} />
        <Daisy x={103} y={219} scale={.6} tilt={-10} />
        <Daisy x={184} y={213} scale={.61} />
        <BabyBreath x={61} y={223} tilt={-33} scale={.7} />
        {/* Overlapping folds, a rolled edge, and fine creases give the wrap depth. */}
        <path d="M48 219C93 236 125 250 158 263L185 352Q159 369 125 355C99 307 76 263 48 219Z" fill={`url(#${ids.paper})`} stroke="#b69573" strokeWidth=".8" />
        <path d="M48 219Q96 225 157 257L181 351C143 332 108 281 48 219Z" fill={`url(#${ids.tissue})`} stroke="#cfbb9d" strokeWidth=".8" />
        <path d="M258 220Q204 240 157 257L125 355C165 343 211 280 258 220Z" fill={`url(#${ids.tissue})`} stroke="#cfbb9d" strokeWidth=".8" />
        <path d="M258 220Q214 247 174 274L125 355Q182 308 225 262Z" fill="#eadcc3" opacity=".72" />
        <path d="M49 219Q97 230 157 259Q205 242 257 220" fill="none" stroke="#fff9e9" strokeWidth="2.4" strokeLinecap="round" />
        <g fill="none" stroke="#bba180" strokeWidth=".65" opacity=".55"><path d="M157 262L153 325M82 248L124 312M233 242L186 297M132 351L151 339" /></g>
        {/* A loose silk bow and a small handwritten gift tag. */}
        <path d="M125 299Q152 311 181 299L178 309Q151 320 128 309Z" fill={`url(#${ids.ribbon})`} />
        <path d="M148 306C130 310 123 338 113 360L128 354L137 363C141 340 151 322 157 310Z" fill={`url(#${ids.ribbon})`} stroke="#a66f82" strokeWidth=".65" />
        <path d="M158 307C173 316 182 335 194 341L181 342L179 352C167 337 160 324 151 311Z" fill={`url(#${ids.ribbonLight})`} stroke="#a66f82" strokeWidth=".65" />
        <path d="M149 305C131 276 101 280 106 297C110 310 133 312 149 305Z" fill={`url(#${ids.ribbonLight})`} stroke="#ac7588" strokeWidth=".7" />
        <path d="M155 305C173 273 203 281 196 297C190 311 170 311 155 305Z" fill={`url(#${ids.ribbon})`} stroke="#9f667d" strokeWidth=".7" />
        <path d="M112 291Q130 290 146 304M163 302Q178 287 190 287M132 354Q136 330 149 315" fill="none" stroke="#f5d4d6" strokeWidth="1.2" opacity=".65" />
        <rect x="145" y="298" width="16" height="16" rx="5" transform="rotate(-8 153 306)" fill={`url(#${ids.ribbonLight})`} stroke="#b47d90" strokeWidth=".6" />
        <path d="M151 310Q157 328 169 333" fill="none" stroke="#b49a73" strokeWidth=".8" />
        <g transform="translate(169 331) rotate(-15)">
          <path d="M0 0L12-5L44-5L44 16L12 16L0 10Z" fill="#fff4df" stroke="#d5bd98" strokeWidth=".7" />
          <circle cx="6" cy="5" r="1.5" fill="#c7ac85" />
          <text x="27" y="9" textAnchor="middle" fill="#a37179" fontFamily="Caveat, cursive" fontSize="10">{monogram}</text>
        </g>
      </g>
    </svg>
    <figcaption>flowers for my favorite person.</figcaption>
  </figure>;
}

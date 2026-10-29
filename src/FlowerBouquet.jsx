import React from 'react';

function Tulip({ x, y, scale = 1, tilt = 0, color = '#d88999', light = '#f0b7bd', delay = '0s' }) {
  return <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <g className="bouquet-bloom" style={{ '--bloom-delay': delay }}>
      <path d="M-21-18C-12-8-8-9 0-23C7-10 14-8 21-18C24 11 14 27 0 28C-15 27-24 11-21-18Z" fill={color} stroke="#a36872" strokeWidth=".7" />
      <path d="M-21-18C-20 4-12 21 0 28C-5 9-9-7-21-18Z" fill={light} />
      <path d="M21-18C20 4 12 21 0 28C5 9 9-7 21-18Z" fill={light} opacity=".8" />
      <path d="M0-23C-5-6-5 14 0 28" fill="none" stroke={light} strokeWidth="1.1" opacity=".7" />
    </g>
  </g>;
}

function Sunflower({ x, y, scale = 1, delay = '0s' }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <g className="bouquet-bloom" style={{ '--bloom-delay': delay }}>
      {Array.from({ length: 18 }, (_, index) => <ellipse key={index} cx="0" cy="-23" rx="6.2" ry="17" transform={`rotate(${index * 20})`}
        fill={index % 2 ? '#e8bc58' : '#deb049'} stroke="#c18d30" strokeWidth=".5" />)}
      <circle r="16" fill="#735038" stroke="#af7c39" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, index) => <circle key={index} cx={Math.cos(index * Math.PI / 6) * 10} cy={Math.sin(index * Math.PI / 6) * 10} r="1.5" fill="#c59656" />)}
      <circle r="5.5" fill="#5f4433" />
    </g>
  </g>;
}

function Daisy({ x, y, scale = 1 }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {Array.from({ length: 8 }, (_, index) => <ellipse key={index} cx="0" cy="-10" rx="4" ry="9" transform={`rotate(${index * 45})`} fill="#fff2d7" stroke="#e5d4b3" strokeWidth=".6" />)}
    <circle r="5" fill="#d9ad4a" />
  </g>;
}

export default function FlowerBouquet({ monogram, laidDown = false }) {
  return <figure className={"flower-bouquet" + (laidDown ? " is-laid-down" : "")}>
    <svg className="bouquet-art" viewBox={laidDown ? "20 0 340 285" : "0 0 300 385"} role="img" aria-label="A bouquet of pink tulips and golden sunflowers, with small daisies and greenery, tied with a ribbon">
      <g transform={laidDown ? 'translate(-20 -85) rotate(65 150 270)' : undefined}>
      <g fill="none" stroke="#7d9375" strokeWidth="3" strokeLinecap="round">
        <path d="M145 345C122 250 88 199 66 137M151 344C143 215 104 137 101 96M155 343C159 215 148 114 145 65M159 344C174 218 201 148 204 90M164 344C188 263 236 171 246 126M151 338C129 247 123 191 151 142M157 343C181 242 217 189 221 163" />
        <path d="M139 300C97 255 75 236 48 212M163 301C198 256 230 240 261 213" />
      </g>
      <g fill="#8b9e7c" stroke="#71866b" strokeWidth=".8">
        <path d="M120 270C75 265 47 244 46 221C86 224 117 244 120 270ZM171 273C217 265 244 244 249 220C209 223 181 246 171 273Z" />
        <path d="M110 228C71 219 60 190 65 170C91 185 106 202 110 228ZM177 233C215 223 235 199 231 177C203 189 182 209 177 233Z" />
        <path d="M135 219C111 196 111 162 124 150C139 173 142 196 135 219ZM165 209C155 176 163 151 177 143C188 170 182 195 165 209Z" />
        <path d="M85 192C48 178 36 154 42 135C66 151 82 172 85 192ZM217 189C247 171 258 149 251 132C229 146 220 167 217 189Z" />
      </g>
      <Daisy x={49} y={188} scale={.8} />
      <Tulip x={66} y={135} scale={.95} tilt={-23} color="#c87690" light="#eaa6b7" delay="-.7s" />
      <Tulip x={102} y={95} scale={1.05} tilt={-10} color="#d59aa9" light="#f1c6cb" delay="-1.7s" />
      <Tulip x={145} y={65} scale={1.1} tilt={4} color="#d48697" light="#efb6bd" delay="-.4s" />
      <Tulip x={204} y={90} scale={1.02} tilt={16} color="#c2a1bd" light="#e6c9d9" delay="-2.2s" />
      <Tulip x={247} y={126} scale={.85} tilt={25} color="#e2a58e" light="#f4cead" delay="-1.2s" />
      <Sunflower x={151} y={143} scale={1.12} delay="-1s" />
      <Sunflower x={222} y={181} scale={.82} delay="-2s" />
      <Daisy x={92} y={186} scale={.75} />
      <Daisy x={184} y={207} scale={.68} />
      <path d="M60 223C113 239 182 246 242 221L181 355C160 367 137 368 119 355Z" fill="#d5b48c" stroke="#bb9871" strokeWidth="1" />
      <path d="M60 223L155 258L181 355C150 345 123 317 103 286Z" fill="#efe1c7" stroke="#d5c2a0" strokeWidth=".8" />
      <path d="M242 221L155 258L119 355C158 341 194 296 218 267Z" fill="#f7ecd5" stroke="#d5c2a0" strokeWidth=".8" />
      <path d="M155 258L151 342" stroke="#c9b28e" strokeWidth="1" />
      <g fill="#c78491" stroke="#a5687d" strokeWidth=".8">
        <path d="M150 301C116 273 103 290 120 306C129 312 140 308 150 301ZM153 301C182 275 202 286 186 303C177 313 163 307 153 301Z" />
        <path d="M146 304L128 348L140 343L148 351L156 307ZM157 304L178 341L166 338L161 350L150 307Z" />
        <rect x="144" y="295" width="15" height="15" rx="5" />
      </g>
      <text x="151" y="375" textAnchor="middle" fill="#a37179" fontFamily="Caveat, cursive" fontSize="17">{monogram}</text>
      </g>
    </svg>
    <figcaption>flowers for my favorite person.</figcaption>
  </figure>;
}

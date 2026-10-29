// A gentle original arrangement of Pachelbel's public-domain Canon in D.
// Times are in beats so the accompaniment and melody stay in sync.
export const CANON_TEMPO = 72;
export const CANON_LOOP_BEATS = 64;
const bass = [50, 45, 47, 42, 43, 38, 43, 45];
const chords = [
  [62, 66, 69, 74], [57, 61, 64, 69], [59, 62, 66, 71], [54, 57, 61, 66],
  [55, 59, 62, 67], [50, 54, 57, 62], [55, 59, 62, 67], [57, 61, 64, 69],
];
const themes = [
  [78, 76, 74, 73, 71, 69, 71, 73],
  [74, 73, 71, 69, 67, 66, 67, 64],
];
const variations = [
  [66, 69, 74, 78], [76, 73, 69, 64], [74, 78, 83, 81], [73, 69, 66, 73],
  [71, 74, 79, 78], [69, 66, 62, 69], [71, 67, 74, 71], [69, 73, 76, 73],
];

export const canonNotes = Array.from({ length: 32 }, (_, index) => {
  const chord = index % 8;
  const at = index * 2;
  const accompaniment = [
    { at, note: bass[chord], length: 1.7, velocity: .4 },
    ...chords[chord].map((note, step) => ({ at: at + step * .5, note, length: .65, velocity: .24 })),
  ];
  const phrase = Math.floor(index / 8);
  const melody = phrase < 2
    ? [{ at, note: themes[phrase][chord], length: 1.8, velocity: .58 }]
    : (phrase === 2 ? variations[chord] : variations[chord].slice().reverse())
      .map((note, step) => ({ at: at + step * .5, note, length: .7, velocity: .45 }));
  return [...accompaniment, ...melody];
}).flat().sort((left, right) => left.at - right.at);
